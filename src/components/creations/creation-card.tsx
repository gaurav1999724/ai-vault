"use client";

import Link from "next/link";
import { useRef } from "react";
import type { CardData } from "@/types/content";
import { cn } from "@/lib/utils";

const labels: Record<CardData["mediaType"], string> = {
  IMAGE: "Image",
  VIDEO: "Video",
  IMAGE_SERIES: "Series",
  TUTORIAL: "Tutorial",
};

export function CreationCard({ creation, className }: { creation: CardData; className?: string }) {
  const ref = useRef<HTMLElement>(null);
  return (
    <article
      ref={ref}
      className={cn("group", className)}
      onPointerMove={(event) => {
        if (event.pointerType !== "mouse" || !ref.current) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const rect = ref.current.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        ref.current.style.transform = `perspective(900px) rotateX(${(-y * 4).toFixed(2)}deg) rotateY(${(x * 4).toFixed(2)}deg)`;
      }}
      onPointerLeave={() => {
        if (ref.current) ref.current.style.transform = "none";
      }}
    >
      <Link href={`/creations/${creation.slug}`} data-cursor="view" className="block">
        <div className="relative overflow-hidden rounded-2xl bg-surface" style={{ aspectRatio: creation.width && creation.height ? `${creation.width} / ${creation.height}` : "4 / 5" }}>
          {creation.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={creation.coverUrl} alt={creation.coverAlt} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
          ) : (
            <div className="grid h-full min-h-64 place-items-center text-xs tracking-[0.18em] text-muted">NO PREVIEW</div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_var(--x,50%)_var(--y,0%),rgba(93,228,255,0.16),transparent_40%)] opacity-0 transition group-hover:opacity-100" />
          <span className="absolute left-3 top-3 rounded-full bg-black/50 px-3 py-1 text-[10px] tracking-[0.16em]">{labels[creation.mediaType]}</span>
        </div>
        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-cyan">{creation.categoryName || "Uncategorized"}</p>
            <h3 className="mt-1 font-display text-3xl leading-none transition group-hover:translate-x-1">{creation.title}</h3>
            <p className="mt-2 line-clamp-2 max-w-md text-sm text-muted">{creation.shortDescription}</p>
          </div>
          {creation.modelName ? <span className="shrink-0 text-xs text-muted">{creation.modelName}</span> : null}
        </div>
        <div className="mt-3 flex items-center justify-between text-[11px] tracking-[0.14em] text-muted">
          <span>{creation.viewCount} views · {creation.copyCount} copies</span>
          <span className="text-ink/80">Explore Creation</span>
        </div>
      </Link>
    </article>
  );
}
