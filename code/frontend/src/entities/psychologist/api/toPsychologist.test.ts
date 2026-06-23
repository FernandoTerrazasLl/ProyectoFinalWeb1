import { describe, expect, it } from "vitest";
import { toPsychologist } from "@entities/psychologist/api/toPsychologist";
import type { PsychologistResponse } from "@entities/psychologist/api/PsychologistResponse";

function buildResponse(overrides: Partial<PsychologistResponse> = {}): PsychologistResponse {
  return {
    id: "1",
    first_name: "Ana",
    last_name: "López",
    specialty: "Psicología Clínica",
    bio: "Bio de prueba",
    session_price: 250,
    average_rating: 4.5,
    review_count: 12,
    is_approved: true,
    ...overrides,
  };
}

describe("Tarjeta del catálogo de especialistas [US-API-01]", () => {
  it("arma el nombre completo a partir de nombre y apellido [AC-2]", () => {
    const response = buildResponse();

    const psicologo = toPsychologist(response);

    expect(psicologo.name).toBe("Ana López");
  });

  it("expone especialidad, costo por sesión y calificación para la tarjeta [AC-2]", () => {
    const response = buildResponse();

    const psicologo = toPsychologist(response);

    expect(psicologo.specialty).toBe("Psicología Clínica");
    expect(psicologo.rate).toBe(250);
    expect(psicologo.rating).toBe(4.5);
  });

  it("usa especialidad vacía cuando el backend no envía ninguna [AC-2]", () => {
    const response = buildResponse({ specialty: null });

    const psicologo = toPsychologist(response);

    expect(psicologo.specialty).toBe("");
  });
});
