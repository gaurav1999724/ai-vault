"use client";

import { useState, type ReactNode } from "react";
import { Modal } from "@/components/ui/dialog";

export function ConfirmDialog({
  title,
  body,
  confirmLabel,
  action,
  children,
}: {
  title: string;
  body: string;
  confirmLabel: string;
  action: () => void | Promise<void>;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        {children}
      </button>
      <Modal open={open} onOpenChange={setOpen} title={title}>
        <p className="text-sm text-muted">{body}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" className="rounded-full border border-line px-4 py-2 text-sm" onClick={() => setOpen(false)}>
            Cancel
          </button>
          <button
            type="button"
            className="rounded-full bg-warm px-4 py-2 text-sm text-background"
            onClick={() => {
              void action();
              setOpen(false);
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </Modal>
    </>
  );
}
