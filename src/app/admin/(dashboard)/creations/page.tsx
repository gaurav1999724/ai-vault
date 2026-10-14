import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { DataTable } from "@/components/admin/data-table";
import { listAdminCreations } from "@/lib/data/admin";
import { getCurrentAdmin } from "@/lib/auth";

export default async function CreationsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const admin = await getCurrentAdmin();
  const query = (await searchParams).q || "";
  const creations = await listAdminCreations(query);
  return (
    <>
      <AdminHeader name={admin?.name || "Admin"} title="Creations" />
      <div className="space-y-4 p-4 md:p-8">
        <form>
          <input name="q" defaultValue={query} placeholder="Search title or slug" className="w-full max-w-md rounded-full border border-line bg-transparent px-4 py-3 text-sm" />
        </form>
        <DataTable
          columns={["Title", "Status", "Type", "Views", "Copies", ""]}
          rows={creations.map((creation) => [
            <Link key={creation.id} href={`/admin/creations/${creation.id}/edit`}>{creation.title}</Link>,
            creation.status,
            creation.mediaType,
            creation.viewCount,
            creation.copyCount,
            <Link key={`${creation.id}-view`} href={`/creations/${creation.slug}`}>View</Link>,
          ])}
        />
        {!creations.length ? <p className="text-sm text-muted">No creations match.</p> : null}
      </div>
    </>
  );
}
