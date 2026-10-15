import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
  UploadPartCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { del } from "@vercel/blob";
import { isVercelBlobUrl } from "@/lib/media-file";

const localRoot = path.join(process.cwd(), "storage", "uploads");

export function storageMode() {
  return process.env.S3_BUCKET && process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY ? "s3" : "local";
}

export function uploadTransport(): "blob" | "s3" | "direct" | "unavailable" {
  if (process.env.BLOB_READ_WRITE_TOKEN) return "blob";
  if (storageMode() === "s3") return "s3";
  if (process.env.VERCEL) return "unavailable";
  return "direct";
}

function resolveLocal(key: string) {
  const file = path.resolve(localRoot, key);
  if (!file.startsWith(`${localRoot}${path.sep}`) && file !== localRoot) {
    throw new Error("Invalid storage key.");
  }
  return file;
}

function s3() {
  return new S3Client({
    region: process.env.S3_REGION || "auto",
    endpoint: process.env.S3_ENDPOINT || undefined,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
    },
  });
}

function bucket() {
  const name = process.env.S3_BUCKET;
  if (!name) throw new Error("S3_BUCKET is required when object storage is enabled.");
  return name;
}

export function publicUrlForKey(key: string) {
  if (storageMode() !== "s3") return `/media/${key.split(path.sep).join("/")}`;
  const base = process.env.S3_PUBLIC_BASE_URL?.replace(/\/$/, "");
  if (!base) throw new Error("S3_PUBLIC_BASE_URL is required when object storage is enabled.");
  return `${base}/${key}`;
}

export async function putObject(key: string, body: Buffer, contentType: string) {
  if (key.includes("..") || key.startsWith("/")) throw new Error("Invalid storage key.");
  if (storageMode() === "s3") {
    await s3().send(
      new PutObjectCommand({
        Bucket: bucket(),
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
    return publicUrlForKey(key);
  }
  const file = resolveLocal(key);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, body);
  return `/media/${key.split(path.sep).join("/")}`;
}

export async function removeObject(key: string) {
  if (!key || key.includes("..")) return;
  if (isVercelBlobUrl(key)) {
    await del(key).catch(() => undefined);
    return;
  }
  if (storageMode() === "s3") {
    await s3().send(new DeleteObjectCommand({ Bucket: bucket(), Key: key }));
    return;
  }
  await unlink(resolveLocal(key)).catch(() => undefined);
}

export async function beginS3Multipart(key: string, contentType: string) {
  const result = await s3().send(
    new CreateMultipartUploadCommand({
      Bucket: bucket(),
      Key: key,
      ContentType: contentType,
    }),
  );
  if (!result.UploadId) throw new Error("Upload could not start.");
  return result.UploadId;
}

export async function signS3Parts(key: string, uploadId: string, partNumbers: number[]) {
  const client = s3();
  return Promise.all(
    partNumbers.map(async (partNumber) => ({
      partNumber,
      url: await getSignedUrl(
        client,
        new UploadPartCommand({
          Bucket: bucket(),
          Key: key,
          UploadId: uploadId,
          PartNumber: partNumber,
        }),
        { expiresIn: 60 * 60 },
      ),
    })),
  );
}

export async function signS3Put(key: string, contentType: string) {
  return getSignedUrl(
    s3(),
    new PutObjectCommand({
      Bucket: bucket(),
      Key: key,
      ContentType: contentType,
    }),
    { expiresIn: 60 * 60 },
  );
}

export async function finishS3Multipart(key: string, uploadId: string, parts: { partNumber: number; etag: string }[]) {
  await s3().send(
    new CompleteMultipartUploadCommand({
      Bucket: bucket(),
      Key: key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts
          .slice()
          .sort((left, right) => left.partNumber - right.partNumber)
          .map((part) => ({ ETag: part.etag, PartNumber: part.partNumber })),
      },
    }),
  );
}

export async function abortS3Multipart(key: string, uploadId: string) {
  await s3()
    .send(new AbortMultipartUploadCommand({ Bucket: bucket(), Key: key, UploadId: uploadId }))
    .catch(() => undefined);
}

export async function statObject(key: string) {
  const result = await s3().send(new HeadObjectCommand({ Bucket: bucket(), Key: key }));
  return {
    size: result.ContentLength ?? 0,
    contentType: result.ContentType || "application/octet-stream",
  };
}

export function localUploadRoot() {
  return localRoot;
}
