"use client";

import { toast } from "sonner";
import { useFavoriteSlugs, writeFavorites } from "@/lib/favorites-client";

export function FavoriteButton({ slug, creationId }: { slug: string; creationId: string }) {
  const saved = useFavoriteSlugs().includes(slug);
  return (
    <button
      type="button"
      className="rounded-full border border-line px-4 py-2 text-sm"
      onClick={() => {
        const current = JSON.parse(localStorage.getItem("acv-favorites") || "[]") as string[];
        const without = current.filter((item) => item !== slug);
        const nowSaved = !saved;
        writeFavorites(nowSaved ? [...without, slug] : without);
        toast.success(nowSaved ? "Saved on this device" : "Removed from this device");
        if (nowSaved) {
          void fetch("/api/analytics", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ type: "FAVORITE", creationId }),
          });
        }
      }}
    >
      {saved ? "Saved" : "Save to Favorites"}
    </button>
  );
}
