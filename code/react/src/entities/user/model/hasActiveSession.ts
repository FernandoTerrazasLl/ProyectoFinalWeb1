import { sessionStore } from "@entities/user/model/sessionStore";

export function hasActiveSession(): boolean {
  return sessionStore.getState().accessToken !== null;
}
