import { describe, expect, it } from "vitest";
import { contactSchema } from "@/lib/validators/contact";
import { creationSchema } from "@/lib/validators/creation";

const base = {
  title: "Rooftop",
  slug: "rooftop",
  shortDescription: "A cinematic rooftop study.",
  description: "A longer description of the rooftop study.",
  mediaType: "IMAGE" as const,
  prompt: "A mysterious futuristic warrior",
  negativePrompt: null,
  aspectRatio: "21:9",
  featured: false,
  promptOfTheDay: false,
  seoTitle: null,
  seoDescription: null,
  modelName: "v6",
  platformName: "Midjourney",
  seed: null,
  guidanceScale: null,
  stepCount: null,
  resolution: null,
  durationSeconds: null,
  frameRate: null,
  cameraMovement: null,
  motionInstructions: null,
  characterNotes: null,
  workflowNotes: null,
  limitations: null,
  credits: null,
  subscriptions: null,
  generationSettings: [],
  categoryIds: ["cat"],
  tagNames: ["rain"],
  toolIds: [],
  media: [{ assetId: "asset", role: "COVER" as const, sortOrder: 0, altText: "Warrior on a roof" }],
  steps: [],
};

describe("creation validation", () => {
  it("accepts a complete published creation", () => {
    expect(creationSchema.safeParse({ ...base, status: "PUBLISHED" }).success).toBe(true);
  });

  it("allows an incomplete draft and rejects an incomplete publish", () => {
    expect(creationSchema.safeParse({ ...base, status: "DRAFT", prompt: "", media: [], categoryIds: [] }).success).toBe(
      true,
    );
    expect(creationSchema.safeParse({ ...base, status: "PUBLISHED", prompt: "  ", media: [] }).success).toBe(false);
  });
});

describe("contact validation", () => {
  it("requires a real message", () => {
    const result = contactSchema.safeParse({
      name: "A",
      email: "not-an-email",
      subject: "Hi",
      message: "short",
      company: "",
      startedAt: Date.now(),
    });
    expect(result.success).toBe(false);
  });
});
