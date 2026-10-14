export function LoadingSkeleton() {
  return (
    <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-6 px-5 py-28 md:grid-cols-2 xl:grid-cols-3 md:px-8" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="aspect-[4/5] rounded-2xl bg-surface" />
          <div className="mt-4 h-3 w-24 rounded bg-surface" />
          <div className="mt-3 h-6 w-2/3 rounded bg-surface" />
        </div>
      ))}
    </div>
  );
}

export function BrandLoader() {
  return (
    <div className="grid min-h-[40vh] place-items-center" role="status" aria-live="polite">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 rounded-full border border-line border-t-cyan motion-safe:animate-spin" />
        <p className="mt-4 text-xs tracking-[0.22em] text-muted">OPENING THE VAULT</p>
      </div>
    </div>
  );
}
