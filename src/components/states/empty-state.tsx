export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-line px-6 py-16 text-center">
      <h2 className="font-display text-4xl">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-muted">{body}</p>
    </div>
  );
}
