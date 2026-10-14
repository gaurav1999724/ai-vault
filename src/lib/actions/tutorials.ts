"use server";

import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { tutorialSchema } from "@/lib/validators/admin";
import { fieldErrors } from "@/lib/validators/creation";
import type { ActionResult } from "@/types/content";

function invalidate(slug?: string) {
  updateTag("tutorials");
  updateTag("sitemap");
  if (slug) updateTag(`tutorial:${slug}`);
}

export async function saveTutorial(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = tutorialSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Check the tutorial fields.", fieldErrors: fieldErrors(parsed.error) };
  const data = parsed.data;
  try {
    const saved = await prisma.$transaction(async (tx) => {
      const existing = data.id ? await tx.tutorial.findUnique({ where: { id: data.id } }) : null;
      if (data.id && !existing) throw new Error("MISSING");
      const owner = await tx.tutorial.findUnique({ where: { slug: data.slug } });
      if (owner && owner.id !== existing?.id) throw new Error("SLUG");
      const payload = {
        title: data.title,
        slug: data.slug,
        coverAssetId: data.coverAssetId,
        summary: data.summary.trim() || data.title,
        difficulty: data.difficulty,
        durationMinutes: data.durationMinutes,
        status: data.status,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        tips: data.tips,
        troubleshooting: data.troubleshooting,
        publishedAt: data.status === "PUBLISHED" ? existing?.publishedAt ?? new Date() : null,
      };
      const tutorial = existing
        ? await tx.tutorial.update({ where: { id: existing.id }, data: payload })
        : await tx.tutorial.create({ data: payload });
      await tx.tutorialStep.deleteMany({ where: { tutorialId: tutorial.id } });
      await tx.tutorialTool.deleteMany({ where: { tutorialId: tutorial.id } });
      await tx.tutorialCreation.deleteMany({ where: { tutorialId: tutorial.id } });
      if (data.steps.length) {
        await tx.tutorialStep.createMany({
          data: data.steps.map((step, index) => ({
            tutorialId: tutorial.id,
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
      if (data.toolIds.length) {
        await tx.tutorialTool.createMany({
          data: [...new Set(data.toolIds)].map((toolId) => ({ tutorialId: tutorial.id, toolId })),
        });
      }
      if (data.creationIds.length) {
        await tx.tutorialCreation.createMany({
          data: [...new Set(data.creationIds)].map((creationId) => ({ tutorialId: tutorial.id, creationId })),
        });
      }
      return tutorial;
    });
    invalidate(saved.slug);
    return { ok: true, id: saved.id, slug: saved.slug, message: data.status === "PUBLISHED" ? "Tutorial published." : "Tutorial saved." };
  } catch (error) {
    if (error instanceof Error && error.message === "SLUG") {
      return { ok: false, message: "That slug is already used.", fieldErrors: { slug: "That slug is already used." } };
    }
    return { ok: false, message: "The tutorial could not be saved." };
  }
}

export async function deleteTutorial(id: string) {
  await requireAdmin();
  const tutorial = await prisma.tutorial.findUnique({ where: { id }, select: { slug: true } });
  if (tutorial) {
    await prisma.tutorial.delete({ where: { id } });
    invalidate(tutorial.slug);
  }
  redirect("/admin/tutorials");
}
