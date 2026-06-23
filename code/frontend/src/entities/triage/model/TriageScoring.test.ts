import { describe, expect, it } from "vitest";
import { TriageScoring } from "@entities/triage/model/TriageScoring";

describe("Análisis inteligente de respuestas [US-TRG-03]", () => {
  it("suma de forma invisible los puntos hacia cada rama [AC-1]", () => {
    const scoring = new TriageScoring();

    scoring.add({ clinica: 3 });
    scoring.add({ clinica: 2, laboral: 1 });

    expect(scoring.total()).toEqual({ clinica: 5, pareja: 0, laboral: 1, infantil: 0 });
  });

  it("acumula la rama con mayor puntaje para sugerir la especialidad ganadora [AC-2]", () => {
    const scoring = new TriageScoring();

    scoring.add({ pareja: 3 });
    scoring.add({ pareja: 2 });
    scoring.add({ clinica: 2 });

    const total = scoring.total();

    expect(total.pareja).toBeGreaterThan(total.clinica);
  });

  it("arranca en cero sin respuestas previas", () => {
    const scoring = new TriageScoring();

    const total = scoring.total();

    expect(total).toEqual({ clinica: 0, pareja: 0, laboral: 0, infantil: 0 });
  });
});
