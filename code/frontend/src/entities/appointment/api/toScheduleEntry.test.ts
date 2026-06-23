import { describe, expect, it } from "vitest";
import { toScheduleEntry } from "@entities/appointment/api/toScheduleEntry";
import type { ScheduleEntryResponse } from "@entities/appointment/api/ScheduleEntryResponse";

function buildResponse(overrides: Partial<ScheduleEntryResponse> = {}): ScheduleEntryResponse {
  return {
    appointment_id: null,
    time: "08:00",
    state: "AVAILABLE",
    patient_name: null,
    ...overrides,
  };
}

describe("Entrada de la agenda del psicólogo [US-BKG-03]", () => {
  it("convierte el estado del backend a minúsculas [AC-1]", () => {
    const response = buildResponse({ state: "COMPLETED" });

    const entrada = toScheduleEntry(response);

    expect(entrada.state).toBe("completed");
  });

  it("conserva la hora del turno y el nombre del paciente [AC-1]", () => {
    const response = buildResponse({ time: "09:00", patient_name: "Mariana Rios" });

    const entrada = toScheduleEntry(response);

    expect(entrada.time).toBe("09:00");
    expect(entrada.patientName).toBe("Mariana Rios");
  });

  it("permite un turno libre sin id de cita ni paciente [AC-1]", () => {
    const response = buildResponse();

    const entrada = toScheduleEntry(response);

    expect(entrada.appointmentId).toBeNull();
    expect(entrada.patientName).toBeNull();
  });
});
