import "server-only";
import { prisma } from "@/lib/db";
import { rateKey } from "@/lib/analytics";

export async function isRateLimited(scope: string, value: string, max: number, windowMs: number) {
  const keyHash = rateKey(scope, value);
  const since = new Date(Date.now() - windowMs);
  await prisma.authAttempt.deleteMany({
    where: { createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
  });
  const count = await prisma.authAttempt.count({ where: { keyHash, createdAt: { gte: since } } });
  return count >= max;
}

export async function recordRateLimit(scope: string, value: string) {
  await prisma.authAttempt.create({ data: { keyHash: rateKey(scope, value) } });
}

export async function clearRateLimit(scope: string, value: string) {
  await prisma.authAttempt.deleteMany({ where: { keyHash: rateKey(scope, value) } });
}
