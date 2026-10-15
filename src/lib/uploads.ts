export { safeFilename } from "@/lib/media-file";

export type DetectedMedia = {
  mime: string;
  kind: "IMAGE" | "VIDEO";
  ext: string;
};

const HEIC_BRANDS = ["heic", "heix", "hevc", "heim", "heis", "hevm", "hevs", "mif1", "msf1"];
const VIDEO_BRANDS = ["mp41", "mp42", "isom", "iso2", "avc1", "dash", "m4v ", "msnv", "qt  ", "m4vh", "m4vp"];

export function detectMedia(buffer: Buffer): DetectedMedia | null {
  if (buffer.length < 12) return null;
  const gif = buffer.toString("ascii", 0, 6);
  if (gif === "GIF87a" || gif === "GIF89a") return { mime: "image/gif", kind: "IMAGE", ext: "gif" };
  if (buffer[0] === 0x42 && buffer[1] === 0x4d) return { mime: "image/bmp", kind: "IMAGE", ext: "bmp" };
  if (
    (buffer[0] === 0x49 && buffer[1] === 0x49 && buffer[2] === 0x2a && buffer[3] === 0x00) ||
    (buffer[0] === 0x4d && buffer[1] === 0x4d && buffer[2] === 0x00 && buffer[3] === 0x2a)
  ) {
    return { mime: "image/tiff", kind: "IMAGE", ext: "tif" };
  }
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { mime: "image/jpeg", kind: "IMAGE", ext: "jpg" };
  }
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return { mime: "image/png", kind: "IMAGE", ext: "png" };
  }
  if (buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") {
    return { mime: "image/webp", kind: "IMAGE", ext: "webp" };
  }
  if (buffer[0] === 0x00 && buffer[1] === 0x00 && buffer[2] === 0x01 && (buffer[3] === 0xba || buffer[3] === 0xb3)) {
    return { mime: "video/mpeg", kind: "VIDEO", ext: "mpg" };
  }
  if (buffer[0] === 0x1a && buffer[1] === 0x45 && buffer[2] === 0xdf && buffer[3] === 0xa3) {
    const head = buffer.subarray(0, Math.min(buffer.length, 4096)).toString("latin1");
    if (head.includes("matroska")) return { mime: "video/x-matroska", kind: "VIDEO", ext: "mkv" };
    return { mime: "video/webm", kind: "VIDEO", ext: "webm" };
  }
  if (buffer.toString("ascii", 4, 8) === "ftyp") {
    const brand = buffer.toString("ascii", 8, 12).toLowerCase();
    if (brand === "avif" || brand === "avis") return { mime: "image/avif", kind: "IMAGE", ext: "avif" };
    if (HEIC_BRANDS.includes(brand)) return { mime: "image/heic", kind: "IMAGE", ext: "heic" };
    if (VIDEO_BRANDS.includes(brand) || brand.startsWith("mp4")) {
      const quickTime = brand === "qt  ";
      return { mime: quickTime ? "video/quicktime" : "video/mp4", kind: "VIDEO", ext: quickTime ? "mov" : "mp4" };
    }
  }
  return null;
}
