import type { Role } from "@entities/user/model/Role";
import type { User } from "@entities/user/model/User";
import type { ToastMessage } from "@app/providers/ToastMessage";

export interface AppState {
  accessToken: string | null;
  user: User | null;
  role: Role | "guest";
  toasts: ToastMessage[];
}
