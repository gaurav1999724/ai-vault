export function GenerationSettings({
  modelName,
  platformName,
  settings,
}: {
  modelName: string | null;
  platformName: string | null;
  settings: { label: string; value: string }[];
}) {
  if (!modelName && !platformName && settings.length === 0) return null;
  return (
    <dl className="mt-6 grid grid-cols-2 gap-3">
      {platformName ? <Item label="Platform" value={platformName} /> : null}
      {modelName ? <Item label="Model" value={modelName} /> : null}
      {settings
        .filter((item) => item.label !== "Aspect ratio" || true)
        .map((item) => (
          <Item key={`${item.label}-${item.value}`} label={item.label} value={item.value} />
        ))}
    </dl>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line px-3 py-3">
      <dt className="text-[10px] tracking-[0.16em] text-muted">{label.toUpperCase()}</dt>
      <dd className="mt-1 text-sm">{value}</dd>
    </div>
  );
}
