import type { Result } from "ts-results-es";
import { http } from "@shared/api/http";
import type { HttpError } from "@shared/api/HttpError";
import type { AuthSession } from "@entities/user/api/AuthSession";
import type { RegisterUserRequest } from "@entities/user/api/RegisterUserRequest";

export function registerUser(request: RegisterUserRequest): Promise<Result<AuthSession, HttpError>> {
  return http.request<AuthSession>("POST", "/auth/register", request);
}
