"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createSession, destroySession, verifyPassword } from "@/lib/auth";
import { clearRateLimit, isRateLimited, recordRateLimit } from "@/lib/rate-limit";
import { LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_MS } from "@/lib/constants";
import { loginSchema } from "@/lib/validators/admin";

export async function loginAction(_state: { message: string }, formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { message: "Enter the administrator email and password." };
  const email = parsed.data.email.toLowerCase();
  if (await isRateLimited("login", email, LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_MS)) {
    return { message: "Too many attempts. Try again in a few minutes." };
  }
  const user = await prisma.adminUser.findUnique({ where: { email } });
  const valid = await verifyPassword(parsed.data.password, user?.passwordHash ?? null);
  if (!user || !valid) {
    await recordRateLimit("login", email);
    return { message: "Those credentials were not recognized." };
  }
  await clearRateLimit("login", email);
  await createSession(user.id);
  const next = String(formData.get("next") || "/admin");
  redirect(next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}
