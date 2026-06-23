import { describe, expect, it } from "vitest";
import { formatTimeLabel } from "@entities/appointment/lib/formatTimeLabel";

describe("Formato de horario disponible [US-BKG-01]", () => {
  it("convierte una hora de la mañana a formato AM [AC-1]", () => {
    const hora = "08:00";

    const etiqueta = formatTimeLabel(hora);

    expect(etiqueta).toBe("08:00 AM");
  });

  it("convierte una hora de la tarde a formato PM [AC-1]", () => {
    const hora = "14:00";

    const etiqueta = formatTimeLabel(hora);

    expect(etiqueta).toBe("02:00 PM");
  });

  it("muestra el mediodía como 12:00 PM [AC-1]", () => {
    const hora = "12:00";

    const etiqueta = formatTimeLabel(hora);

    expect(etiqueta).toBe("12:00 PM");
  });

  it("muestra la medianoche como 12:00 AM [AC-1]", () => {
    const hora = "00:00";

    const etiqueta = formatTimeLabel(hora);

    expect(etiqueta).toBe("12:00 AM");
  });
});
