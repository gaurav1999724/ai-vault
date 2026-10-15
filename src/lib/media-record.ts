import "server-only";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { safeFilename } from "@/lib/media-file";

const INT_MAX = 2_147_483_647;

export async function recordMediaAsset(input: {
  storageKey: string;
  publicUrl: string;
  thumbnailKey: string | null;
  thumbnailUrl: string | null;
  mimeType: string;
  kind: "IMAGE" | "VIDEO";
  width: number | null;
  height: number | null;
  size: number;
  filename: string;
}) {
  const size = Math.max(0, Math.round(input.size));
  const data = {
    storageKey: input.storageKey,
    publicUrl: input.publicUrl,
    thumbnailKey: input.thumbnailKey,
    thumbnailUrl: input.thumbnailUrl,
    mimeType: input.mimeType.slice(0, 120),
    kind: input.kind,
    width: input.width,
    height: input.height,
    sizeBytes: Math.min(size, INT_MAX),
    fileBytes: BigInt(size),
    altText: null as string | null,
    originalFilename: safeFilename(input.filename),
  };
  try {
    const asset = await prisma.mediaAsset.create({ data });
    return present(asset);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const existing = await prisma.mediaAsset.findUnique({ where: { storageKey: input.storageKey } });
      if (existing) return present(existing);
    }
    throw error;
  }
}

function present(asset: {
  id: string;
  publicUrl: string;
  thumbnailUrl: string | null;
  kind: "IMAGE" | "VIDEO";
  originalFilename: string;
  altText: string | null;
  width: number | null;
  height: number | null;
}) {
  return {
    id: asset.id,
    publicUrl: asset.publicUrl,
    thumbnailUrl: asset.thumbnailUrl,
    kind: asset.kind,
    originalFilename: asset.originalFilename,
    altText: asset.altText,
    width: asset.width,
    height: asset.height,
  };
}
