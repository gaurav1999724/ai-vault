"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { useState } from "react";

function MenuMark({ open }: { open: boolean }) {
  return (
    <span className="menu-mark" data-open={open ? "true" : "false"} aria-hidden="true">
      <span />
      <span />
    </span>
  );
}

export function MobileNavigation({ links }: { links: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className="icon-disc grid h-11 w-11 place-items-center lg:hidden" aria-label={open ? "Close menu" : "Open menu"}>
        <MenuMark open={open} />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[90] bg-black/70 lg:hidden" />
        <Dialog.Content className="fixed inset-y-0 right-0 z-[100] flex w-[min(100%,22rem)] flex-col bg-background p-6 lg:hidden">
          <div className="flex items-center justify-between">
            <Dialog.Title className="font-display text-3xl">Menu</Dialog.Title>
            <Dialog.Close className="icon-disc grid h-11 w-11 place-items-center" aria-label="Close menu">
              <MenuMark open />
            </Dialog.Close>
          </div>
          <nav className="mt-10 flex flex-col gap-4" aria-label="Mobile">
            {links.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="font-display text-4xl">
                {link.label}
              </Link>
            ))}
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
