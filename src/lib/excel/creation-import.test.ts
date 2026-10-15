import ExcelJS from "exceljs";
import { describe, expect, it } from "vitest";
import { creationColumns } from "@/lib/excel/creation-columns";
import { parseCreationTables, type ImportTables } from "@/lib/excel/creation-import";
import { buildCreationTemplate, readCreationWorkbook } from "@/lib/excel/creation-workbook";
import { creationSchema } from "@/lib/validators/creation";

function row(rowNumber: number, cells: Record<string, string>) {
  return { row: rowNumber, cells };
}

describe("creation excel import", () => {
  it("turns every public field into a creation draft and keeps related rows", () => {
    const tables: ImportTables = {
      creations: [
        row(2, {
          title: "Rooftop at Midnight",
          shortDescription: "A rain-soaked rooftop above a midnight city.",
          description: "A cinematic still of a futuristic warrior overlooking a neon city.",
          mediaType: "image",
          status: "Published",
          prompt: "A mysterious futuristic warrior.",
          negativePrompt: "daylight",
          aspectRatio: "4:5",
          featured: "Yes",
          promptOfTheDay: "no",
          seoTitle: "Midnight rooftop",
          modelName: "v6",
          platformName: "Midjourney",
          guidanceScale: "5",
          stepCount: "30",
          extraSettings: "Stylize=250; Chaos=4",
          categories: "Cinematic AI, Night",
          tags: "rain, neon",
          tools: "Midjourney",
          toolModels: "v6",
          coverFilename: "rooftop.png",
          coverAlt: "Warrior on a wet roof",
          workflowNotes: "Keep the rim light.",
        }),
        row(3, { title: "Second study", status: "DRAFT" }),
        row(4, { prompt: "Missing a title" }),
      ],
      steps: [row(2, { creationKey: "Rooftop at Midnight", title: "Paste the prompt", body: "Copy it exactly.", tip: "Check the light." })],
      media: [row(2, { creationKey: "rooftop-at-midnight", filename: "detail.png", role: "gallery", altText: "Wet edge" })],
    };
    const parsed = parseCreationTables(tables);
    expect(parsed.errors.map((error) => error.row)).toEqual([4]);
    expect(parsed.drafts).toHaveLength(2);
    const [first, second] = parsed.drafts;
    expect(first.slug).toBe("rooftop-at-midnight");
    expect(first.payload.status).toBe("PUBLISHED");
    expect(first.payload.featured).toBe(true);
    expect(first.payload.promptOfTheDay).toBe(false);
    expect(first.payload.guidanceScale).toBe(5);
    expect(first.payload.stepCount).toBe(30);
    expect(first.payload.generationSettings).toEqual([
      { label: "Stylize", value: "250" },
      { label: "Chaos", value: "4" },
    ]);
    expect(first.payload.workflowNotes).toBe("Keep the rim light.");
    expect(first.payload.steps[0]).toMatchObject({ title: "Paste the prompt", tip: "Check the light." });
    expect(first.mediaFiles.map((file) => [file.filename, file.role, file.sortOrder])).toEqual([
      ["rooftop.png", "COVER", 0],
      ["detail.png", "GALLERY", 1],
    ]);
    expect(first.categoryNames).toEqual(["Cinematic AI", "Night"]);
    expect(first.tools).toEqual([{ name: "Midjourney", modelName: "v6" }]);
    expect(second.payload.status).toBe("DRAFT");
    expect(second.payload.mediaType).toBe("IMAGE");
    const published = creationSchema.safeParse({
      ...first.payload,
      categoryIds: ["category"],
      toolIds: [{ toolId: "tool", modelName: "v6" }],
      media: first.mediaFiles.map((file) => ({ assetId: "asset", role: file.role, sortOrder: file.sortOrder, altText: file.altText })),
    });
    expect(published.success).toBe(true);
  });

  it("rejects a duplicate slug, a bad setting, and a step with no creation", () => {
    const parsed = parseCreationTables({
      creations: [
        row(2, { title: "Same Name", slug: "same-name" }),
        row(3, { title: "Same Name again", slug: "same-name" }),
        row(4, { title: "Broken settings", extraSettings: "no separator" }),
      ],
      steps: [row(2, { creationKey: "missing", title: "Open", body: "Start" })],
      media: [],
    });
    expect(parsed.drafts.map((draft) => draft.slug)).toEqual(["same-name"]);
    expect(parsed.errors.map((error) => error.message)).toEqual([
      "The slug same-name already appears in this file.",
      "Extra settings must look like Label=Value; Label=Value.",
      'No creation in this file matches "missing".',
    ]);
  });

  it("does not import the example sheet and keeps a filled creation row", async () => {
    const template = await buildCreationTemplate({ categories: ["Cinematic AI"], tools: ["Midjourney"] });
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(template as unknown as ExcelJS.Buffer);
    const sheet = workbook.getWorksheet("Creations");
    expect(sheet).toBeTruthy();
    if (!sheet) return;
    const headers = creationColumns.map((column) => column.header);
    headers.forEach((header, index) => {
      expect(sheet.getRow(1).getCell(index + 1).value).toBe(header);
    });
    sheet.getCell("A2").value = "Glass Object";
    sheet.getCell("C2").value = "A single glass object on a dark stone plinth.";
    sheet.getCell("G2").value = "A single glass object, controlled highlight, no logo.";
    const bytes = Buffer.from(await workbook.xlsx.writeBuffer());
    const tables = await readCreationWorkbook(bytes);
    const parsed = parseCreationTables(tables);
    expect(parsed.errors).toEqual([]);
    expect(parsed.drafts).toHaveLength(1);
    expect(parsed.drafts[0]).toMatchObject({
      title: "Glass Object",
      slug: "glass-object",
      payload: { prompt: "A single glass object, controlled highlight, no logo.", status: "DRAFT", mediaType: "IMAGE" },
    });
    expect(workbook.getWorksheet("Example")?.getCell("A2").value).toBe("Rooftop at Midnight");
  });
});
