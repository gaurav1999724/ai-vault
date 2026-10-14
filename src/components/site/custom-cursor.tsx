"use client";

import { useEffect, useRef } from "react";

const labels: Record<string, string> = {
  link: "",
  view: "VIEW",
  copy: "COPY",
  drag: "DRAG",
  "3d": "",
};

export function CustomCursor() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wide = window.matchMedia("(min-width: 1024px)").matches;
    if (!fine || reduce || !wide || !root.current) return;
    const node = root.current;
    document.documentElement.classList.add("has-custom-cursor");
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let cx = x;
    let cy = y;
    let frame = 0;
    const label = node.querySelector(".vault-cursor-label");
    const move = (event: PointerEvent) => {
      x = event.clientX;
      y = event.clientY;
      const target = (event.target as HTMLElement | null)?.closest("[data-cursor]") as HTMLElement | null;
      const mode = target?.dataset.cursor || "";
      if (label) label.textContent = labels[mode] ?? "";
      node.dataset.mode = mode;
    };
    const loop = () => {
      cx += (x - cx) * 0.22;
      cy += (y - cy) * 0.22;
      node.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      frame = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", move, { passive: true });
    frame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, []);
  return (
    <div ref={root} className="vault-cursor pointer-events-none fixed left-0 top-0 z-[80]" aria-hidden="true">
      <span className="vault-cursor-halo" />
      <i className="vault-cursor-ring" />
      <b className="vault-cursor-dot" />
      <span className="vault-cursor-label" />
    </div>
  );
}
