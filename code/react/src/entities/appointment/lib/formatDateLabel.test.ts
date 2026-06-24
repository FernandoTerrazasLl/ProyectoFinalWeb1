import { describe, expect, it } from "vitest";
import { formatDateLabel } from "@entities/appointment/lib/formatDateLabel";

describe("Formato de fecha del selector de turnos [US-BKG-01]", () => {
  it("arma el día de la semana y el mes en español [AC-1]", () => {
    const fecha = "2026-06-23";

    const etiqueta = formatDateLabel(fecha);

    expect(etiqueta).toBe("Martes, 23 de junio");
  });

  it("capitaliza la primera letra del día de la semana [AC-1]", () => {
    const fecha = "2026-12-25";

    const etiqueta = formatDateLabel(fecha);

    expect(etiqueta.charAt(0)).toBe(etiqueta.charAt(0).toUpperCase());
  });
});
