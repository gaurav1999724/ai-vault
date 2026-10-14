"use client";

import { useState, useTransition } from "react";
import { saveProfile } from "@/lib/actions/settings";
import type { ProfileInput } from "@/lib/validators/admin";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProfileForm({ initial, assets }: { initial: ProfileInput; assets: { id: string; originalFilename: string }[] }) {
  const [form, setForm] = useState(initial);
  const [message, setMessage] = useState("");
  const [dirty, setDirty] = useState(false);
  const [pending, start] = useTransition();
  function update(partial: Partial<ProfileInput>) {
    setDirty(true);
    setForm({ ...form, ...partial });
  }
  return (
    <form className="grid max-w-3xl gap-4" onSubmit={(event) => {
      event.preventDefault();
      start(async () => {
        const result = await saveProfile(form);
        setMessage(result.message || "");
        if (result.ok) setDirty(false);
      });
    }}>
      {dirty ? <p className="text-sm text-muted">Unsaved changes</p> : null}
      <Label>Name</Label>
      <Input value={form.name} onChange={(event) => update({ name: event.target.value })} />
      <Label>Username</Label>
      <Input value={form.username} onChange={(event) => update({ username: event.target.value })} />
      <Label>Portrait</Label>
      <Select value={form.profileImageId || ""} onChange={(event) => update({ profileImageId: event.target.value || null })}>
        <option value="">No portrait</option>
        {assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.originalFilename}</option>)}
      </Select>
      <Label>Hero eyebrow</Label>
      <Input value={form.heroEyebrow} onChange={(event) => update({ heroEyebrow: event.target.value })} />
      <Label>Hero heading</Label>
      <Textarea value={form.heroHeading} onChange={(event) => update({ heroHeading: event.target.value })} />
      <Label>Hero subtitle</Label>
      <Textarea value={form.heroSubtitle} onChange={(event) => update({ heroSubtitle: event.target.value })} />
      <Label>Biography</Label>
      <Textarea value={form.biography} onChange={(event) => update({ biography: event.target.value })} />
      <Label>Professional introduction</Label>
      <Textarea value={form.professionalIntro} onChange={(event) => update({ professionalIntro: event.target.value })} />
      <Label>Philosophy</Label>
      <Textarea value={form.philosophy} onChange={(event) => update({ philosophy: event.target.value })} />
      <Label>Specialties, comma separated</Label>
      <Input value={form.specialties.join(", ")} onChange={(event) => update({ specialties: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })} />
      <Label>Interests, comma separated</Label>
      <Input value={form.interests.join(", ")} onChange={(event) => update({ interests: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })} />
      <Label>Instagram URL</Label>
      <Input value={form.instagramUrl || ""} onChange={(event) => update({ instagramUrl: event.target.value || null })} />
      <Label>YouTube URL</Label>
      <Input value={form.youtubeUrl || ""} onChange={(event) => update({ youtubeUrl: event.target.value || null })} />
      <Label>GitHub URL</Label>
      <Input value={form.githubUrl || ""} onChange={(event) => update({ githubUrl: event.target.value || null })} />
      <Label>Contact email</Label>
      <Input value={form.contactEmail || ""} onChange={(event) => update({ contactEmail: event.target.value || null })} />
      <Label>SEO description</Label>
      <Textarea value={form.seoDescription || ""} onChange={(event) => update({ seoDescription: event.target.value || null })} />
      <label className="text-sm"><input type="checkbox" checked={form.collaborationAvailable} onChange={(event) => update({ collaborationAvailable: event.target.checked })} /> Open to collaboration</label>
      <button disabled={pending} className="rounded-full bg-ink px-4 py-3 text-sm text-background" type="submit">Save profile</button>
      {message ? <p className="text-sm text-cyan">{message}</p> : null}
    </form>
  );
}
