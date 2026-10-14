"use client";

export function ErrorState({ reset }: { reset?: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-5 py-32 text-center">
      <p className="text-xs tracking-[0.2em] text-cyan">SOMETHING SLIPPED</p>
      <h1 className="mt-4 font-display text-5xl">The page could not be opened.</h1>
      <p className="mt-4 text-muted">The studio data may be unavailable. Try again in a moment.</p>
      {reset ? (
        <button type="button" onClick={reset} className="mt-8 rounded-full bg-ink px-5 py-3 text-sm text-background">
          Try again
        </button>
      ) : null}
    </div>
  );
}
