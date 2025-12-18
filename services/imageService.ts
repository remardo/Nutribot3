import { convexClient, getUserId } from "./convexClient";

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });

const loadImage = (dataUrl: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(new Error("Image decode failed (possibly unsupported format like HEIC)."));
    img.src = dataUrl;
  });

const drawToCanvas = (img: HTMLImageElement, maxDim: number): HTMLCanvasElement => {
  const canvas = document.createElement("canvas");
  let { width, height } = img;

  if (width > height && width > maxDim) {
    height = (height * maxDim) / width;
    width = maxDim;
  } else if (height > maxDim) {
    width = (width * maxDim) / height;
    height = maxDim;
  }

  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
};

const canvasToJpegBlob = (canvas: HTMLCanvasElement, quality: number): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error("Failed to encode JPEG"));
        resolve(blob);
      },
      "image/jpeg",
      quality
    );
  });

export const compressFileForVision = async (file: File): Promise<Blob> => {
  const sourceDataUrl = await readFileAsDataUrl(file);
  const img = await loadImage(sourceDataUrl);

  // Strong compression, but keep enough detail for vision models.
  // Target keeps UI snappy and storage cheap while staying usable for analysis.
  const targetBytes = 650_000;

  const dimCandidates = [1280, 1152, 1024, 896, 768, 640];
  const qualityCandidates = [0.82, 0.76, 0.7, 0.62, 0.55, 0.48];

  let best: Blob | null = null;
  for (const maxDim of dimCandidates) {
    const canvas = drawToCanvas(img, maxDim);
    for (const quality of qualityCandidates) {
      const blob = await canvasToJpegBlob(canvas, quality);
      best = blob;
      if (blob.size <= targetBytes) return blob;
    }
  }

  if (!best) throw new Error("Image compression failed");
  return best;
};

export const uploadImageToStorage = async (blob: Blob): Promise<string> => {
  if (!convexClient) throw new Error("Convex is not configured");
  const client = convexClient as any;

  const uploadUrl = await client.mutation("files:generateUploadUrl", {});
  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": "image/jpeg" },
    body: blob,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Upload failed (${res.status}): ${body}`);
  }

  const json = await res.json();
  const storageId = json?.storageId;
  if (!storageId) throw new Error("Upload did not return storageId");

  try {
    await client.mutation("files:recordUpload", { userId: getUserId(), storageId });
  } catch (e) {
    console.warn("Failed to record photo upload", e);
  }

  return storageId;
};

export const getStorageUrls = async (
  storageIds: string[]
): Promise<Record<string, string | null>> => {
  if (!convexClient) return Object.fromEntries(storageIds.map((id) => [id, null]));
  const client = convexClient as any;
  return await client.query("files:getUrls", { storageIds });
};
