import type { User } from "@entities/user/model/User";

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: User;
}
