import { describe, expect, it } from "vitest";
import {
  categoryDeleteBlockReason,
  formatSettingsClipboard,
  publicPromptFields,
  publishBlockers,
  withStepOrder,
} from "@/lib/content-rules";

describe("content rules", () => {
  it("hides draft prompts and returns published prompts unchanged", () => {
    expect(publicPromptFields({ status: "DRAFT", prompt: "secret", negativePrompt: null })).toBeNull();
    expect(publicPromptFields({ status: "PUBLISHED", prompt: "exact prompt", negativePrompt: "no blur" })).toEqual({
      prompt: "exact prompt",
      negativePrompt: "no blur",
    });
  });

  it("keeps the original prompt inside the settings clipboard", () => {
    const text = formatSettingsClipboard({
      prompt: "line one\nline two",
      negativePrompt: null,
      settings: [{ label: "Seed", value: "42" }],
    });
    expect(text).toContain("line one\nline two");
  });

  it("blocks category deletion and numbers tutorial steps", () => {
    expect(categoryDeleteBlockReason(2)).toMatch(/Reassign/);
    expect(categoryDeleteBlockReason(0)).toBeNull();
    expect(withStepOrder([{ title: "Open" }, { title: "Generate" }]).map((step) => step.order)).toEqual([1, 2]);
  });

  it("lists publishing blockers", () => {
    expect(
      publishBlockers({
        prompt: "",
        shortDescription: "short",
        description: "",
        hasCover: false,
        coverAlt: false,
        categoryCount: 0,
      }).length,
    ).toBeGreaterThan(3);
  });
});
