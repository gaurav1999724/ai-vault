import { describe, expect, it } from "vitest";
import { slugify } from "@/lib/slug";

describe("slugify", () => {
  it("creates a readable lowercase slug", () => {
    expect(slugify("Rain-Soaked Rooftop!")).toBe("rain-soaked-rooftop");
  });

  it("falls back when the title has no letters", () => {
    expect(slugify("...")).toBe("item");
  });
});
