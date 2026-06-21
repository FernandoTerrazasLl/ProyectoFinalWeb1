import type { Role } from "@entities/user/model/Role";
import type { User } from "@entities/user/model/User";

export interface SessionState {
  accessToken: string | null;
  user: User | null;
  role: Role | "guest";
}
