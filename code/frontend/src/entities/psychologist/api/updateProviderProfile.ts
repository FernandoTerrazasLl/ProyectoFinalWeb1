import type { Result } from "ts-results-es";
import { http } from "@shared/api/http";
import type { HttpError } from "@shared/api/HttpError";
import type { ProviderProfileDraft } from "@entities/psychologist/model/ProviderProfileDraft";

export function updateProviderProfile(draft: ProviderProfileDraft): Promise<Result<unknown, HttpError>> {
  return http.request("PUT", "/me/provider-profile", {
    first_name: draft.firstName,
    last_name: draft.lastName,
    maternal_last_name: draft.maternalLastName,
    ci: draft.ci,
    birth_date: draft.birthDate || null,
    gender: draft.gender || null,
    phone_number: draft.phoneNumber,
    email: draft.email || null,
    bio: draft.bio,
    session_price: draft.sessionPrice,
    tags: draft.tags,
    specialty: draft.specialty || null,
    office_address: draft.officeAddress,
  });
}
