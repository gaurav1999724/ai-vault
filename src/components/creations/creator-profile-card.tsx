import Link from "next/link";
import { SocialLinks } from "@/components/site/social-links";
import type { PublicProfile } from "@/types/content";

export function CreatorProfileCard({ profile }: { profile: PublicProfile }) {
  return (
    <section className="mx-auto grid max-w-[1440px] items-center gap-10 px-5 py-24 md:px-8 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <div className="aspect-[4/5] overflow-hidden rounded-[2rem] bg-surface">
          {profile.portraitUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.portraitUrl} alt={profile.portraitAlt} className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full place-items-center font-display text-6xl text-muted">{profile.name.slice(0, 1)}</div>
          )}
        </div>
      </div>
      <div className="lg:col-span-7">
        <p className="text-[11px] tracking-[0.22em] text-cyan">THE STUDIO</p>
        <h2 className="mt-3 font-display text-6xl">{profile.name}</h2>
        <p className="mt-2 text-muted">@{profile.username}</p>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink/85">{profile.biography}</p>
        <ul className="mt-6 flex flex-wrap gap-2">
          {profile.specialties.map((item) => (
            <li key={item} className="rounded-full border border-line px-3 py-1 text-xs tracking-[0.14em]">
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <SocialLinks profile={profile} />
        </div>
        <p className="mt-6 text-sm text-muted">{profile.publishedCount} published creations</p>
        <Link href="/about" className="mt-6 inline-flex text-sm text-cyan">
          About Me
        </Link>
      </div>
    </section>
  );
}
