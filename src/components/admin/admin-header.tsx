export function AdminHeader({ name, title }: { name: string; title: string }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3 border-b border-line px-4 py-5 md:px-8">
      <div>
        <p className="text-xs tracking-[0.16em] text-muted">SIGNED IN AS {name.toUpperCase()}</p>
        <h1 className="mt-1 font-display text-4xl">{title}</h1>
      </div>
    </header>
  );
}
