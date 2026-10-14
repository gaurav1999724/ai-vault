import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function absoluteUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return new URL(path, base.endsWith("/") ? base : `${base}/`).toString();
}

export function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export function asSocialLinks(value: unknown): { label: string; url: string }[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const record = item as { label?: unknown; url?: unknown };
    if (typeof record.label !== "string" || typeof record.url !== "string") return [];
    return [{ label: record.label, url: record.url }];
  });
}

export function asSettingPairs(value: unknown): { label: string; value: string }[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const record = item as { label?: unknown; value?: unknown };
    if (typeof record.label !== "string" || typeof record.value !== "string") return [];
    return [{ label: record.label, value: record.value }];
  });
}
