export type MediaTypeName = "IMAGE" | "VIDEO" | "IMAGE_SERIES" | "TUTORIAL";

export type CardData = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  mediaType: MediaTypeName;
  modelName: string | null;
  viewCount: number;
  copyCount: number;
  featured: boolean;
  coverUrl: string | null;
  coverAlt: string;
  width: number | null;
  height: number | null;
  categoryName: string | null;
  categorySlug: string | null;
};

export type MediaItem = {
  id: string;
  role: string;
  url: string;
  thumbnailUrl: string | null;
  alt: string;
  kind: "IMAGE" | "VIDEO";
  width: number | null;
  height: number | null;
  sortOrder: number;
};

export type WorkflowStep = {
  order: number;
  title: string;
  body: string;
  imageUrl: string | null;
  imageAlt: string | null;
  externalLink: string | null;
  warning: string | null;
  tip: string | null;
};

export type CreationDetail = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  mediaType: MediaTypeName;
  coverUrl: string | null;
  coverAlt: string;
  width: number | null;
  height: number | null;
  categoryName: string | null;
  categorySlug: string | null;
  prompt: string;
  negativePrompt: string | null;
  aspectRatio: string | null;
  featured: boolean;
  promptOfTheDay: boolean;
  modelName: string | null;
  platformName: string | null;
  seed: string | null;
  guidanceScale: number | null;
  stepCount: number | null;
  resolution: string | null;
  durationSeconds: number | null;
  frameRate: string | null;
  cameraMovement: string | null;
  motionInstructions: string | null;
  characterNotes: string | null;
  workflowNotes: string | null;
  limitations: string | null;
  credits: string | null;
  subscriptions: string | null;
  generationSettings: { label: string; value: string }[];
  seoTitle: string | null;
  seoDescription: string | null;
  publishedAt: string | null;
  viewCount: number;
  copyCount: number;
  tags: { name: string; slug: string }[];
  categories: { name: string; slug: string }[];
  tools: { name: string; slug: string; websiteUrl: string | null; modelName: string | null }[];
  media: MediaItem[];
  steps: WorkflowStep[];
  preview: boolean;
};

export type PublicProfile = {
  name: string;
  username: string;
  portraitUrl: string | null;
  portraitAlt: string;
  heroEyebrow: string;
  heroHeading: string;
  heroSubtitle: string;
  biography: string;
  professionalIntro: string;
  philosophy: string;
  specialties: string[];
  interests: string[];
  instagramUrl: string | null;
  youtubeUrl: string | null;
  githubUrl: string | null;
  otherSocial: { label: string; url: string }[];
  contactEmail: string | null;
  collaborationAvailable: boolean;
  seoDescription: string | null;
  publishedCount: number;
};

export type PublicSettings = {
  websiteTitle: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  defaultSeoTitle: string;
  defaultSeoDescription: string;
  socialImageUrl: string | null;
  contactEmail: string | null;
  footerText: string;
  featuredSectionVisible: boolean;
  instagramHandle: string | null;
  privacyBody: string;
  termsBody: string;
  showPromptOfDay: boolean;
  showProcess: boolean;
  showInstagramCta: boolean;
  instagramPreviews: { url: string; alt: string }[];
};

export type CategoryTile = {
  name: string;
  slug: string;
  description: string | null;
  coverUrl: string | null;
  coverAlt: string;
  count: number;
};

export type TutorialCard = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  difficulty: string;
  durationMinutes: number;
  coverUrl: string | null;
  coverAlt: string;
};

export type TutorialDetail = TutorialCard & {
  tips: string | null;
  troubleshooting: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  publishedAt: string | null;
  tools: { name: string; websiteUrl: string | null }[];
  steps: WorkflowStep[];
  creations: CardData[];
  preview: boolean;
};

export type ActionResult = {
  ok: boolean;
  message?: string;
  id?: string;
  slug?: string;
  fieldErrors?: Record<string, string>;
};

export type AssetOption = {
  id: string;
  publicUrl: string;
  thumbnailUrl: string | null;
  kind: "IMAGE" | "VIDEO";
  originalFilename: string;
  altText: string | null;
  width: number | null;
  height: number | null;
};
