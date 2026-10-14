import { PrismaClient } from "@prisma/client";
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/constants";
import { publicContentSlug, unavailablePublicRecord } from "@/lib/public-access";

const globalForPrisma = globalThis as unknown as { proxyPrisma?: PrismaClient };

function db() {
  return (globalForPrisma.proxyPrisma ??= new PrismaClient());
}

function appDataRequest(request: NextRequest) {
  return request.headers.get("rsc") === "1" || request.headers.has("next-router-prefetch") || request.nextUrl.searchParams.has("_rsc");
}

const missingPage = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex" />
  <title>This frame is empty</title>
  <style>
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #08090d; color: #f4f4f5; font-family: Georgia, serif; }
    main { max-width: 36rem; padding: 2rem; text-align: center; }
    p { color: #9ca3af; }
    a { display: inline-flex; margin-top: 1.5rem; border-radius: 999px; background: #f4f4f5; color: #08090d; padding: 0.8rem 1.2rem; text-decoration: none; font-family: sans-serif; }
  </style>
</head>
<body>
  <main>
    <p>404</p>
    <h1>This frame is empty.</h1>
    <p>The page is missing, or the creation is still a draft.</p>
    <a href="/">Return home</a>
  </main>
</body>
</html>`;

async function missingPublicPage(pathname: string, hasSession: boolean) {
  const target = publicContentSlug(pathname);
  if (!target || !target.slug) return Boolean(target);
  if (target.kind === "categories") {
    const category = await db().category.findFirst({ where: { slug: target.slug, published: true }, select: { id: true } });
    return !category;
  }
  if (target.kind === "tutorials") {
    const tutorial = await db().tutorial.findUnique({ where: { slug: target.slug }, select: { status: true } });
    return unavailablePublicRecord(tutorial?.status ?? null, hasSession);
  }
  const creation = await db().creation.findUnique({ where: { slug: target.slug }, select: { status: true } });
  return unavailablePublicRecord(creation?.status ?? null, hasSession);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }
  if (!appDataRequest(request) && publicContentSlug(pathname)) {
    try {
      if (await missingPublicPage(pathname, Boolean(token))) {
        return new NextResponse(missingPage, {
          status: 404,
          headers: { "content-type": "text/html; charset=utf-8", "x-robots-tag": "noindex" },
        });
      }
    } catch {
      return NextResponse.next();
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/creations/:slug", "/tutorials/:slug", "/categories/:slug"],
};
