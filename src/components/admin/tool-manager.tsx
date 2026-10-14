"use client";

import { useState, useTransition } from "react";
import { deleteTool, saveTool } from "@/lib/actions/taxonomy";
import { slugify } from "@/lib/slug";
import type { ToolInput } from "@/lib/validators/admin";
import { Input, Select, Textarea } from "@/components/ui/input";

type Row = ToolInput & { id: string; count: number };

const media = ["IMAGE", "VIDEO", "IMAGE_SERIES", "TUTORIAL"] as const;

export function ToolManager({ tools, assets }: { tools: Row[]; assets: { id: string; originalFilename: string }[] }) {
  const [rows, setRows] = useState(tools);
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();
  const [draft, setDraft] = useState({ name: "", websiteUrl: "", description: "", notes: "" });

  return (
    <div className="space-y-6">
      {message ? <p className="text-sm text-cyan">{message}</p> : null}
      <form className="grid gap-3 rounded-2xl border border-line p-4" onSubmit={(event) => {
        event.preventDefault();
        start(async () => {
          const result = await saveTool({
            name: draft.name,
            slug: slugify(draft.name),
            websiteUrl: draft.websiteUrl || null,
            logoAssetId: null,
            description: draft.description || null,
            supportedMediaTypes: ["IMAGE"],
            notes: draft.notes || null,
          });
          setMessage(result.message || "");
          if (result.ok) window.location.reload();
        });
      }}>
        <Input required placeholder="Tool name" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
        <Input placeholder="Website URL" value={draft.websiteUrl} onChange={(event) => setDraft({ ...draft, websiteUrl: event.target.value })} />
        <Textarea placeholder="Description" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
        <button disabled={pending} className="rounded-full bg-ink px-4 py-2 text-sm text-background" type="submit">Add tool</button>
      </form>
      {rows.map((row) => (
        <div key={row.id} className="grid gap-3 rounded-2xl border border-line p-4">
          <p className="text-xs text-muted">{row.count} creations</p>
          <Input value={row.name} onChange={(event) => setRows(rows.map((item) => item.id === row.id ? { ...item, name: event.target.value } : item))} />
          <Input value={row.slug} onChange={(event) => setRows(rows.map((item) => item.id === row.id ? { ...item, slug: event.target.value } : item))} />
          <Input value={row.websiteUrl || ""} onChange={(event) => setRows(rows.map((item) => item.id === row.id ? { ...item, websiteUrl: event.target.value || null } : item))} />
          <Textarea value={row.description || ""} onChange={(event) => setRows(rows.map((item) => item.id === row.id ? { ...item, description: event.target.value } : item))} />
          <Textarea value={row.notes || ""} onChange={(event) => setRows(rows.map((item) => item.id === row.id ? { ...item, notes: event.target.value } : item))} />
          <Select value={row.logoAssetId || ""} onChange={(event) => setRows(rows.map((item) => item.id === row.id ? { ...item, logoAssetId: event.target.value || null } : item))}>
            <option value="">No logo</option>
            {assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.originalFilename}</option>)}
          </Select>
          <div className="flex flex-wrap gap-3 text-sm">
            {media.map((type) => (
              <label key={type}>
                <input type="checkbox" checked={row.supportedMediaTypes.includes(type)} onChange={(event) => {
                  const supportedMediaTypes = event.target.checked ? [...row.supportedMediaTypes, type] : row.supportedMediaTypes.filter((item) => item !== type);
                  setRows(rows.map((item) => item.id === row.id ? { ...item, supportedMediaTypes: supportedMediaTypes.length ? supportedMediaTypes : item.supportedMediaTypes } : item));
                }} /> {type}
              </label>
            ))}
          </div>
          <div className="flex gap-3">
            <button type="button" className="rounded-full bg-ink px-4 py-2 text-sm text-background" onClick={() => start(async () => setMessage((await saveTool(row)).message || ""))}>Save</button>
            <button type="button" className="text-sm text-warm" onClick={() => start(async () => {
              const result = await deleteTool(row.id);
              setMessage(result.message || "");
              if (result.ok) setRows(rows.filter((item) => item.id !== row.id));
            })}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}
