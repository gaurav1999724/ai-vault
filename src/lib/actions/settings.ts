"use server";

import { updateTag } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { profileSchema, settingsSchema } from "@/lib/validators/admin";
import { fieldErrors } from "@/lib/validators/creation";
import type { ActionResult } from "@/types/content";

export async function saveProfile(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Check the profile fields.", fieldErrors: fieldErrors(parsed.error) };
  const data = parsed.data;
  await prisma.creatorProfile.upsert({
    where: { id: "default" },
    update: data,
    create: { id: "default", ...data },
  });
  updateTag("profile");
  return { ok: true, message: "Profile saved." };
}

export async function saveSettings(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Check the settings fields.", fieldErrors: fieldErrors(parsed.error) };
  const data = parsed.data;
  await prisma.siteSetting.upsert({
    where: { id: "default" },
    update: data,
    create: { id: "default", ...data },
  });
  updateTag("settings");
  updateTag("sitemap");
  return { ok: true, message: "Settings saved." };
}

export async function markMessageRead(id: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.contactMessage.update({ where: { id }, data: { readAt: new Date() } });
  return { ok: true };
}
