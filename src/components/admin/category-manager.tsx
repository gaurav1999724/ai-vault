"use client";

import { useState, useTransition } from "react";
import { deleteCategory, reorderCategories, saveCategory } from "@/lib/actions/taxonomy";
import { slugify } from "@/lib/slug";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  coverAssetId: string | null;
  displayOrder: number;
  published: boolean;
  count: number;
};

export function CategoryManager({ categories, assets }: { categories: CategoryRow[]; assets: { id: string; originalFilename: string }[] }) {
  const [rows, setRows] = useState(categories);
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();
  const [draft, setDraft] = useState({ name: "", slug: "", description: "", coverAssetId: "", published: true });

  function save(row: CategoryRow) {
    start(async () => {
      const result = await saveCategory(row);
      setMessage(result.message || "");
    });
  }

  return (
    <div className="space-y-8">
      {message ? <p className="text-sm text-cyan">{message}</p> : null}
      <form
        className="grid gap-3 rounded-2xl border border-line p-4 md:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          start(async () => {
            const result = await saveCategory({
              name: draft.name,
              slug: draft.slug || slugify(draft.name),
              description: draft.description,
              coverAssetId: draft.coverAssetId || null,
              displayOrder: rows.length,
              published: draft.published,
            });
            setMessage(result.message || "");
            if (result.ok) window.location.reload();
          });
        }}
      >
        <Input placeholder="Name" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value, slug: slugify(event.target.value) })} required />
        <Input placeholder="Slug" value={draft.slug} onChange={(event) => setDraft({ ...draft, slug: event.target.value })} required />
        <Textarea className="md:col-span-2" placeholder="Description" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
        <button disabled={pending} className="rounded-full bg-ink px-4 py-2 text-sm text-background" type="submit">Add category</button>
      </form>
      <div className="space-y-4">
        {rows.map((row, index) => (
          <div key={row.id} className="grid gap-3 rounded-2xl border border-line p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted">
              <span>{row.count} creations</span>
              <div className="flex gap-2">
                <button type="button" disabled={index === 0} onClick={() => {
                  const next = [...rows];
                  [next[index - 1], next[index]] = [next[index], next[index - 1]];
                  setRows(next);
                  start(async () => {
                    await reorderCategories(next.map((item) => item.id));
                  });
                }}>Up</button>
                <button type="button" disabled={index === rows.length - 1} onClick={() => {
                  const next = [...rows];
                  [next[index + 1], next[index]] = [next[index], next[index + 1]];
                  setRows(next);
                  start(async () => {
                    await reorderCategories(next.map((item) => item.id));
                  });
                }}>Down</button>
              </div>
            </div>
            <Input value={row.name} onChange={(event) => setRows(rows.map((item) => item.id === row.id ? { ...item, name: event.target.value } : item))} />
            <Input value={row.slug} onChange={(event) => setRows(rows.map((item) => item.id === row.id ? { ...item, slug: event.target.value } : item))} />
            <Textarea value={row.description || ""} onChange={(event) => setRows(rows.map((item) => item.id === row.id ? { ...item, description: event.target.value } : item))} />
            <Label>Cover</Label>
            <Select value={row.coverAssetId || ""} onChange={(event) => setRows(rows.map((item) => item.id === row.id ? { ...item, coverAssetId: event.target.value || null } : item))}>
              <option value="">No cover</option>
              {assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.originalFilename}</option>)}
            </Select>
            <label className="text-sm"><input type="checkbox" checked={row.published} onChange={(event) => setRows(rows.map((item) => item.id === row.id ? { ...item, published: event.target.checked } : item))} /> Published</label>
            <div className="flex gap-3">
              <button type="button" className="rounded-full bg-ink px-4 py-2 text-sm text-background" onClick={() => save(rows[index])}>Save</button>
              <button type="button" className="text-sm text-warm" onClick={() => start(async () => {
                const result = await deleteCategory(row.id);
                setMessage(result.message || "");
                if (result.ok) setRows(rows.filter((item) => item.id !== row.id));
              })}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
