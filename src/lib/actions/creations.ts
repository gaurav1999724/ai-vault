"use server";

import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { creationSchema, fieldErrors } from "@/lib/validators/creation";
import type { ActionResult } from "@/types/content";

function invalidate(slug?: string) {
  updateTag("creations");
  updateTag("categories");
  updateTag("sitemap");
  if (slug) updateTag(`creation:${slug}`);
}

export async function saveCreation(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = creationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Check the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
  }
  const data = parsed.data;
  try {
    const saved = await prisma.$transaction(async (tx) => {
      const existing = data.id ? await tx.creation.findUnique({ where: { id: data.id } }) : null;
      if (data.id && !existing) throw new Error("MISSING");
      const slugOwner = await tx.creation.findUnique({ where: { slug: data.slug } });
      if (slugOwner && slugOwner.id !== existing?.id) throw new Error("SLUG");
      if (data.promptOfTheDay) {
        await tx.creation.updateMany({
          where: { promptOfTheDay: true, ...(existing ? { NOT: { id: existing.id } } : {}) },
          data: { promptOfTheDay: false },
        });
      }
      const payload = {
        title: data.title,
        slug: data.slug,
        shortDescription: data.shortDescription.trim() || data.title,
        description: data.description.trim() || data.shortDescription.trim() || data.title,
        mediaType: data.mediaType,
        status: data.status,
        prompt: data.prompt.trim(),
        negativePrompt: data.negativePrompt,
        generationSettings: data.generationSettings.length ? data.generationSettings : Prisma.JsonNull,
        aspectRatio: data.aspectRatio,
        featured: data.featured,
        promptOfTheDay: data.promptOfTheDay,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        publishedAt: data.status === "PUBLISHED" ? existing?.publishedAt ?? new Date() : null,
        modelName: data.modelName,
        platformName: data.platformName,
        seed: data.seed,
        guidanceScale: data.guidanceScale,
        stepCount: data.stepCount,
        resolution: data.resolution,
        durationSeconds: data.durationSeconds,
        frameRate: data.frameRate,
        cameraMovement: data.cameraMovement,
        motionInstructions: data.motionInstructions,
        characterNotes: data.characterNotes,
        workflowNotes: data.workflowNotes,
        limitations: data.limitations,
        credits: data.credits,
        subscriptions: data.subscriptions,
      };
      const creation = existing
        ? await tx.creation.update({ where: { id: existing.id }, data: payload })
        : await tx.creation.create({ data: payload });
      await tx.creationMedia.deleteMany({ where: { creationId: creation.id } });
      await tx.creationStep.deleteMany({ where: { creationId: creation.id } });
      await tx.creationCategory.deleteMany({ where: { creationId: creation.id } });
      await tx.creationTag.deleteMany({ where: { creationId: creation.id } });
      await tx.creationAITool.deleteMany({ where: { creationId: creation.id } });
      if (data.media.length) {
        await tx.creationMedia.createMany({
          data: data.media.map((item) => ({
            creationId: creation.id,
            assetId: item.assetId,
            role: item.role,
            sortOrder: item.sortOrder,
            altText: item.altText,
          })),
        });
      }
      if (data.steps.length) {
        await tx.creationStep.createMany({
          data: data.steps.map((step, index) => ({
            creationId: creation.id,
            order: index + 1,
            title: step.title,
            body: step.body,
            mediaAssetId: step.mediaAssetId,
            externalLink: step.externalLink,
            warning: step.warning,
            tip: step.tip,
          })),
        });
      }
      if (data.categoryIds.length) {
        await tx.creationCategory.createMany({
          data: [...new Set(data.categoryIds)].map((categoryId) => ({ creationId: creation.id, categoryId })),
        });
      }
      const seen = new Set<string>();
      for (const name of data.tagNames) {
        const slug = slugify(name);
        if (seen.has(slug)) continue;
        seen.add(slug);
        const tag = await tx.tag.upsert({ where: { slug }, update: { name }, create: { name, slug } });
        await tx.creationTag.create({ data: { creationId: creation.id, tagId: tag.id } });
      }
      const tools = new Set<string>();
      for (const tool of data.toolIds) {
        if (tools.has(tool.toolId)) continue;
        tools.add(tool.toolId);
        await tx.creationAITool.create({
          data: { creationId: creation.id, toolId: tool.toolId, modelName: tool.modelName },
        });
      }
      return creation;
    });
    invalidate(saved.slug);
    return { ok: true, id: saved.id, slug: saved.slug, message: data.status === "PUBLISHED" ? "Published." : "Draft saved." };
  } catch (error) {
    if (error instanceof Error && error.message === "SLUG") {
      return { ok: false, message: "That slug is already in use.", fieldErrors: { slug: "That slug is already in use." } };
    }
    if (error instanceof Error && error.message === "MISSING") {
      return { ok: false, message: "This creation no longer exists." };
    }
    return { ok: false, message: "The creation could not be saved." };
  }
}

