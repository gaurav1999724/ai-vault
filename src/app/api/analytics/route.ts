import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { dedupeKey, visitorIsValid } from "@/lib/analytics";
import { allowMemory } from "@/lib/memory-limit";
import { sameOrigin } from "@/lib/origin";
import { VISITOR_COOKIE } from "@/lib/constants";

const schema = z.object({
  type: z.enum(["CREATION_VIEW", "PROMPT_COPY", "TUTORIAL_VIEW", "FAVORITE", "OUTBOUND_TOOL_CLICK"]),
  creationId: z.string().min(1).optional(),
  tutorialId: z.string().min(1).optional(),
});

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ ok: false }, { status: 403 });
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });
  const existing = request.headers.get("cookie")?.match(new RegExp(`${VISITOR_COOKIE}=([^;]+)`))?.[1];
  const visitorId = visitorIsValid(existing) ? existing! : crypto.randomUUID();
  if (!allowMemory(visitorId, 40, 60_000)) return NextResponse.json({ ok: false }, { status: 429 });
  const entityId = parsed.data.creationId || parsed.data.tutorialId;
  if (!entityId) return NextResponse.json({ ok: false }, { status: 400 });
  if ((parsed.data.type === "CREATION_VIEW" || parsed.data.type === "PROMPT_COPY" || parsed.data.type === "FAVORITE" || parsed.data.type === "OUTBOUND_TOOL_CLICK") && parsed.data.creationId) {
    const creation = await prisma.creation.findFirst({ where: { id: parsed.data.creationId, status: "PUBLISHED" }, select: { id: true } });
    if (!creation) return NextResponse.json({ ok: false }, { status: 404 });
  }
  if (parsed.data.type === "TUTORIAL_VIEW" && parsed.data.tutorialId) {
    const tutorial = await prisma.tutorial.findFirst({ where: { id: parsed.data.tutorialId, status: "PUBLISHED" }, select: { id: true } });
    if (!tutorial) return NextResponse.json({ ok: false }, { status: 404 });
  }
  const response = NextResponse.json({ ok: true });
  if (!visitorIsValid(existing)) {
    response.cookies.set(VISITOR_COOKIE, visitorId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 180,
    });
  }
  try {
    await prisma.$transaction(async (tx) => {
      await tx.analyticsEvent.create({
        data: {
          type: parsed.data.type,
          creationId: parsed.data.creationId,
          tutorialId: parsed.data.type === "TUTORIAL_VIEW" ? parsed.data.tutorialId : undefined,
          dedupeKey: dedupeKey(visitorId, parsed.data.type, entityId, Date.now()),
        },
      });
      if (parsed.data.type === "CREATION_VIEW" && parsed.data.creationId) {
        await tx.creation.update({ where: { id: parsed.data.creationId }, data: { viewCount: { increment: 1 } } });
      }
      if (parsed.data.type === "PROMPT_COPY" && parsed.data.creationId) {
        await tx.creation.update({ where: { id: parsed.data.creationId }, data: { copyCount: { increment: 1 } } });
      }
      if (parsed.data.type === "TUTORIAL_VIEW" && parsed.data.tutorialId) {
        await tx.tutorial.update({ where: { id: parsed.data.tutorialId }, data: { viewCount: { increment: 1 } } });
      }
    });
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") {
      return NextResponse.json({ ok: false }, { status: 500 });
    }
  }
  return response;
}
