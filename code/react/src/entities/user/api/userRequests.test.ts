import { beforeEach, describe, expect, it, vi } from "vitest";
import { Ok } from "ts-results-es";
import { http } from "@shared/api/http";
import { changePassword } from "@entities/user/api/changePassword";
import { getMyProfile } from "@entities/user/api/getMyProfile";
import { loginUser } from "@entities/user/api/loginUser";
import { loginWithGoogle } from "@entities/user/api/loginWithGoogle";
import { logoutUser } from "@entities/user/api/logoutUser";
import { registerUser } from "@entities/user/api/registerUser";
import { requestPasswordReset } from "@entities/user/api/requestPasswordReset";
import { updateMyProfile } from "@entities/user/api/updateMyProfile";

vi.mock("@shared/api/http", () => ({ http: { request: vi.fn(), logout: vi.fn() } }));

const request = vi.mocked(http.request);
const logout = vi.mocked(http.logout);

function tokenFor(payload: object): string {
  return `header.${btoa(JSON.stringify(payload))}.signature`;
}

beforeEach(() => {
  request.mockReset();
  logout.mockReset();
  request.mockResolvedValue(Ok(undefined));
});

describe("Registro de paciente [US-AUTH-01]", () => {
  it("mapea los datos del formulario y fija el rol PATIENT [AC-1]", async () => {
    await registerUser({
      email: "ana@correo.com",
      password: "12345678",
      firstName: "Ana",
      lastName: "López",
      maternalLastName: "Vargas",
      ci: "1234567",
      birthDate: "1990-01-01",
      gender: "F",
      phoneNumber: "70000000",
    });

    expect(request).toHaveBeenCalledWith(
      "POST",
      "/auth/register",
      expect.objectContaining({ email: "ana@correo.com", first_name: "Ana", role: "PATIENT" }),
    );
  });
});

describe("Inicio de sesión con credenciales [US-AUTH-02]", () => {
  it("construye la sesión a partir de los claims del token [AC-1]", async () => {
    request.mockResolvedValue(
      Ok({ access_token: tokenFor({ sub: "ana@correo.com", role: "PATIENT" }), refresh_token: "r1" }),
    );

    const result = await loginUser({ email: "ana@correo.com", password: "12345678" });

    expect(request).toHaveBeenCalledWith("POST", "/auth/login", { email: "ana@correo.com", password: "12345678" });
    expect(result.unwrap().user.role).toBe("PATIENT");
  });

  it("devuelve error cuando el token no puede decodificarse [AC-2]", async () => {
    request.mockResolvedValue(Ok({ access_token: "token.invalido.x", refresh_token: "r1" }));

    const result = await loginUser({ email: "ana@correo.com", password: "12345678" });

    expect(result.isErr()).toBe(true);
  });
});

describe("Inicio de sesión con Google [US-AUTH-03]", () => {
  it("envía el id_token al endpoint de Google [AC-1]", async () => {
    request.mockResolvedValue(
      Ok({ access_token: tokenFor({ sub: "ana@correo.com", role: "PATIENT" }), refresh_token: "r1" }),
    );

    await loginWithGoogle("google-id-token");

    expect(request).toHaveBeenCalledWith("POST", "/auth/google", { id_token: "google-id-token" });
  });
});

describe("Cierre de sesión [US-AUTH-02]", () => {
  it("delega el cierre de sesión al cliente HTTP [AC-1]", async () => {
    logout.mockResolvedValue(true);

    await logoutUser();

    expect(logout).toHaveBeenCalledOnce();
  });
});

describe("Datos personales del paciente [US-AUTH-01]", () => {
  it("transforma la respuesta del backend al borrador del perfil [AC-1]", async () => {
    request.mockResolvedValue(
      Ok({
        first_name: "Ana",
        last_name: "López",
        maternal_last_name: "Vargas",
        ci: "1234567",
        birth_date: "1990-01-01",
        gender: "F",
        phone_number: "70000000",
        email: "ana@correo.com",
        avatar_url: "",
      }),
    );

    const result = await getMyProfile();

    expect(request).toHaveBeenCalledWith("GET", "/me/profile");
    expect(result.unwrap().firstName).toBe("Ana");
  });

  it("envía los datos editables al actualizar el perfil [AC-2]", async () => {
    await updateMyProfile({
      firstName: "Ana",
      lastName: "López",
      maternalLastName: "Vargas",
      ci: "1234567",
      birthDate: "1990-01-01",
      gender: "F",
      phoneNumber: "70000000",
      email: "ana@correo.com",
      avatarUrl: "",
    });

    expect(request).toHaveBeenCalledWith(
      "PUT",
      "/me/profile",
      expect.objectContaining({ first_name: "Ana", phone_number: "70000000", avatar_url: "" }),
    );
  });
});

describe("Recuperación y cambio de contraseña [US-AUTH-02]", () => {
  it("solicita el restablecimiento de contraseña por correo [AC-1]", async () => {
    await requestPasswordReset("ana@correo.com");

    expect(request).toHaveBeenCalledWith("POST", "/auth/forgot-password", { email: "ana@correo.com" });
  });

  it("envía la contraseña actual y la nueva al cambiarla [AC-2]", async () => {
    await changePassword("vieja12345", "nueva12345");

    expect(request).toHaveBeenCalledWith("PUT", "/auth/change-password", {
      current_password: "vieja12345",
      new_password: "nueva12345",
    });
  });
});
