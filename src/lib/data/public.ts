import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { PAGE_SIZE } from "@/lib/constants";
import { buildExploreWhere, buildOrderBy, type ExploreQuery } from "@/lib/explore";
import { asStringArray } from "@/lib/utils";
import { cardInclude, creationInclude, toCard, toCreationDetail, toProfile, toSettings, toTutorialCard, toTutorialDetail } from "@/lib/serialize";

const tutorialInclude = {
  coverAsset: true,
  steps: { include: { mediaAsset: true }, orderBy: { order: "asc" as const } },
  tools: { include: { tool: true } },
  creations: { include: { creation: { include: cardInclude } } },
} satisfies Prisma.TutorialInclude;

export async function getProfile() {
  "use cache";
  cacheLife("hours");
  cacheTag("profile");
  const [profile, publishedCount] = await Promise.all([
    prisma.creatorProfile.findUnique({ where: { id: "default" }, include: { profileImage: true } }),
    prisma.creation.count({ where: { status: "PUBLISHED" } }),
  ]);
  return toProfile(profile, publishedCount);
}

export async function getSettings() {
  "use cache";
  cacheLife("hours");
  cacheTag("settings");
  const settings = await prisma.siteSetting.findUnique({
    where: { id: "default" },
    include: { logoAsset: true, faviconAsset: true, socialImage: true },
  });
  const ids = asStringArray(settings?.instagramPreviewIds);
  const assets = ids.length ? await prisma.mediaAsset.findMany({ where: { id: { in: ids } } }) : [];
  const previews = ids.flatMap((id) => {
    const asset = assets.find((item) => item.id === id);
    if (!asset) return [];
    return [{ url: asset.thumbnailUrl || asset.publicUrl, alt: asset.altText || "Studio preview" }];
  });
  return toSettings(settings, previews);
}

export async function getFeaturedCreations() {
  "use cache";
  cacheLife("minutes");
  cacheTag("creations");
  const featured = await prisma.creation.findMany({
    where: { status: "PUBLISHED", featured: true },
    include: cardInclude,
    orderBy: { publishedAt: "desc" },
    take: 6,
  });
  const rows = featured.length
    ? featured
    : await prisma.creation.findMany({
        where: { status: "PUBLISHED" },
        include: cardInclude,
        orderBy: { publishedAt: "desc" },
        take: 6,
      });
  return rows.map(toCard);
}

export async function getPromptOfTheDay() {
  "use cache";
  cacheLife("minutes");
  cacheTag("creations");
  const creation = await prisma.creation.findFirst({
    where: { status: "PUBLISHED", promptOfTheDay: true },
    include: creationInclude,
    orderBy: { updatedAt: "desc" },
  });
  return creation ? toCreationDetail(creation) : null;
}

export async function getPublicCategories() {
  "use cache";
  cacheLife("minutes");
  cacheTag("categories", "creations");
  const categories = await prisma.category.findMany({
    where: { published: true },
    include: { coverAsset: true, _count: { select: { creations: { where: { creation: { status: "PUBLISHED" } } } } } },
    orderBy: { displayOrder: "asc" },
  });
  return categories.map((category) => ({
    name: category.name,
    slug: category.slug,
    description: category.description,
    coverUrl: category.coverAsset?.thumbnailUrl || category.coverAsset?.publicUrl || null,
    coverAlt: category.coverAsset?.altText || category.name,
    count: category._count.creations,
  }));
}

export async function getCategory(slug: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag("categories", `category:${slug}`);
  const category = await prisma.category.findFirst({
    where: { slug, published: true },
    include: { coverAsset: true },
  });
  if (!category) return null;
  return {
    name: category.name,
    slug: category.slug,
    description: category.description,
    coverUrl: category.coverAsset?.publicUrl || null,
    coverAlt: category.coverAsset?.altText || category.name,
    count: 0,
  };
}

