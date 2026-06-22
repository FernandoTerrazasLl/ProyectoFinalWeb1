import type { Result } from "ts-results-es";
import { http } from "@shared/api/http";
import type { HttpError } from "@shared/api/HttpError";
import type { ProviderProfileDraft } from "@entities/psychologist/model/ProviderProfileDraft";
import type { ProviderProfileResponse } from "@entities/psychologist/api/ProviderProfileResponse";

export async function getMyProviderProfile(): Promise<Result<ProviderProfileDraft, HttpError>> {
  const result = await http.request<ProviderProfileResponse>("GET", "/me/provider-profile");

  return result.map((response) => ({
    bio: response.bio,
    sessionPrice: response.session_price,
    tags: response.tags,
  }));
}
