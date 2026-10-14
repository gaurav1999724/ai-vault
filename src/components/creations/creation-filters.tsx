"use client";

import { useRouter } from "next/navigation";
import type { ExploreQuery } from "@/lib/explore";

export function CreationFilters({
  query,
  facets,
  basePath,
}: {
  query: ExploreQuery;
  facets: {
    categories: { name: string; slug: string }[];
    tools: { name: string; slug: string }[];
    tags: { name: string; slug: string }[];
  };
  basePath: string;
}) {
  const router = useRouter();
  function update(next: Record<string, string>) {
    const params = new URLSearchParams();
    const merged = {
      q: query.q || "",
      category: query.category || "",
      type: query.type || "",
      tool: query.tool || "",
      tag: query.tag || "",
      sort: query.sort,
      ...next,
    };
    for (const [key, value] of Object.entries(merged)) {
      if (value) params.set(key, value);
    }
    const search = params.toString();
    router.push(search ? `${basePath}?${search}` : basePath);
  }
  return (
    <form className="grid gap-3 md:grid-cols-2 xl:grid-cols-6" onSubmit={(event) => event.preventDefault()}>
      <label className="xl:col-span-2">
        <span className="sr-only">Search</span>
        <input
          defaultValue={query.q || ""}
          placeholder="Search titles, prompts, tags"
          className="w-full rounded-full border border-line bg-transparent px-4 py-3 text-sm"
          onChange={(event) => update({ q: event.target.value, page: "" })}
        />
      </label>
      <Filter label="Category" value={query.category || ""} onChange={(value) => update({ category: value })} options={facets.categories} />
      <Filter label="AI tool" value={query.tool || ""} onChange={(value) => update({ tool: value })} options={facets.tools} />
      <Filter label="Tag" value={query.tag || ""} onChange={(value) => update({ tag: value })} options={facets.tags} />
      {!query.types ? (
        <label>
          <span className="sr-only">Media type</span>
          <select className="w-full rounded-full border border-line bg-background px-4 py-3 text-sm" value={query.type || ""} onChange={(event) => update({ type: event.target.value })}>
            <option value="">All media</option>
            <option value="IMAGE">Image</option>
            <option value="VIDEO">Video</option>
            <option value="IMAGE_SERIES">Image series</option>
            <option value="TUTORIAL">Tutorial</option>
          </select>
        </label>
      ) : (
        <label>
          <span className="sr-only">Sort</span>
          <select className="w-full rounded-full border border-line bg-background px-4 py-3 text-sm" value={query.sort} onChange={(event) => update({ sort: event.target.value })}>
            <option value="latest">Latest</option>
            <option value="viewed">Most viewed</option>
            <option value="copied">Most copied</option>
            <option value="featured">Featured</option>
          </select>
        </label>
      )}
      {!query.types ? (
        <label className="xl:col-span-1">
          <span className="sr-only">Sort</span>
          <select className="w-full rounded-full border border-line bg-background px-4 py-3 text-sm" value={query.sort} onChange={(event) => update({ sort: event.target.value })}>
            <option value="latest">Latest</option>
            <option value="viewed">Most viewed</option>
            <option value="copied">Most copied</option>
            <option value="featured">Featured</option>
          </select>
        </label>
      ) : null}
    </form>
  );
}

function Filter({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { name: string; slug: string }[];
}) {
  return (
    <label>
      <span className="sr-only">{label}</span>
      <select className="w-full rounded-full border border-line bg-background px-4 py-3 text-sm" value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">{label}</option>
        {options.map((option) => (
          <option key={option.slug} value={option.slug}>
            {option.name}
          </option>
        ))}
      </select>
    </label>
  );
}
