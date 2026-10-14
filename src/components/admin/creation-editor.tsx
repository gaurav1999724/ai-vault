"use client";

import * as Tabs from "@radix-ui/react-tabs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { deleteCreation, duplicateCreation, saveCreation } from "@/lib/actions/creations";
import { slugify } from "@/lib/slug";
import type { CreationInput } from "@/lib/validators/creation";
import type { AssetOption } from "@/types/content";
import { MediaUploader } from "@/components/admin/media-uploader";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { FieldError, Label } from "@/components/ui/label";
import { Input, Select, Textarea } from "@/components/ui/input";

const blank: CreationInput = {
  title: "",
  slug: "",
  shortDescription: "",
  description: "",
  mediaType: "IMAGE",
  status: "DRAFT",
  prompt: "",
  negativePrompt: null,
  aspectRatio: null,
  featured: false,
  promptOfTheDay: false,
  seoTitle: null,
  seoDescription: null,
  modelName: null,
  platformName: null,
  seed: null,
  guidanceScale: null,
  stepCount: null,
  resolution: null,
  durationSeconds: null,
  frameRate: null,
  cameraMovement: null,
  motionInstructions: null,
  characterNotes: null,
  workflowNotes: null,
  limitations: null,
  credits: null,
  subscriptions: null,
  generationSettings: [],
  categoryIds: [],
  tagNames: [],
  toolIds: [],
  media: [],
  steps: [],
};

