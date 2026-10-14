import { describe, expect, it } from "vitest";
import { buildExploreWhere, buildOrderBy, parseExploreParams } from "@/lib/explore";

describe("explore filters", () => {
  it("keeps drafts out of the public query", () => {
    const query = parseExploreParams({ q: "rain", sort: "copied", page: "2" });
    expect(buildExploreWhere(query)).toMatchObject({ status: "PUBLISHED" });
    expect(buildOrderBy(query.sort)[0]).toEqual({ copyCount: "desc" });
  });

  it("preserves a preset media group", () => {
    const query = parseExploreParams({ type: "TUTORIAL" }, { types: ["IMAGE", "IMAGE_SERIES"] });
    expect(query.types).toEqual(["IMAGE", "IMAGE_SERIES"]);
    expect(buildExploreWhere(query).mediaType).toEqual({ in: ["IMAGE", "IMAGE_SERIES"] });
  });
});
