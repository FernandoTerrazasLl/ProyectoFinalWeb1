import type { Result } from "ts-results-es";
import type { HttpError } from "@shared/api/HttpError";
import type { AuthSession } from "@entities/user/api/AuthSession";
import type { LoginUserRequest } from "@entities/user/api/LoginUserRequest";
import { requestAuthSession } from "@entities/user/api/requestAuthSession";

export function loginUser(request: LoginUserRequest): Promise<Result<AuthSession, HttpError>> {
  return requestAuthSession("/auth/login", request);
}
