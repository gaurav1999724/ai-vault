import { describe, expect, it } from "vitest";
import { dedupeKey } from "@/lib/analytics";

describe("analytics dedupe", () => {
  it("collapses prompt copies inside the same short window", () => {
    const now = Date.UTC(2026, 9, 14, 12, 0, 1);
    expect(dedupeKey("visitor", "PROMPT_COPY", "creation", now)).toBe(
      dedupeKey("visitor", "PROMPT_COPY", "creation", now + 2000),
    );
  });

  it("separates views by day", () => {
    const first = Date.UTC(2026, 9, 14, 1);
    const next = Date.UTC(2026, 9, 15, 1);
    expect(dedupeKey("visitor", "CREATION_VIEW", "creation", first)).not.toBe(
      dedupeKey("visitor", "CREATION_VIEW", "creation", next),
    );
  });
});
