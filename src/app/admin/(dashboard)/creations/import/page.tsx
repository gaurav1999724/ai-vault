import { AdminHeader } from "@/components/admin/admin-header";
import { CreationImportForm } from "@/components/admin/creation-import-form";
import { getCurrentAdmin } from "@/lib/auth";

export default async function ImportCreationsPage() {
  const admin = await getCurrentAdmin();
  return (
    <>
      <AdminHeader name={admin?.name || "Admin"} title="Import Excel" />
      <div className="max-w-3xl space-y-6 p-4 md:p-8">
        <div className="space-y-3 text-sm leading-7 text-muted">
          <p>One workbook can add many creations. Each row on the Creations sheet is a separate piece, with every field the public page can show.</p>
          <p>Download the template, fill it in, then upload it here. Draft rows can be incomplete. Published rows need a prompt, descriptions, a category, and a cover image that is already in the media library.</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Creations holds the title, prompt, settings, categories, tags, tools, and cover file.</li>
            <li>Workflow steps holds the timeline, one step per row.</li>
            <li>Media holds extra gallery, reference, and download files.</li>
          </ul>
          <p>Header notes in the workbook explain each column. Cyan headers are the fields a published creation shows.</p>
        </div>
        <CreationImportForm />
      </div>
    </>
  );
}
