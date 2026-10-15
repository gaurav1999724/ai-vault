const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "avif", "gif", "bmp", "tif", "tiff", "heic", "heif"]);
const VIDEO_EXTENSIONS = new Set(["mp4", "webm", "mov", "m4v", "ogv", "ogg", "mkv", "mpeg", "mpg"]);

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  gif: "image/gif",
  bmp: "image/bmp",
  tif: "image/tiff",
  tiff: "image/tiff",
  heic: "image/heic",
  heif: "image/heif",
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  m4v: "video/mp4",
  ogv: "video/ogg",
  ogg: "video/ogg",
  mkv: "video/x-matroska",
  mpeg: "video/mpeg",
  mpg: "video/mpeg",
};

export const BLOB_MAX_BYTES = 5 * 1024 * 1024 * 1024 * 1024;
export const S3_MIN_PART_BYTES = 8 * 1024 * 1024;
export const S3_MAX_PARTS = 10_000;

export function fileExtension(name: string) {
  const match = /\.([a-z0-9]{1,8})$/i.exec(name);
  return match?.[1]?.toLowerCase() || "";
}

export function kindFromFile(file: { name: string; type: string }): "IMAGE" | "VIDEO" | null {
  const type = file.type.toLowerCase();
  if (type.startsWith("image/")) return "IMAGE";
  if (type.startsWith("video/")) return "VIDEO";
  const extension = fileExtension(file.name);
  if (IMAGE_EXTENSIONS.has(extension)) return "IMAGE";
  if (VIDEO_EXTENSIONS.has(extension)) return "VIDEO";
  return null;
}

export function contentTypeFor(file: { name: string; type: string }) {
  const type = file.type.toLowerCase().split(";")[0]?.trim() || "";
  if (type.startsWith("image/") || type.startsWith("video/")) return type;
  return CONTENT_TYPES[fileExtension(file.name)] || "";
}

export function kindFromContentType(type: string): "IMAGE" | "VIDEO" | null {
  const value = type.toLowerCase().split(";")[0]?.trim() || "";
  if (value.startsWith("image/")) return "IMAGE";
  if (value.startsWith("video/")) return "VIDEO";
  return null;
}

export function safeFilename(name: string) {
  const cleaned = name.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/_+/g, "_").slice(0, 120);
  return cleaned || "file";
}

export function isVercelBlobUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      (url.hostname.endsWith(".public.blob.vercel-storage.com") || url.hostname.endsWith(".blob.vercel-storage.com"))
    );
  } catch {
    return false;
  }
}

export function siteMediaUrl(pathname: string) {
  return `/media/${pathname.replace(/^\/+/, "")}`;
}

export function blobPathname(pathname: string) {
  const key = pathname.replace(/^\/+/, "");
  if (!key || key.includes("..") || key.length > 400) return null;
  if (!/^(images|videos|thumbs)\//.test(key)) return null;
  return key;
}

export function isStorageKey(value: string) {
  return /^(images|videos|thumbs)\/[A-Za-z0-9][A-Za-z0-9._-]{0,180}$/.test(value);
}

export function storageKeyFor(kind: "IMAGE" | "VIDEO" | "THUMB", id: string, extension: string) {
  const folder = kind === "IMAGE" ? "images" : kind === "VIDEO" ? "videos" : "thumbs";
  const clean = extension.replace(/[^a-z0-9]/gi, "").slice(0, 8) || (kind === "VIDEO" ? "mp4" : "bin");
  return `${folder}/${id}.${clean}`;
}

export function s3PartSize(size: number) {
  if (!Number.isFinite(size) || size <= 0) return S3_MIN_PART_BYTES;
  if (size <= S3_MIN_PART_BYTES) return Math.ceil(size);
  const partsAtMin = Math.ceil(size / S3_MIN_PART_BYTES);
  if (partsAtMin <= S3_MAX_PARTS) return S3_MIN_PART_BYTES;
  return Math.ceil(size / S3_MAX_PARTS);
}

export function s3PartCount(size: number) {
  if (!Number.isFinite(size) || size <= 0) return 1;
  return Math.max(1, Math.ceil(size / s3PartSize(size)));
}
