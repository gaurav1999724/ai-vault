import { Suspense } from "react";
import { CreationFilters } from "@/components/creations/creation-filters";
import { CreationGrid } from "@/components/creations/creation-grid";
import { LoadingSkeleton } from "@/components/states/loading-skeleton";
import { getExplore, getFacets } from "@/lib/data/public";
import { parseExploreParams, type ExploreQuery } from "@/lib/explore";

type Params = Record<string, string | string[] | undefined>;

export function GalleryScreen({
  title,
  intro,
  basePath,
  preset,
  searchParams,
}: {
  title: string;
  intro: string;
  basePath: string;
  preset?: Partial<ExploreQuery>;
  searchParams: Promise<Params>;
}) {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <GalleryBody title={title} intro={intro} basePath={basePath} preset={preset} searchParams={searchParams} />
    </Suspense>
  );
}

async function GalleryBody({
  title,
  intro,
  basePath,
  preset,
  searchParams,
}: {
  title: string;
  intro: string;
  basePath: string;
  preset?: Partial<ExploreQuery>;
  searchParams: Promise<Params>;
}) {
  const query = parseExploreParams(await searchParams, preset);
  const [result, facets] = await Promise.all([getExplore(query), getFacets()]);
  const href = (page: number) => {
    const params = new URLSearchParams();
    if (query.q) params.set("q", query.q);
    if (query.category && !preset?.category) params.set("category", query.category);
    if (query.type) params.set("type", query.type);
    if (query.tool) params.set("tool", query.tool);
    if (query.tag) params.set("tag", query.tag);
    if (query.sort !== "latest") params.set("sort", query.sort);
    if (page > 1) params.set("page", String(page));
    const search = params.toString();
    return search ? `${basePath}?${search}` : basePath;
  };
  return (
    <div className="mx-auto max-w-[1440px] px-5 pb-24 pt-32 md:px-8">
      <p className="text-[11px] tracking-[0.22em] text-violet">ARCHIVE</p>
      <h1 className="mt-3 max-w-4xl font-display text-6xl leading-none md:text-8xl">{title}</h1>
      <p className="mt-5 max-w-2xl text-lg text-muted">{intro}</p>
      <div className="mt-10">
        <CreationFilters query={query} facets={facets} basePath={basePath} />
      </div>
      <div className="mt-12">
        <CreationGrid
          items={result.items}
          page={result.page}
          total={result.total}
          pageSize={result.pageSize}
          prevHref={result.page > 1 ? href(result.page - 1) : undefined}
          nextHref={result.page * result.pageSize < result.total ? href(result.page + 1) : undefined}
        />
      </div>
    </div>
  );
}
