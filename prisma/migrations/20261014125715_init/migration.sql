-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO', 'IMAGE_SERIES', 'TUTORIAL');

-- CreateEnum
CREATE TYPE "CreationStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "MediaKind" AS ENUM ('IMAGE', 'VIDEO');

-- CreateEnum
CREATE TYPE "MediaRole" AS ENUM ('COVER', 'MAIN', 'GALLERY', 'REFERENCE', 'POSTER', 'SOURCE', 'DOWNLOAD');

-- CreateEnum
CREATE TYPE "AnalyticsEventType" AS ENUM ('CREATION_VIEW', 'PROMPT_COPY', 'TUTORIAL_VIEW', 'FAVORITE', 'OUTBOUND_TOOL_CLICK');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" VARCHAR(128) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthAttempt" (
    "id" TEXT NOT NULL,
    "keyHash" VARCHAR(128) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatorProfile" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "name" VARCHAR(120) NOT NULL,
    "username" VARCHAR(80) NOT NULL,
    "profileImageId" TEXT,
    "heroEyebrow" VARCHAR(255) NOT NULL,
    "heroHeading" TEXT NOT NULL,
    "heroSubtitle" TEXT NOT NULL,
    "biography" TEXT NOT NULL,
    "professionalIntro" TEXT NOT NULL,
    "philosophy" TEXT NOT NULL,
    "specialties" JSONB NOT NULL,
    "interests" JSONB NOT NULL,
    "instagramUrl" VARCHAR(500),
    "youtubeUrl" VARCHAR(500),
    "githubUrl" VARCHAR(500),
    "otherSocial" JSONB NOT NULL,
    "contactEmail" VARCHAR(255),
    "collaborationAvailable" BOOLEAN NOT NULL DEFAULT false,
    "seoDescription" VARCHAR(500),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreatorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSetting" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "websiteTitle" VARCHAR(160) NOT NULL,
    "logoAssetId" TEXT,
    "faviconAssetId" TEXT,
    "defaultSeoTitle" VARCHAR(180) NOT NULL,
    "defaultSeoDescription" VARCHAR(500) NOT NULL,
    "socialImageAssetId" TEXT,
    "contactEmail" VARCHAR(255),
    "footerText" TEXT NOT NULL,
    "featuredSectionVisible" BOOLEAN NOT NULL DEFAULT true,
    "instagramHandle" VARCHAR(100),
    "privacyBody" TEXT NOT NULL,
    "termsBody" TEXT NOT NULL,
    "showPromptOfDay" BOOLEAN NOT NULL DEFAULT true,
    "showProcess" BOOLEAN NOT NULL DEFAULT true,
    "showInstagramCta" BOOLEAN NOT NULL DEFAULT true,
    "instagramPreviewIds" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "description" TEXT,
    "coverAssetId" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(40) NOT NULL,
    "slug" VARCHAR(80) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiTool" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "slug" VARCHAR(140) NOT NULL,
    "websiteUrl" VARCHAR(500),
    "logoAssetId" TEXT,
    "description" TEXT,
    "supportedMediaTypes" JSONB NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiTool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Creation" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "slug" VARCHAR(180) NOT NULL,
    "shortDescription" VARCHAR(500) NOT NULL,
    "description" TEXT NOT NULL,
    "mediaType" "MediaType" NOT NULL,
    "status" "CreationStatus" NOT NULL DEFAULT 'DRAFT',
    "prompt" TEXT NOT NULL,
    "negativePrompt" TEXT,
    "generationSettings" JSONB,
    "aspectRatio" VARCHAR(32),
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "promptOfTheDay" BOOLEAN NOT NULL DEFAULT false,
    "seoTitle" VARCHAR(180),
    "seoDescription" VARCHAR(320),
    "publishedAt" TIMESTAMP(3),
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "copyCount" INTEGER NOT NULL DEFAULT 0,
    "modelName" VARCHAR(180),
    "platformName" VARCHAR(180),
    "seed" VARCHAR(120),
    "guidanceScale" DOUBLE PRECISION,
    "stepCount" INTEGER,
    "resolution" VARCHAR(64),
    "durationSeconds" INTEGER,
    "frameRate" VARCHAR(32),
    "cameraMovement" VARCHAR(255),
    "motionInstructions" TEXT,
    "characterNotes" TEXT,
    "workflowNotes" TEXT,
    "limitations" TEXT,
    "credits" TEXT,
    "subscriptions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Creation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreationMedia" (
    "id" TEXT NOT NULL,
    "creationId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "role" "MediaRole" NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "altText" VARCHAR(300),

    CONSTRAINT "CreationMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreationStep" (
    "id" TEXT NOT NULL,
    "creationId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "body" TEXT NOT NULL,
    "mediaAssetId" TEXT,
    "externalLink" VARCHAR(500),
    "warning" TEXT,
    "tip" TEXT,

    CONSTRAINT "CreationStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreationCategory" (
    "creationId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "CreationCategory_pkey" PRIMARY KEY ("creationId","categoryId")
);

-- CreateTable
CREATE TABLE "CreationTag" (
    "creationId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "CreationTag_pkey" PRIMARY KEY ("creationId","tagId")
);

-- CreateTable
CREATE TABLE "CreationAITool" (
    "creationId" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "modelName" VARCHAR(180),

    CONSTRAINT "CreationAITool_pkey" PRIMARY KEY ("creationId","toolId")
);

-- CreateTable
CREATE TABLE "Tutorial" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "slug" VARCHAR(180) NOT NULL,
    "coverAssetId" TEXT,
    "summary" TEXT NOT NULL,
    "difficulty" "Difficulty" NOT NULL DEFAULT 'BEGINNER',
    "durationMinutes" INTEGER NOT NULL DEFAULT 15,
    "status" "CreationStatus" NOT NULL DEFAULT 'DRAFT',
    "seoTitle" VARCHAR(180),
    "seoDescription" VARCHAR(320),
    "tips" TEXT,
    "troubleshooting" TEXT,
    "publishedAt" TIMESTAMP(3),
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tutorial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TutorialStep" (
    "id" TEXT NOT NULL,
    "tutorialId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "body" TEXT NOT NULL,
    "mediaAssetId" TEXT,
    "externalLink" VARCHAR(500),
    "warning" TEXT,
    "tip" TEXT,

    CONSTRAINT "TutorialStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TutorialTool" (
    "tutorialId" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,

    CONSTRAINT "TutorialTool_pkey" PRIMARY KEY ("tutorialId","toolId")
);

-- CreateTable
CREATE TABLE "TutorialCreation" (
    "tutorialId" TEXT NOT NULL,
    "creationId" TEXT NOT NULL,

    CONSTRAINT "TutorialCreation_pkey" PRIMARY KEY ("tutorialId","creationId")
);

-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL,
    "storageKey" VARCHAR(400) NOT NULL,
    "publicUrl" VARCHAR(800) NOT NULL,
    "thumbnailKey" VARCHAR(400),
    "thumbnailUrl" VARCHAR(800),
    "mimeType" VARCHAR(120) NOT NULL,
    "kind" "MediaKind" NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "durationSeconds" DOUBLE PRECISION,
    "sizeBytes" INTEGER NOT NULL,
    "altText" VARCHAR(300),
    "originalFilename" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "type" "AnalyticsEventType" NOT NULL,
    "creationId" TEXT,
    "tutorialId" TEXT,
    "dedupeKey" VARCHAR(128),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "email" VARCHAR(180) NOT NULL,
    "subject" VARCHAR(140) NOT NULL,
    "message" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AdminSession_tokenHash_key" ON "AdminSession"("tokenHash");

-- CreateIndex
CREATE INDEX "AdminSession_userId_idx" ON "AdminSession"("userId");

-- CreateIndex
CREATE INDEX "AdminSession_expiresAt_idx" ON "AdminSession"("expiresAt");

-- CreateIndex
CREATE INDEX "AuthAttempt_keyHash_createdAt_idx" ON "AuthAttempt"("keyHash", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_published_displayOrder_idx" ON "Category"("published", "displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_slug_key" ON "Tag"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "AiTool_slug_key" ON "AiTool"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Creation_slug_key" ON "Creation"("slug");

-- CreateIndex
CREATE INDEX "Creation_status_publishedAt_idx" ON "Creation"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "Creation_featured_status_idx" ON "Creation"("featured", "status");

-- CreateIndex
CREATE INDEX "Creation_promptOfTheDay_status_idx" ON "Creation"("promptOfTheDay", "status");

-- CreateIndex
CREATE INDEX "Creation_mediaType_status_idx" ON "Creation"("mediaType", "status");

-- CreateIndex
CREATE INDEX "CreationMedia_creationId_sortOrder_idx" ON "CreationMedia"("creationId", "sortOrder");

-- CreateIndex
CREATE INDEX "CreationMedia_assetId_idx" ON "CreationMedia"("assetId");

-- CreateIndex
CREATE INDEX "CreationStep_creationId_order_idx" ON "CreationStep"("creationId", "order");

-- CreateIndex
CREATE INDEX "CreationCategory_categoryId_idx" ON "CreationCategory"("categoryId");

-- CreateIndex
CREATE INDEX "CreationTag_tagId_idx" ON "CreationTag"("tagId");

-- CreateIndex
CREATE INDEX "CreationAITool_toolId_idx" ON "CreationAITool"("toolId");

-- CreateIndex
CREATE UNIQUE INDEX "Tutorial_slug_key" ON "Tutorial"("slug");

-- CreateIndex
CREATE INDEX "Tutorial_status_publishedAt_idx" ON "Tutorial"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "TutorialStep_tutorialId_order_idx" ON "TutorialStep"("tutorialId", "order");

-- CreateIndex
CREATE INDEX "TutorialCreation_creationId_idx" ON "TutorialCreation"("creationId");

-- CreateIndex
CREATE UNIQUE INDEX "MediaAsset_storageKey_key" ON "MediaAsset"("storageKey");

-- CreateIndex
CREATE INDEX "MediaAsset_kind_createdAt_idx" ON "MediaAsset"("kind", "createdAt");

-- CreateIndex
CREATE INDEX "MediaAsset_originalFilename_idx" ON "MediaAsset"("originalFilename");

-- CreateIndex
CREATE UNIQUE INDEX "AnalyticsEvent_dedupeKey_key" ON "AnalyticsEvent"("dedupeKey");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_type_createdAt_idx" ON "AnalyticsEvent"("type", "createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_creationId_type_idx" ON "AnalyticsEvent"("creationId", "type");

-- CreateIndex
CREATE INDEX "ContactMessage_createdAt_idx" ON "ContactMessage"("createdAt");

-- CreateIndex
CREATE INDEX "ContactMessage_readAt_idx" ON "ContactMessage"("readAt");

-- AddForeignKey
ALTER TABLE "AdminSession" ADD CONSTRAINT "AdminSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatorProfile" ADD CONSTRAINT "CreatorProfile_profileImageId_fkey" FOREIGN KEY ("profileImageId") REFERENCES "MediaAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteSetting" ADD CONSTRAINT "SiteSetting_logoAssetId_fkey" FOREIGN KEY ("logoAssetId") REFERENCES "MediaAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteSetting" ADD CONSTRAINT "SiteSetting_faviconAssetId_fkey" FOREIGN KEY ("faviconAssetId") REFERENCES "MediaAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteSetting" ADD CONSTRAINT "SiteSetting_socialImageAssetId_fkey" FOREIGN KEY ("socialImageAssetId") REFERENCES "MediaAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_coverAssetId_fkey" FOREIGN KEY ("coverAssetId") REFERENCES "MediaAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiTool" ADD CONSTRAINT "AiTool_logoAssetId_fkey" FOREIGN KEY ("logoAssetId") REFERENCES "MediaAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreationMedia" ADD CONSTRAINT "CreationMedia_creationId_fkey" FOREIGN KEY ("creationId") REFERENCES "Creation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreationMedia" ADD CONSTRAINT "CreationMedia_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "MediaAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreationStep" ADD CONSTRAINT "CreationStep_creationId_fkey" FOREIGN KEY ("creationId") REFERENCES "Creation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreationStep" ADD CONSTRAINT "CreationStep_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreationCategory" ADD CONSTRAINT "CreationCategory_creationId_fkey" FOREIGN KEY ("creationId") REFERENCES "Creation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreationCategory" ADD CONSTRAINT "CreationCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreationTag" ADD CONSTRAINT "CreationTag_creationId_fkey" FOREIGN KEY ("creationId") REFERENCES "Creation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreationTag" ADD CONSTRAINT "CreationTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreationAITool" ADD CONSTRAINT "CreationAITool_creationId_fkey" FOREIGN KEY ("creationId") REFERENCES "Creation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreationAITool" ADD CONSTRAINT "CreationAITool_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "AiTool"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tutorial" ADD CONSTRAINT "Tutorial_coverAssetId_fkey" FOREIGN KEY ("coverAssetId") REFERENCES "MediaAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutorialStep" ADD CONSTRAINT "TutorialStep_tutorialId_fkey" FOREIGN KEY ("tutorialId") REFERENCES "Tutorial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutorialStep" ADD CONSTRAINT "TutorialStep_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutorialTool" ADD CONSTRAINT "TutorialTool_tutorialId_fkey" FOREIGN KEY ("tutorialId") REFERENCES "Tutorial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutorialTool" ADD CONSTRAINT "TutorialTool_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "AiTool"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutorialCreation" ADD CONSTRAINT "TutorialCreation_tutorialId_fkey" FOREIGN KEY ("tutorialId") REFERENCES "Tutorial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutorialCreation" ADD CONSTRAINT "TutorialCreation_creationId_fkey" FOREIGN KEY ("creationId") REFERENCES "Creation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_creationId_fkey" FOREIGN KEY ("creationId") REFERENCES "Creation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_tutorialId_fkey" FOREIGN KEY ("tutorialId") REFERENCES "Tutorial"("id") ON DELETE SET NULL ON UPDATE CASCADE;
