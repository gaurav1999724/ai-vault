import { slugify } from "@/lib/slug";
import { mediaRoles, mediaTypes } from "@/lib/validators/creation";
import { MAX_IMPORT_ROWS } from "@/lib/excel/creation-columns";

const mediaTypeSet = new Set<string>(mediaTypes);
const roleSet = new Set<string>(mediaRoles);

export type ImportCells = Record<string, string>;

export type ImportTableRow = {
  row: number;
  cells: ImportCells;
};

export type ImportTables = {
  creations: ImportTableRow[];
  steps: ImportTableRow[];
  media: ImportTableRow[];
};

export type ImportRowResult = {
  row: number;
  title: string;
  ok: boolean;
  message: string;
  id?: string;
  slug?: string;
};

export type ImportMediaFile = {
  filename: string;
  role: (typeof mediaRoles)[number];
  sortOrder: number;
  altText: string | null;
};

export type CreationImportDraft = {
  row: number;
  title: string;
  slug: string;
  categoryNames: string[];
  tools: { name: string; modelName: string | null }[];
  mediaFiles: ImportMediaFile[];
  payload: {
    title: string;
    slug: string;
    shortDescription: string;
    description: string;
    mediaType: (typeof mediaTypes)[number];
    status: "DRAFT" | "PUBLISHED";
    prompt: string;
    negativePrompt: string | null;
    aspectRatio: string | null;
    featured: boolean;
    promptOfTheDay: boolean;
    seoTitle: string | null;
    seoDescription: string | null;
    modelName: string | null;
    platformName: string | null;
    seed: string | null;
    guidanceScale: number | null;
    stepCount: number | null;
    resolution: string | null;
    durationSeconds: number | null;
    frameRate: string | null;
    cameraMovement: string | null;
    motionInstructions: string | null;
    characterNotes: string | null;
    workflowNotes: string | null;
    limitations: string | null;
    credits: string | null;
    subscriptions: string | null;
    generationSettings: { label: string; value: string }[];
    tagNames: string[];
    steps: {
      title: string;
      body: string;
      mediaAssetId: null;
      externalLink: string | null;
      warning: string | null;
      tip: string | null;
    }[];
  };
};

export type ImportParse = {
  drafts: CreationImportDraft[];
  errors: ImportRowResult[];
};

function blank(value: string | undefined) {
  const trimmed = value?.trim() ?? "";
  return trimmed.length ? trimmed : null;
}

function enumToken(value: string) {
  return value.trim().toUpperCase().replace(/[\s-]+/g, "_");
}

