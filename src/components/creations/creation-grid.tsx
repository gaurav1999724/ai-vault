"use client";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { motion, useReducedMotion } from "motion/react";
import { CreationCard } from "@/components/creations/creation-card";
import { EmptyState } from "@/components/states/empty-state";
import type { CardData } from "@/types/content";
import Link from "next/link";

const spans = ["xl:col-span-7", "xl:col-span-5", "xl:col-span-4", "xl:col-span-8", "xl:col-span-6", "xl:col-span-6"];

export function CreationGrid({
  items,
  page,
  total,
  pageSize,
  prevHref,
  nextHref,
}: {
  items: CardData[];
  page: number;
  total: number;
  pageSize: number;
  prevHref?: string;
  nextHref?: string;
}) {
  const [parent] = useAutoAnimate();
  const reduce = useReducedMotion();
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (!items.length) {
    return <EmptyState title="Nothing in this frame" body="Try another model, category, or a shorter search." />;
  }
  return (
    <div>
      <div ref={parent} className="grid grid-cols-1 gap-x-6 gap-y-14 md:grid-cols-2 xl:grid-cols-12">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            className={spans[index % spans.length]}
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: Math.min(index, 8) * 0.05 }}
          >
            <CreationCard creation={item} />
          </motion.div>
        ))}
      </div>
      {pages > 1 ? (
        <nav className="mt-12 flex items-center justify-between text-sm" aria-label="Pagination">
          <span className="text-muted">
            Page {page} of {pages}
          </span>
          <div className="flex gap-3">
            {prevHref ? <Link className="rounded-full border border-line px-4 py-2" href={prevHref}>Previous</Link> : null}
            {nextHref ? <Link className="rounded-full border border-line px-4 py-2" href={nextHref}>Next</Link> : null}
          </div>
        </nav>
      ) : null}
    </div>
  );
}
