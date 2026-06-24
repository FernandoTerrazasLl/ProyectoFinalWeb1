import { beforeEach, describe, expect, it, vi } from "vitest";
import { Err, Ok } from "ts-results-es";
import { loginUser, applySession } from "@entities/user";
import { submitLogin } from "@features/auth-login/model/submitLogin";
import type { AuthSession } from "@entities/user";

vi.mock("@entities/user", () => ({ loginUser: vi.fn(), applySession: vi.fn() }));

const loginUserMock = vi.mocked(loginUser);
const applySessionMock = vi.mocked(applySession);

const session: AuthSession = {
  accessToken: "a",
  refreshToken: "r",
  user: { id: "ana@correo.com", name: "ana@correo.com", email: "ana@correo.com", role: "PATIENT" },
};

beforeEach(() => {
  loginUserMock.mockReset();
  applySessionMock.mockReset();
});

describe("Envío del formulario de inicio de sesión [US-AUTH-02]", () => {
  it("aplica la sesión cuando las credenciales son válidas [AC-1]", async () => {
    loginUserMock.mockResolvedValue(Ok(session));

    const result = await submitLogin({ email: "ana@correo.com", password: "12345678" });

    expect(result.isOk()).toBe(true);
    expect(applySessionMock).toHaveBeenCalledWith(session);
  });

  it("no aplica la sesión cuando las credenciales son inválidas [AC-2]", async () => {
    loginUserMock.mockResolvedValue(Err({ status: 401, message: "unauthorized" }));

    const result = await submitLogin({ email: "ana@correo.com", password: "mala" });

    expect(result.isErr()).toBe(true);
    expect(applySessionMock).not.toHaveBeenCalled();
  });
});
