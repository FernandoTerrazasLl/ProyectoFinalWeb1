import { beforeEach, describe, expect, it, vi } from "vitest";
import { Ok } from "ts-results-es";
import { http } from "@shared/api/http";
import { evaluateTriage } from "@entities/triage/api/evaluateTriage";

vi.mock("@shared/api/http", () => ({ http: { request: vi.fn() } }));

const request = vi.mocked(http.request);

beforeEach(() => {
  request.mockReset();
});

describe("Evaluación del triage [US-TRG-04]", () => {
  it("envía el usuario y los puntajes al endpoint de evaluación [AC-1]", async () => {
    request.mockResolvedValue(Ok({ recommended_specialty: "Psicologia Clinica", risk_level: "medio" }));
    const scores = { clinica: 3, pareja: 0, laboral: 1, infantil: 0 };

    await evaluateTriage("u1", scores);

    expect(request).toHaveBeenCalledWith("POST", "/triage/evaluate", { user_id: "u1", scores });
  });

  it("transforma la respuesta a especialidad recomendada y nivel de riesgo [AC-2]", async () => {
    request.mockResolvedValue(Ok({ recommended_specialty: "Psicologia Clinica", risk_level: "alto" }));

    const result = await evaluateTriage("u1", { clinica: 5, pareja: 0, laboral: 0, infantil: 0 });

    expect(result.unwrap()).toEqual({ recommendedSpecialty: "Psicologia Clinica", riskLevel: "alto" });
  });
});
