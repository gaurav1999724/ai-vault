"use client";

import { useState } from "react";
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
          accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            setError("");
            const data = new FormData();
            data.set("file", file);
            const xhr = new XMLHttpRequest();
            xhr.open("POST", "/api/admin/upload");
            xhr.upload.onprogress = (progressEvent) => {
              if (progressEvent.lengthComputable) setProgress(Math.round((progressEvent.loaded / progressEvent.total) * 100));
            };
            xhr.onload = () => {
              setProgress(null);
              const body = JSON.parse(xhr.responseText || "{}") as { message?: string; asset?: AssetOption };
              if (xhr.status >= 400 || !body.asset) {
                setError(body.message || "Upload failed.");
                return;
              }
              onUploaded(body.asset);
            };
            xhr.onerror = () => {
              setProgress(null);
              setError("Upload failed.");
            };
            xhr.send(data);
          }}
        />
      </label>
      {progress != null ? <p className="mt-2 text-xs text-muted">Uploading {progress}%</p> : null}
      {error ? <p className="mt-2 text-sm text-warm">{error}</p> : null}
    </div>
  );
}
