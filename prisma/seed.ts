import { readFileSync } from "node:fs";
import { PrismaClient, type MediaType } from "@prisma/client";
import sharp from "sharp";
import { putObject } from "../src/lib/storage";
import { placeholderProfile, placeholderSettings } from "../src/lib/placeholders";

function loadEnv() {
  try {
    const text = readFileSync(new URL("../.env", import.meta.url), "utf8");
    for (const line of text.split("\n")) {
      const match = line.match(/^([A-Z0-9_]+)="(.*)"$/);
      if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
    }
  } catch {
    // Prisma may already have loaded the environment.
  }
}

const categories = [
  ["Cinematic AI", "cinematic-ai", "Wide frames, weather, and dramatic light."],
  ["AI Portraits", "ai-portraits", "Faces, identity, and controlled likeness studies."],
  ["AI Photography", "ai-photography", "Lens-like stills and editorial setups."],
  ["AI Video", "ai-video", "Motion studies and shot design."],
  ["3D Art", "3d-art", "Sculptural and rendered experiments."],
  ["Anime", "anime", "Stylized character and world studies."],
  ["Fantasy Worlds", "fantasy-worlds", "Places that do not exist, built carefully."],
  ["Product Visualization", "product-visualization", "Objects, materials, and campaign stills."],
  ["AI Advertising", "ai-advertising", "Concepts for campaigns and key art."],
  ["Experimental Art", "experimental-art", "Process-first visual research."],
];

const tools: { name: string; slug: string; websiteUrl: string | null; supportedMediaTypes: string[] }[] = [
  { name: "Midjourney", slug: "midjourney", websiteUrl: "https://www.midjourney.com", supportedMediaTypes: ["IMAGE"] },
  { name: "Flux", slug: "flux", websiteUrl: "https://blackforestlabs.ai", supportedMediaTypes: ["IMAGE"] },
  { name: "Runway", slug: "runway", websiteUrl: "https://runwayml.com", supportedMediaTypes: ["VIDEO", "IMAGE"] },
  { name: "Kling", slug: "kling", websiteUrl: "https://klingai.com", supportedMediaTypes: ["VIDEO"] },
  { name: "Veo", slug: "veo", websiteUrl: null, supportedMediaTypes: ["VIDEO"] },
];

const rooftopPrompt = `A mysterious futuristic warrior standing on a rain-soaked rooftop overlooking a massive cyberpunk city at midnight, cinematic wide-angle composition, atmospheric fog, reflective neon lights, intricate futuristic armor, dramatic rim lighting, realistic wet surfaces, volumetric lighting, detailed environment, deep cinematic shadows, filmic color grading, ultra-detailed environment, professional science-fiction concept art, carefully composed foreground and background.`;

