import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/content/breadcrumbs";
import { Markdown } from "@/components/content/markdown";
import { FavoriteButton } from "@/components/creations/favorite-button";
import { MediaGallery } from "@/components/creations/media-gallery";
import { PromptPanel } from "@/components/creations/prompt-panel";
import { RelatedCreations } from "@/components/creations/related-creations";
import { ShareButton } from "@/components/creations/share-button";
import { TutorialTimeline } from "@/components/creations/tutorial-timeline";
import { ViewTracker } from "@/components/creations/view-tracker";
import { LoadingSkeleton } from "@/components/states/loading-skeleton";
import { getCurrentAdmin } from "@/lib/auth";
import { getCreationStatus, getDraftCreation, getProfile, getPublishedCreation } from "@/lib/data/public";
import { absoluteUrl } from "@/lib/utils";
import type { CardData, CreationDetail } from "@/types/content";

export const instant = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const data = await getPublishedCreation((await params).slug);
  if (!data) return { title: "Creation", robots: { index: false, follow: false } };
  const { creation } = data;
  const image = creation.media[0]?.url;
  return {
    title: creation.seoTitle || creation.title,
    description: creation.seoDescription || creation.shortDescription,
    alternates: { canonical: `/creations/${creation.slug}` },
    openGraph: {
      title: creation.seoTitle || creation.title,
      description: creation.seoDescription || creation.shortDescription,
      images: image ? [image] : undefined,
    },
  };
}

export default async function CreationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const published = await getPublishedCreation(slug);
  if (published) return <CreationView data={published.creation} related={published.related} previous={published.previous} next={published.next} />;
  if ((await getCreationStatus(slug)) !== "DRAFT") notFound();
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <DraftPreview slug={slug} />
    </Suspense>
  );
}

async function DraftPreview({ slug }: { slug: string }) {
  const admin = await getCurrentAdmin();
  if (!admin) notFound();
  const draft = await getDraftCreation(slug);
  if (!draft) notFound();
  return <CreationView data={draft.creation} related={[]} previous={null} next={null} />;
}

async function CreationView({
  data,
  related,
  previous,
  next,
}: {
  data: CreationDetail;
  related: CardData[];
  previous: { title: string; slug: string } | null;
  next: { title: string; slug: string } | null;
}) {
  const profile = await getProfile();
  const notes = [
    data.workflowNotes ? ["Workflow notes", data.workflowNotes] : null,
    data.limitations ? ["Limitations", data.limitations] : null,
    data.credits ? ["Credits", data.credits] : null,
    data.subscriptions ? ["Required subscriptions", data.subscriptions] : null,
    data.motionInstructions ? ["Motion instructions", data.motionInstructions] : null,
    data.characterNotes ? ["Character consistency", data.characterNotes] : null,
  ].filter((item): item is [string, string] => Boolean(item));
  const downloads = data.media.filter((item) => item.role === "DOWNLOAD" || item.role === "SOURCE" || item.role === "REFERENCE");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: data.title,
    description: data.shortDescription,
    creator: { "@type": "Person", name: profile.name },
    datePublished: data.publishedAt,
    url: absoluteUrl(`/creations/${data.slug}`),
  };
  return (
    <article className="mx-auto max-w-[1440px] px-5 pb-24 pt-32 md:px-8">
      {data.preview ? null : <ViewTracker creationId={data.id} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {data.preview ? <p className="mb-6 rounded-full border border-warm/40 px-4 py-2 text-sm text-warm">Draft preview. This page is not public.</p> : null}
      <Breadcrumbs items={[{ label: "Explore", href: "/explore" }, { label: data.categories[0]?.name || "Creation", href: data.categories[0] ? `/categories/${data.categories[0].slug}` : undefined }, { label: data.title }]} />
      <header className="mt-6 grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <h1 className="font-display text-6xl leading-[0.9] md:text-8xl">{data.title}</h1>
          <p className="mt-5 max-w-3xl text-lg text-muted">{data.description}</p>
        </div>
        <dl className="space-y-2 text-sm text-muted lg:col-span-4 lg:text-right">
          <div>By {profile.name}</div>
          {data.publishedAt ? <div>{new Date(data.publishedAt).toLocaleDateString("en", { dateStyle: "long" })}</div> : null}
          <div>{data.mediaType.replaceAll("_", " ").toLowerCase()}</div>
          {data.featured ? <div>Featured</div> : null}
          <div className="flex flex-wrap gap-2 lg:justify-end">
            {data.tags.map((tag) => (
              <span key={tag.slug} className="rounded-full border border-line px-2 py-1 text-xs">
                {tag.name}
              </span>
            ))}
          </div>
        </dl>
      </header>
      <div className="mt-10">
        <MediaGallery creation={data} previous={previous} next={next} />
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <ShareButton title={data.title} path={`/creations/${data.slug}`} />
        <FavoriteButton slug={data.slug} creationId={data.id} />
      </div>
      <div className="mt-12 grid gap-10 lg:grid-cols-12">
        <div className="space-y-12 lg:col-span-7">
          <section>
            <h2 className="font-display text-4xl">Workflow</h2>
            <div className="mt-6">
              <TutorialTimeline steps={data.steps} />
            </div>
          </section>
          {notes.map(([title, body]) => (
            <section key={title}>
              <h2 className="font-display text-3xl">{title}</h2>
              <div className="mt-3">
                <Markdown content={body} />
              </div>
            </section>
          ))}
          {downloads.length ? (
            <section>
              <h2 className="font-display text-3xl">Reference files</h2>
              <ul className="mt-4 space-y-2 text-sm">
                {downloads.map((item) => (
                  <li key={item.id}>
                    <a className="text-cyan" href={item.url} download>
                      {item.role.toLowerCase()} · {item.alt || "Download"}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {data.tools.length ? (
            <section>
              <h2 className="font-display text-3xl">Tools used</h2>
              <ul className="mt-4 space-y-2 text-sm text-muted">
                {data.tools.map((tool) => (
                  <li key={tool.slug}>
                    {tool.name}
                    {tool.modelName ? ` · ${tool.modelName}` : ""}
                    {tool.websiteUrl ? " · catalog link only" : ""}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
        <div className="lg:col-span-5">
          <PromptPanel creation={data} />
        </div>
      </div>
      <RelatedCreations items={related} />
    </article>
  );
}
