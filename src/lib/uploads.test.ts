import { describe, expect, it } from "vitest";
import { detectMedia, safeFilename } from "@/lib/uploads";

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

  it("recognizes gif and quicktime signatures", () => {
    const gif = Buffer.alloc(12);
    gif.write("GIF89a", 0, "ascii");
    expect(detectMedia(gif)?.mime).toBe("image/gif");
    const mov = Buffer.alloc(12);
    mov.write("ftyp", 4, "ascii");
    mov.write("qt  ", 8, "ascii");
    expect(detectMedia(mov)?.ext).toBe("mov");
  });

  it("rejects a renamed text file", () => {
    expect(detectMedia(Buffer.from("not an image!!"))).toBeNull();
  });

  it("keeps filenames inside a single path segment", () => {
    expect(safeFilename("../prompt.png")).not.toContain("/");
  });
});
