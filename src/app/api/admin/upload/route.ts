import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { head } from "@vercel/blob";
import { getCurrentAdmin } from "@/lib/auth";
import { adminMutationStatus } from "@/lib/guards";
import {
  blobPathname,
  BLOB_MAX_BYTES,
  contentTypeFor,
  fileExtension,
  isStorageKey,
  isVercelBlobUrl,
  kindFromContentType,
  kindFromFile,
  s3PartCount,
  s3PartSize,
  storageKeyFor,
} from "@/lib/media-file";
import { recordMediaAsset } from "@/lib/media-record";
import { sameOrigin } from "@/lib/origin";
import {
  abortS3Multipart,
  beginS3Multipart,
  finishS3Multipart,
  publicUrlForKey,
  putObject,
  removeObject,
  signS3Parts,
  signS3Put,
  statObject,
  uploadTransport,
} from "@/lib/storage";
import { detectMedia, safeFilename } from "@/lib/uploads";

const THUMB_MEMORY_LIMIT = 64 * 1024 * 1024;

function denied(request: Request, admin: { id: string } | null) {
  if (!sameOrigin(request)) return Response.json({ message: "Forbidden." }, { status: 403 });
  if (adminMutationStatus(admin) !== 200) return Response.json({ message: "Sign in required." }, { status: 401 });
  return null;
}

function databaseAsleep(error: unknown) {
  const text = (error instanceof Error ? error.message : "").toLowerCase();
  return text.includes("can't reach database server") || text.includes("p1001") || text.includes("connection pool") || text.includes("timed out fetching");
}

function failure(error: unknown) {
  if (databaseAsleep(error)) {
    return Response.json({ message: "The archive database is still waking up. Wait a few seconds and try the upload again." }, { status: 503 });
  }
  const message = error instanceof Error && error.message.length < 180 ? error.message : "Upload failed.";
  const status = message === "Sign in required." ? 401 : 400;
  return Response.json({ message }, { status });
}

function asRecord(body: unknown) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  return body as Record<string, unknown>;
}

function isBlobEvent(body: unknown): body is HandleUploadBody {
  const type = asRecord(body)?.type;
  return type === "blob.generate-client-token" || type === "blob.upload-completed";
}

function dimension(value: unknown) {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0 || value > 100_000) return null;
  return value;
}

function readParts(value: unknown) {
  if (!Array.isArray(value) || value.length === 0 || value.length > 10_000) return null;
  const parts: { partNumber: number; etag: string }[] = [];
  const seen = new Set<number>();
  for (const item of value) {
    const record = asRecord(item);
    const partNumber = record?.partNumber;
    const etag = record?.etag;
    if (typeof partNumber !== "number" || !Number.isInteger(partNumber) || partNumber < 1 || partNumber > 10_000) return null;
    if (typeof etag !== "string" || etag.length < 1 || etag.length > 200) return null;
    if (seen.has(partNumber)) return null;
    seen.add(partNumber);
    parts.push({ partNumber, etag });
  }
  return parts;
}

function uploadIdOk(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9+/=._-]{8,1024}$/.test(value);
}

async function saved(input: Parameters<typeof recordMediaAsset>[0]) {
  const asset = await recordMediaAsset(input);
  return Response.json({ asset });
}

async function handleBlob(request: Request, body: HandleUploadBody, admin: { id: string } | null) {
  if (body.type === "blob.generate-client-token") {
    const rejection = denied(request, admin);
    if (rejection) return rejection;
    const contentType = typeof body.payload.clientPayload === "string" ? readClientType(body.payload.clientPayload) : "";
    const kind = kindFromContentType(contentType);
    if (!kind && !body.payload.pathname.startsWith("thumbs/")) {
      return Response.json({ message: "Use an image or a video." }, { status: 400 });
    }
  }
  try {
    const result = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async (pathname) => {
        const current = await getCurrentAdmin();
        if (!current) throw new Error("Sign in required.");
        if (pathname.includes("..") || !/^(images|videos|thumbs)\//.test(pathname)) {
          throw new Error("Invalid upload path.");
        }
        return {
          addRandomSuffix: true,
          maximumSizeInBytes: BLOB_MAX_BYTES,
          validUntil: Date.now() + 12 * 60 * 60 * 1000,
          allowOverwrite: false,
        };
      },
    });
    return Response.json(result);
  } catch (error) {
    return failure(error);
  }
}

function readClientType(payload: string) {
  try {
    const parsed = JSON.parse(payload) as { contentType?: unknown };
    return typeof parsed.contentType === "string" ? parsed.contentType : "";
  } catch {
    return "";
  }
}

