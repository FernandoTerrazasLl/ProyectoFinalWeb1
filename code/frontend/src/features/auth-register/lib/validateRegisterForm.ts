import type { RegisterFormValues } from "@features/auth-register/lib/RegisterFormValues";

export function validateRegisterForm(values: RegisterFormValues): boolean {
  const hasFirstName = values.firstName.length > 0;
  const hasLastName = values.lastName.length > 0;
  const hasCi = values.ci.length > 0;
  const hasBirthDate = values.birthDate.length > 0;
  const hasGender = values.gender.length > 0;
  const hasPhone = values.phoneNumber.length > 0;
  const hasEmail = values.email.length > 0;
  const hasStrongPassword = values.password.length >= 8;
  const passwordsMatch = values.password === values.confirmPassword;

  return hasFirstName && hasLastName && hasCi && hasBirthDate && hasGender && hasPhone && hasEmail && hasStrongPassword && passwordsMatch;
}
