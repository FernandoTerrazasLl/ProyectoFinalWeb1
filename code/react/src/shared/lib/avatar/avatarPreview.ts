type AvatarPreviewRefs = Record<string, Element | undefined>;

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

export function syncAvatarPreviewFromInput(
  event: Event,
  input: HTMLInputElement,
  preview: HTMLImageElement,
  initial: HTMLElement,
) {
  if (event.target !== input)
    return;

  syncAvatarPreview(input.value.trim(), preview, initial);
}

export function setAvatarInitialFromRefs(firstName: string, refs: AvatarPreviewRefs) {
  setAvatarInitial(firstName, refs.avatarInitial as HTMLElement | undefined, refs.avatarPreview as HTMLImageElement | undefined);
}

export function syncAvatarPreviewFromRefs(event: Event, refs: AvatarPreviewRefs) {
  const input = refs.avatarUrl;
  const preview = refs.avatarPreview;
  const initial = refs.avatarInitial;

  if (!(input instanceof HTMLInputElement) || !(preview instanceof HTMLImageElement) || !(initial instanceof HTMLElement))
    return;

  syncAvatarPreviewFromInput(event, input, preview, initial);
}
