import type { Result } from "ts-results-es";
import { http } from "@shared/api/http";
import type { HttpError } from "@shared/api/HttpError";
import type { Psychologist } from "@entities/psychologist/model/Psychologist";
import type { PsychologistResponse } from "@entities/psychologist/api/PsychologistResponse";
import { toPsychologist } from "@entities/psychologist/api/toPsychologist";

export async function getPsychologist(id: string): Promise<Result<Psychologist, HttpError>> {
  const result = await http.request<PsychologistResponse>("GET", `/psychologists/${id}`);

  return result.map(toPsychologist);
}
