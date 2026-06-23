import { describe, expect, it } from "vitest";
import { toPatientAppointment } from "@entities/appointment/api/toPatientAppointment";
import type { PatientAppointmentResponse } from "@entities/appointment/api/PatientAppointmentResponse";

function buildResponse(overrides: Partial<PatientAppointmentResponse> = {}): PatientAppointmentResponse {
  return {
    id: "1",
    provider_id: "p1",
    provider_name: "Dra. Pérez",
    provider_phone: "70000000",
    provider_address: "Calle Falsa 123",
    date: "2026-06-22",
    time: "10:00",
    state: "PENDING",
    ...overrides,
  };
}

describe("Mis citas con dirección y teléfono [US-BKG-02]", () => {
  it("expone la dirección y el teléfono del profesional en la cita [AC-3]", () => {
    const response = buildResponse();

    const cita = toPatientAppointment(response);

    expect(cita.providerAddress).toBe("Calle Falsa 123");
    expect(cita.providerPhone).toBe("70000000");
  });

  it("normaliza el estado a minúsculas sin importar el casing del backend [AC-3]", () => {
    const response = buildResponse({ state: "CANCELLED" });

    const cita = toPatientAppointment(response);

    expect(cita.state).toBe("cancelled");
  });
});

describe("Reseña solo de citas finalizadas [US-UGC-01]", () => {
  it("permite reseñar cuando la cita ya fue completada [AC-1]", () => {
    const response = buildResponse({ state: "COMPLETED" });

    const cita = toPatientAppointment(response);

    expect(cita.reviewable).toBe(true);
  });

  it("no permite reseñar cuando la atención todavía no ocurrió [AC-3]", () => {
    const response = buildResponse({ state: "PENDING" });

    const cita = toPatientAppointment(response);

    expect(cita.reviewable).toBe(false);
  });
});
