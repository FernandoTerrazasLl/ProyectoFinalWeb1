import type { Result } from "ts-results-es";
import { http } from "@shared/api/http";
import type { HttpError } from "@shared/api/HttpError";
import type { Specialty } from "@entities/specialty/model/Specialty";
import type { SpecialtyResponse } from "@entities/specialty/api/SpecialtyResponse";

export async function listSpecialties(): Promise<Result<Specialty[], HttpError>> {
  const result = await http.request<SpecialtyResponse[]>("GET", "/specialties/");

  return result.map((responses) =>
    responses.map((response) => ({ id: response.id, name: response.name, active: true })),
  );
}
