import { AdminHeader } from "@/components/admin/admin-header";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AnalyticsCharts } from "@/components/admin/analytics-charts";
import { EmptyState } from "@/components/states/empty-state";
import { getAnalyticsDashboard } from "@/lib/data/admin";
import { getCurrentAdmin } from "@/lib/auth";

export default async function AnalyticsPage() {
  const [admin, data] = await Promise.all([getCurrentAdmin(), getAnalyticsDashboard()]);
  return (
    <>
      <AdminHeader name={admin?.name || "Admin"} title="Analytics" />
      <div className="space-y-8 p-4 md:p-8">
        <p className="max-w-3xl text-sm text-muted">
          A view is counted once per browser per creation per UTC day. Prompt copies from the same browser are ignored for about ten seconds. Raw IP addresses are not stored. The visitor cookie is a random id.
        </p>
        <AdminStatCard label="Copy-to-view ratio" value={data.ratio == null ? "—" : data.ratio.toFixed(2)} hint="All-time copies divided by accepted views." />
        {data.hasEvents ? <AnalyticsCharts days={data.days} /> : <EmptyState title="No events yet" body="Views and copies appear after visitors use the public site." />}
        <div className="grid gap-6 lg:grid-cols-2">
          <List title="Most viewed" rows={data.viewed.map((item) => `${item.title} · ${item.viewCount}`)} />
          <List title="Most copied" rows={data.copied.map((item) => `${item.title} · ${item.copyCount}`)} />
          <List title="Popular categories" rows={data.categories.map((item) => `${item.name} · ${item.views} views`)} />
          <List title="AI tool usage" rows={data.tools.map((item) => `${item.name} · ${item.count}`)} />
        </div>
        <section>
          <h2 className="font-display text-3xl">Recent activity</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            {data.recent.map((event) => (
              <li key={event.id}>{event.createdAt.toLocaleString()} · {event.type} · {event.creation?.title || event.tutorial?.title || "site"}</li>
            ))}
            {!data.recent.length ? <li>No activity recorded.</li> : null}
          </ul>
        </section>
      </div>
    </>
  );
}

function List({ title, rows }: { title: string; rows: string[] }) {
  return (
    <section className="rounded-2xl border border-line p-4">
      <h2 className="font-display text-3xl">{title}</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {rows.length ? rows.map((row) => <li key={row}>{row}</li>) : <li className="text-muted">Nothing recorded.</li>}
      </ul>
    </section>
  );
}
