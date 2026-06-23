import { Ok, type Result } from "ts-results-es";
import { http } from "@shared/api/http";
import type { HttpError } from "@shared/api/HttpError";
import type { Psychologist } from "@entities/psychologist/model/Psychologist";
import type { PsychologistQuery } from "@entities/psychologist/api/PsychologistQuery";
import type { PsychologistResponse } from "@entities/psychologist/api/PsychologistResponse";
import { toPsychologist } from "@entities/psychologist/api/toPsychologist";

const cache = new Map<string, Psychologist[]>();

export async function listPsychologists(
  query: PsychologistQuery = {},
  signal?: AbortSignal,
): Promise<Result<Psychologist[], HttpError>> {
  const params = new URLSearchParams();

  if (query.q)
    params.set("q", query.q);
  if (query.specialty)
    params.set("specialty", query.specialty);
  if (query.maxRate !== undefined)
    params.set("maxRate", String(query.maxRate));
  if (query.skip !== undefined)
    params.set("skip", String(query.skip));
  if (query.limit !== undefined)
    params.set("limit", String(query.limit));

  const search = params.toString();
  const cached = cache.get(search);

  if (cached)
    return Ok(cached);

  const result = await http.request<PsychologistResponse[]>(
    "GET",
    `/psychologists/${search ? `?${search}` : ""}`,
    undefined,
    signal,
  );

  return result.map((responses) => {
    const psychologists = responses.map(toPsychologist);
    cache.set(search, psychologists);

    return psychologists;
  });
}
