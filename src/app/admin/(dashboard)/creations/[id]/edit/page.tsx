import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-header";
import { CreationEditor } from "@/components/admin/creation-editor";
import { getCreationForm, getEditorOptions } from "@/lib/data/admin";
import { getCurrentAdmin } from "@/lib/auth";

export default async function EditCreationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [admin, form, options] = await Promise.all([getCurrentAdmin(), getCreationForm(id), getEditorOptions()]);
  if (!form) notFound();
  return (
    <>
      <AdminHeader name={admin?.name || "Admin"} title="Edit creation" />
      <div className="p-4 md:p-8">
        <CreationEditor initial={form} options={options} />
      </div>
    </>
  );
}
