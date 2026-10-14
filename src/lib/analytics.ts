import { createHash } from "node:crypto";

const COPY_BUCKET_MS = 10_000;

export function visitorIsValid(value: string | undefined) {
  return Boolean(value && /^[0-9a-f-]{36}$/i.test(value));
}

export function dedupeKey(visitorId: string, type: string, entityId: string, now: number) {
  const bucket = type === "PROMPT_COPY" ? Math.floor(now / COPY_BUCKET_MS) : new Date(now).toISOString().slice(0, 10);
  return createHash("sha256").update(`${visitorId}:${type}:${entityId}:${bucket}`).digest("hex");
}

export function rateKey(scope: string, value: string) {
  return createHash("sha256").update(`${scope}:${value.trim().toLowerCase()}`).digest("hex");
}
