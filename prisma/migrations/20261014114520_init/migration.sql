-- CreateTable
CREATE TABLE `AdminUser` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `passwordHash` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AdminUser_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdminSession` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `tokenHash` VARCHAR(128) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `AdminSession_tokenHash_key`(`tokenHash`),
    INDEX `AdminSession_userId_idx`(`userId`),
    INDEX `AdminSession_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuthAttempt` (
    `id` VARCHAR(191) NOT NULL,
    `keyHash` VARCHAR(128) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AuthAttempt_keyHash_createdAt_idx`(`keyHash`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CreatorProfile` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'default',
    `name` VARCHAR(120) NOT NULL,
    `username` VARCHAR(80) NOT NULL,
    `profileImageId` VARCHAR(191) NULL,
    `heroEyebrow` VARCHAR(255) NOT NULL,
    `heroHeading` TEXT NOT NULL,
    `heroSubtitle` TEXT NOT NULL,
    `biography` TEXT NOT NULL,
    `professionalIntro` TEXT NOT NULL,
    `philosophy` TEXT NOT NULL,
    `specialties` JSON NOT NULL,
    `interests` JSON NOT NULL,
    `instagramUrl` VARCHAR(500) NULL,
    `youtubeUrl` VARCHAR(500) NULL,
    `githubUrl` VARCHAR(500) NULL,
    `otherSocial` JSON NOT NULL,
    `contactEmail` VARCHAR(255) NULL,
    `collaborationAvailable` BOOLEAN NOT NULL DEFAULT false,
    `seoDescription` VARCHAR(500) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SiteSetting` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'default',
    `websiteTitle` VARCHAR(160) NOT NULL,
    `logoAssetId` VARCHAR(191) NULL,
    `faviconAssetId` VARCHAR(191) NULL,
    `defaultSeoTitle` VARCHAR(180) NOT NULL,
    `defaultSeoDescription` VARCHAR(500) NOT NULL,
    `socialImageAssetId` VARCHAR(191) NULL,
    `contactEmail` VARCHAR(255) NULL,
    `footerText` TEXT NOT NULL,
    `featuredSectionVisible` BOOLEAN NOT NULL DEFAULT true,
    `instagramHandle` VARCHAR(100) NULL,
    `privacyBody` LONGTEXT NOT NULL,
    `termsBody` LONGTEXT NOT NULL,
    `showPromptOfDay` BOOLEAN NOT NULL DEFAULT true,
    `showProcess` BOOLEAN NOT NULL DEFAULT true,
    `showInstagramCta` BOOLEAN NOT NULL DEFAULT true,
    `instagramPreviewIds` JSON NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Category` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(80) NOT NULL,
    `slug` VARCHAR(120) NOT NULL,
    `description` TEXT NULL,
    `coverAssetId` VARCHAR(191) NULL,
    `displayOrder` INTEGER NOT NULL DEFAULT 0,
    `published` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Category_slug_key`(`slug`),
    INDEX `Category_published_displayOrder_idx`(`published`, `displayOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tag` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(40) NOT NULL,
    `slug` VARCHAR(80) NOT NULL,

    UNIQUE INDEX `Tag_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AiTool` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `slug` VARCHAR(140) NOT NULL,
    `websiteUrl` VARCHAR(500) NULL,
    `logoAssetId` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `supportedMediaTypes` JSON NOT NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AiTool_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Creation` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(160) NOT NULL,
    `slug` VARCHAR(180) NOT NULL,
    `shortDescription` VARCHAR(500) NOT NULL,
    `description` TEXT NOT NULL,
    `mediaType` ENUM('IMAGE', 'VIDEO', 'IMAGE_SERIES', 'TUTORIAL') NOT NULL,
    `status` ENUM('DRAFT', 'PUBLISHED') NOT NULL DEFAULT 'DRAFT',
    `prompt` LONGTEXT NOT NULL,
    `negativePrompt` LONGTEXT NULL,
    `generationSettings` JSON NULL,
    `aspectRatio` VARCHAR(32) NULL,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `promptOfTheDay` BOOLEAN NOT NULL DEFAULT false,
    `seoTitle` VARCHAR(180) NULL,
    `seoDescription` VARCHAR(320) NULL,
    `publishedAt` DATETIME(3) NULL,
    `viewCount` INTEGER NOT NULL DEFAULT 0,
    `copyCount` INTEGER NOT NULL DEFAULT 0,
    `modelName` VARCHAR(180) NULL,
    `platformName` VARCHAR(180) NULL,
    `seed` VARCHAR(120) NULL,
    `guidanceScale` DOUBLE NULL,
    `stepCount` INTEGER NULL,
    `resolution` VARCHAR(64) NULL,
    `durationSeconds` INTEGER NULL,
    `frameRate` VARCHAR(32) NULL,
    `cameraMovement` VARCHAR(255) NULL,
    `motionInstructions` TEXT NULL,
    `characterNotes` TEXT NULL,
    `workflowNotes` TEXT NULL,
    `limitations` TEXT NULL,
    `credits` TEXT NULL,
    `subscriptions` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Creation_slug_key`(`slug`),
    INDEX `Creation_status_publishedAt_idx`(`status`, `publishedAt`),
    INDEX `Creation_featured_status_idx`(`featured`, `status`),
    INDEX `Creation_promptOfTheDay_status_idx`(`promptOfTheDay`, `status`),
    INDEX `Creation_mediaType_status_idx`(`mediaType`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CreationMedia` (
    `id` VARCHAR(191) NOT NULL,
    `creationId` VARCHAR(191) NOT NULL,
    `assetId` VARCHAR(191) NOT NULL,
    `role` ENUM('COVER', 'MAIN', 'GALLERY', 'REFERENCE', 'POSTER', 'SOURCE', 'DOWNLOAD') NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `altText` VARCHAR(300) NULL,

    INDEX `CreationMedia_creationId_sortOrder_idx`(`creationId`, `sortOrder`),
    INDEX `CreationMedia_assetId_idx`(`assetId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CreationStep` (
    `id` VARCHAR(191) NOT NULL,
    `creationId` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL,
    `title` VARCHAR(160) NOT NULL,
    `body` TEXT NOT NULL,
    `mediaAssetId` VARCHAR(191) NULL,
    `externalLink` VARCHAR(500) NULL,
    `warning` TEXT NULL,
    `tip` TEXT NULL,

    INDEX `CreationStep_creationId_order_idx`(`creationId`, `order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CreationCategory` (
    `creationId` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,

    INDEX `CreationCategory_categoryId_idx`(`categoryId`),
    PRIMARY KEY (`creationId`, `categoryId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CreationTag` (
    `creationId` VARCHAR(191) NOT NULL,
    `tagId` VARCHAR(191) NOT NULL,

    INDEX `CreationTag_tagId_idx`(`tagId`),
    PRIMARY KEY (`creationId`, `tagId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CreationAITool` (
    `creationId` VARCHAR(191) NOT NULL,
    `toolId` VARCHAR(191) NOT NULL,
    `modelName` VARCHAR(180) NULL,

    INDEX `CreationAITool_toolId_idx`(`toolId`),
    PRIMARY KEY (`creationId`, `toolId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tutorial` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(160) NOT NULL,
    `slug` VARCHAR(180) NOT NULL,
    `coverAssetId` VARCHAR(191) NULL,
    `summary` TEXT NOT NULL,
    `difficulty` ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED') NOT NULL DEFAULT 'BEGINNER',
    `durationMinutes` INTEGER NOT NULL DEFAULT 15,
    `status` ENUM('DRAFT', 'PUBLISHED') NOT NULL DEFAULT 'DRAFT',
    `seoTitle` VARCHAR(180) NULL,
    `seoDescription` VARCHAR(320) NULL,
    `tips` TEXT NULL,
    `troubleshooting` TEXT NULL,
    `publishedAt` DATETIME(3) NULL,
    `viewCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Tutorial_slug_key`(`slug`),
    INDEX `Tutorial_status_publishedAt_idx`(`status`, `publishedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TutorialStep` (
    `id` VARCHAR(191) NOT NULL,
    `tutorialId` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL,
    `title` VARCHAR(160) NOT NULL,
    `body` TEXT NOT NULL,
    `mediaAssetId` VARCHAR(191) NULL,
    `externalLink` VARCHAR(500) NULL,
    `warning` TEXT NULL,
    `tip` TEXT NULL,

    INDEX `TutorialStep_tutorialId_order_idx`(`tutorialId`, `order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TutorialTool` (
    `tutorialId` VARCHAR(191) NOT NULL,
    `toolId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`tutorialId`, `toolId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TutorialCreation` (
    `tutorialId` VARCHAR(191) NOT NULL,
    `creationId` VARCHAR(191) NOT NULL,

    INDEX `TutorialCreation_creationId_idx`(`creationId`),
    PRIMARY KEY (`tutorialId`, `creationId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MediaAsset` (
    `id` VARCHAR(191) NOT NULL,
    `storageKey` VARCHAR(400) NOT NULL,
    `publicUrl` VARCHAR(800) NOT NULL,
    `thumbnailKey` VARCHAR(400) NULL,
    `thumbnailUrl` VARCHAR(800) NULL,
    `mimeType` VARCHAR(120) NOT NULL,
    `kind` ENUM('IMAGE', 'VIDEO') NOT NULL,
    `width` INTEGER NULL,
    `height` INTEGER NULL,
    `durationSeconds` DOUBLE NULL,
    `sizeBytes` INTEGER NOT NULL,
    `altText` VARCHAR(300) NULL,
    `originalFilename` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `MediaAsset_storageKey_key`(`storageKey`),
    INDEX `MediaAsset_kind_createdAt_idx`(`kind`, `createdAt`),
    INDEX `MediaAsset_originalFilename_idx`(`originalFilename`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AnalyticsEvent` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('CREATION_VIEW', 'PROMPT_COPY', 'TUTORIAL_VIEW', 'FAVORITE', 'OUTBOUND_TOOL_CLICK') NOT NULL,
    `creationId` VARCHAR(191) NULL,
    `tutorialId` VARCHAR(191) NULL,
    `dedupeKey` VARCHAR(128) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `AnalyticsEvent_dedupeKey_key`(`dedupeKey`),
    INDEX `AnalyticsEvent_type_createdAt_idx`(`type`, `createdAt`),
    INDEX `AnalyticsEvent_creationId_type_idx`(`creationId`, `type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContactMessage` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(80) NOT NULL,
    `email` VARCHAR(180) NOT NULL,
    `subject` VARCHAR(140) NOT NULL,
    `message` TEXT NOT NULL,
    `readAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ContactMessage_createdAt_idx`(`createdAt`),
    INDEX `ContactMessage_readAt_idx`(`readAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AdminSession` ADD CONSTRAINT `AdminSession_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `AdminUser`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CreatorProfile` ADD CONSTRAINT `CreatorProfile_profileImageId_fkey` FOREIGN KEY (`profileImageId`) REFERENCES `MediaAsset`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SiteSetting` ADD CONSTRAINT `SiteSetting_logoAssetId_fkey` FOREIGN KEY (`logoAssetId`) REFERENCES `MediaAsset`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SiteSetting` ADD CONSTRAINT `SiteSetting_faviconAssetId_fkey` FOREIGN KEY (`faviconAssetId`) REFERENCES `MediaAsset`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SiteSetting` ADD CONSTRAINT `SiteSetting_socialImageAssetId_fkey` FOREIGN KEY (`socialImageAssetId`) REFERENCES `MediaAsset`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Category` ADD CONSTRAINT `Category_coverAssetId_fkey` FOREIGN KEY (`coverAssetId`) REFERENCES `MediaAsset`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AiTool` ADD CONSTRAINT `AiTool_logoAssetId_fkey` FOREIGN KEY (`logoAssetId`) REFERENCES `MediaAsset`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CreationMedia` ADD CONSTRAINT `CreationMedia_creationId_fkey` FOREIGN KEY (`creationId`) REFERENCES `Creation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CreationMedia` ADD CONSTRAINT `CreationMedia_assetId_fkey` FOREIGN KEY (`assetId`) REFERENCES `MediaAsset`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CreationStep` ADD CONSTRAINT `CreationStep_creationId_fkey` FOREIGN KEY (`creationId`) REFERENCES `Creation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CreationStep` ADD CONSTRAINT `CreationStep_mediaAssetId_fkey` FOREIGN KEY (`mediaAssetId`) REFERENCES `MediaAsset`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CreationCategory` ADD CONSTRAINT `CreationCategory_creationId_fkey` FOREIGN KEY (`creationId`) REFERENCES `Creation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CreationCategory` ADD CONSTRAINT `CreationCategory_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CreationTag` ADD CONSTRAINT `CreationTag_creationId_fkey` FOREIGN KEY (`creationId`) REFERENCES `Creation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CreationTag` ADD CONSTRAINT `CreationTag_tagId_fkey` FOREIGN KEY (`tagId`) REFERENCES `Tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CreationAITool` ADD CONSTRAINT `CreationAITool_creationId_fkey` FOREIGN KEY (`creationId`) REFERENCES `Creation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CreationAITool` ADD CONSTRAINT `CreationAITool_toolId_fkey` FOREIGN KEY (`toolId`) REFERENCES `AiTool`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tutorial` ADD CONSTRAINT `Tutorial_coverAssetId_fkey` FOREIGN KEY (`coverAssetId`) REFERENCES `MediaAsset`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TutorialStep` ADD CONSTRAINT `TutorialStep_tutorialId_fkey` FOREIGN KEY (`tutorialId`) REFERENCES `Tutorial`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TutorialStep` ADD CONSTRAINT `TutorialStep_mediaAssetId_fkey` FOREIGN KEY (`mediaAssetId`) REFERENCES `MediaAsset`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TutorialTool` ADD CONSTRAINT `TutorialTool_tutorialId_fkey` FOREIGN KEY (`tutorialId`) REFERENCES `Tutorial`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TutorialTool` ADD CONSTRAINT `TutorialTool_toolId_fkey` FOREIGN KEY (`toolId`) REFERENCES `AiTool`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TutorialCreation` ADD CONSTRAINT `TutorialCreation_tutorialId_fkey` FOREIGN KEY (`tutorialId`) REFERENCES `Tutorial`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TutorialCreation` ADD CONSTRAINT `TutorialCreation_creationId_fkey` FOREIGN KEY (`creationId`) REFERENCES `Creation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnalyticsEvent` ADD CONSTRAINT `AnalyticsEvent_creationId_fkey` FOREIGN KEY (`creationId`) REFERENCES `Creation`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnalyticsEvent` ADD CONSTRAINT `AnalyticsEvent_tutorialId_fkey` FOREIGN KEY (`tutorialId`) REFERENCES `Tutorial`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