async function registerBlob(body: Record<string, unknown>) {
  const url = typeof body.url === "string" ? body.url : "";
  const filename = typeof body.filename === "string" ? body.filename : "file";
  if (!isVercelBlobUrl(url)) return Response.json({ message: "That file is not in the media store." }, { status: 400 });
  let meta: Awaited<ReturnType<typeof head>>;
  try {
    meta = await head(url);
  } catch {
    return Response.json({ message: "That file is not in the media store." }, { status: 400 });
  }
  const storageKey = blobPathname(meta.pathname);
  const kind = kindFromContentType(meta.contentType);
  if (!storageKey || !kind || storageKey.startsWith("thumbs/")) {
    await removeObject(meta.url);
    return Response.json({ message: "Use an image or a video." }, { status: 400 });
  }
  let thumbnailKey: string | null = null;
  let thumbnailUrl: string | null = null;
  const thumbUrl = typeof body.thumbnailUrl === "string" ? body.thumbnailUrl : "";
  if (thumbUrl && isVercelBlobUrl(thumbUrl)) {
    try {
      const thumb = await head(thumbUrl);
      const thumbKey = blobPathname(thumb.pathname);
      if (thumbKey && kindFromContentType(thumb.contentType) === "IMAGE") {
        thumbnailKey = thumbKey;
        thumbnailUrl = thumb.url;
      }
    } catch {
      thumbnailKey = null;
    }
  }
  try {
    return await saved({
      storageKey,
      publicUrl: meta.url,
      thumbnailKey,
      thumbnailUrl,
      mimeType: meta.contentType,
      kind,
      width: dimension(body.width),
      height: dimension(body.height),
      size: meta.size,
      filename,
    });
  } catch (error) {
    return failure(error);
  }
}

async function planS3(body: Record<string, unknown>) {
  const filename = typeof body.filename === "string" ? body.filename : "";
  const contentType = typeof body.contentType === "string" ? body.contentType : "";
  const size = typeof body.size === "number" ? body.size : Number(body.size);
  const kind = kindFromContentType(contentType) || kindFromFile({ name: filename, type: contentType });
  if (!kind || !Number.isFinite(size) || size <= 0) return Response.json({ message: "Use an image or a video." }, { status: 400 });
  const extension = fileExtension(filename) || (kind === "IMAGE" ? "jpg" : "mp4");
  const key = storageKeyFor(kind, randomUUID(), extension);
  try {
    const uploadId = await beginS3Multipart(key, contentTypeFor({ name: filename, type: contentType }) || contentType);
    return Response.json({
      transport: "s3",
      key,
      uploadId,
      partSize: s3PartSize(size),
      partCount: s3PartCount(size),
      publicUrl: publicUrlForKey(key),
    });
  } catch (error) {
    return failure(error);
  }
}

async function signParts(body: Record<string, unknown>) {
  const key = typeof body.key === "string" ? body.key : "";
  const uploadId = body.uploadId;
  const partNumbers = Array.isArray(body.partNumbers) ? body.partNumbers : null;
  if (!isStorageKey(key) || !uploadIdOk(uploadId) || !partNumbers || partNumbers.length === 0 || partNumbers.length > 32) {
    return Response.json({ message: "Upload failed." }, { status: 400 });
  }
  const numbers = partNumbers.filter((part): part is number => typeof part === "number" && Number.isInteger(part) && part >= 1 && part <= 10_000);
  if (numbers.length !== partNumbers.length) return Response.json({ message: "Upload failed." }, { status: 400 });
  try {
    return Response.json({ parts: await signS3Parts(key, uploadId, numbers) });
  } catch (error) {
    return failure(error);
  }
}

async function completeS3(body: Record<string, unknown>) {
  const key = typeof body.key === "string" ? body.key : "";
  const uploadId = body.uploadId;
  const parts = readParts(body.parts);
  const filename = typeof body.filename === "string" ? body.filename : "file";
  if (!isStorageKey(key) || !uploadIdOk(uploadId) || !parts) return Response.json({ message: "Upload failed." }, { status: 400 });
  try {
    await finishS3Multipart(key, uploadId, parts);
  } catch (error) {
    await abortS3Multipart(key, uploadId);
    return failure(error);
  }
  try {
    const stat = await statObject(key);
    const kind = kindFromContentType(stat.contentType) || kindFromFile({ name: filename, type: stat.contentType });
    if (!kind) {
      await removeObject(key);
      return Response.json({ message: "Use an image or a video." }, { status: 400 });
    }
    const thumbnailKey = typeof body.thumbnailKey === "string" && isStorageKey(body.thumbnailKey) ? body.thumbnailKey : null;
    let thumbnailUrl: string | null = null;
    if (thumbnailKey) {
      try {
        const thumb = await statObject(thumbnailKey);
        if (kindFromContentType(thumb.contentType) === "IMAGE") thumbnailUrl = publicUrlForKey(thumbnailKey);
      } catch {
        thumbnailUrl = null;
      }
    }
    return await saved({
      storageKey: key,
      publicUrl: publicUrlForKey(key),
      thumbnailKey: thumbnailUrl ? thumbnailKey : null,
      thumbnailUrl,
      mimeType: stat.contentType,
      kind,
      width: dimension(body.width),
      height: dimension(body.height),
      size: stat.size,
      filename,
    });
  } catch (error) {
    return failure(error);
  }
}

