"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { MagneticButton } from "@/components/site/magnetic-button";
import { HeroFallback } from "@/components/home/hero-fallback";
import type { PublicProfile } from "@/types/content";

const Scene = dynamic(() => import("@/components/home/interactive-hero-scene").then((mod) => mod.InteractiveHeroScene), {
  ssr: false,
  loading: () => <HeroFallback />,
});

export function HeroSection({ profile }: { profile: PublicProfile }) {
  const scene = useSyncExternalStore(
    (callback) => {
      const queries = ["(prefers-reduced-motion: reduce)", "(pointer: fine)", "(min-width: 1024px)"].map((query) => window.matchMedia(query));
      queries.forEach((query) => query.addEventListener("change", callback));
      return () => queries.forEach((query) => query.removeEventListener("change", callback));
    },
    () =>
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      window.matchMedia("(pointer: fine)").matches &&
      window.matchMedia("(min-width: 1024px)").matches,
    () => false,
  );
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const lines = profile.heroHeading.split("\n").filter(Boolean);
  return (
    <section
      className="relative mx-auto grid min-h-[100svh] max-w-[1440px] items-end gap-10 px-5 pb-16 pt-32 md:px-8 lg:grid-cols-12 lg:items-center"
      onPointerMove={(event) => {
        if (event.pointerType !== "mouse") return;
        const rect = event.currentTarget.getBoundingClientRect();
        setOffset({
          x: (event.clientX - rect.left) / rect.width - 0.5,
          y: (event.clientY - rect.top) / rect.height - 0.5,
        });
      }}
    >
      <div className="lg:col-span-7" style={{ transform: `translate3d(${offset.x * -12}px, ${offset.y * -8}px, 0)` }}>
        <p className="text-[11px] tracking-[0.28em] text-violet">{profile.heroEyebrow}</p>
        <h1 className="mt-6 max-w-4xl font-display text-[clamp(4.2rem,9vw,8.4rem)] leading-[0.84] tracking-[-0.045em]">
          {lines.map((line, index) => (
            <span key={line} className={index === lines.length - 1 ? "block italic text-ink/90" : "block"}>
              {line}
            </span>
          ))}
        </h1>
        <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted">{profile.heroSubtitle}</p>
        <div className="mt-10 flex flex-wrap gap-4">
          <MagneticButton>
            <Link href="/explore" className="inline-flex rounded-full bg-ink px-6 py-3 text-sm text-background">
              Explore Creations
            </Link>
          </MagneticButton>
          <MagneticButton>
            <a href="#process" className="inline-flex rounded-full border border-line px-6 py-3 text-sm">
              Discover the Process
            </a>
          </MagneticButton>
        </div>
        <p className="mt-10 text-xs tracking-[0.2em] text-muted">{profile.name} · @{profile.username}</p>
      </div>
      <div className="relative h-[46vh] min-h-80 lg:col-span-5 lg:h-[70vh]">
        <div className="pointer-events-none absolute inset-6 rounded-full bg-violet/20 blur-3xl" />
        {scene ? <Scene /> : <HeroFallback />}
      </div>
      <a href="#selected" className="absolute bottom-6 left-8 hidden text-[11px] tracking-[0.22em] text-muted lg:block">
        SCROLL
      </a>
    </section>
  );
}
