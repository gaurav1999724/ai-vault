import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { getOverview } from "@/lib/data/admin";
import { getCurrentAdmin } from "@/lib/auth";

export default async function AdminHomePage() {
  const [admin, overview] = await Promise.all([getCurrentAdmin(), getOverview()]);
  return (
    <>
      <AdminHeader name={admin?.name || "Admin"} title="Overview" />
      <div className="space-y-8 p-4 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard label="Published" value={overview.published} />
          <AdminStatCard label="Drafts" value={overview.drafts} />
          <AdminStatCard label="Views" value={overview.views} hint="Accepted view events after daily dedupe." />
          <AdminStatCard label="Prompt copies" value={overview.copies} />
        </div>
        <section className="rounded-2xl border border-line p-5">
          <h2 className="font-display text-3xl">Most popular</h2>
          {overview.popular ? (
            <Link className="mt-3 inline-block text-cyan" href={`/creations/${overview.popular.slug}`}>
              {overview.popular.title} · {overview.popular.viewCount} views
            </Link>
          ) : (
            <p className="mt-3 text-sm text-muted">No viewed creations yet.</p>
          )}
        </section>
        <section>
          <h2 className="mb-3 font-display text-3xl">Recent creations</h2>
          <ul className="space-y-2 text-sm">
            {overview.recentCreations.map((creation) => (
              <li key={creation.id}>
                <Link href={`/admin/creations/${creation.id}/edit`}>{creation.title}</Link>
                <span className="ml-2 text-muted">{creation.status}</span>
              </li>
            ))}
            {!overview.recentCreations.length ? <li className="text-muted">No creations yet.</li> : null}
          </ul>
        </section>
        <section>
          <h2 className="mb-3 font-display text-3xl">Recent activity</h2>
          <ul className="space-y-2 text-sm text-muted">
            {overview.recentEvents.map((event) => (
              <li key={event.id}>
                {event.type} · {event.creation?.title || event.tutorial?.title || "site"} · {event.createdAt.toLocaleString()}
              </li>
            ))}
            {!overview.recentEvents.length ? <li>No analytics events recorded yet.</li> : null}
          </ul>
        </section>
      </div>
    </>
  );
}
