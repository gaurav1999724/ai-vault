export const mediaTypes = ["IMAGE", "VIDEO", "IMAGE_SERIES", "TUTORIAL"] as const;
export const sortOptions = ["latest", "viewed", "copied", "featured"] as const;

export type MediaTypeName = (typeof mediaTypes)[number];
export type SortOption = (typeof sortOptions)[number];

export type ExploreQuery = {
  q?: string;
  category?: string;
  type?: MediaTypeName;
  types?: MediaTypeName[];
  tool?: string;
  tag?: string;
  sort: SortOption;
  page: number;
};

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function parseExploreParams(params: SearchParams, preset?: Partial<ExploreQuery>): ExploreQuery {
  const q = first(params.q)?.trim().slice(0, 120) || undefined;
  const category = preset?.category || first(params.category)?.trim().slice(0, 120) || undefined;
  const tool = first(params.tool)?.trim().slice(0, 140) || undefined;
  const tag = first(params.tag)?.trim().slice(0, 80) || undefined;
  const requestedType = first(params.type);
  const type = mediaTypes.find((item) => item === requestedType);
  const requestedSort = first(params.sort);
  const sort = sortOptions.find((item) => item === requestedSort) ?? preset?.sort ?? "latest";
  const pageNumber = Number(first(params.page) ?? preset?.page ?? 1);
  const page = Number.isFinite(pageNumber) ? Math.min(1000, Math.max(1, Math.trunc(pageNumber))) : 1;
  return {
    q,
    category,
    type: preset?.types ? undefined : preset?.type || type,
    types: preset?.types,
    tool,
    tag,
    sort,
    page,
  };
}

export function buildExploreWhere(query: ExploreQuery) {
  const where: Record<string, unknown> = { status: "PUBLISHED" };
  if (query.types?.length) where.mediaType = { in: query.types };
  else if (query.type) where.mediaType = query.type;
  if (query.category) where.categories = { some: { category: { slug: query.category, published: true } } };
  if (query.tool) where.tools = { some: { tool: { slug: query.tool } } };
  if (query.tag) where.tags = { some: { tag: { slug: query.tag } } };
  if (query.q) {
    where.OR = [
      { title: { contains: query.q } },
      { shortDescription: { contains: query.q } },
      { description: { contains: query.q } },
      { modelName: { contains: query.q } },
      { prompt: { contains: query.q } },
      { tags: { some: { tag: { name: { contains: query.q } } } } },
      { categories: { some: { category: { name: { contains: query.q } } } } },
      { tools: { some: { tool: { name: { contains: query.q } } } } },
    ];
  }
  return where;
}

export function buildOrderBy(sort: SortOption) {
  if (sort === "viewed") return [{ viewCount: "desc" as const }, { publishedAt: "desc" as const }];
  if (sort === "copied") return [{ copyCount: "desc" as const }, { publishedAt: "desc" as const }];
  if (sort === "featured") return [{ featured: "desc" as const }, { publishedAt: "desc" as const }];
  return [{ publishedAt: "desc" as const }];
}
