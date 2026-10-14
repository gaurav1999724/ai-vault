import "server-only";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { asSettingPairs, asSocialLinks, asStringArray } from "@/lib/utils";
import { creationInclude } from "@/lib/serialize";
import type { CreationInput } from "@/lib/validators/creation";
import type { ProfileInput, SettingsInput, TutorialInput } from "@/lib/validators/admin";

export async function getOverview() {
  await requireAdmin();
  const [published, drafts, views, copies, popular, recentCreations, recentEvents, tutorials] = await Promise.all([
    prisma.creation.count({ where: { status: "PUBLISHED" } }),
    prisma.creation.count({ where: { status: "DRAFT" } }),
    prisma.creation.aggregate({ _sum: { viewCount: true } }),
    prisma.creation.aggregate({ _sum: { copyCount: true } }),
    prisma.creation.findFirst({
      where: { status: "PUBLISHED", viewCount: { gt: 0 } },
      orderBy: { viewCount: "desc" },
      select: { title: true, slug: true, viewCount: true },
    }),
    prisma.creation.findMany({
      orderBy: { updatedAt: "desc" },
      take: 6,
      select: { id: true, title: true, status: true, updatedAt: true, slug: true },
    }),
    prisma.analyticsEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { creation: { select: { title: true } }, tutorial: { select: { title: true } } },
    }),
    prisma.tutorial.count(),
  ]);
  return {
    published,
    drafts,
    tutorials,
    views: views._sum.viewCount ?? 0,
    copies: copies._sum.copyCount ?? 0,
    popular,
    recentCreations,
    recentEvents,
  };
}

export async function listAdminCreations(query: string) {
  await requireAdmin();
  return prisma.creation.findMany({
    where: query
      ? { OR: [{ title: { contains: query } }, { slug: { contains: query } }] }
      : undefined,
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      mediaType: true,
      featured: true,
      promptOfTheDay: true,
      viewCount: true,
      copyCount: true,
      updatedAt: true,
    },
  });
}

export async function getEditorOptions() {
  await requireAdmin();
  const [categories, tools, assets] = await Promise.all([
    prisma.category.findMany({ orderBy: { displayOrder: "asc" }, select: { id: true, name: true } }),
    prisma.aiTool.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, websiteUrl: true } }),
    prisma.mediaAsset.findMany({
      orderBy: { createdAt: "desc" },
      take: 80,
      select: {
        id: true,
        publicUrl: true,
        thumbnailUrl: true,
        kind: true,
        originalFilename: true,
        altText: true,
        width: true,
        height: true,
      },
    }),
  ]);
  return { categories, tools, assets };
}

export async function getCreationForm(id: string): Promise<CreationInput | null> {
  await requireAdmin();
  const creation = await prisma.creation.findUnique({ where: { id }, include: creationInclude });
  if (!creation) return null;
  return {
    id: creation.id,
    title: creation.title,
    slug: creation.slug,
    shortDescription: creation.shortDescription,
    description: creation.description,
    mediaType: creation.mediaType,
    status: creation.status,
    prompt: creation.prompt,
    negativePrompt: creation.negativePrompt,
    aspectRatio: creation.aspectRatio,
    featured: creation.featured,
    promptOfTheDay: creation.promptOfTheDay,
    seoTitle: creation.seoTitle,
    seoDescription: creation.seoDescription,
    modelName: creation.modelName,
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
    categoryIds: creation.categories.map((item) => item.categoryId),
    tagNames: creation.tags.map((item) => item.tag.name),
    toolIds: creation.tools.map((item) => ({ toolId: item.toolId, modelName: item.modelName })),
    media: creation.media.map((item) => ({
      assetId: item.assetId,
      role: item.role,
      sortOrder: item.sortOrder,
      altText: item.altText,
    })),
    steps: creation.workflowSteps.map((step) => ({
      title: step.title,
      body: step.body,
      mediaAssetId: step.mediaAssetId,
      externalLink: step.externalLink,
      warning: step.warning,
      tip: step.tip,
    })),
  };
}

