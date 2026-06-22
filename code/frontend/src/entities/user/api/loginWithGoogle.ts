import type { Result } from "ts-results-es";
import type { HttpError } from "@shared/api/HttpError";
import type { AuthSession } from "@entities/user/api/AuthSession";
import { requestAuthSession } from "@entities/user/api/requestAuthSession";

export function loginWithGoogle(idToken: string): Promise<Result<AuthSession, HttpError>> {
  return requestAuthSession("/auth/google", { id_token: idToken });
}
