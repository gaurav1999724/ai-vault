"use client";

import { useState, useTransition } from "react";
import { markMessageRead } from "@/lib/actions/settings";

export function MessageList({
  messages,
}: {
  messages: { id: string; name: string; email: string; subject: string; message: string; createdAt: string; readAt: string | null }[];
}) {
  const [items, setItems] = useState(messages);
  const [pending, start] = useTransition();
  if (!items.length) return <p className="text-sm text-muted">No messages yet.</p>;
  return (
    <div className="space-y-4">
      {items.map((message) => (
        <article key={message.id} className="rounded-2xl border border-line p-4">
          <div className="flex flex-wrap justify-between gap-2">
            <h2 className="font-display text-2xl">{message.subject}</h2>
            <span className="text-xs text-muted">{new Date(message.createdAt).toLocaleString()}</span>
          </div>
          <p className="mt-1 text-sm text-muted">{message.name} · {message.email}</p>
          <p className="mt-3 whitespace-pre-wrap text-sm">{message.message}</p>
          {message.readAt ? <p className="mt-3 text-xs text-muted">Read</p> : (
            <button type="button" disabled={pending} className="mt-3 text-sm text-cyan" onClick={() => start(async () => {
              await markMessageRead(message.id);
              setItems(items.map((item) => item.id === message.id ? { ...item, readAt: new Date().toISOString() } : item));
            })}>Mark read</button>
          )}
        </article>
      ))}
    </div>
  );
}