export async function duplicateCreation(id: string) {
  await requireAdmin();
  const creation = await prisma.creation.findUnique({
    where: { id },
    include: { media: true, workflowSteps: true, categories: true, tags: true, tools: true },
  });
  if (!creation) redirect("/admin/creations");
  let slug = `${creation.slug}-copy`;
  let suffix = 2;
  while (await prisma.creation.findUnique({ where: { slug } })) {
    slug = `${creation.slug}-copy-${suffix++}`;
  }
  const copy = await prisma.creation.create({
    data: {
      title: `${creation.title} copy`,
      slug,
      shortDescription: creation.shortDescription,
      description: creation.description,
      mediaType: creation.mediaType,
      status: "DRAFT",
      prompt: creation.prompt,
      negativePrompt: creation.negativePrompt,
      generationSettings: creation.generationSettings ?? Prisma.JsonNull,
      aspectRatio: creation.aspectRatio,
      featured: false,
      promptOfTheDay: false,
      seoTitle: creation.seoTitle,
      seoDescription: creation.seoDescription,
      modelName: creation.modelName,
      platformName: creation.platformName,
      seed: creation.seed,
      guidanceScale: creation.guidanceScale,
      stepCount: creation.stepCount,
      resolution: creation.resolution,
      durationSeconds: creation.durationSeconds,
      frameRate: creation.frameRate,
      cameraMovement: creation.cameraMovement,
      motionInstructions: creation.motionInstructions,
      characterNotes: creation.characterNotes,
      workflowNotes: creation.workflowNotes,
      limitations: creation.limitations,
      credits: creation.credits,
      subscriptions: creation.subscriptions,
      media: { create: creation.media.map((item) => ({ assetId: item.assetId, role: item.role, sortOrder: item.sortOrder, altText: item.altText })) },
      workflowSteps: {
        create: creation.workflowSteps.map((step) => ({
          order: step.order,
          title: step.title,
          body: step.body,
          mediaAssetId: step.mediaAssetId,
          externalLink: step.externalLink,
          warning: step.warning,
          tip: step.tip,
        })),
      },
      categories: { create: creation.categories.map((item) => ({ categoryId: item.categoryId })) },
      tags: { create: creation.tags.map((item) => ({ tagId: item.tagId })) },
      tools: { create: creation.tools.map((item) => ({ toolId: item.toolId, modelName: item.modelName })) },
    },
  });
  invalidate(copy.slug);
  redirect(`/admin/creations/${copy.id}/edit`);
}

export async function deleteCreation(id: string) {
  await requireAdmin();
  const creation = await prisma.creation.findUnique({ where: { id }, select: { slug: true } });
  if (creation) {
    await prisma.creation.delete({ where: { id } });
    invalidate(creation.slug);
  }
  redirect("/admin/creations");
}
