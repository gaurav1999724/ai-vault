import { z } from "zod";
import { nullableNumber, nullableText, optionalUrl, slugSchema } from "@/lib/validators/fields";

export const mediaRoles = ["COVER", "MAIN", "GALLERY", "REFERENCE", "POSTER", "SOURCE", "DOWNLOAD"] as const;
export const mediaTypes = ["IMAGE", "VIDEO", "IMAGE_SERIES", "TUTORIAL"] as const;

const stepSchema = z.object({
  title: z.string().trim().min(1).max(160),
  body: z.string().trim().min(1).max(20000),
  mediaAssetId: z.string().trim().min(1).nullable(),
  externalLink: optionalUrl(),
  warning: nullableText(2000),
  tip: nullableText(2000),
});

export const creationSchema = z
  .object({
    id: z.string().trim().min(1).optional(),
    title: z.string().trim().min(2).max(160),
    slug: slugSchema,
    shortDescription: z.string().trim().max(500),
    description: z.string().trim().max(20000),
    mediaType: z.enum(mediaTypes),
    status: z.enum(["DRAFT", "PUBLISHED"]),
    prompt: z.string().max(20000),
    negativePrompt: nullableText(20000),
    aspectRatio: nullableText(32),
    featured: z.boolean(),
    promptOfTheDay: z.boolean(),
    seoTitle: nullableText(180),
    seoDescription: nullableText(320),
    modelName: nullableText(180),
    platformName: nullableText(180),
    seed: nullableText(120),
    guidanceScale: nullableNumber(0, 100),
    stepCount: nullableNumber(1, 500, true),
    resolution: nullableText(64),
    durationSeconds: nullableNumber(0, 36000, true),
    frameRate: nullableText(32),
    cameraMovement: nullableText(255),
    motionInstructions: nullableText(10000),
    characterNotes: nullableText(10000),
    workflowNotes: nullableText(10000),
    limitations: nullableText(10000),
    credits: nullableText(5000),
    subscriptions: nullableText(5000),
    generationSettings: z
      .array(
        z.object({
          label: z.string().trim().min(1).max(80),
          value: z.string().trim().min(1).max(500),
        }),
      )
      .max(40),
    categoryIds: z.array(z.string().trim().min(1)).max(12),
    tagNames: z.array(z.string().trim().min(1).max(40)).max(20),
    toolIds: z
      .array(
        z.object({
          toolId: z.string().trim().min(1),
          modelName: nullableText(180),
        }),
      )
      .max(8),
    media: z
      .array(
        z.object({
          assetId: z.string().trim().min(1),
          role: z.enum(mediaRoles),
          sortOrder: z.number().int().min(0).max(999),
          altText: nullableText(300),
        }),
      )
      .max(40),
    steps: z.array(stepSchema).max(40),
  })
  .superRefine((value, context) => {
    if (value.status !== "PUBLISHED") return;
    if (value.prompt.trim().length < 1) {
      context.addIssue({ code: "custom", path: ["prompt"], message: "Add the generation prompt before publishing." });
    }
    if (value.shortDescription.trim().length < 10) {
      context.addIssue({
        code: "custom",
        path: ["shortDescription"],
        message: "Add a short description of at least 10 characters.",
      });
    }
    if (value.description.trim().length < 10) {
      context.addIssue({ code: "custom", path: ["description"], message: "Add a description before publishing." });
    }
    const cover = value.media.find((item) => item.role === "COVER" || item.role === "MAIN");
    if (!cover) {
      context.addIssue({ code: "custom", path: ["media"], message: "Add cover or main media before publishing." });
    } else if (!cover.altText) {
      context.addIssue({ code: "custom", path: ["media"], message: "Add alt text for the cover media." });
    }
    if (value.categoryIds.length < 1) {
      context.addIssue({ code: "custom", path: ["categoryIds"], message: "Choose a category before publishing." });
    }
  });

export type CreationInput = z.infer<typeof creationSchema>;

export function fieldErrors(error: z.ZodError) {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0] ? String(issue.path[0]) : "form";
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}
