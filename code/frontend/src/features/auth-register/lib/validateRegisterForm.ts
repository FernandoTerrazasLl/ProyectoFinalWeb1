import type { RegisterFormValues } from "@features/auth-register/lib/RegisterFormValues";

export function validateRegisterForm(values: RegisterFormValues): boolean {
  const hasName = values.name.length > 0;
  const hasEmail = values.email.length > 0;
  const hasStrongPassword = values.password.length >= 8;
  const passwordsMatch = values.password === values.confirmPassword;

  return hasName && hasEmail && hasStrongPassword && passwordsMatch;
}
