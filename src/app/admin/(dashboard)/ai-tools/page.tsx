import { AdminHeader } from "@/components/admin/admin-header";
import { ToolManager } from "@/components/admin/tool-manager";
import { getEditorOptions, listTools } from "@/lib/data/admin";
import { getCurrentAdmin } from "@/lib/auth";

export default async function ToolsPage() {
  const [admin, tools, options] = await Promise.all([getCurrentAdmin(), listTools(), getEditorOptions()]);
  return (
    <>
      <AdminHeader name={admin?.name || "Admin"} title="AI tools" />
      <div className="p-4 md:p-8">
        <p className="mb-6 max-w-2xl text-sm text-muted">These records describe tools a creation used. Saving one does not connect the website to that service.</p>
        <ToolManager
          tools={tools.map((tool) => ({
            id: tool.id,
            name: tool.name,
            slug: tool.slug,
            websiteUrl: tool.websiteUrl,
            logoAssetId: tool.logoAssetId,
            description: tool.description,
            supportedMediaTypes: Array.isArray(tool.supportedMediaTypes) ? tool.supportedMediaTypes.filter((item): item is "IMAGE" | "VIDEO" | "IMAGE_SERIES" | "TUTORIAL" => typeof item === "string") : ["IMAGE"],
            notes: tool.notes,
            count: tool._count.creations,
          }))}
          assets={options.assets}
        />
      </div>
    </>
  );
}
