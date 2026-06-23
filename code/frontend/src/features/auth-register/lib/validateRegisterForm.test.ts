import { describe, expect, it } from "vitest";
import { validateRegisterForm } from "@features/auth-register/lib/validateRegisterForm";
import type { RegisterFormValues } from "@features/auth-register/lib/RegisterFormValues";

function buildValues(overrides: Partial<RegisterFormValues> = {}): RegisterFormValues {
  return {
    firstName: "Ana",
    lastName: "López",
    maternalLastName: "",
    ci: "1234567",
    birthDate: "2000-01-01",
    gender: "FEMALE",
    phoneNumber: "70000000",
    email: "ana@example.com",
    password: "secret123",
    confirmPassword: "secret123",
    ...overrides,
  };
}

describe("Registro de nuevo paciente [US-AUTH-01]", () => {
  it("habilita el registro cuando los datos están completos y las contraseñas coinciden [AC-1]", () => {
    const values = buildValues();

    const esValido = validateRegisterForm(values);

    expect(esValido).toBe(true);
  });

  it("bloquea el registro cuando falta un dato obligatorio [AC-2]", () => {
    const values = buildValues({ firstName: "" });

    const esValido = validateRegisterForm(values);

    expect(esValido).toBe(false);
  });

  it("bloquea el registro cuando la contraseña es muy corta [AC-2]", () => {
    const values = buildValues({ password: "corta", confirmPassword: "corta" });

    const esValido = validateRegisterForm(values);

    expect(esValido).toBe(false);
  });

  it("bloquea el registro cuando las contraseñas no coinciden [AC-2]", () => {
    const values = buildValues({ confirmPassword: "otra12345" });

    const esValido = validateRegisterForm(values);

    expect(esValido).toBe(false);
  });
});
