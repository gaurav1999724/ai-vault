import { getCurrentAdmin } from "@/lib/auth";
import { adminMutationStatus } from "@/lib/guards";
import { ImportFileError } from "@/lib/excel/creation-columns";
import { importCreationWorkbook } from "@/lib/excel/import-creations";
import { sameOrigin } from "@/lib/origin";

const MAX_WORKBOOK_BYTES = 8 * 1024 * 1024;

function databaseUnavailable(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  return message.includes("Can't reach database server") || message.includes("P1001") || message.includes("timed out");
}

export async function POST(request: Request) {
  try {
    if (!sameOrigin(request)) return Response.json({ message: "Forbidden." }, { status: 403 });
    const admin = await getCurrentAdmin();
    if (adminMutationStatus(admin) !== 200) return Response.json({ message: "Sign in required." }, { status: 401 });
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return Response.json({ message: "Choose an Excel file." }, { status: 400 });
    if (!file.name.toLowerCase().endsWith(".xlsx")) return Response.json({ message: "Use the .xlsx template." }, { status: 400 });
    if (file.size > MAX_WORKBOOK_BYTES) return Response.json({ message: "That Excel file is too large." }, { status: 400 });
    const bytes = Buffer.from(await file.arrayBuffer());
    if (bytes.length < 4 || bytes[0] !== 0x50 || bytes[1] !== 0x4b) {
      return Response.json({ message: "That file is not an Excel workbook." }, { status: 400 });
    }
    try {
      return Response.json(await importCreationWorkbook(bytes));
    } catch (error) {
      if (!databaseUnavailable(error)) throw error;
      return Response.json(await importCreationWorkbook(bytes));
    }
  } catch (error) {
    if (error instanceof ImportFileError) return Response.json({ message: error.message }, { status: 400 });
    if (databaseUnavailable(error)) {
      return Response.json({ message: "The archive database is still waking up. Wait a few seconds and import the file again." }, { status: 503 });
    }
    console.error(error);
    return Response.json({ message: "The Excel file could not be imported." }, { status: 500 });
  }
}