export function CreationEditor({
  initial,
  options,
}: {
  initial: CreationInput | null;
  options: {
    categories: { id: string; name: string }[];
    tools: { id: string; name: string; websiteUrl: string | null }[];
    assets: AssetOption[];
  };
}) {
  const router = useRouter();
  const [form, setForm] = useState<CreationInput>(initial ?? blank);
  const [assets, setAssets] = useState(options.assets);
  const [tagDraft, setTagDraft] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [dirty, setDirty] = useState(false);
  const [pending, start] = useTransition();
  const slugEdited = useRef(Boolean(initial?.slug));
  const formRef = useRef(form);
  formRef.current = form;

  useEffect(() => {
    const onLeave = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
    };
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [dirty]);

  useEffect(() => {
    if (!form.id || form.status !== "DRAFT" || !dirty) return;
    const timer = window.setTimeout(() => submit("DRAFT"), 2500);
    return () => window.clearTimeout(timer);
    // Autosave only while a draft is dirty.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, dirty]);

  function patch(partial: Partial<CreationInput>) {
    setDirty(true);
    setForm((current) => ({ ...current, ...partial }));
  }

  function submit(status: "DRAFT" | "PUBLISHED") {
    const payload = { ...formRef.current, status };
    start(async () => {
      const result = await saveCreation(payload);
      setErrors(result.fieldErrors || {});
      setMessage(result.message || "");
      if (!result.ok || !result.id) return;
      setDirty(false);
      setForm((current) => ({ ...current, id: result.id, status, slug: result.slug || current.slug }));
      if (!initial?.id) router.replace(`/admin/creations/${result.id}/edit`);
      else router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">{dirty ? "Unsaved changes" : message || "All changes stored"}</p>
        <div className="flex flex-wrap gap-2">
          {form.slug ? (
            <Link className="rounded-full border border-line px-4 py-2 text-sm" href={`/creations/${form.slug}`} target="_blank">
              Preview
            </Link>
          ) : null}
          {form.id ? (
            <button type="button" className="rounded-full border border-line px-4 py-2 text-sm" onClick={() => start(() => duplicateCreation(form.id!))}>
              Duplicate
            </button>
          ) : null}
          {form.id ? (
            <ConfirmDialog title="Delete creation" body="This removes the creation. Media files stay in the library." confirmLabel="Delete" action={() => deleteCreation(form.id!)}>
              <span className="rounded-full border border-warm/40 px-4 py-2 text-sm text-warm">Delete</span>
            </ConfirmDialog>
          ) : null}
          <button type="button" disabled={pending} className="rounded-full border border-line px-4 py-2 text-sm" onClick={() => submit("DRAFT")}>
            Save draft
          </button>
          <button type="button" disabled={pending} className="rounded-full bg-ink px-4 py-2 text-sm text-background" onClick={() => submit("PUBLISHED")}>
            {form.status === "PUBLISHED" ? "Update published" : "Publish"}
          </button>
        </div>
      </div>
      {message ? <p className="text-sm text-cyan">{message}</p> : null}
      <Tabs.Root defaultValue="basic">
        <Tabs.List className="flex gap-2 overflow-x-auto border-b border-line pb-3">
          {["basic", "media", "prompt", "model", "tutorial", "taxonomy", "seo"].map((tab) => (
            <Tabs.Trigger key={tab} value={tab} className="rounded-full px-3 py-2 text-sm capitalize text-muted data-[state=active]:bg-white/10 data-[state=active]:text-ink">
              {tab === "seo" ? "SEO" : tab}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        <Tabs.Content value="basic" className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={form.title} onChange={(event) => {
              const title = event.target.value;
              patch({ title, slug: slugEdited.current ? form.slug : slugify(title) });
            }} />
            <FieldError>{errors.title}</FieldError>
          </div>
          <div>
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" value={form.slug} onChange={(event) => { slugEdited.current = true; patch({ slug: slugify(event.target.value) }); }} />
            <FieldError>{errors.slug}</FieldError>
          </div>
          <div>
            <Label htmlFor="type">Media type</Label>
            <Select id="type" value={form.mediaType} onChange={(event) => patch({ mediaType: event.target.value as CreationInput["mediaType"] })}>
              <option value="IMAGE">Image</option>
              <option value="VIDEO">Video</option>
              <option value="IMAGE_SERIES">Image series</option>
              <option value="TUTORIAL">Tutorial</option>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="short">Short description</Label>
            <Textarea id="short" value={form.shortDescription} onChange={(event) => patch({ shortDescription: event.target.value })} />
            <FieldError>{errors.shortDescription}</FieldError>
          </div>
          <div className="md:col-span-2">
            <RichTextEditor label="Description" value={form.description} onChange={(description) => patch({ description })} />
            <FieldError>{errors.description}</FieldError>
          </div>
        </Tabs.Content>
        <Tabs.Content value="media" className="mt-6 space-y-4">
          <MediaUploader onUploaded={(asset) => setAssets((current) => [asset, ...current])} />
          <FieldError>{errors.media}</FieldError>
          <div className="grid gap-3">
            {form.media.map((item, index) => {
              const asset = assets.find((entry) => entry.id === item.assetId);
              return (
                <div key={`${item.assetId}-${index}`} className="grid gap-3 rounded-2xl border border-line p-3 md:grid-cols-[72px_1fr_160px_auto]">
                  {asset?.thumbnailUrl || asset?.publicUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={asset.thumbnailUrl || asset.publicUrl} alt="" className="h-16 w-16 rounded-lg object-cover" />
                  ) : <div className="h-16 w-16 rounded-lg bg-black/30" />}
                  <Input value={item.altText || ""} placeholder="Alt text" onChange={(event) => {
                    const media = [...form.media];
                    media[index] = { ...item, altText: event.target.value || null };
                    patch({ media });
                  }} />
                  <Select value={item.role} onChange={(event) => {
                    const media = [...form.media];
                    media[index] = { ...item, role: event.target.value as CreationInput["media"][number]["role"] };
                    patch({ media });
                  }}>
                    {["COVER", "MAIN", "GALLERY", "REFERENCE", "POSTER", "SOURCE", "DOWNLOAD"].map((role) => <option key={role}>{role}</option>)}
                  </Select>
                  <button type="button" className="text-sm text-warm" onClick={() => patch({ media: form.media.filter((_, itemIndex) => itemIndex !== index) })}>Remove</button>
                </div>
              );
            })}
          </div>
          <Select value="" onChange={(event) => {
            if (!event.target.value) return;
            patch({ media: [...form.media, { assetId: event.target.value, role: form.media.length ? "GALLERY" : "COVER", sortOrder: form.media.length, altText: null }] });
          }}>
            <option value="">Attach existing media</option>
            {assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.originalFilename}</option>)}
          </Select>
        </Tabs.Content>
        <Tabs.Content value="prompt" className="mt-6 space-y-4">
          <div>
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea id="prompt" className="min-h-56 font-mono" value={form.prompt} onChange={(event) => patch({ prompt: event.target.value })} />
            <FieldError>{errors.prompt}</FieldError>
          </div>
          <div>
            <Label htmlFor="negative">Negative prompt</Label>
            <Textarea id="negative" value={form.negativePrompt || ""} onChange={(event) => patch({ negativePrompt: event.target.value || null })} />
          </div>
        </Tabs.Content>
        <Tabs.Content value="model" className="mt-6 grid gap-4 md:grid-cols-2">
          <Field label="Platform" value={form.platformName || ""} onChange={(platformName) => patch({ platformName: platformName || null })} />
          <Field label="Model" value={form.modelName || ""} onChange={(modelName) => patch({ modelName: modelName || null })} />
          <Field label="Aspect ratio" value={form.aspectRatio || ""} onChange={(aspectRatio) => patch({ aspectRatio: aspectRatio || null })} />
          <Field label="Resolution" value={form.resolution || ""} onChange={(resolution) => patch({ resolution: resolution || null })} />
          <Field label="Seed" value={form.seed || ""} onChange={(seed) => patch({ seed: seed || null })} />
          <Field label="Guidance" value={form.guidanceScale?.toString() || ""} onChange={(value) => patch({ guidanceScale: value ? Number(value) : null })} />
          <Field label="Steps" value={form.stepCount?.toString() || ""} onChange={(value) => patch({ stepCount: value ? Number(value) : null })} />
          <Field label="Duration seconds" value={form.durationSeconds?.toString() || ""} onChange={(value) => patch({ durationSeconds: value ? Number(value) : null })} />
          <Field label="Frame rate" value={form.frameRate || ""} onChange={(frameRate) => patch({ frameRate: frameRate || null })} />
          <Field label="Camera movement" value={form.cameraMovement || ""} onChange={(cameraMovement) => patch({ cameraMovement: cameraMovement || null })} />
          <div className="md:col-span-2">
            <Label>Motion instructions</Label>
            <Textarea value={form.motionInstructions || ""} onChange={(event) => patch({ motionInstructions: event.target.value || null })} />
          </div>
          <div className="md:col-span-2">
            <Label>Character notes</Label>
            <Textarea value={form.characterNotes || ""} onChange={(event) => patch({ characterNotes: event.target.value || null })} />
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label>Other settings</Label>
            {form.generationSettings.map((setting, index) => (
              <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                <Input value={setting.label} onChange={(event) => {
                  const generationSettings = [...form.generationSettings];
                  generationSettings[index] = { ...setting, label: event.target.value };
                  patch({ generationSettings });
                }} />
                <Input value={setting.value} onChange={(event) => {
                  const generationSettings = [...form.generationSettings];
                  generationSettings[index] = { ...setting, value: event.target.value };
                  patch({ generationSettings });
                }} />
                <button type="button" onClick={() => patch({ generationSettings: form.generationSettings.filter((_, itemIndex) => itemIndex !== index) })}>Remove</button>
              </div>
            ))}
            <button type="button" className="text-sm text-cyan" onClick={() => patch({ generationSettings: [...form.generationSettings, { label: "Setting", value: "Value" }] })}>Add setting</button>
          </div>
        </Tabs.Content>
        <Tabs.Content value="tutorial" className="mt-6 space-y-4">
          {form.steps.map((step, index) => (
            <div key={index} className="space-y-3 rounded-2xl border border-line p-4">
              <Input value={step.title} onChange={(event) => {
                const steps = [...form.steps];
                steps[index] = { ...step, title: event.target.value };
                patch({ steps });
              }} />
              <RichTextEditor label={`Step ${index + 1}`} value={step.body} onChange={(body) => {
                const steps = [...form.steps];
                steps[index] = { ...step, body };
                patch({ steps });
              }} />
              <Input placeholder="Tip" value={step.tip || ""} onChange={(event) => {
                const steps = [...form.steps];
                steps[index] = { ...step, tip: event.target.value || null };
                patch({ steps });
              }} />
              <Input placeholder="Warning" value={step.warning || ""} onChange={(event) => {
                const steps = [...form.steps];
                steps[index] = { ...step, warning: event.target.value || null };
                patch({ steps });
              }} />
              <Input placeholder="External link" value={step.externalLink || ""} onChange={(event) => {
                const steps = [...form.steps];
                steps[index] = { ...step, externalLink: event.target.value || null };
                patch({ steps });
              }} />
              <button type="button" className="text-sm text-warm" onClick={() => patch({ steps: form.steps.filter((_, itemIndex) => itemIndex !== index) })}>Remove step</button>
            </div>
          ))}
          <button type="button" className="rounded-full border border-line px-4 py-2 text-sm" onClick={() => patch({ steps: [...form.steps, { title: "New step", body: "Describe this step.", mediaAssetId: null, externalLink: null, warning: null, tip: null }] })}>Add step</button>
          <Label>Workflow notes</Label>
          <Textarea value={form.workflowNotes || ""} onChange={(event) => patch({ workflowNotes: event.target.value || null })} />
          <Label>Limitations</Label>
          <Textarea value={form.limitations || ""} onChange={(event) => patch({ limitations: event.target.value || null })} />
          <Label>Credits</Label>
          <Textarea value={form.credits || ""} onChange={(event) => patch({ credits: event.target.value || null })} />
          <Label>Subscriptions</Label>
          <Textarea value={form.subscriptions || ""} onChange={(event) => patch({ subscriptions: event.target.value || null })} />
        </Tabs.Content>
        <Tabs.Content value="taxonomy" className="mt-6 space-y-4">
          <FieldError>{errors.categoryIds}</FieldError>
          <div className="grid gap-2 sm:grid-cols-2">
            {options.categories.map((category) => (
              <label key={category.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.categoryIds.includes(category.id)} onChange={(event) => patch({ categoryIds: event.target.checked ? [...form.categoryIds, category.id] : form.categoryIds.filter((id) => id !== category.id) })} />
                {category.name}
              </label>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {form.tagNames.map((tag) => (
              <button key={tag} type="button" className="rounded-full border border-line px-3 py-1 text-xs" onClick={() => patch({ tagNames: form.tagNames.filter((item) => item !== tag) })}>
                {tag} ×
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={tagDraft} placeholder="Add a tag" onChange={(event) => setTagDraft(event.target.value)} onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                if (tagDraft.trim()) patch({ tagNames: [...form.tagNames, tagDraft.trim()] });
                setTagDraft("");
              }
            }} />
          </div>
          <div className="space-y-2">
            {options.tools.map((tool) => {
              const selected = form.toolIds.find((item) => item.toolId === tool.id);
              return (
                <label key={tool.id} className="flex items-center gap-3 text-sm">
                  <input type="checkbox" checked={Boolean(selected)} onChange={(event) => patch({ toolIds: event.target.checked ? [...form.toolIds, { toolId: tool.id, modelName: null }] : form.toolIds.filter((item) => item.toolId !== tool.id) })} />
                  {tool.name}
                </label>
              );
            })}
          </div>
        </Tabs.Content>
        <Tabs.Content value="seo" className="mt-6 space-y-4">
          <Field label="SEO title" value={form.seoTitle || ""} onChange={(seoTitle) => patch({ seoTitle: seoTitle || null })} />
          <div>
            <Label>SEO description</Label>
            <Textarea value={form.seoDescription || ""} onChange={(event) => patch({ seoDescription: event.target.value || null })} />
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.featured} onChange={(event) => patch({ featured: event.target.checked })} /> Featured</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.promptOfTheDay} onChange={(event) => patch({ promptOfTheDay: event.target.checked })} /> Prompt of the day</label>
          {form.status === "PUBLISHED" ? (
            <button type="button" className="text-sm text-warm" onClick={() => submit("DRAFT")}>Unpublish</button>
          ) : null}
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <Input value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}
