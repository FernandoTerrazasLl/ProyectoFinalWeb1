import type { Result } from "ts-results-es";
import { http } from "@shared/api/http";
import type { HttpError } from "@shared/api/HttpError";
import type { Psychologist } from "@entities/psychologist/model/Psychologist";
import type { PsychologistQuery } from "@entities/psychologist/api/PsychologistQuery";
import type { PsychologistResponse } from "@entities/psychologist/api/PsychologistResponse";
import { toPsychologist } from "@entities/psychologist/api/toPsychologist";

export async function listPsychologists(
  query: PsychologistQuery = {},
): Promise<Result<Psychologist[], HttpError>> {
  const params = new URLSearchParams();

  if (query.q)
    params.set("q", query.q);
  if (query.specialty)
    params.set("specialty", query.specialty);
  if (query.maxRate !== undefined)
    params.set("maxRate", String(query.maxRate));

  const search = params.toString();
  const result = await http.request<PsychologistResponse[]>(
    "GET",
    `/psychologists/${search ? `?${search}` : ""}`,
  );

  return result.map((responses) => responses.map(toPsychologist));
}
