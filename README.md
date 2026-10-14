# AI Creative Vault

A portfolio and discovery site for an AI creator. Visitors browse published images, videos, prompts, and tutorials. An administrator manages the archive from `/admin`.

The public pages read from MySQL. Nothing in the gallery is hardcoded into the page components. Demonstration records are created only by the seed script and are labeled as demonstration content.

## Prerequisites

- Node.js 22
- npm
- MySQL 8
- Optional: an S3-compatible bucket for production media

## Installation

```bash
npm install
cp .env.example .env
```

Edit `.env`. Set `DATABASE_URL`, `SESSION_PEPPER`, and `NEXT_PUBLIC_SITE_URL`. Do not put real passwords in `.env.example`.

## MySQL

Create a database and a user that can run migrations:

```sql
CREATE DATABASE ai_creative_vault CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'vault'@'%' IDENTIFIED BY 'change-me';
GRANT ALL PRIVILEGES ON ai_creative_vault.* TO 'vault'@'%';
```

`prisma migrate dev` also needs permission to create a shadow database, or you can run `npm run db:deploy` against an existing migration history.

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

Local development stores files in `storage/uploads`, which is not committed. The app serves them from `/media/...`. Images get a WebP thumbnail. Allowed types are JPEG, PNG, WebP, AVIF, MP4, and WebM, checked from file signatures. Images are limited to 15 MB and videos to 80 MB.

Deleting a library file is refused while a creation, tutorial, category, profile, or setting still references it. Removing a file from one creation leaves it in the library.

### Object storage

Set `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, and `S3_PUBLIC_BASE_URL`. Optional: `S3_ENDPOINT`, `S3_REGION`, and `S3_FORCE_PATH_STYLE=true` for providers that need path-style URLs. Credentials stay on the server. `S3_PUBLIC_BASE_URL` is the public delivery origin, not a secret.

When those bucket variables are empty, uploads stay on the local disk. That is appropriate for development and a single Node server. Use object storage when you run more than one app instance.

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

Host the Node server behind HTTPS. Point `NEXT_PUBLIC_SITE_URL` at the public origin. Keep MySQL and object storage credentials in the host environment, not in client code.

Suggested checks before launch:

- Replace the placeholder profile, privacy policy, and terms.
- Create the real administrator and remove demonstration creations you do not want public.
- Confirm SMTP if you want contact messages emailed. Without `SMTP_HOST` and `SMTP_FROM`, messages are stored in Contact Messages only.

## Analytics and privacy

Views increment once per random visitor cookie, per creation, per UTC day. Prompt copies from the same browser are ignored for about ten seconds so a double click is not counted twice. The cookie name is `acv_visitor`. Raw IP addresses are not stored. Login attempts are limited with a hash of the email, not the IP.

Favorites are stored in the browser only. There are no visitor accounts.

## Stack notes

The app uses Next.js 16, React 19, Tailwind CSS 4, Prisma 6, and MySQL. Prisma 6 is pinned because the newest Prisma CLI available during setup was an 8.0 release candidate that did not match the client. Motion, GSAP, React Three Fiber, and Lenis are used for specific interactions rather than for every element.

## Known limitations

- Login throttling beyond the email hash, and public analytics throttling, are process-local. They are not a shared rate-limit store.
- There is no live Instagram feed. Preview images are uploaded by the administrator.
- AI tool records are a catalog. The site does not call those products.
- Email is optional. Contact submissions are always stored.
- Local uploads are not shared across multiple servers.
- Video files are not transcoded. Posters are separate image uploads.
- Public view and copy counts can lag for a few minutes because published pages are cached and then invalidated when an editor publishes, not on every view.
