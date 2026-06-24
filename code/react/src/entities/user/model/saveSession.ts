import type { AuthSession } from "@entities/user/api/AuthSession";

const STORAGE_KEY = "curamente.session";

export function saveSession(session: AuthSession) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}
