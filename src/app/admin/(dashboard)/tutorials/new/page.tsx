import { AdminHeader } from "@/components/admin/admin-header";
import { TutorialEditor } from "@/components/admin/tutorial-editor";
import { getEditorOptions, listCreationChoices } from "@/lib/data/admin";
import { getCurrentAdmin } from "@/lib/auth";

export default async function NewTutorialPage() {
  const [admin, options, creations] = await Promise.all([getCurrentAdmin(), getEditorOptions(), listCreationChoices()]);
  return (
    <>
      <AdminHeader name={admin?.name || "Admin"} title="New tutorial" />
      <div className="p-4 md:p-8">
        <TutorialEditor initial={null} tools={options.tools} creations={creations} assets={options.assets} />
      </div>
    </>
  );
}
