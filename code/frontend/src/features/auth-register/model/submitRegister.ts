import type { Result } from "ts-results-es";
import type { HttpError } from "@shared/api/HttpError";
import { registerUser, applySession } from "@entities/user";
import type { RegisterUserRequest, AuthSession } from "@entities/user";

export async function submitRegister(request: RegisterUserRequest): Promise<Result<AuthSession, HttpError>> {
  const result = await registerUser(request);

  if (result.isOk()) 
    applySession(result.value);
  
  return result;
}
