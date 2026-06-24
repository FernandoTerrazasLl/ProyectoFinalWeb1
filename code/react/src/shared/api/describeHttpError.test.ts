import { describe, expect, it } from "vitest";
import { describeHttpError } from "@shared/api/describeHttpError";

describe("Mensajes de error claros al iniciar sesión o registrarse [US-AUTH-02]", () => {
  it("avisa cuando las credenciales son incorrectas [AC-3]", () => {
    const error = { status: 401, message: "Invalid credentials" };

    const mensaje = describeHttpError(error);

    expect(mensaje).toBe("Correo o contraseña incorrectos.");
  });

  it("avisa cuando el correo ya está registrado [AC-2]", () => {
    const error = { status: 400, message: "Email already registered" };

    const mensaje = describeHttpError(error);

    expect(mensaje).toBe("Ese correo ya está registrado.");
  });

  it("avisa cuando no hay conexión con el servidor", () => {
    const error = { status: 0, message: "network_error" };

    const mensaje = describeHttpError(error);

    expect(mensaje).toBe("No se pudo conectar con el servidor. Revisa tu conexión.");
  });

  it("avisa cuando el servidor falla", () => {
    const error = { status: 500, message: "Internal Server Error" };

    const mensaje = describeHttpError(error);

    expect(mensaje).toBe("Ocurrió un error en el servidor. Inténtalo más tarde.");
  });
});
