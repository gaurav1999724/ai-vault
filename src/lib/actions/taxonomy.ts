"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { updateTag } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { categoryDeleteBlockReason } from "@/lib/content-rules";
import { categorySchema, toolSchema } from "@/lib/validators/admin";
import { fieldErrors } from "@/lib/validators/creation";
import type { ActionResult } from "@/types/content";

function refresh() {
  updateTag("categories");
  updateTag("creations");
  updateTag("sitemap");
  revalidatePath("/");
}

export async function saveCategory(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Check the category fields.", fieldErrors: fieldErrors(parsed.error) };
  const data = parsed.data;
  const owner = await prisma.category.findUnique({ where: { slug: data.slug } });
  if (owner && owner.id !== data.id) return { ok: false, message: "That slug is already used.", fieldErrors: { slug: "That slug is already used." } };
  const payload = {
    name: data.name,
    slug: data.slug,
    description: data.description,
    coverAssetId: data.coverAssetId,
    displayOrder: data.displayOrder,
    published: data.published,
  };
  const saved = data.id
    ? await prisma.category.update({ where: { id: data.id }, data: payload })
    : await prisma.category.create({ data: payload });
  updateTag(`category:${saved.slug}`);
  refresh();
  return { ok: true, id: saved.id, message: "Category saved." };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  await requireAdmin();
  const count = await prisma.creationCategory.count({ where: { categoryId: id } });
  const reason = categoryDeleteBlockReason(count);
  if (reason) return { ok: false, message: reason };
  const category = await prisma.category.delete({ where: { id } }).catch(() => null);
  if (!category) return { ok: false, message: "The category could not be deleted." };
  updateTag(`category:${category.slug}`);
  refresh();
  return { ok: true, message: "Category deleted." };
}

export async function reorderCategories(ids: string[]): Promise<ActionResult> {
  await requireAdmin();
  await prisma.$transaction(ids.map((id, index) => prisma.category.update({ where: { id }, data: { displayOrder: index } })));
  refresh();
  return { ok: true, message: "Order saved." };
}

export async function saveTool(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = toolSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Check the tool fields.", fieldErrors: fieldErrors(parsed.error) };
  const data = parsed.data;
  const owner = await prisma.aiTool.findUnique({ where: { slug: data.slug } });
  if (owner && owner.id !== data.id) return { ok: false, message: "That slug is already used.", fieldErrors: { slug: "That slug is already used." } };
  const payload = {
    name: data.name,
    slug: data.slug,
    websiteUrl: data.websiteUrl,
    logoAssetId: data.logoAssetId,
    description: data.description,
    supportedMediaTypes: data.supportedMediaTypes,
    notes: data.notes,
  };
  const saved = data.id
    ? await prisma.aiTool.update({ where: { id: data.id }, data: payload })
    : await prisma.aiTool.create({ data: payload });
  refresh();
  return { ok: true, id: saved.id, message: "Tool saved. This stores a catalog record only." };
}

export async function deleteTool(id: string): Promise<ActionResult> {
  await requireAdmin();
  const count = await prisma.creationAITool.count({ where: { toolId: id } });
  if (count > 0) return { ok: false, message: "Remove this tool from creations before deleting it." };
  try {
    await prisma.aiTool.delete({ where: { id } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return { ok: false, message: "This tool is still referenced." };
    }
    return { ok: false, message: "The tool could not be deleted." };
  }
  refresh();
  return { ok: true, message: "Tool deleted." };
}
