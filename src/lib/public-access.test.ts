import { describe, expect, it } from "vitest";
import { publicContentSlug, unavailablePublicRecord } from "@/lib/public-access";

describe("public access", () => {
  it("treats missing and anonymous drafts as unavailable", () => {
    expect(unavailablePublicRecord(null, false)).toBe(true);
    expect(unavailablePublicRecord("DRAFT", false)).toBe(true);
    expect(unavailablePublicRecord("DRAFT", true)).toBe(false);
    expect(unavailablePublicRecord("PUBLISHED", false)).toBe(false);
  });

  it("reads a single public content slug", () => {
    expect(publicContentSlug("/creations/demo-rooftop-warrior")).toEqual({
      kind: "creations",
      slug: "demo-rooftop-warrior",
    });
    expect(publicContentSlug("/explore")).toBeNull();
    expect(publicContentSlug("/creations/demo/extra")).toBeNull();
  });
});
