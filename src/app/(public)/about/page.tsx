import type { Metadata } from "next";
import Link from "next/link";
import { CreationCard } from "@/components/creations/creation-card";
import { SocialLinks } from "@/components/site/social-links";
import { getFeaturedCreations, getProfile, getSettings } from "@/lib/data/public";

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  return { title: "About", description: profile.seoDescription || profile.professionalIntro };
}

export default async function AboutPage() {
  const [profile, settings, featured] = await Promise.all([getProfile(), getSettings(), getFeaturedCreations()]);
  return (
    <article className="mx-auto max-w-[1440px] px-5 pb-24 pt-32 md:px-8">
      <div className="grid items-end gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="text-[11px] tracking-[0.22em] text-violet">{settings.websiteTitle}</p>
          <h1 className="mt-4 font-display text-[clamp(4rem,8vw,7rem)] leading-[0.86]">{profile.name}</h1>
          <p className="mt-4 text-muted">@{profile.username}</p>
        </div>
        <div className="aspect-[4/5] overflow-hidden rounded-[2rem] bg-surface lg:col-span-5">
          {profile.portraitUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.portraitUrl} alt={profile.portraitAlt} className="h-full w-full object-cover" />
          ) : null}
        </div>
      </div>
      <div className="mt-16 grid gap-12 lg:grid-cols-2">
        <section>
          <h2 className="font-display text-4xl">Introduction</h2>
          <p className="mt-4 text-lg leading-relaxed text-muted">{profile.professionalIntro}</p>
          <p className="mt-4 leading-relaxed">{profile.biography}</p>
        </section>
        <section>
          <h2 className="font-display text-4xl">Philosophy</h2>
          <p className="mt-4 leading-relaxed text-muted">{profile.philosophy}</p>
          <h3 className="mt-8 text-xs tracking-[0.18em] text-muted">INTERESTS</h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {profile.interests.map((item) => (
              <li key={item} className="rounded-full border border-line px-3 py-1 text-sm">{item}</li>
            ))}
          </ul>
          <h3 className="mt-8 text-xs tracking-[0.18em] text-muted">TOOLS AND SKILLS</h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {profile.specialties.map((item) => (
              <li key={item} className="rounded-full border border-line px-3 py-1 text-sm">{item}</li>
            ))}
          </ul>
        </section>
      </div>
      <div className="mt-12 flex flex-wrap items-center justify-between gap-4">
        <SocialLinks profile={profile} />
        <p className="text-sm text-muted">
          {profile.collaborationAvailable ? "Open to collaboration." : "Collaboration status is set in the profile."}{" "}
          {profile.contactEmail ? <a className="text-cyan" href={`mailto:${profile.contactEmail}`}>{profile.contactEmail}</a> : null}
        </p>
      </div>
      <section className="mt-20">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-5xl">Featured creations</h2>
          <Link href="/contact" className="text-sm text-cyan">Contact</Link>
        </div>
        <div className="mt-8 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {featured.slice(0, 3).map((creation) => (
            <CreationCard key={creation.id} creation={creation} />
          ))}
        </div>
      </section>
    </article>
  );
}
