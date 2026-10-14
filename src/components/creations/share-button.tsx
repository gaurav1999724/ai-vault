"use client";

import { toast } from "sonner";

export function ShareButton({ title, path }: { title: string; path: string }) {
  return (
    <button
      type="button"
      className="rounded-full border border-line px-4 py-2 text-sm"
      onClick={async () => {
        const url = new URL(path, window.location.origin).toString();
        if (navigator.share) {
          await navigator.share({ title, url }).catch(() => undefined);
          return;
        }
        await navigator.clipboard.writeText(url);
        toast.success("Page link copied");
      }}
    >
      Share Creation
    </button>
  );
}
