import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/content/breadcrumbs";
import { Markdown } from "@/components/content/markdown";
import { RelatedCreations } from "@/components/creations/related-creations";
import { TutorialTimeline } from "@/components/creations/tutorial-timeline";
import { ViewTracker } from "@/components/creations/view-tracker";
import { LoadingSkeleton } from "@/components/states/loading-skeleton";
import { getCurrentAdmin } from "@/lib/auth";
import { getDraftTutorial, getPublishedTutorial, getTutorialStatus } from "@/lib/data/public";
import type { TutorialDetail } from "@/types/content";

export const instant = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const tutorial = await getPublishedTutorial((await params).slug);
  if (!tutorial) return { title: "Tutorial", robots: { index: false, follow: false } };
  return {
    title: tutorial.seoTitle || tutorial.title,
    description: tutorial.seoDescription || tutorial.summary,
    alternates: { canonical: `/tutorials/${tutorial.slug}` },
    openGraph: { images: tutorial.coverUrl ? [tutorial.coverUrl] : undefined },
  };
}

export default async function TutorialPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const published = await getPublishedTutorial(slug);
  if (published) return <TutorialView tutorial={published} />;
  if ((await getTutorialStatus(slug)) !== "DRAFT") notFound();
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <DraftTutorial slug={slug} />
    </Suspense>
  );
}

async function DraftTutorial({ slug }: { slug: string }) {
  const admin = await getCurrentAdmin();
  if (!admin) notFound();
  const draft = await getDraftTutorial(slug);
  if (!draft) notFound();
  return <TutorialView tutorial={draft} />;
}

function TutorialView({ tutorial }: { tutorial: TutorialDetail }) {
  return (
    <article className="mx-auto max-w-4xl px-5 pb-24 pt-32 md:px-8">
      {tutorial.preview ? <p className="mb-6 text-sm text-warm">Draft preview.</p> : <ViewTracker tutorialId={tutorial.id} />}
      <Breadcrumbs items={[{ label: "Tutorials", href: "/tutorials" }, { label: tutorial.title }]} />
      <p className="mt-6 text-[11px] tracking-[0.18em] text-cyan">
        {tutorial.difficulty} · {tutorial.durationMinutes} MIN
      </p>
      <h1 className="mt-3 font-display text-6xl leading-none">{tutorial.title}</h1>
      <p className="mt-5 text-lg text-muted">{tutorial.summary}</p>
      {tutorial.coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={tutorial.coverUrl} alt={tutorial.coverAlt} className="mt-8 w-full rounded-[2rem] object-cover" />
      ) : null}
      {tutorial.tools.length ? (
        <p className="mt-6 text-sm text-muted">Tools: {tutorial.tools.map((tool) => tool.name).join(", ")}. Catalog records only.</p>
      ) : null}
      <nav className="mt-8 flex flex-wrap gap-3 text-sm" aria-label="Steps">
        {tutorial.steps.map((step) => (
          <a key={step.order} href={`#step-${step.order}`} className="rounded-full border border-line px-3 py-1">
            {step.order}. {step.title}
          </a>
        ))}
      </nav>
      <div className="mt-10">
        <TutorialTimeline steps={tutorial.steps} />
      </div>
      {tutorial.tips ? (
        <section className="mt-12">
          <h2 className="font-display text-4xl">Helpful tips</h2>
          <Markdown content={tutorial.tips} />
        </section>
      ) : null}
      {tutorial.troubleshooting ? (
        <section className="mt-10">
          <h2 className="font-display text-4xl">Troubleshooting</h2>
          <Markdown content={tutorial.troubleshooting} />
        </section>
      ) : null}
      <RelatedCreations items={tutorial.creations} />
      <Link href="/tutorials" className="mt-10 inline-block text-sm text-cyan">
        All tutorials
      </Link>
    </article>
  );
}
