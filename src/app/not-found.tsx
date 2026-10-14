import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-5 py-40 text-center">
      <p className="text-xs tracking-[0.2em] text-cyan">404</p>
      <h1 className="mt-4 font-display text-6xl">This frame is empty.</h1>
      <p className="mt-4 text-muted">The page is missing, or the creation is still a draft.</p>
      <Link href="/" className="mt-8 inline-flex rounded-full bg-ink px-5 py-3 text-sm text-background">
        Return home
      </Link>
    </div>
  );
}