export async function listCategories() {
  await requireAdmin();
  return prisma.category.findMany({
    orderBy: { displayOrder: "asc" },
    include: { coverAsset: true, _count: { select: { creations: true } } },
  });
}

export async function listTools() {
  await requireAdmin();
  return prisma.aiTool.findMany({ orderBy: { name: "asc" }, include: { logoAsset: true, _count: { select: { creations: true } } } });
}

export async function listTutorials() {
  await requireAdmin();
  return prisma.tutorial.findMany({
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, slug: true, status: true, difficulty: true, updatedAt: true },
  });
}

export async function getTutorialForm(id: string): Promise<TutorialInput | null> {
  await requireAdmin();
  const tutorial = await prisma.tutorial.findUnique({
    where: { id },
    include: { steps: { orderBy: { order: "asc" } }, tools: true, creations: true },
  });
  if (!tutorial) return null;
  return {
    id: tutorial.id,
    title: tutorial.title,
    slug: tutorial.slug,
    coverAssetId: tutorial.coverAssetId,
    summary: tutorial.summary,
    difficulty: tutorial.difficulty,
    durationMinutes: tutorial.durationMinutes,
    status: tutorial.status,
    seoTitle: tutorial.seoTitle,
    seoDescription: tutorial.seoDescription,
    tips: tutorial.tips,
    troubleshooting: tutorial.troubleshooting,
    toolIds: tutorial.tools.map((item) => item.toolId),
    creationIds: tutorial.creations.map((item) => item.creationId),
    steps: tutorial.steps.map((step) => ({
      title: step.title,
      body: step.body,
      mediaAssetId: step.mediaAssetId,
      externalLink: step.externalLink,
      warning: step.warning,
      tip: step.tip,
    })),
  };
}

export async function listCreationChoices() {
  await requireAdmin();
  return prisma.creation.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true, status: true } });
}

export async function getProfileForm(): Promise<ProfileInput> {
  await requireAdmin();
  const profile = await prisma.creatorProfile.findUnique({ where: { id: "default" } });
  if (!profile) {
    return {
      name: "Your Name",
      username: "yourstudio",
      profileImageId: null,
      heroEyebrow: "AI ART • PROMPT ENGINEERING • VISUAL STORYTELLING",
      heroHeading: "Imagine It.\nPrompt It.\nCreate It.",
      heroSubtitle: "Explore the prompts, tools, and creative workflows behind extraordinary AI-generated visuals.",
      biography: "Replace this biography.",
      professionalIntro: "Replace this introduction.",
      philosophy: "Replace this philosophy.",
      specialties: [],
      interests: [],
      instagramUrl: null,
      youtubeUrl: null,
      githubUrl: null,
      otherSocial: [],
      contactEmail: null,
      collaborationAvailable: false,
      seoDescription: null,
    };
  }
  return {
    name: profile.name,
    username: profile.username,
    profileImageId: profile.profileImageId,
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
  };
}

export async function getSettingsForm(): Promise<SettingsInput> {
  await requireAdmin();
  const settings = await prisma.siteSetting.findUnique({ where: { id: "default" } });
  if (!settings) {
    return {
      websiteTitle: "AI Creative Vault",
      logoAssetId: null,
      faviconAssetId: null,
      defaultSeoTitle: "AI Creative Vault",
      defaultSeoDescription: "Explore prompts, tools, and creative workflows.",
      socialImageAssetId: null,
      contactEmail: null,
      footerText: "A studio archive of AI images, video experiments, and the workflows behind them.",
      featuredSectionVisible: true,
      instagramHandle: null,
      privacyBody: "Replace this privacy policy.",
      termsBody: "Replace these terms.",
      showPromptOfDay: true,
      showProcess: true,
      showInstagramCta: true,
      instagramPreviewIds: [],
    };
  }
  return {
    websiteTitle: settings.websiteTitle,
    logoAssetId: settings.logoAssetId,
    faviconAssetId: settings.faviconAssetId,
    defaultSeoTitle: settings.defaultSeoTitle,
    defaultSeoDescription: settings.defaultSeoDescription,
    socialImageAssetId: settings.socialImageAssetId,
    contactEmail: settings.contactEmail,
    footerText: settings.footerText,
    featuredSectionVisible: settings.featuredSectionVisible,
    instagramHandle: settings.instagramHandle,
    privacyBody: settings.privacyBody,
    termsBody: settings.termsBody,
    showPromptOfDay: settings.showPromptOfDay,
    showProcess: settings.showProcess,
    showInstagramCta: settings.showInstagramCta,
    instagramPreviewIds: asStringArray(settings.instagramPreviewIds),
  };
}

