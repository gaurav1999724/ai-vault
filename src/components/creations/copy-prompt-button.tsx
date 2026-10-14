"use client";

import { Check, Copy } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

async function copyText(text: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to the selection fallback.
  }
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.left = "-9999px";
  document.body.appendChild(area);
  area.select();
  const ok = document.execCommand("copy");
  area.remove();
  return ok;
}

export function CopyPromptButton({
  text,
  label,
  creationId,
  track = false,
}: {
  text: string;
  label: string;
  creationId?: string;
  track?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const lock = useRef(false);
  return (
    <button
      type="button"
      data-cursor="copy"
      className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm hover:border-cyan"
      onClick={async () => {
        if (lock.current) return;
        lock.current = true;
        const ok = await copyText(text);
        if (!ok) {
          toast.error("Clipboard is unavailable. Select the prompt and copy it manually.");
          window.setTimeout(() => {
            lock.current = false;
          }, 600);
          return;
        }
        setCopied(true);
        toast.success(`${label} copied`);
        if (track && creationId) {
          void fetch("/api/analytics", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ type: "PROMPT_COPY", creationId }),
          });
        }
        window.setTimeout(() => setCopied(false), 1600);
        window.setTimeout(() => {
          lock.current = false;
        }, 700);
      }}
    >
      {copied ? <Check size={15} /> : <Copy size={15} />}
      {copied ? "Copied!" : label}
    </button>
  );
}
