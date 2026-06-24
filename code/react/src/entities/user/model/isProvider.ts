import { sessionStore } from "@entities/user/model/sessionStore";

export function isProvider(): boolean {
  return sessionStore.getState().role === "PROVIDER";
}
