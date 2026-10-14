import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-header";
import { TutorialEditor } from "@/components/admin/tutorial-editor";
import { getEditorOptions, getTutorialForm, listCreationChoices } from "@/lib/data/admin";
import { getCurrentAdmin } from "@/lib/auth";

export default async function EditTutorialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [admin, form, options, creations] = await Promise.all([
    getCurrentAdmin(),
    getTutorialForm(id),
    getEditorOptions(),
    listCreationChoices(),
  ]);
  if (!form) notFound();
  return (
    <>
      <AdminHeader name={admin?.name || "Admin"} title="Edit tutorial" />
      <div className="p-4 md:p-8">
        <TutorialEditor initial={form} tools={options.tools} creations={creations} assets={options.assets} />
      </div>
    </>
  );
}
