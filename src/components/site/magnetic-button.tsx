"use client";

import { useRef, type ReactNode } from "react";

export function MagneticButton({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className="inline-flex"
      onPointerMove={(event) => {
        if (event.pointerType !== "mouse" || !ref.current) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const rect = ref.current.getBoundingClientRect();
        const x = event.clientX - (rect.left + rect.width / 2);
        const y = event.clientY - (rect.top + rect.height / 2);
        ref.current.style.transform = `translate3d(${x * 0.2}px, ${y * 0.28}px, 0)`;
      }}
      onPointerLeave={() => {
        if (ref.current) ref.current.style.transform = "translate3d(0,0,0)";
      }}
    >
      {children}
    </div>
  );
}
