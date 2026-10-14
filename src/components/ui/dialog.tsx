"use client";

import * as Dialog from "@radix-ui/react-dialog";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  onOpenChange,
  title,
  children,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[90] bg-black/70" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-[100] max-h-[85vh] w-[min(640px,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-3xl border border-line bg-panel p-6 shadow-2xl",
            className,
          )}
        >
          <Dialog.Title className="font-display text-3xl">{title}</Dialog.Title>
          <div className="mt-5">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export const DialogRoot = Dialog.Root;
export const DialogTrigger = Dialog.Trigger;
export const DialogClose = Dialog.Close;
