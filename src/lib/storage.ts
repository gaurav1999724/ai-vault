import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const localRoot = path.join(process.cwd(), "storage", "uploads");

export function storageMode() {
  return process.env.S3_BUCKET && process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY ? "s3" : "local";
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
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
    },
  });
}

export async function putObject(key: string, body: Buffer, contentType: string) {
  if (key.includes("..") || key.startsWith("/")) throw new Error("Invalid storage key.");
  if (storageMode() === "s3") {
    const base = process.env.S3_PUBLIC_BASE_URL?.replace(/\/$/, "");
    if (!base) throw new Error("S3_PUBLIC_BASE_URL is required when object storage is enabled.");
    await s3().send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
    return `${base}/${key}`;
  }
  const file = resolveLocal(key);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, body);
  return `/media/${key.split(path.sep).join("/")}`;
}

export async function removeObject(key: string) {
  if (!key || key.includes("..")) return;
  if (storageMode() === "s3") {
    await s3().send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key }));
    return;
  }
  await unlink(resolveLocal(key)).catch(() => undefined);
}

export function localUploadRoot() {
  return localRoot;
}