async function thumbTarget() {
  const key = storageKeyFor("THUMB", randomUUID(), "webp");
  try {
    const uploadUrl = await signS3Put(key, "image/webp");
    return Response.json({ key, uploadUrl, publicUrl: publicUrlForKey(key) });
  } catch (error) {
    return failure(error);
  }
}

async function handleIntent(body: Record<string, unknown>) {
  const intent = body.intent;
  if (intent === "plan") {
    const transport = uploadTransport();
    if (transport === "unavailable") {
      return Response.json({
        transport,
        message: "Add a Vercel Blob store to this project so images and videos upload directly to storage. This host cannot accept the file in the app server.",
      });
    }
    if (transport === "s3") return planS3(body);
    return Response.json({ transport });
  }
  if (intent === "register") {
    if (uploadTransport() !== "blob") return Response.json({ message: "Upload failed." }, { status: 400 });
    return registerBlob(body);
  }
  if (intent === "s3-parts" || intent === "s3-complete" || intent === "s3-thumb" || intent === "s3-abort") {
    if (uploadTransport() !== "s3") return Response.json({ message: "Upload failed." }, { status: 400 });
  }
  if (intent === "s3-parts") return signParts(body);
  if (intent === "s3-complete") return completeS3(body);
  if (intent === "s3-thumb") return thumbTarget();
  if (intent === "s3-abort") {
    const key = typeof body.key === "string" ? body.key : "";
    if (isStorageKey(key) && uploadIdOk(body.uploadId)) await abortS3Multipart(key, body.uploadId);
    return Response.json({ ok: true });
  }
  return Response.json({ message: "Upload failed." }, { status: 400 });
}

async function handleDirect(request: Request) {
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || file.size <= 0) return Response.json({ message: "Choose a file." }, { status: 400 });
  const bytes = Buffer.from(await file.arrayBuffer());
  const detected = detectMedia(bytes);
  if (!detected) return Response.json({ message: "Use an image or a video." }, { status: 400 });
  const id = randomUUID();
  const key = `${detected.kind === "IMAGE" ? "images" : "videos"}/${id}.${detected.ext}`;
  let width: number | null = null;
  let height: number | null = null;
  let thumbnailKey: string | null = null;
  let thumbnailUrl: string | null = null;
  if (detected.kind === "IMAGE" && bytes.length <= THUMB_MEMORY_LIMIT) {
    try {
      const meta = await sharp(bytes).metadata();
      width = meta.width ?? null;
      height = meta.height ?? null;
      const thumb = await sharp(bytes).rotate().resize({ width: 960, withoutEnlargement: true }).webp({ quality: 76 }).toBuffer();
      thumbnailKey = `thumbs/${id}.webp`;
      thumbnailUrl = await putObject(thumbnailKey, thumb, "image/webp");
    } catch {
      width = null;
      height = null;
      thumbnailKey = null;
      thumbnailUrl = null;
    }
  }
  try {
    const publicUrl = await putObject(key, bytes, detected.mime);
    return await saved({
      storageKey: key,
      publicUrl,
      thumbnailKey,
      thumbnailUrl,
      mimeType: detected.mime,
      kind: detected.kind,
      width,
      height,
      size: bytes.length,
      filename: safeFilename(file.name),
    });
  } catch (error) {
    return failure(error);
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      let body: unknown;
      try {
        body = await request.json();
      } catch {
        return Response.json({ message: "Upload failed." }, { status: 400 });
      }
      if (isBlobEvent(body)) return handleBlob(request, body, admin);
      const rejection = denied(request, admin);
      if (rejection) return rejection;
      const record = asRecord(body);
      if (!record) return Response.json({ message: "Upload failed." }, { status: 400 });
      return handleIntent(record);
    }
    const rejection = denied(request, admin);
    if (rejection) return rejection;
    return handleDirect(request);
  } catch (error) {
    return failure(error);
  }
}
