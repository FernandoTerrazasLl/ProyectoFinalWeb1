import { Store } from "@shared/lib/store/Store";
import type { AppState } from "@app/providers/AppState";

export const appStore = new Store<AppState>({
  accessToken: null,
  user: null,
  role: "guest",
  toasts: [],
});
