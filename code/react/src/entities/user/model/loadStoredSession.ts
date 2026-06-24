import { Result } from "ts-results-es";
import type { AuthSession } from "@entities/user/api/AuthSession";

const STORAGE_KEY = "curamente.session";

export function loadStoredSession(): AuthSession | null {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw)
    return null;

  const parsed = Result.wrap<AuthSession>(() => JSON.parse(raw));

  return parsed.isOk() ? parsed.value : null;
}
