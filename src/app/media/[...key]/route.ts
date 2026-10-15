import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { localUploadRoot } from "@/lib/storage";

const types: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".bmp": "image/bmp",
  ".tif": "image/tiff",
  ".tiff": "image/tiff",
  ".heic": "image/heic",
  ".heif": "image/heif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".m4v": "video/mp4",
  ".ogv": "video/ogg",
  ".mkv": "video/x-matroska",
  ".mpg": "video/mpeg",
  ".mpeg": "video/mpeg",
};

export async function GET(request: Request, context: { params: Promise<{ key: string[] }> }) {
  const { key } = await context.params;
  const relative = key.join("/");
  if (!relative || relative.includes("..")) return new Response("Not found", { status: 404 });
  const root = localUploadRoot();
  const file = path.resolve(root, relative);
  if (!file.startsWith(`${root}${path.sep}`)) return new Response("Not found", { status: 404 });
  try {
    const info = await stat(file);
    if (!info.isFile()) return new Response("Not found", { status: 404 });
    const contentType = types[path.extname(file).toLowerCase()] || "application/octet-stream";
    const shared = {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "Accept-Ranges": "bytes",
    };
    const range = request.headers.get("range");
    if (range) {
      const match = /^bytes=(\d+)-(\d*)$/.exec(range);
      if (!match) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${info.size}` } });
      const start = Number(match[1]);
      const end = match[2] ? Number(match[2]) : info.size - 1;
      if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end < start || start >= info.size) {
        return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${info.size}` } });
      }
      const capped = Math.min(end, info.size - 1);
      const stream = Readable.toWeb(createReadStream(file, { start, end: capped })) as ReadableStream;
      return new Response(stream, {
        status: 206,
        headers: {
          ...shared,
          "Content-Range": `bytes ${start}-${capped}/${info.size}`,
          "Content-Length": String(capped - start + 1),
        },
      });
    }
    const stream = Readable.toWeb(createReadStream(file)) as ReadableStream;
    return new Response(stream, {
      headers: {
        ...shared,
        "Content-Length": String(info.size),
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
