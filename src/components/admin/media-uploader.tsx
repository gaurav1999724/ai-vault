"use client";

import { useState } from "react";
import { sendMediaFile } from "@/lib/browser-upload";
import type { AssetOption } from "@/types/content";

export function MediaUploader({ onUploaded }: { onUploaded: (asset: AssetOption) => void }) {
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");
  return (
    <div>
      <label className="inline-flex cursor-pointer rounded-full border border-line px-4 py-2 text-sm">
        Upload media
        <input
          className="sr-only"
          type="file"
          accept="image/*,video/*"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            setError("");
            setProgress(0);
            void sendMediaFile(file, setProgress)
              .then((asset) => {
                setProgress(null);
                onUploaded(asset);
              })
              .catch((reason: unknown) => {
                setProgress(null);
                setError(reason instanceof Error && reason.message ? reason.message : "Upload failed.");
              });
          }}
        />
      </label>
      {progress != null ? <p className="mt-2 text-xs text-muted">Uploading {progress}%</p> : null}
      {error ? <p className="mt-2 text-sm text-warm">{error}</p> : null}
    </div>
  );
}
