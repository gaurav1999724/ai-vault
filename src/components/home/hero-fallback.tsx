export function HeroFallback() {
  return (
    <div className="relative h-full min-h-72 w-full overflow-hidden rounded-[2rem] border border-line bg-panel" aria-hidden="true">
      <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-3xl border border-violet/50" />
      <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan/40" />
      <div className="absolute left-[30%] top-[28%] h-16 w-16 rounded-full bg-violet/30 blur-2xl" />
      <div className="absolute bottom-[22%] right-[24%] h-20 w-20 rounded-full bg-cyan/20 blur-2xl" />
    </div>
  );
}
