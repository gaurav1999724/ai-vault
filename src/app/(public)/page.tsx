import Link from "next/link";
import { CategoryCard } from "@/components/creations/category-card";
import { CreationCard } from "@/components/creations/creation-card";
import { CreatorProfileCard } from "@/components/creations/creator-profile-card";
import { CopyPromptButton } from "@/components/creations/copy-prompt-button";
import { HeroSection } from "@/components/home/hero-section";
import { InstagramCta } from "@/components/home/instagram-cta";
import { ProcessSection } from "@/components/home/process-section";
import { EmptyState } from "@/components/states/empty-state";
import { getFeaturedCreations, getProfile, getPromptOfTheDay, getPublicCategories, getSettings } from "@/lib/data/public";

export default async function HomePage() {
  const [profile, settings, featured, prompt, categories] = await Promise.all([
    getProfile(),
    getSettings(),
    getFeaturedCreations(),
    getPromptOfTheDay(),
    getPublicCategories(),
  ]);
  return (
    <>
      <HeroSection profile={profile} />
      {settings.featuredSectionVisible ? (
        <section id="selected" className="mx-auto max-w-[1440px] px-5 py-24 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <h2 className="font-display text-6xl md:text-7xl">Selected Experiments</h2>
              <p className="mt-4 max-w-xl text-muted">A collection of ideas transformed into visual experiences.</p>
            </div>
            <Link href="/explore" className="text-sm text-cyan">
              Explore all creations
            </Link>
          </div>
          {featured.length ? (
            <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-14 md:grid-cols-2 xl:grid-cols-12">
              {featured.map((creation, index) => (
                <div key={creation.id} className={index % 2 === 0 ? "xl:col-span-7" : "xl:col-span-5"}>
                  <CreationCard creation={creation} />
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-10">
              <EmptyState title="The vault is quiet" body="Published creations will appear here." />
            </div>
          )}
        </section>
      ) : null}
      {settings.showPromptOfDay && prompt ? (
        <section className="border-y border-line bg-panel">
          <div className="mx-auto grid max-w-[1440px] gap-8 px-5 py-20 md:px-8 lg:grid-cols-12">
            <div className="overflow-hidden rounded-[2rem] bg-surface lg:col-span-7">
              {prompt.media[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={prompt.media[0].url} alt={prompt.media[0].alt || prompt.title} className="h-full max-h-[640px] w-full object-cover" />
              ) : null}
            </div>
            <div className="lg:col-span-5">
              <p className="text-[11px] tracking-[0.22em] text-cyan">PROMPT OF THE DAY</p>
              <h2 className="mt-3 font-display text-5xl">{prompt.title}</h2>
              <p className="mt-4 text-muted">{prompt.shortDescription}</p>
              <p className="mt-4 text-sm text-ink/80">{prompt.platformName || prompt.tools[0]?.name || prompt.modelName}</p>
              <p className="mt-6 line-clamp-6 whitespace-pre-wrap text-sm leading-7 text-muted">{prompt.prompt}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <CopyPromptButton text={prompt.prompt} label="Copy Prompt" creationId={prompt.id} track />
                <Link href={`/creations/${prompt.slug}`} className="rounded-full border border-line px-4 py-2 text-sm">
                  View Full Workflow
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : null}
      <section className="mx-auto max-w-[1440px] px-5 py-24 md:px-8">
        <h2 className="font-display text-6xl">Explore by category</h2>
        <div data-cursor="drag" className="mt-8 flex gap-4 overflow-x-auto pb-4">
          {categories.map((category) => (
            <CategoryCard key={category.slug} category={category} />
          ))}
        </div>
        {!categories.length ? <EmptyState title="No categories yet" body="Published categories will show up here." /> : null}
      </section>
      {settings.showProcess ? <ProcessSection /> : null}
      <CreatorProfileCard profile={profile} />
      <InstagramCta settings={settings} profile={profile} />
    </>
  );
}
