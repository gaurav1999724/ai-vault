# AI Creative Vault

A portfolio and discovery site for an AI creator. Visitors browse published images, videos, prompts, and tutorials. An administrator manages the archive from `/admin`.

The public pages read from PostgreSQL. Nothing in the gallery is hardcoded into the page components. Demonstration records are created only by the seed script and are labeled as demonstration content.

## Prerequisites

- Node.js 22
- npm
- PostgreSQL 16
- Optional: an S3-compatible bucket for production media

## Installation

```bash
npm install
cp .env.example .env
```

Edit `.env`. Set `DATABASE_URL`, `SESSION_PEPPER`, and `NEXT_PUBLIC_SITE_URL`. Do not put real passwords in `.env.example`.

## PostgreSQL

Create a database and a user that can run migrations. The user needs permission to create a shadow database when you use `prisma migrate dev`.

```sql
CREATE USER vault WITH PASSWORD 'change-me' CREATEDB;
CREATE DATABASE ai_creative_vault OWNER vault;
```

A local Docker instance is enough for development:

```bash
docker run -d --name ai-creative-vault-postgres \
  -e POSTGRES_USER=vault \
  -e POSTGRES_PASSWORD=change-me \
  -e POSTGRES_DB=ai_creative_vault \
  -p 127.0.0.1:5432:5432 \
  postgres:16
```

Set `DATABASE_URL` to `postgresql://vault:change-me@127.0.0.1:5432/ai_creative_vault`. Production builds prerender public pages, so the build environment must be able to reach this database. A hosted Postgres URL (Neon, Supabase, or another provider) belongs in the deployment environment, not `127.0.0.1`.

```bash
npm run db:deploy
npm run db:seed
```

`db:seed` inserts clearly marked demonstration categories, tools, creations, and one tutorial. It does not create an administrator and it does not overwrite rows that already exist.

## First administrator

There is no default account and no public registration.

```bash
ADMIN_EMAIL="you@example.com" ADMIN_NAME="Your Name" ADMIN_PASSWORD="a-long-mixed-password" npm run admin:create
```

The password must be at least 12 characters and include upper case, lower case, and a number. In a terminal you can omit the variables and answer the prompts. If the email already exists, the command stops and does not change the password.

Sign in at `/admin/login`.

## Publishing a creation

1. Log in and open Add Creation.
2. Enter the title, description, and media type.
3. Upload a cover from the Media tab, or attach a file already in the library. Add alt text.
4. Paste the exact prompt and, if you use one, the negative prompt.
5. Choose AI tools, categories, and tags.
6. Add workflow steps.
7. Save a draft or publish.

Published work appears on the homepage, explore pages, and its own URL. Drafts stay out of public queries, the sitemap, and search. An administrator can still open a draft URL while signed in.

Prompt of the day is exclusive: publishing that flag clears it from other creations.

## Media

Local development stores files in `storage/uploads`, which is not committed. The app serves them from `/media/...`. Images and videos have no application size cap. On Vercel, set `BLOB_READ_WRITE_TOKEN` by connecting a Blob store: the browser uploads straight to Blob, because Vercel rejects app-server bodies over about 4.5 MB. Private Blob stores are supported, and the site serves those files from `/media`. Image thumbnails are generated in the browser for that path. Local files are checked from their signatures. Common types include JPEG, PNG, WebP, AVIF, GIF, HEIC, MP4, WebM, and QuickTime.

Deleting a library file is refused while a creation, tutorial, category, profile, or setting still references it. Removing a file from one creation leaves it in the library.

### Object storage

Set `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, and `S3_PUBLIC_BASE_URL`. Optional: `S3_ENDPOINT`, `S3_REGION`, and `S3_FORCE_PATH_STYLE=true` for providers that need path-style URLs. Credentials stay on the server. `S3_PUBLIC_BASE_URL` is the public delivery origin, not a secret.

When Blob and these bucket variables are empty, uploads stay on the local disk. That is appropriate for development and a single Node server. With S3 configured, the browser uploads directly to the bucket. The bucket CORS policy needs to allow `PUT` from the site and expose the `ETag` header. Use Blob or object storage when you run more than one app instance.

## Development

```bash
npm run dev
npm test
npm run typecheck
npm run lint
```

## Production

```bash
npm run db:deploy
npm run build
npm start
```

Host the Node server behind HTTPS. Point `NEXT_PUBLIC_SITE_URL` at the public origin. Keep PostgreSQL and object storage credentials in the host environment, not in client code. The build step queries the database while prerendering, so `DATABASE_URL` on the host must be a reachable Postgres connection string.

Suggested checks before launch:

- Replace the placeholder profile, privacy policy, and terms.
- Create the real administrator and remove demonstration creations you do not want public.
- Confirm SMTP if you want contact messages emailed. Without `SMTP_HOST` and `SMTP_FROM`, messages are stored in Contact Messages only.

## Analytics and privacy

Views increment once per random visitor cookie, per creation, per UTC day. Prompt copies from the same browser are ignored for about ten seconds so a double click is not counted twice. The cookie name is `acv_visitor`. Raw IP addresses are not stored. Login attempts are limited with a hash of the email, not the IP.

Favorites are stored in the browser only. There are no visitor accounts.

## Stack notes

The app uses Next.js 16, React 19, Tailwind CSS 4, Prisma 6, and PostgreSQL. Prisma 6 is pinned because the newest Prisma CLI available during setup was an 8.0 release candidate that did not match the client. Motion, GSAP, React Three Fiber, and Lenis are used for specific interactions rather than for every element.

## Known limitations

- Login throttling beyond the email hash, and public analytics throttling, are process-local. They are not a shared rate-limit store.
- There is no live Instagram feed. Preview images are uploaded by the administrator.
- AI tool records are a catalog. The site does not call those products.
- Email is optional. Contact submissions are always stored.
- Local uploads are not shared across multiple servers.
- Video files are not transcoded. Posters are separate image uploads.
- Public view and copy counts can lag for a few minutes because published pages are cached and then invalidated when an editor publishes, not on every view.