export async function listMessages() {
  await requireAdmin();
  return prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
}

export async function listMedia(query: string) {
  await requireAdmin();
  return prisma.mediaAsset.findMany({
    where: query ? { originalFilename: { contains: query } } : undefined,
    orderBy: { createdAt: "desc" },
    take: 80,
  });
}

export async function getAnalyticsDashboard() {
  await requireAdmin();
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - 29);
  since.setUTCHours(0, 0, 0, 0);
  const [events, creations, links, tools] = await Promise.all([
    prisma.analyticsEvent.findMany({
      where: { createdAt: { gte: since } },
      select: { type: true, createdAt: true },
    }),
    prisma.creation.findMany({
      where: { status: "PUBLISHED" },
      select: {
        title: true,
        slug: true,
        viewCount: true,
        copyCount: true,
        categories: { select: { category: { select: { name: true } } } },
      },
      orderBy: { viewCount: "desc" },
    }),
    prisma.creationCategory.findMany({
      where: { creation: { status: "PUBLISHED" } },
      select: { category: { select: { name: true } }, creation: { select: { viewCount: true } } },
    }),
    prisma.aiTool.findMany({
      select: { name: true, _count: { select: { creations: true } } },
      orderBy: { creations: { _count: "desc" } },
    }),
  ]);
  const days = Array.from({ length: 30 }, (_, index) => {
    const date = new Date(since);
    date.setUTCDate(since.getUTCDate() + index);
    return { day: date.toISOString().slice(5, 10), views: 0, copies: 0 };
  });
  const index = new Map(days.map((day, position) => [day.day, position]));
  for (const event of events) {
    const key = event.createdAt.toISOString().slice(5, 10);
    const slot = index.get(key);
    if (slot == null) continue;
    if (event.type === "CREATION_VIEW") days[slot].views += 1;
    if (event.type === "PROMPT_COPY") days[slot].copies += 1;
  }
  const categoryMap = new Map<string, number>();
  for (const link of links) {
    categoryMap.set(link.category.name, (categoryMap.get(link.category.name) ?? 0) + link.creation.viewCount);
  }
  const totalViews = creations.reduce((sum, creation) => sum + creation.viewCount, 0);
  const totalCopies = creations.reduce((sum, creation) => sum + creation.copyCount, 0);
  return {
    hasEvents: events.length > 0,
    days,
    viewed: creations.filter((creation) => creation.viewCount > 0).slice(0, 6),
    copied: [...creations].filter((creation) => creation.copyCount > 0).sort((a, b) => b.copyCount - a.copyCount).slice(0, 6),
    categories: [...categoryMap.entries()].map(([name, views]) => ({ name, views })).sort((a, b) => b.views - a.views).slice(0, 8),
    tools: tools.filter((tool) => tool._count.creations > 0).map((tool) => ({ name: tool.name, count: tool._count.creations })),
    ratio: totalViews > 0 ? totalCopies / totalViews : null,
    recent: await prisma.analyticsEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 12,
      include: { creation: { select: { title: true } }, tutorial: { select: { title: true } } },
    }),
  };
}
