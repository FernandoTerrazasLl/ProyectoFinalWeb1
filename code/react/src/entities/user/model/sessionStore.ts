import { Store } from "@shared/lib/store/Store";
import type { SessionState } from "@entities/user/model/SessionState";

export const sessionStore = new Store<SessionState>({
  accessToken: null,
  user: null,
  role: "guest",
});
