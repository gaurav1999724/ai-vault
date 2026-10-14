"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteTutorial, saveTutorial } from "@/lib/actions/tutorials";
import { slugify } from "@/lib/slug";
import type { TutorialInput } from "@/lib/validators/admin";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { FieldError, Label } from "@/components/ui/label";
import { Input, Select, Textarea } from "@/components/ui/input";

const blank: TutorialInput = {
  title: "",
  slug: "",
  coverAssetId: null,
  summary: "",
  difficulty: "BEGINNER",
  durationMinutes: 15,
  status: "DRAFT",
  seoTitle: null,
  seoDescription: null,
  tips: null,
  troubleshooting: null,
  toolIds: [],
  creationIds: [],
  steps: [],
};

export function TutorialEditor({
  initial,
  tools,
  creations,
  assets,
}: {
  initial: TutorialInput | null;
  tools: { id: string; name: string }[];
  creations: { id: string; title: string }[];
  assets: { id: string; originalFilename: string }[];
}) {
  const router = useRouter();
  const [form, setForm] = useState(initial ?? blank);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, start] = useTransition();

  function save(status: TutorialInput["status"]) {
    start(async () => {
      const result = await saveTutorial({ ...form, status });
      setErrors(result.fieldErrors || {});
      setMessage(result.message || "");
      if (result.ok && result.id && !initial?.id) router.replace(`/admin/tutorials/${result.id}/edit`);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={pending} className="rounded-full border border-line px-4 py-2 text-sm" onClick={() => save("DRAFT")}>Save draft</button>
        <button type="button" disabled={pending} className="rounded-full bg-ink px-4 py-2 text-sm text-background" onClick={() => save("PUBLISHED")}>Publish</button>
        {form.id ? (
          <ConfirmDialog title="Delete tutorial" body="This removes the tutorial and its steps." confirmLabel="Delete" action={() => deleteTutorial(form.id!)}>
            <span className="text-sm text-warm">Delete</span>
          </ConfirmDialog>
        ) : null}
      </div>
      {message ? <p className="text-sm text-cyan">{message}</p> : null}
      <Label>Title</Label>
      <Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value, slug: initial ? form.slug : slugify(event.target.value) })} />
      <FieldError>{errors.title}</FieldError>
      <Label>Slug</Label>
      <Input value={form.slug} onChange={(event) => setForm({ ...form, slug: slugify(event.target.value) })} />
      <FieldError>{errors.slug}</FieldError>
      <Label>Summary</Label>
      <Textarea value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} />
      <FieldError>{errors.summary}</FieldError>
      <div className="grid gap-3 md:grid-cols-3">
        <Select value={form.difficulty} onChange={(event) => setForm({ ...form, difficulty: event.target.value as TutorialInput["difficulty"] })}>
          <option value="BEGINNER">Beginner</option>
          <option value="INTERMEDIATE">Intermediate</option>
          <option value="ADVANCED">Advanced</option>
        </Select>
        <Input type="number" value={form.durationMinutes} onChange={(event) => setForm({ ...form, durationMinutes: Number(event.target.value) })} />
        <Select value={form.coverAssetId || ""} onChange={(event) => setForm({ ...form, coverAssetId: event.target.value || null })}>
          <option value="">No cover</option>
          {assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.originalFilename}</option>)}
        </Select>
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        {tools.map((tool) => (
          <label key={tool.id} className="text-sm">
            <input type="checkbox" checked={form.toolIds.includes(tool.id)} onChange={(event) => setForm({ ...form, toolIds: event.target.checked ? [...form.toolIds, tool.id] : form.toolIds.filter((id) => id !== tool.id) })} /> {tool.name}
          </label>
        ))}
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        {creations.map((creation) => (
          <label key={creation.id} className="text-sm">
            <input type="checkbox" checked={form.creationIds.includes(creation.id)} onChange={(event) => setForm({ ...form, creationIds: event.target.checked ? [...form.creationIds, creation.id] : form.creationIds.filter((id) => id !== creation.id) })} /> {creation.title}
          </label>
        ))}
      </div>
      {form.steps.map((step, index) => (
        <div key={index} className="space-y-2 rounded-2xl border border-line p-4">
          <Input value={step.title} onChange={(event) => {
            const steps = [...form.steps];
            steps[index] = { ...step, title: event.target.value };
            setForm({ ...form, steps });
          }} />
          <RichTextEditor label="Body" value={step.body} onChange={(body) => {
            const steps = [...form.steps];
            steps[index] = { ...step, body };
            setForm({ ...form, steps });
          }} />
          <button type="button" className="text-sm text-warm" onClick={() => setForm({ ...form, steps: form.steps.filter((_, itemIndex) => itemIndex !== index) })}>Remove</button>
        </div>
      ))}
      <button type="button" className="rounded-full border border-line px-4 py-2 text-sm" onClick={() => setForm({ ...form, steps: [...form.steps, { title: "Step", body: "Explain the step.", mediaAssetId: null, externalLink: null, warning: null, tip: null }] })}>Add step</button>
      <FieldError>{errors.steps}</FieldError>
      <Label>Tips</Label>
      <Textarea value={form.tips || ""} onChange={(event) => setForm({ ...form, tips: event.target.value || null })} />
      <Label>Troubleshooting</Label>
      <Textarea value={form.troubleshooting || ""} onChange={(event) => setForm({ ...form, troubleshooting: event.target.value || null })} />
      <Label>SEO title</Label>
      <Input value={form.seoTitle || ""} onChange={(event) => setForm({ ...form, seoTitle: event.target.value || null })} />
      <Label>SEO description</Label>
      <Textarea value={form.seoDescription || ""} onChange={(event) => setForm({ ...form, seoDescription: event.target.value || null })} />
    </div>
  );
}
