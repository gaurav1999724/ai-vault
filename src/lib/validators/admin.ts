import { z } from "zod";
import { nullableText, optionalUrl, slugSchema } from "@/lib/validators/fields";

export const loginSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(1).max(200),
});

export const categorySchema = z.object({
  id: z.string().trim().min(1).optional(),
  name: z.string().trim().min(2).max(80),
  slug: slugSchema,
  description: nullableText(2000),
  coverAssetId: z.string().trim().min(1).nullable(),
  displayOrder: z.coerce.number().int().min(0).max(9999),
  published: z.boolean(),
});

export const toolSchema = z.object({
  id: z.string().trim().min(1).optional(),
  name: z.string().trim().min(2).max(120),
  slug: slugSchema,
  websiteUrl: optionalUrl(),
  logoAssetId: z.string().trim().min(1).nullable(),
  description: nullableText(4000),
  supportedMediaTypes: z.array(z.enum(["IMAGE", "VIDEO", "IMAGE_SERIES", "TUTORIAL"])).min(1).max(4),
  notes: nullableText(4000),
});

const tutorialStepSchema = z.object({
  title: z.string().trim().min(1).max(160),
  body: z.string().trim().min(1).max(20000),
  mediaAssetId: z.string().trim().min(1).nullable(),
  externalLink: optionalUrl(),
  warning: nullableText(2000),
  tip: nullableText(2000),
});

export const tutorialSchema = z
  .object({
    id: z.string().trim().min(1).optional(),
    title: z.string().trim().min(2).max(160),
    slug: slugSchema,
    coverAssetId: z.string().trim().min(1).nullable(),
    summary: z.string().trim().max(4000),
    difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
    durationMinutes: z.coerce.number().int().min(1).max(600),
    status: z.enum(["DRAFT", "PUBLISHED"]),
    seoTitle: nullableText(180),
    seoDescription: nullableText(320),
    tips: nullableText(8000),
    troubleshooting: nullableText(8000),
    toolIds: z.array(z.string().trim().min(1)).max(8),
    creationIds: z.array(z.string().trim().min(1)).max(12),
    steps: z.array(tutorialStepSchema).max(40),
  })
  .superRefine((value, context) => {
    if (value.status !== "PUBLISHED") return;
    if (value.summary.trim().length < 10) {
      context.addIssue({ code: "custom", path: ["summary"], message: "Add a summary before publishing." });
    }
    if (value.steps.length < 1) {
      context.addIssue({ code: "custom", path: ["steps"], message: "Add at least one step before publishing." });
    }
  });

export const profileSchema = z.object({
  name: z.string().trim().min(2).max(120),
  username: z.string().trim().min(2).max(80),
  profileImageId: z.string().trim().min(1).nullable(),
  heroEyebrow: z.string().trim().min(2).max(255),
  heroHeading: z.string().trim().min(2).max(500),
  heroSubtitle: z.string().trim().min(2).max(1000),
  biography: z.string().trim().min(2).max(8000),
  professionalIntro: z.string().trim().min(2).max(8000),
  philosophy: z.string().trim().min(2).max(8000),
  specialties: z.array(z.string().trim().min(1).max(80)).max(16),
  interests: z.array(z.string().trim().min(1).max(80)).max(16),
  instagramUrl: optionalUrl(),
  youtubeUrl: optionalUrl(),
  githubUrl: optionalUrl(),
  otherSocial: z
    .array(
      z.object({
        label: z.string().trim().min(1).max(40),
        url: z.string().trim().url().max(500),
      }),
    )
    .max(8),
  contactEmail: z.preprocess((value) => {
    if (typeof value !== "string" || !value.trim()) return null;
    return value.trim();
  }, z.string().email().max(255).nullable()),
  collaborationAvailable: z.boolean(),
  seoDescription: nullableText(500),
});

export const settingsSchema = z.object({
  websiteTitle: z.string().trim().min(2).max(160),
  logoAssetId: z.string().trim().min(1).nullable(),
  faviconAssetId: z.string().trim().min(1).nullable(),
  defaultSeoTitle: z.string().trim().min(2).max(180),
  defaultSeoDescription: z.string().trim().min(2).max(500),
  socialImageAssetId: z.string().trim().min(1).nullable(),
  contactEmail: z.preprocess((value) => {
    if (typeof value !== "string" || !value.trim()) return null;
    return value.trim();
  }, z.string().email().max(255).nullable()),
  footerText: z.string().trim().min(2).max(2000),
  featuredSectionVisible: z.boolean(),
  instagramHandle: nullableText(100),
  privacyBody: z.string().trim().min(2).max(20000),
  termsBody: z.string().trim().min(2).max(20000),
  showPromptOfDay: z.boolean(),
  showProcess: z.boolean(),
  showInstagramCta: z.boolean(),
  instagramPreviewIds: z.array(z.string().trim().min(1)).max(6),
});

export type CategoryInput = z.infer<typeof categorySchema>;
export type ToolInput = z.infer<typeof toolSchema>;
export type TutorialInput = z.infer<typeof tutorialSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
