"use client";

import { useEffect, useRef } from "react";

const steps = [
  ["01", "IDEA", "Develop the concept and visual direction."],
  ["02", "PROMPT", "Write the detailed prompt and define constraints."],
  ["03", "GENERATE", "Choose the appropriate AI model and settings."],
  ["04", "REFINE", "Iterate on composition, identity, lighting, and details."],
  ["05", "PUBLISH", "Share the result with the community."],
];

export function ProcessSection() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let revert = () => {};
    let stopped = false;
    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([gsapModule, triggerModule]) => {
      if (stopped || !ref.current) return;
      const gsap = gsapModule.default;
      gsap.registerPlugin(triggerModule.ScrollTrigger);
      const context = gsap.context(() => {
        gsap.from("[data-step]", {
          scrollTrigger: { trigger: ref.current, start: "top 75%" },
          y: 24,
          opacity: 0,
          stagger: 0.08,
          duration: 0.7,
          ease: "power2.out",
        });
        gsap.from("[data-process-line]", {
          scrollTrigger: { trigger: ref.current, start: "top 75%" },
          scaleX: 0,
          transformOrigin: "left center",
          duration: 1.1,
          ease: "power2.out",
        });
      }, ref);
      revert = () => context.revert();
    });
    return () => {
      stopped = true;
      revert();
    };
  }, []);
  return (
    <section id="process" ref={ref} className="mx-auto max-w-[1440px] px-5 py-24 md:px-8">
      <p className="text-[11px] tracking-[0.22em] text-violet">CREATION PROCESS</p>
      <h2 className="mt-3 max-w-3xl font-display text-6xl leading-none">From a sentence to a scene.</h2>
      <div data-process-line className="mt-10 hidden h-px origin-left bg-gradient-to-r from-violet via-cyan to-transparent lg:block" />
      <ol className="mt-8 grid gap-8 lg:grid-cols-5">
        {steps.map(([index, title, body]) => (
          <li key={index} data-step>
            <p className="font-display text-3xl text-cyan">{index}</p>
            <h3 className="mt-3 text-sm tracking-[0.18em]">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-muted">{body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
