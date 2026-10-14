import { CreationCard } from "@/components/creations/creation-card";
import type { CardData } from "@/types/content";

export function RelatedCreations({ items }: { items: CardData[] }) {
  if (!items.length) return null;
  return (
    <section className="mt-20">
      <h2 className="font-display text-5xl">Related experiments</h2>
      <div className="mt-8 grid gap-8 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <CreationCard key={item.id} creation={item} />
        ))}
      </div>
    </section>
  );
}
