import { NextResponse } from "next/server";
import { z } from "zod";
import { getCardsBySlugs } from "@/lib/data/public";
import { sameOrigin } from "@/lib/origin";

const schema = z.object({ slugs: z.array(z.string().min(1).max(180)).max(40) });

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ items: [] }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ items: [] }, { status: 400 });
  const items = await getCardsBySlugs(parsed.data.slugs);
  return NextResponse.json({ items });
}
