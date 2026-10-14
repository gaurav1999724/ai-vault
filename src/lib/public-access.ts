export function unavailablePublicRecord(status: "PUBLISHED" | "DRAFT" | null, hasSession: boolean) {
  if (!status) return true;
  if (status === "DRAFT") return !hasSession;
  return false;
}

export function publicContentSlug(pathname: string) {
  const match = pathname.match(/^\/(creations|tutorials|categories)\/([^/]+)$/);
  if (!match) return null;
  let slug = match[2];
  try {
    slug = decodeURIComponent(slug);
  } catch {
    return { kind: match[1] as "creations" | "tutorials" | "categories", slug: "" };
  }
  return { kind: match[1] as "creations" | "tutorials" | "categories", slug };
}
