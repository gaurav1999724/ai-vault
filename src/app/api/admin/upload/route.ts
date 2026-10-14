import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { adminMutationStatus } from "@/lib/guards";
import { sameOrigin } from "@/lib/origin";
import { putObject } from "@/lib/storage";
import { detectMedia, mediaTooLarge, safeFilename } from "@/lib/uploads";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ message: "Forbidden." }, { status: 403 });
  const admin = await getCurrentAdmin();
  if (adminMutationStatus(admin) !== 200) return Response.json({ message: "Sign in required." }, { status: 401 });
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return Response.json({ message: "Choose a file." }, { status: 400 });
  const bytes = Buffer.from(await file.arrayBuffer());
  const detected = detectMedia(bytes);
  if (!detected) return Response.json({ message: "Use JPEG, PNG, WebP, AVIF, MP4, or WebM." }, { status: 400 });
  if (mediaTooLarge(detected.kind, bytes.length)) return Response.json({ message: "That file is too large." }, { status: 400 });
  const id = randomUUID();
  const key = `${detected.kind === "IMAGE" ? "images" : "videos"}/${id}.${detected.ext}`;
  let width: number | null = null;
  let height: number | null = null;
  let thumbnailKey: string | null = null;
  let thumbnailUrl: string | null = null;
  if (detected.kind === "IMAGE") {
    try {
      const meta = await sharp(bytes).metadata();
      width = meta.width ?? null;
      height = meta.height ?? null;
      const thumb = await sharp(bytes).rotate().resize({ width: 960, withoutEnlargement: true }).webp({ quality: 76 }).toBuffer();
      thumbnailKey = `thumbs/${id}.webp`;
      thumbnailUrl = await putObject(thumbnailKey, thumb, "image/webp");
    } catch {
      return Response.json({ message: "The image could not be processed." }, { status: 400 });
    }
  }
  const alt = String(form.get("alt") || "").trim().slice(0, 300) || null;
  const publicUrl = await putObject(key, bytes, detected.mime);
  const asset = await prisma.mediaAsset.create({
    data: {
      storageKey: key,
      publicUrl,
      thumbnailKey,
      thumbnailUrl,
      mimeType: detected.mime,
      kind: detected.kind,
      width,
      height,
      sizeBytes: bytes.length,
      altText: alt,
      originalFilename: safeFilename(file.name),
    },
  });
  return Response.json({
    asset: {
      id: asset.id,
      publicUrl: asset.publicUrl,
      thumbnailUrl: asset.thumbnailUrl,
      kind: asset.kind,
      originalFilename: asset.originalFilename,
      altText: asset.altText,
      width: asset.width,
      height: asset.height,
    },
  });
}
