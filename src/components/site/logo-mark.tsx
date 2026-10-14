export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <rect x="8" y="8" width="32" height="32" rx="8" fill="none" stroke="currentColor" strokeOpacity="0.45" />
      <path className="origin-center motion-safe:animate-[spin_18s_linear_infinite]" d="M24 10 34 30H14Z" fill="none" stroke="#8B5CF6" strokeWidth="1.4" />
      <circle cx="24" cy="24" r="3" fill="#5DE4FF" />
    </svg>
  );
}
