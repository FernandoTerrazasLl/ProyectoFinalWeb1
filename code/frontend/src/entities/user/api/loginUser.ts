import { Ok, Err } from "ts-results-es";
import type { Result } from "ts-results-es";
import { http } from "@shared/api/http";
import type { HttpError } from "@shared/api/HttpError";
import type { AuthSession } from "@entities/user/api/AuthSession";
import type { AuthTokensResponse } from "@entities/user/api/AuthTokensResponse";
import type { LoginUserRequest } from "@entities/user/api/LoginUserRequest";
import { toAuthSession } from "@entities/user/api/toAuthSession";

export async function loginUser(request: LoginUserRequest): Promise<Result<AuthSession, HttpError>> {
  const result = await http.request<AuthTokensResponse>("POST", "/auth/login", request);

  return result.andThen((tokens) => {
    const session = toAuthSession(tokens);
    return session ? Ok(session) : Err({ status: 0, message: "invalid_token" });
  });
}
