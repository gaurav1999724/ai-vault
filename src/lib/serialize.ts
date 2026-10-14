import type { Prisma } from "@prisma/client";
import { asSettingPairs, asSocialLinks, asStringArray } from "@/lib/utils";
import { placeholderProfile, placeholderSettings } from "@/lib/placeholders";
import type { CardData, CreationDetail, MediaItem, PublicProfile, PublicSettings, TutorialCard, TutorialDetail } from "@/types/content";

const cardInclude = {
  media: { include: { asset: true }, orderBy: { sortOrder: "asc" as const } },
  categories: { include: { category: true } },
  tools: { include: { tool: true } },
} satisfies Prisma.CreationInclude;

export const creationInclude = {
  ...cardInclude,
  tags: { include: { tag: true } },
  workflowSteps: { include: { mediaAsset: true }, orderBy: { order: "asc" as const } },
} satisfies Prisma.CreationInclude;

type CardRecord = Prisma.CreationGetPayload<{ include: typeof cardInclude }>;
type CreationRecord = Prisma.CreationGetPayload<{ include: typeof creationInclude }>;

export function coverFrom(media: CardRecord["media"]) {
  return (
    media.find((item) => item.role === "COVER") ||
    media.find((item) => item.role === "MAIN") ||
    media[0] ||
    null
  );
}

export function toCard(creation: CardRecord): CardData {
  const cover = coverFrom(creation.media);
  const category = creation.categories[0]?.category;
  return {
    id: creation.id,
    title: creation.title,
    slug: creation.slug,
    shortDescription: creation.shortDescription,
    mediaType: creation.mediaType,
    modelName: creation.modelName,
    viewCount: creation.viewCount,
    copyCount: creation.copyCount,
    featured: creation.featured,
    coverUrl: cover?.asset.thumbnailUrl || cover?.asset.publicUrl || null,
    coverAlt: cover?.altText || cover?.asset.altText || creation.title,
    width: cover?.asset.width ?? null,
    height: cover?.asset.height ?? null,
    categoryName: category?.name ?? null,
    categorySlug: category?.slug ?? null,
  };
}

function toMedia(item: CreationRecord["media"][number]): MediaItem {
  return {
    id: item.id,
    role: item.role,
    url: item.asset.publicUrl,
    thumbnailUrl: item.asset.thumbnailUrl,
    alt: item.altText || item.asset.altText || "",
    kind: item.asset.kind,
    width: item.asset.width,
    height: item.asset.height,
    sortOrder: item.sortOrder,
  };
}

export function toCreationDetail(creation: CreationRecord, preview = false): CreationDetail {
  return {
    ...toCard(creation),
    coverUrl: coverFrom(creation.media)?.asset.publicUrl || null,
    description: creation.description,
    prompt: creation.prompt,
    negativePrompt: creation.negativePrompt,
    aspectRatio: creation.aspectRatio,
    promptOfTheDay: creation.promptOfTheDay,
    platformName: creation.platformName,
    seed: creation.seed,
    guidanceScale: creation.guidanceScale,
    stepCount: creation.stepCount,
    resolution: creation.resolution,
    durationSeconds: creation.durationSeconds,
    frameRate: creation.frameRate,
    cameraMovement: creation.cameraMovement,
    motionInstructions: creation.motionInstructions,
    characterNotes: creation.characterNotes,
    workflowNotes: creation.workflowNotes,
    limitations: creation.limitations,
    credits: creation.credits,
    subscriptions: creation.subscriptions,
    generationSettings: asSettingPairs(creation.generationSettings),
    seoTitle: creation.seoTitle,
    seoDescription: creation.seoDescription,
    publishedAt: creation.publishedAt?.toISOString() ?? null,
    tags: creation.tags.map((item) => ({ name: item.tag.name, slug: item.tag.slug })),
    categories: creation.categories.map((item) => ({ name: item.category.name, slug: item.category.slug })),
    tools: creation.tools.map((item) => ({
      name: item.tool.name,
      slug: item.tool.slug,
      websiteUrl: item.tool.websiteUrl,
      modelName: item.modelName,
    })),
    media: creation.media.map(toMedia),
    steps: creation.workflowSteps.map((step) => ({
      order: step.order,
      title: step.title,
      body: step.body,
      imageUrl: step.mediaAsset?.publicUrl ?? null,
      imageAlt: step.mediaAsset?.altText ?? null,
      externalLink: step.externalLink,
      warning: step.warning,
      tip: step.tip,
    })),
    preview,
  };
}

