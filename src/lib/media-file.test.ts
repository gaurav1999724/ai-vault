import { describe, expect, it } from "vitest";
import {
  blobPathname,
  isVercelBlobUrl,
  kindFromFile,
  S3_MAX_PARTS,
  S3_MIN_PART_BYTES,
  s3PartCount,
  s3PartSize,
} from "@/lib/media-file";

describe("media files", () => {
  it("accepts images and videos of any size by type", () => {
    expect(kindFromFile({ name: "poster.heic", type: "" })).toBe("IMAGE");
    expect(kindFromFile({ name: "clip.mov", type: "video/quicktime" })).toBe("VIDEO");
    expect(kindFromFile({ name: "notes.txt", type: "text/plain" })).toBeNull();
  });

  it("only accepts this project's blob urls", () => {
    expect(isVercelBlobUrl("https://store.public.blob.vercel-storage.com/images/a.png")).toBe(true);
    expect(isVercelBlobUrl("https://store.private.blob.vercel-storage.com/images/a.png")).toBe(true);
    expect(isVercelBlobUrl("https://example.com/images/a.png")).toBe(false);
    expect(blobPathname("/images/poster.png")).toBe("images/poster.png");
    expect(blobPathname("../images/poster.png")).toBeNull();
  });

  it("splits very large uploads into at most 10000 parts", () => {
    expect(s3PartSize(1024)).toBe(1024);
    expect(s3PartCount(S3_MIN_PART_BYTES * 2)).toBe(2);
    const huge = S3_MIN_PART_BYTES * (S3_MAX_PARTS + 5);
    expect(s3PartCount(huge)).toBeLessThanOrEqual(S3_MAX_PARTS);
  });
});
