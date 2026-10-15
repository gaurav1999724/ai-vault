import { kindFromFile } from "@/lib/media-file";

export type MediaPreview = {
  width: number | null;
  height: number | null;
  thumbnail: Blob | null;
};

function canvasBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }
      canvas.toBlob((jpeg) => resolve(jpeg), "image/jpeg", 0.76);
    }, "image/webp", 0.76);
  });
}

function scaledCanvas(source: CanvasImageSource, width: number, height: number) {
  const scale = Math.min(1, 960 / width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas;
}

async function imagePreview(file: File): Promise<MediaPreview> {
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = scaledCanvas(bitmap, bitmap.width, bitmap.height);
    return {
      width: bitmap.width,
      height: bitmap.height,
      thumbnail: canvas ? await canvasBlob(canvas) : null,
    };
  } finally {
    bitmap.close();
  }
}

function waitFor(target: HTMLVideoElement, event: "loadeddata" | "seeked") {
  return new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error("preview timeout")), 4000);
    const done = () => {
      window.clearTimeout(timer);
      resolve();
    };
    target.addEventListener(event, done, { once: true });
    target.addEventListener("error", () => {
      window.clearTimeout(timer);
      reject(new Error("preview failed"));
    }, { once: true });
  });
}

async function videoPreview(file: File): Promise<MediaPreview> {
  const url = URL.createObjectURL(file);
  try {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    const loaded = waitFor(video, "loadeddata");
    video.src = url;
    await loaded;
    if (Number.isFinite(video.duration) && video.duration > 0) {
      const seeked = waitFor(video, "seeked");
      video.currentTime = Math.min(0.1, video.duration / 2);
      await seeked;
    }
    const width = video.videoWidth || null;
    const height = video.videoHeight || null;
    if (!width || !height) return { width, height, thumbnail: null };
    const canvas = scaledCanvas(video, width, height);
    return { width, height, thumbnail: canvas ? await canvasBlob(canvas) : null };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function readPreview(file: File): Promise<MediaPreview> {
  const empty = { width: null, height: null, thumbnail: null };
  try {
    const kind = kindFromFile(file);
    if (kind === "IMAGE") return await imagePreview(file);
    if (kind === "VIDEO") return await videoPreview(file);
  } catch {
    return empty;
  }
  return empty;
}
