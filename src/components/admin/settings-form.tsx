"use client";

import { useState, useTransition } from "react";
import { saveSettings } from "@/lib/actions/settings";
import type { SettingsInput } from "@/lib/validators/admin";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SettingsForm({ initial, assets }: { initial: SettingsInput; assets: { id: string; originalFilename: string }[] }) {
  const [form, setForm] = useState(initial);
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();
  function update(partial: Partial<SettingsInput>) {
    setForm({ ...form, ...partial });
  }
  return (
    <form className="grid max-w-3xl gap-4" onSubmit={(event) => {
      event.preventDefault();
      start(async () => setMessage((await saveSettings(form)).message || ""));
    }}>
      <Label>Website title</Label>
      <Input value={form.websiteTitle} onChange={(event) => update({ websiteTitle: event.target.value })} />
      <Label>Default SEO title</Label>
      <Input value={form.defaultSeoTitle} onChange={(event) => update({ defaultSeoTitle: event.target.value })} />
      <Label>Default SEO description</Label>
      <Textarea value={form.defaultSeoDescription} onChange={(event) => update({ defaultSeoDescription: event.target.value })} />
      <Label>Footer text</Label>
      <Textarea value={form.footerText} onChange={(event) => update({ footerText: event.target.value })} />
      <Label>Instagram handle</Label>
      <Input value={form.instagramHandle || ""} onChange={(event) => update({ instagramHandle: event.target.value || null })} />
      <Label>Contact email</Label>
      <Input value={form.contactEmail || ""} onChange={(event) => update({ contactEmail: event.target.value || null })} />
      <AssetSelect label="Logo" value={form.logoAssetId} assets={assets} onChange={(logoAssetId) => update({ logoAssetId })} />
      <AssetSelect label="Favicon" value={form.faviconAssetId} assets={assets} onChange={(faviconAssetId) => update({ faviconAssetId })} />
      <AssetSelect label="Social image" value={form.socialImageAssetId} assets={assets} onChange={(socialImageAssetId) => update({ socialImageAssetId })} />
      <Label>Privacy policy</Label>
      <Textarea className="min-h-40" value={form.privacyBody} onChange={(event) => update({ privacyBody: event.target.value })} />
      <Label>Terms of use</Label>
      <Textarea className="min-h-40" value={form.termsBody} onChange={(event) => update({ termsBody: event.target.value })} />
      <label className="text-sm"><input type="checkbox" checked={form.featuredSectionVisible} onChange={(event) => update({ featuredSectionVisible: event.target.checked })} /> Show featured section</label>
      <label className="text-sm"><input type="checkbox" checked={form.showPromptOfDay} onChange={(event) => update({ showPromptOfDay: event.target.checked })} /> Show prompt of the day</label>
      <label className="text-sm"><input type="checkbox" checked={form.showProcess} onChange={(event) => update({ showProcess: event.target.checked })} /> Show process section</label>
      <label className="text-sm"><input type="checkbox" checked={form.showInstagramCta} onChange={(event) => update({ showInstagramCta: event.target.checked })} /> Show Instagram section</label>
      <Label>Instagram preview images</Label>
      <Select value="" onChange={(event) => {
        if (!event.target.value || form.instagramPreviewIds.includes(event.target.value)) return;
        update({ instagramPreviewIds: [...form.instagramPreviewIds, event.target.value] });
      }}>
        <option value="">Add a preview</option>
        {assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.originalFilename}</option>)}
      </Select>
      <ul className="text-sm">
        {form.instagramPreviewIds.map((id) => (
          <li key={id}>
            {assets.find((asset) => asset.id === id)?.originalFilename || id}
            <button type="button" className="ml-2 text-warm" onClick={() => update({ instagramPreviewIds: form.instagramPreviewIds.filter((item) => item !== id) })}>Remove</button>
          </li>
        ))}
      </ul>
      <button disabled={pending} className="rounded-full bg-ink px-4 py-3 text-sm text-background" type="submit">Save settings</button>
      {message ? <p className="text-sm text-cyan">{message}</p> : null}
    </form>
  );
}

function AssetSelect({ label, value, assets, onChange }: { label: string; value: string | null; assets: { id: string; originalFilename: string }[]; onChange: (value: string | null) => void }) {
  return (
    <>
      <Label>{label}</Label>
      <Select value={value || ""} onChange={(event) => onChange(event.target.value || null)}>
        <option value="">None</option>
        {assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.originalFilename}</option>)}
      </Select>
    </>
  );
}
