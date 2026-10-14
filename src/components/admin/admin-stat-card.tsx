export function AdminStatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <article className="rounded-2xl border border-line bg-surface p-5">
      <p className="text-xs tracking-[0.16em] text-muted">{label}</p>
      <p className="mt-3 font-display text-4xl">{value}</p>
      {hint ? <p className="mt-2 text-sm text-muted">{hint}</p> : null}
    </article>
  );
}
