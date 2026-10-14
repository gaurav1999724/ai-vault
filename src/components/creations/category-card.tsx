import Link from "next/link";
import type { CategoryTile } from "@/types/content";

export function CategoryCard({ category }: { category: CategoryTile }) {
  return (
    <Link href={`/categories/${category.slug}`} data-cursor="view" className="group relative h-72 min-w-64 overflow-hidden rounded-[1.6rem] bg-surface">
      {category.coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={category.coverUrl} alt={category.coverAlt} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
      ) : (
        <div className="h-full w-full bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.45),transparent_40%),linear-gradient(160deg,#101218,#08090d)]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5">
        <h3 className="font-display text-3xl">{category.name}</h3>
        <p className="mt-1 text-xs tracking-[0.16em] text-white/70">{category.count} WORKS</p>
      </div>
    </Link>
  );
}
