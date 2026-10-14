"use client";

import { useEffect, type ReactNode } from "react";

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const wide = window.matchMedia("(min-width: 1024px)").matches;
    if (reduce || !fine || !wide) return;
    let frame = 0;
    let stopped = false;
    let destroy = () => {};
    void import("lenis").then(({ default: Lenis }) => {
      if (stopped) return;
      const lenis = new Lenis({ lerp: 0.085, smoothWheel: true });
      destroy = () => lenis.destroy();
      const loop = (time: number) => {
        lenis.raf(time);
        frame = requestAnimationFrame(loop);
      };
      frame = requestAnimationFrame(loop);
    });
    return () => {
      stopped = true;
      cancelAnimationFrame(frame);
      destroy();
    };
  }, []);
  return children;
}
