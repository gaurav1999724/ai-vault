import type { Metadata } from "next";
import { GalleryScreen } from "@/components/creations/gallery-screen";

export const metadata: Metadata = { title: "AI Videos", description: "Published AI video experiments." };

export default function VideosPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return (
    <GalleryScreen
      title="AI Videos"
      intro="Motion studies with duration, camera notes, and the prompt that directed them."
      basePath="/videos"
      preset={{ type: "VIDEO" }}
      searchParams={searchParams}
    />
  );
}