function artwork(title: string, accent: string, secondary: string) {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="2000">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#08090D"/>
        <stop offset="0.55" stop-color="${accent}"/>
        <stop offset="1" stop-color="#101218"/>
      </linearGradient>
    </defs>
    <rect width="1600" height="2000" fill="url(#g)"/>
    <circle cx="1200" cy="420" r="260" fill="${secondary}" opacity="0.35"/>
    <circle cx="360" cy="1500" r="340" fill="#5DE4FF" opacity="0.12"/>
    <rect x="140" y="920" width="980" height="6" fill="#F4F4F5" opacity="0.45"/>
    <text x="140" y="1800" fill="#F4F4F5" font-size="54" font-family="Georgia, serif">${title}</text>
  </svg>`);
}

async function imageAsset(prisma: PrismaClient, key: string, title: string, accent: string, secondary: string) {
  const existing = await prisma.mediaAsset.findUnique({ where: { storageKey: key } });
  if (existing) return existing;
  const source = await sharp(artwork(title, accent, secondary)).png().toBuffer();
  const thumb = await sharp(source).resize({ width: 960 }).webp({ quality: 76 }).toBuffer();
  const publicUrl = await putObject(key, source, "image/png");
  const thumbnailKey = key.replace("images/", "thumbs/").replace(".png", ".webp");
  const thumbnailUrl = await putObject(thumbnailKey, thumb, "image/webp");
  const meta = await sharp(source).metadata();
  return prisma.mediaAsset.create({
    data: {
      storageKey: key,
      publicUrl,
      thumbnailKey,
      thumbnailUrl,
      mimeType: "image/png",
      kind: "IMAGE",
      width: meta.width,
      height: meta.height,
      sizeBytes: source.length,
      altText: `${title}. Demonstration artwork.`,
      originalFilename: `${key.split("/").pop()}`,
    },
  });
}

async function main() {
  loadEnv();
  const prisma = new PrismaClient();
  const categoryIds = new Map<string, string>();
  for (const [index, [name, slug, description]] of categories.entries()) {
    const category = await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name, slug, description, displayOrder: index, published: true },
    });
    categoryIds.set(slug, category.id);
  }
  const toolIds = new Map<string, string>();
  for (const toolInput of tools) {
    const { name, slug, websiteUrl, supportedMediaTypes } = toolInput;
    const tool = await prisma.aiTool.upsert({
      where: { slug },
      update: {},
      create: { name, slug, websiteUrl, supportedMediaTypes, description: "Demonstration catalog entry. Not a live integration." },
    });
    toolIds.set(slug, tool.id);
  }
  if (!(await prisma.creatorProfile.findUnique({ where: { id: "default" } }))) {
    await prisma.creatorProfile.create({
      data: {
        id: "default",
        ...placeholderProfile,
        specialties: placeholderProfile.specialties,
        interests: placeholderProfile.interests,
        otherSocial: [],
      },
    });
  }
  if (!(await prisma.siteSetting.findUnique({ where: { id: "default" } }))) {
    await prisma.siteSetting.create({
      data: {
        id: "default",
        ...placeholderSettings,
        contactEmail: placeholderProfile.contactEmail,
        instagramPreviewIds: [],
      },
    });
  }

  const demos: {
    slug: string;
    title: string;
    mediaType: MediaType;
    category: string;
    tool: string;
    prompt: string;
    negativePrompt?: string;
    featured?: boolean;
    promptOfTheDay?: boolean;
    modelName: string;
    platformName: string;
    aspectRatio: string;
    colors: [string, string];
    extra?: { durationSeconds?: number; cameraMovement?: string; frameRate?: string };
  }[] = [
    {
      slug: "demo-rooftop-warrior",
      title: "Rooftop at Midnight",
      mediaType: "IMAGE",
      category: "cinematic-ai",
      tool: "midjourney",
      prompt: rooftopPrompt,
      negativePrompt: "blurry armor, extra limbs, watermark, flat lighting, daylight, low detail",
      featured: true,
      promptOfTheDay: true,
      modelName: "v6",
      platformName: "Midjourney",
      aspectRatio: "21:9",
      colors: ["#241433", "#8B5CF6"],
    },
    {
      slug: "demo-porcelain-portrait",
      title: "Porcelain Study",
      mediaType: "IMAGE",
      category: "ai-portraits",
      tool: "flux",
      prompt: "Demonstration prompt: a quiet three-quarter portrait in cool window light, porcelain skin texture, restrained wardrobe, shallow depth, editorial crop.",
      featured: true,
      modelName: "Flux",
      platformName: "Flux",
      aspectRatio: "4:5",
      colors: ["#1b2430", "#5DE4FF"],
    },
    {
      slug: "demo-glass-object",
      title: "Glass Object",
      mediaType: "IMAGE",
      category: "product-visualization",
      tool: "midjourney",
      prompt: "Demonstration prompt: a single glass object on a dark stone plinth, controlled highlight, no logo, campaign still.",
      featured: true,
      modelName: "v6",
      platformName: "Midjourney",
      aspectRatio: "1:1",
      colors: ["#201610", "#FF8B6A"],
    },
    {
      slug: "demo-rain-transit",
      title: "Rain Transit",
      mediaType: "VIDEO",
      category: "ai-video",
      tool: "runway",
      prompt: "Demonstration prompt: a slow lateral move across a rain-soaked platform, cyan practicals, no faces close to camera, 5 second shot.",
      modelName: "Gen-3",
      platformName: "Runway",
      aspectRatio: "16:9",
      colors: ["#101820", "#5DE4FF"],
      extra: { durationSeconds: 5, cameraMovement: "Slow lateral dolly", frameRate: "24 fps" },
    },
    {
      slug: "demo-floating-shrine",
      title: "Floating Shrine",
      mediaType: "IMAGE",
      category: "fantasy-worlds",
      tool: "flux",
      prompt: "Demonstration prompt: a small shrine suspended over still water, warm lantern, cool mist, no readable text.",
      featured: true,
      modelName: "Flux",
      platformName: "Flux",
      aspectRatio: "3:2",
      colors: ["#142018", "#8B5CF6"],
    },
    {
      slug: "demo-signal-series",
      title: "Signal Series",
      mediaType: "IMAGE_SERIES",
      category: "experimental-art",
      tool: "flux",
      prompt: "Demonstration prompt: three variations of an abstract signal breaking across a dark field, consistent palette, no characters.",
      modelName: "Flux",
      platformName: "Flux",
      aspectRatio: "4:5",
      colors: ["#18141f", "#FF8B6A"],
    },
  ];

  for (const demo of demos) {
    if (await prisma.creation.findUnique({ where: { slug: demo.slug } })) continue;
    const asset = await imageAsset(prisma, `images/${demo.slug}.png`, demo.title, demo.colors[0], demo.colors[1]);
    await prisma.creation.create({
      data: {
        title: demo.title,
        slug: demo.slug,
        shortDescription: "Demonstration seed content for local development.",
        description: "This record is demonstration content so the archive has something to browse. Replace it with a real creation.",
        mediaType: demo.mediaType,
        status: "PUBLISHED",
        prompt: demo.prompt,
        negativePrompt: demo.negativePrompt,
        featured: Boolean(demo.featured),
        promptOfTheDay: Boolean(demo.promptOfTheDay),
        modelName: demo.modelName,
        platformName: demo.platformName,
        aspectRatio: demo.aspectRatio,
        guidanceScale: 5,
        stepCount: demo.mediaType === "VIDEO" ? null : 30,
        seed: "demo-1001",
        publishedAt: new Date(),
        credits: "Demonstration content generated for local development. Not a published artist work.",
        durationSeconds: demo.extra?.durationSeconds,
        cameraMovement: demo.extra?.cameraMovement,
        frameRate: demo.extra?.frameRate,
        generationSettings: [{ label: "Sampler", value: "demonstration" }],
        categories: { create: [{ categoryId: categoryIds.get(demo.category)! }] },
        tools: { create: [{ toolId: toolIds.get(demo.tool)!, modelName: demo.modelName }] },
        media: { create: [{ assetId: asset.id, role: "COVER", sortOrder: 0, altText: `${demo.title}. Demonstration artwork.` }] },
        workflowSteps: {
          create: [
            { order: 1, title: "Open the recommended AI platform", body: "Use the catalog link as a reference. The site does not sign you in." },
            { order: 2, title: "Select the specified model", body: `Choose ${demo.modelName}.` },
            { order: 3, title: "Paste the prompt", body: "Copy the prompt exactly. Do not rewrite it before the first generation." },
            { order: 4, title: "Set the aspect ratio", body: `Start with ${demo.aspectRatio}.` },
            { order: 5, title: "Generate and review", body: "Keep the first result, then refine only the detail that failed." },
          ],
        },
        tags: {
          create: [
            { tag: { connectOrCreate: { where: { slug: "demonstration" }, create: { name: "Demonstration", slug: "demonstration" } } } },
          ],
        },
      },
    });
  }

  const rooftop = await prisma.creation.findUnique({ where: { slug: "demo-rooftop-warrior" } });
  if (rooftop && !(await prisma.tutorial.findUnique({ where: { slug: "demo-cinematic-rooftop" } }))) {
    const cover = await prisma.mediaAsset.findUnique({ where: { storageKey: "images/demo-rooftop-warrior.png" } });
    await prisma.tutorial.create({
      data: {
        title: "Building a cinematic rooftop",
        slug: "demo-cinematic-rooftop",
        summary: "Demonstration tutorial that walks through one seeded image workflow.",
        difficulty: "BEGINNER",
        durationMinutes: 20,
        status: "PUBLISHED",
        publishedAt: new Date(),
        coverAssetId: cover?.id,
        tips: "Keep the armor description specific before you add more weather.",
        troubleshooting: "If the city flattens, add a foreground edge and a distant skyline separately.",
        steps: {
          create: [
            { order: 1, title: "Open the platform", body: "This is a catalog reference, not a connected account." },
            { order: 2, title: "Paste the rooftop prompt", body: "Use the copy button on the creation page so the wording stays exact." },
            { order: 3, title: "Review the first frame", body: "Look at wet surfaces and rim light before changing the subject." },
          ],
        },
        tools: { create: [{ toolId: toolIds.get("midjourney")! }] },
        creations: { create: [{ creationId: rooftop.id }] },
      },
    });
  }
  await prisma.$disconnect();
  console.log("Demonstration seed complete.");
}

main().catch(async (error) => {
  console.error(error);
  process.exit(1);
});
