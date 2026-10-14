import type { MetadataRoute } from "next";
import { getSitemapEntries } from "@/lib/data/public";
import { absoluteUrl } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await getSitemapEntries();
  const staticRoutes = ["", "/explore", "/images", "/videos", "/tutorials", "/about", "/contact", "/privacy", "/terms"].map((path) => ({
    url: absoluteUrl(path || "/"),
  }));
  return [
    ...staticRoutes,
    ...entries.creations.map((item) => ({ url: absoluteUrl(`/creations/${item.slug}`), lastModified: item.updatedAt })),
    ...entries.tutorials.map((item) => ({ url: absoluteUrl(`/tutorials/${item.slug}`), lastModified: item.updatedAt })),
    ...entries.categories.map((item) => ({ url: absoluteUrl(`/categories/${item.slug}`), lastModified: item.updatedAt })),
  ];
}
