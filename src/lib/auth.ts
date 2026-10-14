import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/constants";

const DUMMY_HASH = "$2b$12$C6UzMDM.H6dfI/f/IKcEeO6Yk2nQvQe1m3o1m3o1m3o1m3o1m3o1m";

function tokenHash(token: string) {
  const pepper = process.env.SESSION_PEPPER || "";
  return createHash("sha256").update(`${pepper}:${token}`).digest("hex");
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  await prisma.adminSession.create({
    data: {
      userId,
      tokenHash: tokenHash(token),
      expiresAt: new Date(Date.now() + SESSION_MAX_AGE * 1000),
    },
  });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.adminSession.deleteMany({ where: { tokenHash: tokenHash(token) } });
  }
  jar.delete(SESSION_COOKIE);
}

export async function getCurrentAdmin() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const jar = await cookies();
  if (!token) return null;
  const session = await prisma.adminSession.findUnique({
    where: { tokenHash: tokenHash(token) },
    include: { user: true },
  });
  if (!session || session.expiresAt.getTime() < Date.now()) {
    if (session) await prisma.adminSession.delete({ where: { id: session.id } }).catch(() => undefined);
    jar.delete(SESSION_COOKIE);
    return null;
  }
  return { id: session.user.id, email: session.user.email, name: session.user.name };
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

export async function verifyPassword(password: string, hash: string | null) {
  if (!hash) {
    await bcrypt.compare(password, DUMMY_HASH).catch(() => false);
    return false;
  }
  return bcrypt.compare(password, hash);
}
