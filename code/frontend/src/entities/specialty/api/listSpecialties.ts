import type { Result } from "ts-results-es";
import { http } from "@shared/api/http";
import type { HttpError } from "@shared/api/HttpError";
import type { Specialty } from "@entities/specialty/model/Specialty";

export function listSpecialties(): Promise<Result<Specialty[], HttpError>> {
  return http.request<Specialty[]>("GET", "/specialties");
}
