"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/input";

export function RichTextEditor({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="mb-2 flex flex-wrap gap-2">
        {[
          ["Bold", "**bold**"],
          ["Link", "[text](https://)"],
          ["List", "\n- item"],
          ["Warning", "\n> Warning: "],
        ].map(([name, snippet]) => (
          <button key={name} type="button" className="rounded-full border border-line px-3 py-1 text-xs" onClick={() => onChange(`${value}${snippet}`)}>
            {name}
          </button>
        ))}
      </div>
      <Textarea id={id} value={value} onChange={(event) => onChange(event.target.value)} className="min-h-40 font-mono text-sm" />
      <p className="mt-2 text-xs text-muted">Markdown is supported. The stored text is rendered with sanitization.</p>
    </div>
  );
}
