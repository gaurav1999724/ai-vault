import type { PublicProfile, PublicSettings } from "@/types/content";

export function InstagramCta({ settings, profile }: { settings: PublicSettings; profile: PublicProfile }) {
  if (!settings.showInstagramCta) return null;
  const href = profile.instagramUrl;
  const handle = settings.instagramHandle || profile.username;
  return (
    <section className="relative overflow-hidden border-y border-line">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(139,92,246,0.25),transparent_30%),radial-gradient(circle_at_80%_70%,rgba(93,228,255,0.16),transparent_28%)]" />
      <div className="relative mx-auto grid max-w-[1440px] gap-8 px-5 py-24 md:px-8 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-[clamp(3.5rem,7vw,6.5rem)] leading-[0.9]">
            Let&apos;s Create Something <span className="italic">Unreal.</span>
          </h2>
          <p className="mt-6 text-lg text-muted">@{handle?.replace(/^@/, "")}</p>
          {href ? (
            <a href={href} target="_blank" rel="noreferrer" className="mt-8 inline-flex rounded-full bg-ink px-6 py-3 text-sm text-background">
              Follow on Instagram
            </a>
          ) : null}
        </div>
        {settings.instagramPreviews.length ? (
          <div className="grid grid-cols-3 gap-3">
            {settings.instagramPreviews.map((preview) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={preview.url} src={preview.url} alt={preview.alt} className="aspect-square rounded-2xl object-cover" />
            ))}
          </div>
        ) : (
          <p className="self-end text-sm text-muted">Latest posts appear here only when preview images are added in website settings.</p>
        )}
      </div>
    </section>
  );
}
