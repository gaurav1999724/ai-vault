import { describe, expect, it } from "vitest";
import { detectMedia, mediaTooLarge, safeFilename } from "@/lib/uploads";
import { MAX_IMAGE_BYTES } from "@/lib/constants";

function buffer(bytes: number[]) {
  return Buffer.from(bytes);
}

describe("detectMedia", () => {
  it("recognizes jpeg, png, and webp signatures", () => {
    expect(detectMedia(buffer([0xff, 0xd8, 0xff, 0x00, 0, 0, 0, 0, 0, 0, 0, 0]))?.mime).toBe("image/jpeg");
    expect(detectMedia(buffer([0x89, 0x50, 0x4e, 0x47, 0, 0, 0, 0, 0, 0, 0, 0]))?.mime).toBe("image/png");
    const webp = Buffer.alloc(12);
    webp.write("RIFF", 0, "ascii");
    webp.write("WEBP", 8, "ascii");
    expect(detectMedia(webp)?.ext).toBe("webp");
  });

  it("rejects a renamed text file", () => {
    expect(detectMedia(Buffer.from("not an image!!"))).toBeNull();
  });

  it("enforces size limits", () => {
    expect(mediaTooLarge("IMAGE", MAX_IMAGE_BYTES + 1)).toBe(true);
    expect(safeFilename("../prompt.png")).not.toContain("/");
  });
});
