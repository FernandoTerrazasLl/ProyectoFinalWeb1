const STORAGE_KEY = "curamente.session";

export function clearStoredSession() {
  localStorage.removeItem(STORAGE_KEY);
}
