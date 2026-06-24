import { beforeEach, describe, expect, it, vi } from "vitest";
import { Err, Ok } from "ts-results-es";
import { registerUser, loginUser, applySession } from "@entities/user";
import { submitRegister } from "@features/auth-register/model/submitRegister";
import type { AuthSession, RegisterUserRequest } from "@entities/user";

vi.mock("@entities/user", () => ({ registerUser: vi.fn(), loginUser: vi.fn(), applySession: vi.fn() }));

const registerUserMock = vi.mocked(registerUser);
const loginUserMock = vi.mocked(loginUser);
const applySessionMock = vi.mocked(applySession);

const request: RegisterUserRequest = {
  email: "ana@correo.com",
  password: "12345678",
  firstName: "Ana",
  lastName: "López",
  maternalLastName: "Vargas",
  ci: "1234567",
  birthDate: "1990-01-01",
  gender: "F",
  phoneNumber: "70000000",
};

const session: AuthSession = {
  accessToken: "a",
  refreshToken: "r",
  user: { id: "ana@correo.com", name: "ana@correo.com", email: "ana@correo.com", role: "PATIENT" },
};

beforeEach(() => {
  registerUserMock.mockReset();
  loginUserMock.mockReset();
  applySessionMock.mockReset();
});

describe("Registro y autologin del paciente [US-AUTH-01]", () => {
  it("inicia sesión automáticamente tras un registro exitoso [AC-1]", async () => {
    registerUserMock.mockResolvedValue(Ok(undefined));
    loginUserMock.mockResolvedValue(Ok(session));

    const result = await submitRegister(request);

    expect(result.isOk()).toBe(true);
    expect(applySessionMock).toHaveBeenCalledWith(session);
  });

  it("no intenta iniciar sesión si el registro falla [AC-2]", async () => {
    registerUserMock.mockResolvedValue(Err({ status: 409, message: "already registered" }));

    const result = await submitRegister(request);

    expect(result.isErr()).toBe(true);
    expect(loginUserMock).not.toHaveBeenCalled();
    expect(applySessionMock).not.toHaveBeenCalled();
  });
});
