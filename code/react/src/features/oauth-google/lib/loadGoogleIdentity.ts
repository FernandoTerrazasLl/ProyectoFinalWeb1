const GOOGLE_IDENTITY_SRC = "https://accounts.google.com/gsi/client";

let loader: Promise<GoogleIdentityApi | null> | null = null;

export function loadGoogleIdentity(): Promise<GoogleIdentityApi | null> {
  if (loader)
    return loader;

  loader = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = GOOGLE_IDENTITY_SRC;
    script.async = true;
    script.onload = () => resolve(window.google?.accounts.id ?? null);
    script.onerror = () => resolve(null);
    document.head.append(script);
  });

  return loader;
}
