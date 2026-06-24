import { beforeEach, describe, expect, it, vi } from "vitest";
import { Ok } from "ts-results-es";
import { http } from "@shared/api/http";
import { listSpecialties } from "@entities/specialty/api/listSpecialties";

vi.mock("@shared/api/http", () => ({ http: { request: vi.fn() } }));

const request = vi.mocked(http.request);

beforeEach(() => {
  request.mockReset();
});

describe("Catálogo de especialidades clínicas [US-API-03]", () => {
  it("pide las especialidades al endpoint correcto [AC-1]", async () => {
    request.mockResolvedValue(Ok([]));

    await listSpecialties();

    expect(request).toHaveBeenCalledWith("GET", "/specialties/");
  });

  it("marca cada especialidad como activa al transformarla [AC-2]", async () => {
    request.mockResolvedValue(Ok([{ id: "s1", name: "Psicologia Clinica" }]));

    const result = await listSpecialties();

    expect(result.unwrap()[0]).toEqual({ id: "s1", name: "Psicologia Clinica", active: true });
  });
});
