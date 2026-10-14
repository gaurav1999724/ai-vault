"use client";

import { useState } from "react";
import { VideoPlayer } from "@/components/creations/video-player";
import type { CreationDetail } from "@/types/content";
import Link from "next/link";

export function MediaGallery({
  creation,
  previous,
  next,
}: {
  creation: CreationDetail;
  previous: { title: string; slug: string } | null;
  next: { title: string; slug: string } | null;
}) {
  const images = creation.media.filter((item) => item.kind === "IMAGE");
  const video = creation.media.find((item) => item.kind === "VIDEO" && (item.role === "MAIN" || item.role === "COVER"));
  const poster = creation.media.find((item) => item.role === "POSTER") || images[0];
  const [active, setActive] = useState(0);
  const frame = useState<HTMLElement | null>(null);
  const current = images[active];
  return (
    <figure className="space-y-4">
      <div ref={(node) => frame[1](node)} className="relative overflow-hidden rounded-[2rem] bg-black">
        {creation.mediaType === "VIDEO" ? (
          <div className="aspect-video">
            <VideoPlayer src={video?.url ?? null} poster={poster?.url ?? null} title={creation.title} />
          </div>
        ) : current ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current.url} alt={current.alt || creation.title} className="max-h-[78vh] w-full object-contain" />
        ) : (
          <div className="grid aspect-[16/10] place-items-center text-muted">No media uploaded.</div>
        )}
        <button
          type="button"
          className="absolute right-4 top-4 rounded-full bg-black/60 px-3 py-2 text-xs"
          onClick={() => {
            const node = frame[0];
            if (!node) return;
            if (document.fullscreenElement) void document.exitFullscreen();
            else void node.requestFullscreen();
          }}
        >
          Fullscreen
        </button>
      </div>
      {images.length > 1 ? (
        <div className="flex gap-3 overflow-x-auto">
          {images.map((image, index) => (
            <button key={image.id} type="button" className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-line" onClick={() => setActive(index)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.thumbnailUrl || image.url} alt={image.alt || ""} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
      <figcaption className="flex justify-between gap-4 text-sm text-muted">
        {previous ? <Link href={`/creations/${previous.slug}`}>Previous · {previous.title}</Link> : <span />}
        {next ? <Link href={`/creations/${next.slug}`}>Next · {next.title}</Link> : <span />}
      </figcaption>
    </figure>
  );
}
