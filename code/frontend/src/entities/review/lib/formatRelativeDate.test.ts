import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { formatRelativeDate } from "@entities/review/lib/formatRelativeDate";

const NOW = new Date("2026-06-23T12:00:00.000Z");

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

function daysAgo(days: number): string {
  return new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
}

describe("Antigüedad de una reseña [US-UGC-02]", () => {
  it("muestra 'Hoy' para una reseña del mismo día [AC-1]", () => {
    const fecha = daysAgo(0);

    const etiqueta = formatRelativeDate(fecha);

    expect(etiqueta).toBe("Hoy");
  });

  it("muestra 'Ayer' para una reseña del día anterior [AC-1]", () => {
    const fecha = daysAgo(1);

    const etiqueta = formatRelativeDate(fecha);

    expect(etiqueta).toBe("Ayer");
  });

  it("muestra 'Ayer' por calendario aunque hayan pasado menos de 24 horas [AC-1]", () => {
    const fecha = "2026-06-22T23:30:00-04:00";

    const etiqueta = formatRelativeDate(fecha);

    expect(etiqueta).toBe("Ayer");
  });

  it("muestra días en plural antes de la semana [AC-1]", () => {
    const fecha = daysAgo(3);

    const etiqueta = formatRelativeDate(fecha);

    expect(etiqueta).toBe("Hace 3 días");
  });

  it("muestra 'Hace 1 semana' en singular [AC-1]", () => {
    const fecha = daysAgo(7);

    const etiqueta = formatRelativeDate(fecha);

    expect(etiqueta).toBe("Hace 1 semana");
  });

  it("muestra semanas en plural antes del mes [AC-1]", () => {
    const fecha = daysAgo(14);

    const etiqueta = formatRelativeDate(fecha);

    expect(etiqueta).toBe("Hace 2 semanas");
  });

  it("muestra meses en plural antes del año [AC-1]", () => {
    const fecha = daysAgo(60);

    const etiqueta = formatRelativeDate(fecha);

    expect(etiqueta).toBe("Hace 2 meses");
  });

  it("muestra años en plural para reseñas muy antiguas [AC-1]", () => {
    const fecha = daysAgo(800);

    const etiqueta = formatRelativeDate(fecha);

    expect(etiqueta).toBe("Hace 2 años");
  });
});
