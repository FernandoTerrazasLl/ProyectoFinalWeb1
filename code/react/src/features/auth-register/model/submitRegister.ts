import type { Result } from "ts-results-es";
import type { HttpError } from "@shared/api/HttpError";
import { registerUser, loginUser, applySession } from "@entities/user";
import type { RegisterUserRequest, AuthSession } from "@entities/user";

export async function submitRegister(request: RegisterUserRequest): Promise<Result<AuthSession, HttpError>> {
  const registered = await registerUser(request);

  if (registered.isErr())
    return registered;

  const session = await loginUser({ email: request.email, password: request.password });

  if (session.isOk())
    applySession(session.value);

  return session;
}
