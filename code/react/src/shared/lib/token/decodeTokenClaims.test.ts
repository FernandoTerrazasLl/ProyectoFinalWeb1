import { describe, expect, it } from "vitest";
import { decodeTokenClaims } from "@shared/lib/token/decodeTokenClaims";

function tokenFor(payload: object): string {
  return `header.${btoa(JSON.stringify(payload))}.signature`;
}

describe("Decodificación de los claims del token [US-AUTH-02]", () => {
  it("extrae el sujeto y el rol de un token válido [AC-1]", () => {
    const token = tokenFor({ sub: "ana@correo.com", role: "PATIENT" });

    const claims = decodeTokenClaims(token);

    expect(claims?.sub).toBe("ana@correo.com");
    expect(claims?.role).toBe("PATIENT");
  });

  it("devuelve null cuando el token no tiene segmento de payload [AC-2]", () => {
    const claims = decodeTokenClaims("sin-puntos");

    expect(claims).toBeNull();
  });

  it("devuelve null cuando el payload no es JSON válido [AC-2]", () => {
    const claims = decodeTokenClaims("header.@@@@.signature");

    expect(claims).toBeNull();
  });
});
