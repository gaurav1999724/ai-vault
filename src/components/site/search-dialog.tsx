"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[90] bg-black/70" />
        <Dialog.Content className="fixed left-1/2 top-[18vh] z-[100] w-[min(720px,calc(100%-2rem))] -translate-x-1/2 rounded-3xl border border-line bg-panel p-6">
          <Dialog.Title className="font-display text-4xl">Search the vault</Dialog.Title>
          <form
            className="mt-6"
            onSubmit={(event) => {
              event.preventDefault();
              const value = query.trim();
              onOpenChange(false);
              router.push(value ? `/explore?q=${encodeURIComponent(value)}` : "/explore");
            }}
          >
            <label htmlFor="vault-search" className="sr-only">
              Search creations
            </label>
            <input
              id="vault-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Title, model, tag, or prompt"
              className="w-full border-b border-line bg-transparent py-4 text-2xl outline-none"
              autoFocus
            />
            <button className="mt-6 rounded-full bg-ink px-5 py-3 text-sm text-background" type="submit">
              Explore results
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
