import { MAX_IMAGE_BYTES, MAX_VIDEO_BYTES } from "@/lib/constants";

export type DetectedMedia = {
  mime: string;
  kind: "IMAGE" | "VIDEO";
  ext: string;
};

export function detectMedia(buffer: Buffer): DetectedMedia | null {
  if (buffer.length < 12) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { mime: "image/jpeg", kind: "IMAGE", ext: "jpg" };
  }
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return { mime: "image/png", kind: "IMAGE", ext: "png" };
  }
  if (buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") {
    return { mime: "image/webp", kind: "IMAGE", ext: "webp" };
  }
  if (buffer[0] === 0x1a && buffer[1] === 0x45 && buffer[2] === 0xdf && buffer[3] === 0xa3) {
    return { mime: "video/webm", kind: "VIDEO", ext: "webm" };
  }
  if (buffer.toString("ascii", 4, 8) === "ftyp") {
    const brand = buffer.toString("ascii", 8, 12).toLowerCase();
    if (brand === "avif" || brand === "avis") return { mime: "image/avif", kind: "IMAGE", ext: "avif" };
    const videoBrands = ["mp41", "mp42", "isom", "iso2", "avc1", "dash", "m4v ", "msnv"];
    if (videoBrands.includes(brand) || brand.startsWith("mp4")) {
      return { mime: "video/mp4", kind: "VIDEO", ext: "mp4" };
    }
  }
  return null;
}

export function mediaTooLarge(kind: "IMAGE" | "VIDEO", size: number) {
  return kind === "IMAGE" ? size > MAX_IMAGE_BYTES : size > MAX_VIDEO_BYTES;
}

export function safeFilename(name: string) {
  const cleaned = name.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/_+/g, "_").slice(0, 120);
  return cleaned || "file";
}
