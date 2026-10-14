"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteMedia } from "@/lib/actions/media";
import { MediaUploader } from "@/components/admin/media-uploader";

export function MediaLibrary({
  query,
  assets,
}: {
  query: string;
  assets: {
    id: string;
    publicUrl: string;
    thumbnailUrl: string | null;
    kind: "IMAGE" | "VIDEO";
    originalFilename: string;
    altText: string | null;
    width: number | null;
    height: number | null;
    mimeType: string;
    sizeBytes: number;
  }[];
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <form>
          <input name="q" defaultValue={query} placeholder="Search filename" className="rounded-full border border-line bg-transparent px-4 py-3 text-sm" />
        </form>
        <MediaUploader onUploaded={() => router.refresh()} />
      </div>
      {message ? <p className="text-sm text-cyan">{message}</p> : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {assets.map((asset) => (
          <article key={asset.id} className="rounded-2xl border border-line p-3">
            {asset.kind === "IMAGE" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={asset.thumbnailUrl || asset.publicUrl} alt={asset.altText || asset.originalFilename} className="aspect-square w-full rounded-xl object-cover" />
            ) : (
              <video src={asset.publicUrl} className="aspect-square w-full rounded-xl bg-black" muted controls preload="metadata" />
            )}
            <p className="mt-3 truncate text-sm">{asset.originalFilename}</p>
            <p className="text-xs text-muted">{asset.mimeType} · {Math.ceil(asset.sizeBytes / 1024)} KB {asset.width ? `· ${asset.width}×${asset.height}` : ""}</p>
            <button type="button" disabled={pending} className="mt-3 text-sm text-warm" onClick={() => start(async () => {
              const result = await deleteMedia(asset.id);
              setMessage(result.message || "");
              if (result.ok) router.refresh();
            })}>Delete</button>
          </article>
        ))}
      </div>
      {!assets.length ? <p className="text-sm text-muted">No files match.</p> : null}
    </div>
  );
}
