import { beforeEach, describe, expect, it, vi } from "vitest";
import { Ok } from "ts-results-es";
import { http } from "@shared/api/http";
import { blockSlot } from "@entities/appointment/api/blockSlot";
import { bookAppointment } from "@entities/appointment/api/bookAppointment";
import { cancelAppointment } from "@entities/appointment/api/cancelAppointment";
import { completeAppointment } from "@entities/appointment/api/completeAppointment";
import { getAppointmentPatient } from "@entities/appointment/api/getAppointmentPatient";
import { getAvailability } from "@entities/appointment/api/getAvailability";
import { getProviderSchedule } from "@entities/appointment/api/getProviderSchedule";
import { getScheduleRules } from "@entities/appointment/api/getScheduleRules";
import { listMyAppointments } from "@entities/appointment/api/listMyAppointments";
import { updateScheduleRules } from "@entities/appointment/api/updateScheduleRules";

vi.mock("@shared/api/http", () => ({ http: { request: vi.fn() } }));

const request = vi.mocked(http.request);

beforeEach(() => {
  request.mockReset();
  request.mockResolvedValue(Ok(undefined));
});

describe("Bloqueo de un horario de la agenda [US-BKG-03]", () => {
  it("envía la excepción de tipo BLOCKED al endpoint correcto [AC-1]", async () => {
    await blockSlot("2026-06-23", "08:00");

    expect(request).toHaveBeenCalledWith("POST", "/me/exceptions", {
      date: "2026-06-23",
      time: "08:00",
      exception_type: "BLOCKED",
    });
  });
});

describe("Reserva de una cita [US-BKG-02]", () => {
  it("envía proveedor, fecha, hora y motivo en el cuerpo [AC-1]", async () => {
    await bookAppointment({ psychologistId: "p1", date: "2026-06-23", time: "08:00", reason: "Ansiedad" });

    expect(request).toHaveBeenCalledWith("POST", "/appointments/", {
      provider_id: "p1",
      date: "2026-06-23",
      time: "08:00",
      reason: "Ansiedad",
    });
  });
});

describe("Cambios de estado de una cita [US-BKG-02]", () => {
  it("cancela la cita con un PATCH a la ruta de cancelación [AC-1]", async () => {
    await cancelAppointment("a1");

    expect(request).toHaveBeenCalledWith("PATCH", "/appointments/a1/cancel");
  });

  it("completa la cita con un PATCH a la ruta de completado [AC-1]", async () => {
    await completeAppointment("a1");

    expect(request).toHaveBeenCalledWith("PATCH", "/appointments/a1/complete");
  });
});

describe("Disponibilidad horaria del psicólogo [US-BKG-01]", () => {
  it("consulta la disponibilidad por fecha [AC-1]", async () => {
    await getAvailability("p1", "2026-06-23");

    expect(request).toHaveBeenCalledWith("GET", "/psychologists/p1/availability?date=2026-06-23");
  });

  it("consulta las reglas recurrentes de agenda [AC-2]", async () => {
    request.mockResolvedValue(Ok([]));

    await getScheduleRules();

    expect(request).toHaveBeenCalledWith("GET", "/me/schedule-rules");
  });

  it("guarda las reglas recurrentes con snake_case [AC-3]", async () => {
    await updateScheduleRules([{ dayOfWeek: 1, startTime: "08:00", endTime: "09:00" }]);

    expect(request).toHaveBeenCalledWith("POST", "/me/schedule-rules", [
      { day_of_week: 1, start_time: "08:00", end_time: "09:00" },
    ]);
  });
});

describe("Expediente del paciente de una cita [US-BKG-04]", () => {
  it("pide la información del paciente de la cita [AC-1]", async () => {
    await getAppointmentPatient("a1");

    expect(request).toHaveBeenCalledWith("GET", "/appointments/a1/patient");
  });
});

describe("Agenda del día del psicólogo [US-BKG-03]", () => {
  it("transforma cada entrada del backend al modelo de la agenda [AC-1]", async () => {
    request.mockResolvedValue(
      Ok([{ appointment_id: "a1", time: "08:00", state: "COMPLETED", patient_name: "Mariana Rios" }]),
    );

    const result = await getProviderSchedule("2026-06-23");

    expect(request).toHaveBeenCalledWith("GET", "/me/schedule?date=2026-06-23");
    expect(result.unwrap()[0]?.state).toBe("completed");
    expect(result.unwrap()[0]?.patientName).toBe("Mariana Rios");
  });
});

describe("Listado de citas del paciente [US-BKG-02]", () => {
  it("marca como reseñable solo las citas completadas [AC-1]", async () => {
    request.mockResolvedValue(
      Ok([
        {
          id: "a1",
          provider_id: "p1",
          provider_name: "Carlos Vega",
          provider_phone: "70000000",
          provider_address: "Zona Sur",
          date: "2026-06-21",
          time: "09:00",
          state: "COMPLETED",
        },
      ]),
    );

    const result = await listMyAppointments();

    expect(request).toHaveBeenCalledWith("GET", "/me/appointments");
    expect(result.unwrap()[0]?.reviewable).toBe(true);
  });
});
