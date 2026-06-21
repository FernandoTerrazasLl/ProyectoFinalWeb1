import type { Result } from "ts-results-es";
import { http } from "@shared/api/http";
import type { HttpError } from "@shared/api/HttpError";
import type { Psychologist } from "@entities/psychologist/model/Psychologist";

export function getPsychologist(id: string): Promise<Result<Psychologist, HttpError>> {
  return http.request<Psychologist>("GET", `/psychologists/${id}`);
}
