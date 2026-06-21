import type { Result } from "ts-results-es";
import { http } from "@shared/api/http";
import type { HttpError } from "@shared/api/HttpError";
import type { AuthSession } from "@entities/user/api/AuthSession";
import type { LoginUserRequest } from "@entities/user/api/LoginUserRequest";

export function loginUser(request: LoginUserRequest): Promise<Result<AuthSession, HttpError>> {
  return http.request<AuthSession>("POST", "/auth/login", request);
}
