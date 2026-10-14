"use client";

import { useEffect, useState } from "react";
import { CreationCard } from "@/components/creations/creation-card";
import { EmptyState } from "@/components/states/empty-state";
import { useFavoriteSlugs } from "@/lib/favorites-client";
import type { CardData } from "@/types/content";

export default function FavoritesPage() {
  const slugs = useFavoriteSlugs();
  const key = slugs.join("|");
  const [items, setItems] = useState<CardData[] | null>(null);
  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    void fetch("/api/favorites", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slugs: key.split("|") }),
    })
      .then((response) => response.json())
      .then((data: { items?: CardData[] }) => {
        if (!cancelled) setItems(data.items || []);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, [key]);
  const visible = key ? items : [];
  return (
    <div className="mx-auto max-w-[1440px] px-5 pb-24 pt-32 md:px-8">
      <h1 className="font-display text-7xl">Favorites</h1>
      <p className="mt-4 max-w-xl text-muted">Saved in this browser only. There are no visitor accounts.</p>
      {key && visible === null ? <p className="mt-10 text-sm text-muted">Loading saved work…</p> : null}
      <div className="mt-10 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        {visible?.map((item) => <CreationCard key={item.id} creation={item} />)}
      </div>
      {visible && visible.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="No saved creations" body="Use Save to Favorites on a creation page." />
        </div>
      ) : null}
    </div>
  );
}
