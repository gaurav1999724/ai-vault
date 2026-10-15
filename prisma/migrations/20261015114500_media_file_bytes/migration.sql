ALTER TABLE "MediaAsset" ADD COLUMN "fileBytes" BIGINT NOT NULL DEFAULT 0;

UPDATE "MediaAsset" SET "fileBytes" = "sizeBytes" WHERE "fileBytes" = 0;
