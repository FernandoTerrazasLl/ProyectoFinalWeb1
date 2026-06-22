import { loginWithGoogle, applySession } from "@entities/user";

export async function authenticateWithGoogle(idToken: string): Promise<boolean> {
  const result = await loginWithGoogle(idToken);

  if (result.isOk())
    applySession(result.value);

  return result.isOk();
}
