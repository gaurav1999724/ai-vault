"use server";

import { updateTag } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { asStringArray } from "@/lib/utils";
import { isVercelBlobUrl } from "@/lib/media-file";
import { removeObject } from "@/lib/storage";
import type { ActionResult } from "@/types/content";

export async function deleteMedia(id: string): Promise<ActionResult> {
  await requireAdmin();
  const asset = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!asset) return { ok: false, message: "That file is already gone." };
  const settings = await prisma.siteSetting.findUnique({ where: { id: "default" } });
  if (asStringArray(settings?.instagramPreviewIds).includes(id)) {
    return { ok: false, message: "Remove this file from the Instagram previews before deleting it." };
  }
  try {
    await prisma.mediaAsset.delete({ where: { id } });
  } catch {
    return { ok: false, message: "This file is still used by a creation, tutorial, category, profile, or setting." };
  }
  await removeObject(isVercelBlobUrl(asset.publicUrl) ? asset.publicUrl : asset.storageKey);
  if (asset.thumbnailUrl && isVercelBlobUrl(asset.thumbnailUrl)) await removeObject(asset.thumbnailUrl);
  else if (asset.thumbnailKey) await removeObject(asset.thumbnailKey);
  updateTag("creations");
  updateTag("settings");
  return { ok: true, message: "File deleted." };
}
