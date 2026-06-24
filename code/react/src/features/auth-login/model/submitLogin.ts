import type { Result } from "ts-results-es";
import type { HttpError } from "@shared/api/HttpError";
import { loginUser, applySession } from "@entities/user";
import type { LoginUserRequest, AuthSession } from "@entities/user";

export async function submitLogin(request: LoginUserRequest): Promise<Result<AuthSession, HttpError>> {
  const result = await loginUser(request);

  if (result.isOk()) 
    applySession(result.value);
  
  return result;
}
