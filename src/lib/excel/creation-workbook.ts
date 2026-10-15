import ExcelJS from "exceljs";
import {
  ImportFileError,
  MAX_IMPORT_ROWS,
  creationColumns,
  creationHeaderMap,
  mediaColumns,
  mediaHeaderMap,
  stepColumns,
  stepHeaderMap,
  templateInstructions,
  normalizeHeader,
  type SheetColumn,
} from "@/lib/excel/creation-columns";
import type { ImportTableRow } from "@/lib/excel/creation-import";

const SHEET_CREATIONS = "Creations";
const SHEET_STEPS = "Workflow steps";
const SHEET_MEDIA = "Media";
const SHEET_EXAMPLE = "Example";
const SHEET_VALUES = "Allowed values";
const SHEET_INSTRUCTIONS = "Instructions";
const RESERVED_SHEETS = new Set(
  [SHEET_EXAMPLE, SHEET_VALUES, SHEET_INSTRUCTIONS, SHEET_STEPS, SHEET_MEDIA].map((name) => name.toLowerCase()),
);

function columnLetter(index: number) {
  let current = index;
  let letters = "";
  while (current > 0) {
    const remainder = (current - 1) % 26;
    letters = String.fromCharCode(65 + remainder) + letters;
    current = Math.floor((current - 1) / 26);
  }
  return letters;
}

function addSheet(workbook: ExcelJS.Workbook, name: string, columns: SheetColumn[], rows: string[][]) {
  const sheet = workbook.addWorksheet(name, { views: [{ state: "frozen", ySplit: 1 }] });
  columns.forEach((column, index) => {
    sheet.getColumn(index + 1).width = column.width;
  });
  const header = sheet.getRow(1);
  header.height = 22;
  columns.forEach((column, index) => {
    const cell = header.getCell(index + 1);
    cell.value = column.header;
    cell.font = { bold: true, color: { argb: column.required ? "FF5DE4FF" : "FFF4F4F5" }, name: "Calibri", size: 12 };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF171A23" } };
    cell.alignment = { vertical: "middle", wrapText: true };
    cell.note = column.hint;
  });
  rows.forEach((values, rowIndex) => {
    const row = sheet.getRow(rowIndex + 2);
    values.forEach((value, columnIndex) => {
      row.getCell(columnIndex + 1).value = value;
    });
  });
  const lastColumn = columnLetter(columns.length);
  sheet.autoFilter = { from: "A1", to: `${lastColumn}1` };
  return sheet;
}

function listValidation(formula: string): ExcelJS.DataValidation {
  return {
    type: "list",
    allowBlank: true,
    formulae: [formula],
    showErrorMessage: true,
    errorStyle: "warning",
    errorTitle: "Use a listed value",
    error: "Pick a value from the Allowed values sheet, or type one of those choices.",
  };
}

function applyList(sheet: ExcelJS.Worksheet, header: string, columns: SheetColumn[], formula: string) {
  const index = columns.findIndex((column) => column.header === header);
  if (index < 0) return;
  const letter = columnLetter(index + 1);
  for (let row = 2; row <= MAX_IMPORT_ROWS + 1; row += 1) {
    sheet.getCell(`${letter}${row}`).dataValidation = listValidation(formula);
  }
}

export async function buildCreationTemplate(options: { categories: string[]; tools: string[] }) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "AI Creative Vault";
  workbook.created = new Date();

  const instructions = workbook.addWorksheet(SHEET_INSTRUCTIONS);
  instructions.getColumn(1).width = 120;
  templateInstructions.forEach((line, index) => {
    const cell = instructions.getCell(index + 1, 1);
    cell.value = line;
    cell.alignment = { wrapText: true, vertical: "top" };
    if (index === 0) cell.font = { bold: true, size: 16, color: { argb: "FFF4F4F5" } };
  });

  const values = workbook.addWorksheet(SHEET_VALUES);
  const lists: [string, string[]][] = [
    ["Media type", ["IMAGE", "VIDEO", "IMAGE_SERIES", "TUTORIAL"]],
    ["Status", ["DRAFT", "PUBLISHED"]],
    ["Media role", ["COVER", "MAIN", "GALLERY", "REFERENCE", "POSTER", "SOURCE", "DOWNLOAD"]],
    ["Yes or No", ["Yes", "No"]],
    ["Categories in the archive", options.categories.length ? options.categories : ["None yet. Type a new name on the Creations sheet."]],
    ["Tools in the archive", options.tools.length ? options.tools : ["None yet. Type a new name on the Creations sheet."]],
  ];
  lists.forEach((entry, columnIndex) => {
    const [title, items] = entry;
    values.getColumn(columnIndex + 1).width = 42;
    const header = values.getCell(1, columnIndex + 1);
    header.value = title;
    header.font = { bold: true, color: { argb: "FFF4F4F5" } };
    header.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF171A23" } };
    items.forEach((item, rowIndex) => {
      values.getCell(rowIndex + 2, columnIndex + 1).value = item;
    });
  });

  const creations = addSheet(workbook, SHEET_CREATIONS, creationColumns, []);
  applyList(creations, "Media type", creationColumns, `'${SHEET_VALUES}'!$A$2:$A$5`);
  applyList(creations, "Status", creationColumns, `'${SHEET_VALUES}'!$B$2:$B$3`);
  applyList(creations, "Featured", creationColumns, `'${SHEET_VALUES}'!$D$2:$D$3`);
  applyList(creations, "Prompt of the day", creationColumns, `'${SHEET_VALUES}'!$D$2:$D$3`);
  addSheet(workbook, SHEET_STEPS, stepColumns, []);
  const media = addSheet(workbook, SHEET_MEDIA, mediaColumns, []);
  applyList(media, "Role", mediaColumns, `'${SHEET_VALUES}'!$C$2:$C$8`);
  addSheet(workbook, SHEET_EXAMPLE, creationColumns, [creationColumns.map((column) => column.example)]);
  addSheet(workbook, "Example steps", stepColumns, [stepColumns.map((column) => column.example)]);
  addSheet(workbook, "Example media", mediaColumns, [mediaColumns.map((column) => column.example)]);
  const file = await workbook.xlsx.writeBuffer();
  return Buffer.from(file);
}

