import { beforeEach, describe, expect, it, vi } from "vitest";
import { Err, Ok } from "ts-results-es";
import { loginWithGoogle, applySession } from "@entities/user";
import { authenticateWithGoogle } from "@features/oauth-google/model/authenticateWithGoogle";
import type { AuthSession } from "@entities/user";

vi.mock("@entities/user", () => ({ loginWithGoogle: vi.fn(), applySession: vi.fn() }));

const loginWithGoogleMock = vi.mocked(loginWithGoogle);
const applySessionMock = vi.mocked(applySession);

const session: AuthSession = {
  accessToken: "a",
  refreshToken: "r",
  user: { id: "ana@correo.com", name: "ana@correo.com", email: "ana@correo.com", role: "PATIENT" },
};

beforeEach(() => {
  loginWithGoogleMock.mockReset();
  applySessionMock.mockReset();
});

describe("Autenticación con Google [US-AUTH-03]", () => {
  it("aplica la sesión cuando el token de Google es válido [AC-1]", async () => {
    loginWithGoogleMock.mockResolvedValue(Ok(session));

    const result = await authenticateWithGoogle("google-id-token");

    expect(result.isOk()).toBe(true);
    expect(applySessionMock).toHaveBeenCalledWith(session);
  });

  it("propaga el error sin aplicar sesión cuando Google rechaza el token [AC-2]", async () => {
    loginWithGoogleMock.mockResolvedValue(Err({ status: 401, message: "invalid_token" }));

    const result = await authenticateWithGoogle("token-malo");

    expect(result.isErr()).toBe(true);
    expect(applySessionMock).not.toHaveBeenCalled();
  });
});
