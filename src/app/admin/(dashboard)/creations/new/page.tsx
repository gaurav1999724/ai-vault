import { AdminHeader } from "@/components/admin/admin-header";
import { CreationEditor } from "@/components/admin/creation-editor";
import { getEditorOptions } from "@/lib/data/admin";
import { getCurrentAdmin } from "@/lib/auth";

export default async function NewCreationPage() {
  const [admin, options] = await Promise.all([getCurrentAdmin(), getEditorOptions()]);
  return (
    <>
      <AdminHeader name={admin?.name || "Admin"} title="Add creation" />
      <div className="p-4 md:p-8">
        <CreationEditor initial={null} options={options} />
      </div>
    </>
  );
}