export function cellToString(value: ExcelJS.CellValue): string {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? "" : value.toISOString();
  if (typeof value === "object") {
    if ("richText" in value && Array.isArray(value.richText)) {
      return value.richText.map((part) => part.text || "").join("").trim();
    }
    if ("result" in value && ("formula" in value || "sharedFormula" in value)) return cellToString(value.result);
    if ("text" in value && typeof value.text === "string") return value.text.trim();
  }
  return "";
}

function mapSheet(sheet: ExcelJS.Worksheet, aliases: Record<string, string>, limit: number) {
  const columns = new Map<number, string>();
  sheet.getRow(1).eachCell({ includeEmpty: false }, (cell, column) => {
    const key = aliases[normalizeHeader(cellToString(cell.value))];
    if (key) columns.set(column, key);
  });
  const present = new Set(columns.values());
  const rows: ImportTableRow[] = [];
  const lastRow = Math.min(sheet.rowCount || 1, limit + 5);
  for (let number = 2; number <= lastRow; number += 1) {
    const cells: Record<string, string> = {};
    let filled = false;
    for (const [column, key] of columns) {
      const text = cellToString(sheet.getRow(number).getCell(column).value);
      if (text) filled = true;
      cells[key] = cells[key] ? `${cells[key]} ${text}`.trim() : text;
    }
    if (!filled) continue;
    rows.push({ row: number, cells });
    if (rows.length > limit) break;
  }
  return { present, rows };
}

function findWorksheet(workbook: ExcelJS.Workbook, name: string) {
  return workbook.worksheets.find((sheet) => sheet.name.trim().toLowerCase() === name.toLowerCase());
}

export async function readCreationWorkbook(bytes: Buffer) {
  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.load(bytes as unknown as ExcelJS.Buffer);
  } catch {
    throw new ImportFileError("The Excel file could not be read. Use the .xlsx template.");
  }
  let creationsSheet = findWorksheet(workbook, SHEET_CREATIONS);
  if (!creationsSheet) {
    creationsSheet = workbook.worksheets.find((sheet) => {
      const name = sheet.name.trim().toLowerCase();
      return !RESERVED_SHEETS.has(name) && !name.startsWith("example");
    });
  }
  if (!creationsSheet) throw new ImportFileError("The workbook needs a Creations sheet.");
  const creations = mapSheet(creationsSheet, creationHeaderMap, MAX_IMPORT_ROWS);
  if (!creations.present.has("title")) {
    throw new ImportFileError("The Creations sheet needs a Title column in row 1.");
  }
  if (creations.rows.length > MAX_IMPORT_ROWS) {
    throw new ImportFileError(`Import up to ${MAX_IMPORT_ROWS} creations at a time.`);
  }
  const stepsSheet = findWorksheet(workbook, SHEET_STEPS);
  const mediaSheet = findWorksheet(workbook, SHEET_MEDIA);
  const steps = stepsSheet ? mapSheet(stepsSheet, stepHeaderMap, 1000) : { rows: [], present: new Set<string>() };
  const media = mediaSheet ? mapSheet(mediaSheet, mediaHeaderMap, 1000) : { rows: [], present: new Set<string>() };
  if (steps.rows.length > 1000 || media.rows.length > 1000) {
    throw new ImportFileError("This workbook has too many workflow or media rows.");
  }
  return { creations: creations.rows, steps: steps.rows, media: media.rows };
}
