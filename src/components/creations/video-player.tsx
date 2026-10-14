"use client";

import { useRef, useState } from "react";

export function VideoPlayer({ src, poster, title }: { src: string | null; poster: string | null; title: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [previewing, setPreviewing] = useState(false);
  if (!src) {
    return poster ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={poster} alt={title} className="h-full w-full object-cover" />
    ) : (
      <div className="grid h-full min-h-64 place-items-center text-sm text-muted">No video file has been uploaded.</div>
    );
  }
  return (
    <div className="relative h-full">
      <video ref={ref} controls playsInline preload="metadata" poster={poster ?? undefined} className="h-full w-full bg-black">
        <source src={src} />
      </video>
      <button
        type="button"
        className="absolute bottom-16 left-3 rounded-full bg-black/70 px-3 py-2 text-xs"
        onClick={() => {
          const video = ref.current;
          if (!video) return;
          video.muted = true;
          void video.play();
          setPreviewing(true);
        }}
      >
        {previewing ? "Muted preview playing" : "Play muted preview"}
      </button>
    </div>
  );
}
