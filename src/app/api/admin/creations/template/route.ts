import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { buildCreationTemplate } from "@/lib/excel/creation-workbook";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return Response.json({ message: "Sign in required." }, { status: 401 });
  const [categories, tools] = await Promise.all([
    prisma.category.findMany({ orderBy: [{ displayOrder: "asc" }, { name: "asc" }], select: { name: true } }),
    prisma.aiTool.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
  ]);
  const file = await buildCreationTemplate({
    categories: categories.map((category) => category.name),
    tools: tools.map((tool) => tool.name),
  });
  return new Response(new Uint8Array(file), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="ai-creative-vault-creations.xlsx"',
      "Cache-Control": "no-store",
    },
  });
}
