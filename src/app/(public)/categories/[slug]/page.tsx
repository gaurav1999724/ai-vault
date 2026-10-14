import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GalleryScreen } from "@/components/creations/gallery-screen";
import { getCategory } from "@/lib/data/public";

export const instant = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const category = await getCategory((await params).slug);
  if (!category) return { title: "Category" };
  return { title: category.name, description: category.description || `${category.name} experiments.` };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();
  return (
    <GalleryScreen
      title={category.name}
      intro={category.description || "Published work filed under this category."}
      basePath={`/categories/${slug}`}
      preset={{ category: slug }}
      searchParams={searchParams}
    />
  );
}
