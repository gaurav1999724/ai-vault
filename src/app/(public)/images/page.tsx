import type { Metadata } from "next";
import { GalleryScreen } from "@/components/creations/gallery-screen";

export const metadata: Metadata = { title: "AI Images", description: "Published AI images and image series." };

export default function ImagesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return (
    <GalleryScreen
      title="AI Images"
      intro="Still images and series, with the prompt and settings kept beside the picture."
      basePath="/images"
      preset={{ types: ["IMAGE", "IMAGE_SERIES"] }}
      searchParams={searchParams}
    />
  );
}
