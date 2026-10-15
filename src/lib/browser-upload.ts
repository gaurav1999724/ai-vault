"use client";

import { upload } from "@vercel/blob/client";
import { readPreview } from "@/lib/browser-preview";
import { contentTypeFor, kindFromFile, safeFilename } from "@/lib/media-file";
import type { AssetOption } from "@/types/content";

type Plan =
  | { transport: "blob" | "direct" }
  | { transport: "unavailable"; message?: string }
  | { transport: "s3"; key: string; uploadId: string; partSize: number; partCount: number };

async function postJson<T>(body: unknown): Promise<T> {
  const response = await fetch("/api/admin/upload", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await response.json().catch(() => ({}))) as T & { message?: string };
  if (!response.ok) throw new Error(data.message || "Upload failed.");
  return data;
}

function uploadError(error: unknown) {
  if (!(error instanceof Error) || !error.message) return "Upload failed.";
  if (error.message.includes("client token")) return "The upload could not start. Stay signed in and try again.";
  return error.message.length < 180 ? error.message : "Upload failed.";
}

async function uploadDirect(file: File, onProgress: (percent: number) => void) {
  return new Promise<AssetOption>((resolve, reject) => {
    const data = new FormData();
    data.set("file", file);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/upload");
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      const body = JSON.parse(xhr.responseText || "{}") as { message?: string; asset?: AssetOption };
      if (xhr.status >= 400 || !body.asset) reject(new Error(body.message || "Upload failed."));
      else resolve(body.asset);
    };
    xhr.onerror = () => reject(new Error("Upload failed."));
    xhr.send(data);
  });
}

async function uploadBlob(file: File, kind: "IMAGE" | "VIDEO", onProgress: (percent: number) => void) {
  const preview = await readPreview(file);
  const contentType = contentTypeFor(file);
  const folder = kind === "IMAGE" ? "images" : "videos";
  const stored = await upload(`${folder}/${safeFilename(file.name)}`, file, {
    access: "public",
    handleUploadUrl: "/api/admin/upload",
    contentType,
    clientPayload: JSON.stringify({ contentType }),
    multipart: file.size > 4 * 1024 * 1024,
    onUploadProgress: ({ loaded, total }) => onProgress(total > 0 ? Math.min(99, Math.round((loaded / total) * 100)) : 0),
  });
  let thumbnailUrl: string | null = null;
  if (preview.thumbnail) {
    try {
      const thumbType = preview.thumbnail.type || "image/webp";
      const thumb = await upload("thumbs/preview.webp", preview.thumbnail, {
        access: "public",
        handleUploadUrl: "/api/admin/upload",
        contentType: thumbType,
        clientPayload: JSON.stringify({ contentType: thumbType }),
      });
      thumbnailUrl = thumb.url;
    } catch {
      thumbnailUrl = null;
    }
  }
  const registered = await postJson<{ asset: AssetOption }>({
    intent: "register",
    url: stored.url,
    thumbnailUrl,
    filename: file.name,
    width: preview.width,
    height: preview.height,
  });
  return registered.asset;
}

async function putPart(url: string, chunk: Blob) {
  const response = await fetch(url, { method: "PUT", body: chunk });
  if (!response.ok) throw new Error("Upload failed.");
  const etag = response.headers.get("etag");
  if (!etag) throw new Error("The storage bucket did not share the upload confirmation. Allow the ETag header on that bucket.");
  return etag;
}

async function uploadS3(file: File, plan: Extract<Plan, { transport: "s3" }>, onProgress: (percent: number) => void) {
  const preview = await readPreview(file);
  const parts: { partNumber: number; etag: string }[] = [];
  let uploaded = 0;
  try {
    for (let start = 1; start <= plan.partCount; start += 16) {
      const partNumbers: number[] = [];
      for (let number = start; number < start + 16 && number <= plan.partCount; number += 1) partNumbers.push(number);
      const signed = await postJson<{ parts: { partNumber: number; url: string }[] }>({
        intent: "s3-parts",
        key: plan.key,
        uploadId: plan.uploadId,
        partNumbers,
      });
      await Promise.all(
        signed.parts.map(async (part) => {
          const begin = (part.partNumber - 1) * plan.partSize;
          const chunk = file.slice(begin, Math.min(file.size, begin + plan.partSize));
          const etag = await putPart(part.url, chunk);
          parts.push({ partNumber: part.partNumber, etag });
          uploaded += chunk.size;
          onProgress(Math.min(99, Math.round((uploaded / file.size) * 100)));
        }),
      );
    }
    let thumbnailKey: string | null = null;
    if (preview.thumbnail) {
      try {
        const thumb = await postJson<{ key: string; uploadUrl: string }>({ intent: "s3-thumb" });
        const response = await fetch(thumb.uploadUrl, {
          method: "PUT",
          body: preview.thumbnail,
          headers: { "content-type": preview.thumbnail.type || "image/webp" },
        });
        if (response.ok) thumbnailKey = thumb.key;
      } catch {
        thumbnailKey = null;
      }
    }
    const registered = await postJson<{ asset: AssetOption }>({
      intent: "s3-complete",
      key: plan.key,
      uploadId: plan.uploadId,
      parts,
      filename: file.name,
      width: preview.width,
      height: preview.height,
      thumbnailKey,
    });
    onProgress(100);
    return registered.asset;
  } catch (error) {
    await postJson({ intent: "s3-abort", key: plan.key, uploadId: plan.uploadId }).catch(() => undefined);
    throw error;
  }
}

export async function sendMediaFile(file: File, onProgress: (percent: number) => void) {
  try {
    const kind = kindFromFile(file);
    const contentType = contentTypeFor(file);
    if (!kind || !contentType) throw new Error("Use an image or a video.");
    const plan = await postJson<Plan>({ intent: "plan", filename: file.name, size: file.size, contentType });
    if (plan.transport === "unavailable") {
      throw new Error(plan.message || "Add a Vercel Blob store before uploading.");
    }
    if (plan.transport === "blob") return await uploadBlob(file, kind, onProgress);
    if (plan.transport === "s3") return await uploadS3(file, plan, onProgress);
    return await uploadDirect(file, onProgress);
  } catch (error) {
    throw new Error(uploadError(error));
  }
}
