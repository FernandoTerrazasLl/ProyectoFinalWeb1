const MAX_SIZE = 320;
const JPEG_QUALITY = 0.78;

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Invalid image"));
    image.src = dataUrl;
  });
}

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Invalid image"));
    reader.readAsDataURL(file);
  });
}

export async function prepareProfileImage(file: File): Promise<string | null> {
  if (!file.type.startsWith("image/"))
    return null;

  const dataUrl = await readFile(file);
  const image = await loadImage(dataUrl);
  const scale = Math.min(1, MAX_SIZE / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context)
    return dataUrl;

  canvas.width = width;
  canvas.height = height;
  context.drawImage(image, 0, 0, width, height);

  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}

export async function previewProfileImage(
  file: File | undefined,
  preview: HTMLImageElement,
  fallback: HTMLElement,
): Promise<string | null> {
  if (!file || file.size > 5 * 1024 * 1024)
    return null;

  const imageUrl = await prepareProfileImage(file);

  if (!imageUrl)
    return null;

  preview.src = imageUrl;
  preview.style.display = "block";
  fallback.style.display = "none";

  return imageUrl;
}
