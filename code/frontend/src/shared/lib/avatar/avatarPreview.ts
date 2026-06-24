export function setAvatarInitial(firstName: string, initial: HTMLElement | undefined, preview: HTMLImageElement | undefined) {
  if (!initial)
    return;

  initial.textContent = firstName.trim().charAt(0).toUpperCase() || "P";

  if (preview?.getAttribute("src"))
    initial.style.display = "none";
}

export function syncAvatarPreview(imageUrl: string, preview: HTMLImageElement, initial: HTMLElement) {
  preview.src = imageUrl;
  preview.style.display = imageUrl ? "block" : "none";
  initial.style.display = imageUrl ? "none" : "inline";
}
