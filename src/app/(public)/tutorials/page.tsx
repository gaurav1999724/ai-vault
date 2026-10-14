import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/states/empty-state";
import { getPublishedTutorials } from "@/lib/data/public";

export const metadata: Metadata = { title: "Tutorials", description: "Step-by-step creative workflows." };

export default async function TutorialsPage() {
  const tutorials = await getPublishedTutorials();
  return (
    <div className="mx-auto max-w-[1440px] px-5 pb-24 pt-32 md:px-8">
      <h1 className="font-display text-7xl">Tutorials</h1>
      <p className="mt-4 max-w-2xl text-muted">Ordered workflows with the tools, warnings, and related creations beside them.</p>
      {tutorials.length ? (
        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {tutorials.map((tutorial) => (
            <Link key={tutorial.slug} href={`/tutorials/${tutorial.slug}`} className="group block">
              <div className="aspect-[16/9] overflow-hidden rounded-[1.6rem] bg-surface">
                {tutorial.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={tutorial.coverUrl} alt={tutorial.coverAlt} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                ) : null}
              </div>
              <p className="mt-4 text-[11px] tracking-[0.16em] text-cyan">
                {tutorial.difficulty} · {tutorial.durationMinutes} MIN
              </p>
              <h2 className="mt-2 font-display text-4xl">{tutorial.title}</h2>
              <p className="mt-2 text-sm text-muted">{tutorial.summary}</p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-10">
          <EmptyState title="No tutorials yet" body="Published tutorials will be listed here." />
        </div>
      )}
    </div>
  );
}
