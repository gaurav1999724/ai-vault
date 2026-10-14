"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitContact } from "@/lib/actions/contact";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ContactForm() {
  const [state, action, pending] = useActionState(submitContact, { ok: false, message: "" });
  const startedAt = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (startedAt.current) startedAt.current.value = String(Date.now());
  }, []);
  return (
    <form action={action} className="relative space-y-4 rounded-[2rem] border border-line bg-panel p-6">
      <input ref={startedAt} type="hidden" name="startedAt" defaultValue="0" />
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label>
          Company
          <input name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required autoComplete="name" />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div>
        <Label htmlFor="subject">Subject</Label>
        <Input id="subject" name="subject" required />
      </div>
      <div>
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" name="message" required />
      </div>
      <button disabled={pending} className="rounded-full bg-ink px-5 py-3 text-sm text-background disabled:opacity-60" type="submit">
        {pending ? "Sending" : "Send message"}
      </button>
      {state.message ? <p className={state.ok ? "text-sm text-cyan" : "text-sm text-warm"}>{state.message}</p> : null}
    </form>
  );
}
