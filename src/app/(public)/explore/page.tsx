import type { Metadata } from "next";
import { GalleryScreen } from "@/components/creations/gallery-screen";

export const metadata: Metadata = { title: "Explore", description: "Browse published AI images, videos, and workflows." };

export default function ExplorePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return (
    <GalleryScreen
      title="Explore"
      intro="A living index of published experiments. Filter by medium, model, or the language of the prompt."
      basePath="/explore"
      searchParams={searchParams}
    />
  );
}
