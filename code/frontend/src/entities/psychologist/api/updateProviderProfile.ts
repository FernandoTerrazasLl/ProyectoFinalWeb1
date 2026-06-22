import type { Result } from "ts-results-es";
import { http } from "@shared/api/http";
import type { HttpError } from "@shared/api/HttpError";
import type { ProviderProfileDraft } from "@entities/psychologist/model/ProviderProfileDraft";

export function updateProviderProfile(draft: ProviderProfileDraft): Promise<Result<unknown, HttpError>> {
  return http.request("PUT", "/me/provider-profile", {
    bio: draft.bio,
    session_price: draft.sessionPrice,
    tags: draft.tags,
  });
}
