import type { Result } from "ts-results-es";
import { loginWithGoogle, applySession } from "@entities/user";
import type { HttpError } from "@shared/api/HttpError";

export async function authenticateWithGoogle(idToken: string): Promise<Result<undefined, HttpError>> {
  const result = await loginWithGoogle(idToken);

  if (result.isOk())
    applySession(result.value);

  return result.map(() => undefined);
}