function splitList(value: string) {
  return value
    .split(/[,;\n]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function parseBoolean(value: string, label: string) {
  const normalized = value.trim().toLowerCase();
  if (!normalized || ["no", "n", "false", "0", "off"].includes(normalized)) return { ok: true as const, value: false };
  if (["yes", "y", "true", "1", "on"].includes(normalized)) return { ok: true as const, value: true };
  return { ok: false as const, message: `${label} must be Yes or No.` };
}

function parseNumber(value: string, label: string) {
  if (!value.trim()) return { ok: true as const, value: null };
  const number = Number(value);
  if (!Number.isFinite(number)) return { ok: false as const, message: `${label} must be a number.` };
  return { ok: true as const, value: number };
}

function parseSettings(value: string) {
  if (!value.trim()) return { ok: true as const, value: [] as { label: string; value: string }[] };
  const settings: { label: string; value: string }[] = [];
  for (const part of value.split(/[;\n]/)) {
    const piece = part.trim();
    if (!piece) continue;
    const index = piece.indexOf("=");
    const label = index > 0 ? piece.slice(0, index).trim() : "";
    const settingValue = index > 0 ? piece.slice(index + 1).trim() : "";
    if (!label || !settingValue) {
      return { ok: false as const, message: "Extra settings must look like Label=Value; Label=Value." };
    }
    settings.push({ label, value: settingValue });
  }
  return { ok: true as const, value: settings };
}

function findDraft(key: string, drafts: CreationImportDraft[]): { draft: CreationImportDraft } | { error: string } {
  const normalized = key.trim().toLowerCase();
  const bySlug = drafts.filter((draft) => draft.slug.toLowerCase() === normalized);
  if (bySlug.length > 1) return { error: `"${key}" matches more than one creation.` };
  if (bySlug.length === 1) return { draft: bySlug[0] };
  const byTitle = drafts.filter((draft) => draft.title.toLowerCase() === normalized);
  if (byTitle.length > 1) return { error: `"${key}" matches more than one creation title.` };
  if (byTitle.length === 1) return { draft: byTitle[0] };
  return { error: `No creation in this file matches "${key}".` };
}

export function parseCreationTables(tables: ImportTables): ImportParse {
  if (tables.creations.length > MAX_IMPORT_ROWS) {
    return {
      drafts: [],
      errors: [{ row: 0, title: "File", ok: false, message: `Import up to ${MAX_IMPORT_ROWS} creations at a time.` }],
    };
  }
  const errors: ImportRowResult[] = [];
  const drafts: CreationImportDraft[] = [];
  const seenSlugs = new Set<string>();

  for (const record of tables.creations) {
    const cells = record.cells;
    const title = cells.title?.trim() ?? "";
    if (!title) {
      errors.push({ row: record.row, title: "Untitled", ok: false, message: "Add a title." });
      continue;
    }
    const problems: string[] = [];
    const slug = blank(cells.slug) || slugify(title);
    if (seenSlugs.has(slug)) {
      errors.push({ row: record.row, title, ok: false, message: `The slug ${slug} already appears in this file.` });
      continue;
    }
    seenSlugs.add(slug);
    const mediaType = enumToken(cells.mediaType || "") || "IMAGE";
    if (!mediaTypeSet.has(mediaType)) problems.push("Media type must be IMAGE, VIDEO, IMAGE_SERIES, or TUTORIAL.");
    const status = enumToken(cells.status || "") || "DRAFT";
    if (status !== "DRAFT" && status !== "PUBLISHED") problems.push("Status must be DRAFT or PUBLISHED.");
    const featured = parseBoolean(cells.featured || "", "Featured");
    if (!featured.ok) problems.push(featured.message);
    const promptOfTheDay = parseBoolean(cells.promptOfTheDay || "", "Prompt of the day");
    if (!promptOfTheDay.ok) problems.push(promptOfTheDay.message);
    const guidanceScale = parseNumber(cells.guidanceScale || "", "Guidance scale");
    if (!guidanceScale.ok) problems.push(guidanceScale.message);
    const stepCount = parseNumber(cells.stepCount || "", "Generation steps");
    if (!stepCount.ok) problems.push(stepCount.message);
    const durationSeconds = parseNumber(cells.durationSeconds || "", "Duration seconds");
    if (!durationSeconds.ok) problems.push(durationSeconds.message);
    const settings = parseSettings(cells.extraSettings || "");
    if (!settings.ok) problems.push(settings.message);
    const categoryNames = splitList(cells.categories || "");
    for (const name of categoryNames) {
      if (name.length < 2) problems.push(`Category "${name}" needs at least 2 characters.`);
      if (name.length > 80) problems.push(`Category "${name.slice(0, 40)}" is longer than 80 characters.`);
    }
    const toolNames = splitList(cells.tools || "");
    const toolModels = splitList(cells.toolModels || "");
    for (const name of toolNames) {
      if (name.length < 2) problems.push(`Tool "${name}" needs at least 2 characters.`);
      if (name.length > 120) problems.push(`Tool "${name.slice(0, 40)}" is longer than 120 characters.`);
    }
    const mediaFiles: ImportMediaFile[] = [];
    if (blank(cells.coverFilename)) {
      mediaFiles.push({
        filename: cells.coverFilename.trim(),
        role: "COVER",
        sortOrder: 0,
        altText: blank(cells.coverAlt),
      });
    }
    if (problems.length || !featured.ok || !promptOfTheDay.ok || !guidanceScale.ok || !stepCount.ok || !durationSeconds.ok || !settings.ok) {
      errors.push({ row: record.row, title, ok: false, message: problems.join(" ") || "Check this row." });
      continue;
    }
    drafts.push({
      row: record.row,
      title,
      slug,
      categoryNames,
      tools: toolNames.map((name, index) => ({ name, modelName: blank(toolModels[index] || "") })),
      mediaFiles,
      payload: {
        title,
        slug,
        shortDescription: cells.shortDescription?.trim() ?? "",
        description: cells.description?.trim() ?? "",
        mediaType: mediaType as CreationImportDraft["payload"]["mediaType"],
        status: status as "DRAFT" | "PUBLISHED",
        prompt: cells.prompt?.trim() ?? "",
        negativePrompt: blank(cells.negativePrompt),
        aspectRatio: blank(cells.aspectRatio),
        featured: featured.value,
        promptOfTheDay: promptOfTheDay.value,
        seoTitle: blank(cells.seoTitle),
        seoDescription: blank(cells.seoDescription),
        modelName: blank(cells.modelName),
        platformName: blank(cells.platformName),
        seed: blank(cells.seed),
        guidanceScale: guidanceScale.value,
        stepCount: stepCount.value,
        resolution: blank(cells.resolution),
        durationSeconds: durationSeconds.value,
        frameRate: blank(cells.frameRate),
        cameraMovement: blank(cells.cameraMovement),
        motionInstructions: blank(cells.motionInstructions),
        characterNotes: blank(cells.characterNotes),
        workflowNotes: blank(cells.workflowNotes),
        limitations: blank(cells.limitations),
        credits: blank(cells.credits),
        subscriptions: blank(cells.subscriptions),
        generationSettings: settings.value,
        tagNames: splitList(cells.tags || ""),
        steps: [],
      },
    });
  }

  const blocked = new Set<CreationImportDraft>();
  for (const record of tables.steps) {
    const cells = record.cells;
    const creationKey = cells.creationKey?.trim() ?? "";
    const title = cells.title?.trim() ?? "";
    const body = cells.body?.trim() ?? "";
    if (!creationKey && !title && !body && !cells.tip?.trim() && !cells.warning?.trim() && !cells.link?.trim()) continue;
    if (!creationKey) {
      errors.push({ row: record.row, title: title || "Workflow step", ok: false, message: "Name the creation this step belongs to." });
      continue;
    }
    const match = findDraft(creationKey, drafts);
    if ("error" in match) {
      errors.push({ row: record.row, title: creationKey, ok: false, message: match.error });
      continue;
    }
    if (!title || !body) {
      blocked.add(match.draft);
      errors.push({
        row: match.draft.row,
        title: match.draft.title,
        ok: false,
        message: `Workflow step on row ${record.row} needs both a title and a body.`,
      });
      continue;
    }
    match.draft.payload.steps.push({
      title,
      body,
      mediaAssetId: null,
      externalLink: blank(cells.link),
      warning: blank(cells.warning),
      tip: blank(cells.tip),
    });
  }

  for (const record of tables.media) {
    const cells = record.cells;
    const creationKey = cells.creationKey?.trim() ?? "";
    const filename = cells.filename?.trim() ?? "";
    if (!creationKey && !filename && !cells.role?.trim() && !cells.altText?.trim()) continue;
    if (!creationKey || !filename) {
      errors.push({ row: record.row, title: creationKey || filename || "Media", ok: false, message: "Each media row needs a creation and a filename." });
      continue;
    }
    const match = findDraft(creationKey, drafts);
    if ("error" in match) {
      errors.push({ row: record.row, title: creationKey, ok: false, message: match.error });
      continue;
    }
    const explicit = cells.role?.trim() ?? "";
    let role: ImportMediaFile["role"];
    if (!explicit) {
      const hasCover = match.draft.mediaFiles.some((item) => item.role === "COVER" || item.role === "MAIN");
      role = hasCover ? "GALLERY" : "COVER";
    } else {
      const token = enumToken(explicit);
      if (!roleSet.has(token)) {
        blocked.add(match.draft);
        errors.push({
          row: match.draft.row,
          title: match.draft.title,
          ok: false,
          message: `Media role "${explicit}" on row ${record.row} is not a cover, main, gallery, reference, poster, source, or download.`,
        });
        continue;
      }
      role = token as ImportMediaFile["role"];
    }
    match.draft.mediaFiles.push({
      filename,
      role,
      sortOrder: match.draft.mediaFiles.length,
      altText: blank(cells.altText),
    });
  }

  return {
    drafts: drafts.filter((draft) => !blocked.has(draft)),
    errors,
  };
}
