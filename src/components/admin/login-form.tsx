"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({ nextPath }: { nextPath: string }) {
  const [state, action, pending] = useActionState(loginAction, { message: "" });
  return (
    <form action={action} className="mt-8 space-y-4">
      <input type="hidden" name="next" value={nextPath} />
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="username" required />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      {state.message ? <p className="text-sm text-warm">{state.message}</p> : null}
      <button disabled={pending} className="w-full rounded-full bg-ink py-3 text-sm text-background" type="submit">
        {pending ? "Checking" : "Log in"}
      </button>
    </form>
  );
}
