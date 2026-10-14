import { z } from "zod";

export function nullableText(max: number) {
  return z.preprocess((value) => {
    if (value == null) return null;
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  }, z.string().max(max).nullable());
}

export function nullableNumber(min: number, max: number, integer = false) {
  return z.preprocess((value) => {
    if (value == null || value === "") return null;
    const number = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(number)) return value;
    return integer ? Math.trunc(number) : number;
  }, z.number().min(min).max(max).nullable());
}

export function optionalUrl(max = 500) {
  return z.preprocess((value) => {
    if (value == null) return null;
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  }, z.string().url().max(max).nullable());
}

export const slugSchema = z
  .string()
  .trim()
  .min(2)
  .max(180)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens.");
