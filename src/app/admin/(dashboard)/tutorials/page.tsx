import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { DataTable } from "@/components/admin/data-table";
import { listTutorials } from "@/lib/data/admin";
import { getCurrentAdmin } from "@/lib/auth";

export default async function TutorialsAdminPage() {
  const [admin, tutorials] = await Promise.all([getCurrentAdmin(), listTutorials()]);
  return (
    <>
      <AdminHeader name={admin?.name || "Admin"} title="Tutorials" />
      <div className="space-y-4 p-4 md:p-8">
        <Link href="/admin/tutorials/new" className="inline-flex rounded-full bg-ink px-4 py-2 text-sm text-background">New tutorial</Link>
        <DataTable
          columns={["Title", "Status", "Difficulty", ""]}
          rows={tutorials.map((tutorial) => [
            tutorial.title,
            tutorial.status,
            tutorial.difficulty,
            <Link key={tutorial.id} href={`/admin/tutorials/${tutorial.id}/edit`}>Edit</Link>,
          ])}
        />
      </div>
    </>
  );
}