export async function getExplore(query: ExploreQuery) {
  "use cache";
  cacheLife("minutes");
  cacheTag("creations");
  const where = buildExploreWhere(query) as Prisma.CreationWhereInput;
  const [total, rows] = await Promise.all([
    prisma.creation.count({ where }),
    prisma.creation.findMany({
      where,
      include: cardInclude,
      orderBy: buildOrderBy(query.sort),
      skip: (query.page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);
  return { total, page: query.page, pageSize: PAGE_SIZE, items: rows.map(toCard) };
}

export async function getFacets() {
  "use cache";
  cacheLife("minutes");
  cacheTag("categories", "creations");
  const [categories, tools, tags] = await Promise.all([
    prisma.category.findMany({
      where: { published: true },
      orderBy: { displayOrder: "asc" },
      select: { name: true, slug: true },
    }),
    prisma.aiTool.findMany({ orderBy: { name: "asc" }, select: { name: true, slug: true } }),
    prisma.tag.findMany({
      where: { creations: { some: { creation: { status: "PUBLISHED" } } } },
      orderBy: { name: "asc" },
      select: { name: true, slug: true },
    }),
  ]);
  return { categories, tools, tags };
}

export async function getCreationStatus(slug: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag("creations", `creation:${slug}`);
  const row = await prisma.creation.findUnique({ where: { slug }, select: { status: true } });
  return row?.status ?? null;
}

export async function getPublishedCreation(slug: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag("creations", `creation:${slug}`);
  const creation = await prisma.creation.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: creationInclude,
  });
  if (!creation) return null;
  const categoryIds = creation.categories.map((item) => item.categoryId);
  const toolIds = creation.tools.map((item) => item.toolId);
  const relatedWhere: Prisma.CreationWhereInput = {
    status: "PUBLISHED",
    id: { not: creation.id },
  };
  const or: Prisma.CreationWhereInput[] = [];
  if (categoryIds.length) or.push({ categories: { some: { categoryId: { in: categoryIds } } } });
  if (toolIds.length) or.push({ tools: { some: { toolId: { in: toolIds } } } });
  if (or.length) relatedWhere.OR = or;
  const [related, previous, next] = await Promise.all([
    prisma.creation.findMany({ where: relatedWhere, include: cardInclude, orderBy: { publishedAt: "desc" }, take: 4 }),
    creation.publishedAt
      ? prisma.creation.findFirst({
          where: { status: "PUBLISHED", publishedAt: { lt: creation.publishedAt } },
          orderBy: { publishedAt: "desc" },
          select: { title: true, slug: true },
        })
      : null,
    creation.publishedAt
      ? prisma.creation.findFirst({
          where: { status: "PUBLISHED", publishedAt: { gt: creation.publishedAt } },
          orderBy: { publishedAt: "asc" },
          select: { title: true, slug: true },
        })
      : null,
  ]);
  return {
    creation: toCreationDetail(creation),
    related: related.map(toCard),
    previous,
    next,
  };
}

export async function getDraftCreation(slug: string) {
  const creation = await prisma.creation.findFirst({ where: { slug }, include: creationInclude });
  if (!creation) return null;
  return {
    creation: toCreationDetail(creation, true),
    related: [],
    previous: null,
    next: null,
  };
}

export async function getPublishedTutorials() {
  "use cache";
  cacheLife("minutes");
  cacheTag("tutorials");
  const tutorials = await prisma.tutorial.findMany({
    where: { status: "PUBLISHED" },
    include: { coverAsset: true },
    orderBy: { publishedAt: "desc" },
  });
  return tutorials.map(toTutorialCard);
}

export async function getTutorialStatus(slug: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag("tutorials", `tutorial:${slug}`);
  const row = await prisma.tutorial.findUnique({ where: { slug }, select: { status: true } });
  return row?.status ?? null;
}

export async function getPublishedTutorial(slug: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag("tutorials", `tutorial:${slug}`);
  const tutorial = await prisma.tutorial.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: tutorialInclude,
  });
  return tutorial ? toTutorialDetail(tutorial) : null;
}

export async function getDraftTutorial(slug: string) {
  const tutorial = await prisma.tutorial.findFirst({ where: { slug }, include: tutorialInclude });
  return tutorial ? toTutorialDetail(tutorial, true) : null;
}

export async function getCardsBySlugs(slugs: string[]) {
  const unique = [...new Set(slugs)].slice(0, 40);
  if (!unique.length) return [];
  const rows = await prisma.creation.findMany({
    where: { slug: { in: unique }, status: "PUBLISHED" },
    include: cardInclude,
  });
  const order = new Map(unique.map((slug, index) => [slug, index]));
  return rows.sort((a, b) => (order.get(a.slug) ?? 0) - (order.get(b.slug) ?? 0)).map(toCard);
}

export async function getSitemapEntries() {
  "use cache";
  cacheLife("hours");
  cacheTag("creations", "tutorials", "categories", "sitemap");
  const [creations, tutorials, categories] = await Promise.all([
    prisma.creation.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
    prisma.tutorial.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
    prisma.category.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
  ]);
  return { creations, tutorials, categories };
}
