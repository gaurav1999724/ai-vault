import { prisma } from "@/lib/db";
import { saveCreation } from "@/lib/actions/creations";
import { slugify } from "@/lib/slug";
import { creationSchema, fieldErrors } from "@/lib/validators/creation";
import type { CreationImportDraft, ImportRowResult } from "@/lib/excel/creation-import";
import { parseCreationTables } from "@/lib/excel/creation-import";
import { readCreationWorkbook } from "@/lib/excel/creation-workbook";

async function categoryId(name: string) {
  const trimmed = name.trim();
  const byName = await prisma.category.findFirst({
    where: { name: { equals: trimmed, mode: "insensitive" } },
    select: { id: true },
  });
  if (byName) return byName.id;
  const slug = slugify(trimmed);
  const bySlug = await prisma.category.findUnique({ where: { slug }, select: { id: true } });
  if (bySlug) return bySlug.id;
  const created = await prisma.category.create({
    data: {
      name: trimmed,
      slug,
      published: true,
      displayOrder: await prisma.category.count(),
    },
    select: { id: true },
  });
  return created.id;
}

async function toolId(name: string, mediaType: CreationImportDraft["payload"]["mediaType"]) {
  const trimmed = name.trim();
  const byName = await prisma.aiTool.findFirst({
    where: { name: { equals: trimmed, mode: "insensitive" } },
    select: { id: true },
  });
  if (byName) return byName.id;
  const slug = slugify(trimmed);
  const bySlug = await prisma.aiTool.findUnique({ where: { slug }, select: { id: true } });
  if (bySlug) return bySlug.id;
  const created = await prisma.aiTool.create({
    data: {
      name: trimmed,
      slug,
      description: "Added from the Excel import.",
      supportedMediaTypes: mediaType === "VIDEO" ? ["VIDEO"] : ["IMAGE"],
    },
    select: { id: true },
  });
  return created.id;
}

async function assetId(filename: string) {
  const asset = await prisma.mediaAsset.findFirst({
    where: { originalFilename: filename },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });
  return asset?.id ?? null;
}

function savedMessage(result: { message?: string; fieldErrors?: Record<string, string> }) {
  const details = Object.values(result.fieldErrors ?? {}).filter((detail) => detail && detail !== result.message);
  return [result.message, ...details].filter(Boolean).join(" ");
}

async function saveDraft(draft: CreationImportDraft): Promise<ImportRowResult> {
  const media = [];
  for (const file of draft.mediaFiles) {
    const id = await assetId(file.filename);
    if (!id) {
      return {
        row: draft.row,
        title: draft.title,
        ok: false,
        message: `Upload ${file.filename} in the media library before importing this creation.`,
      };
    }
    media.push({ assetId: id, role: file.role, sortOrder: file.sortOrder, altText: file.altText });
  }
  const placeholderCategories = draft.categoryNames.map((name, index) => `category-${index}-${slugify(name)}`);
  const placeholderTools = draft.tools.map((tool, index) => ({ toolId: `tool-${index}-${slugify(tool.name)}`, modelName: tool.modelName }));
  const parsed = creationSchema.safeParse({
    ...draft.payload,
    categoryIds: placeholderCategories,
    toolIds: placeholderTools,
    media,
  });
  if (!parsed.success) {
    return { row: draft.row, title: draft.title, ok: false, message: savedMessage({ message: "Check this row.", fieldErrors: fieldErrors(parsed.error) }) };
  }
  try {
    const categoryIds: string[] = [];
    for (const name of draft.categoryNames) categoryIds.push(await categoryId(name));
    const toolIds = [];
    for (const tool of draft.tools) {
      toolIds.push({ toolId: await toolId(tool.name, draft.payload.mediaType), modelName: tool.modelName });
    }
    const saved = await saveCreation({ ...parsed.data, categoryIds, toolIds });
    if (!saved.ok) return { row: draft.row, title: draft.title, ok: false, message: savedMessage(saved) };
    return {
      row: draft.row,
      title: draft.title,
      ok: true,
      message: saved.message || "Saved.",
      id: saved.id,
      slug: saved.slug,
    };
  } catch {
    return { row: draft.row, title: draft.title, ok: false, message: "This row could not be saved." };
  }
}

export async function importCreationWorkbook(bytes: Buffer) {
  const tables = await readCreationWorkbook(bytes);
  const parsed = parseCreationTables(tables);
  if (!parsed.drafts.length && !parsed.errors.length) {
    return {
      created: 0,
      failed: 1,
      results: [{ row: 0, title: "File", ok: false, message: "Add at least one creation under the header row." }],
    };
  }
  const results = [...parsed.errors];
  for (const draft of parsed.drafts) results.push(await saveDraft(draft));
  results.sort((left, right) => left.row - right.row || left.title.localeCompare(right.title));
  return {
    created: results.filter((result) => result.ok).length,
    failed: results.filter((result) => !result.ok).length,
    results,
  };
}