export function toProfile(
  profile: Prisma.CreatorProfileGetPayload<{ include: { profileImage: true } }> | null,
  publishedCount: number,
): PublicProfile {
  if (!profile) {
    return { ...placeholderProfile, portraitUrl: null, portraitAlt: placeholderProfile.name, publishedCount };
  }
  return {
    name: profile.name,
    username: profile.username,
    portraitUrl: profile.profileImage?.publicUrl ?? null,
    portraitAlt: profile.profileImage?.altText || profile.name,
    heroEyebrow: profile.heroEyebrow,
    heroHeading: profile.heroHeading,
    heroSubtitle: profile.heroSubtitle,
    biography: profile.biography,
    professionalIntro: profile.professionalIntro,
    philosophy: profile.philosophy,
    specialties: asStringArray(profile.specialties),
    interests: asStringArray(profile.interests),
    instagramUrl: profile.instagramUrl,
    youtubeUrl: profile.youtubeUrl,
    githubUrl: profile.githubUrl,
    otherSocial: asSocialLinks(profile.otherSocial),
    contactEmail: profile.contactEmail,
    collaborationAvailable: profile.collaborationAvailable,
    seoDescription: profile.seoDescription,
    publishedCount,
  };
}

export function toSettings(
  settings: Prisma.SiteSettingGetPayload<{
    include: { logoAsset: true; faviconAsset: true; socialImage: true };
  }> | null,
  previews: { url: string; alt: string }[],
): PublicSettings {
  if (!settings) {
    return {
      ...placeholderSettings,
      logoUrl: null,
      faviconUrl: null,
      socialImageUrl: null,
      contactEmail: placeholderProfile.contactEmail,
      instagramPreviews: [],
    };
  }
  return {
    websiteTitle: settings.websiteTitle,
    logoUrl: settings.logoAsset?.publicUrl ?? null,
    faviconUrl: settings.faviconAsset?.publicUrl ?? null,
    defaultSeoTitle: settings.defaultSeoTitle,
    defaultSeoDescription: settings.defaultSeoDescription,
    socialImageUrl: settings.socialImage?.publicUrl ?? null,
    contactEmail: settings.contactEmail,
    footerText: settings.footerText,
    featuredSectionVisible: settings.featuredSectionVisible,
    instagramHandle: settings.instagramHandle,
    privacyBody: settings.privacyBody,
    termsBody: settings.termsBody,
    showPromptOfDay: settings.showPromptOfDay,
    showProcess: settings.showProcess,
    showInstagramCta: settings.showInstagramCta,
    instagramPreviews: previews,
  };
}

type TutorialRecord = Prisma.TutorialGetPayload<{
  include: {
    coverAsset: true;
    steps: { include: { mediaAsset: true }; orderBy: { order: "asc" } };
    tools: { include: { tool: true } };
    creations: { include: { creation: { include: typeof cardInclude } } };
  };
}>;

export function toTutorialCard(tutorial: {
  id: string;
  title: string;
  slug: string;
  summary: string;
  difficulty: string;
  durationMinutes: number;
  coverAsset: { publicUrl: string; thumbnailUrl: string | null; altText: string | null } | null;
}): TutorialCard {
  return {
    id: tutorial.id,
    title: tutorial.title,
    slug: tutorial.slug,
    summary: tutorial.summary,
    difficulty: tutorial.difficulty,
    durationMinutes: tutorial.durationMinutes,
    coverUrl: tutorial.coverAsset?.thumbnailUrl || tutorial.coverAsset?.publicUrl || null,
    coverAlt: tutorial.coverAsset?.altText || tutorial.title,
  };
}

export function toTutorialDetail(tutorial: TutorialRecord, preview = false): TutorialDetail {
  return {
    ...toTutorialCard(tutorial),
    coverUrl: tutorial.coverAsset?.publicUrl || null,
    tips: tutorial.tips,
    troubleshooting: tutorial.troubleshooting,
    seoTitle: tutorial.seoTitle,
    seoDescription: tutorial.seoDescription,
    publishedAt: tutorial.publishedAt?.toISOString() ?? null,
    tools: tutorial.tools.map((item) => ({ name: item.tool.name, websiteUrl: item.tool.websiteUrl })),
    steps: tutorial.steps.map((step) => ({
      order: step.order,
      title: step.title,
      body: step.body,
      imageUrl: step.mediaAsset?.publicUrl ?? null,
      imageAlt: step.mediaAsset?.altText ?? null,
      externalLink: step.externalLink,
      warning: step.warning,
      tip: step.tip,
    })),
    creations: tutorial.creations
      .filter((item) => preview || item.creation.status === "PUBLISHED")
      .map((item) => toCard(item.creation)),
    preview,
  };
}

export { cardInclude };
