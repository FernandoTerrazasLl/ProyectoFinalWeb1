import type { Result } from "ts-results-es";
import { http } from "@shared/api/http";
import type { HttpError } from "@shared/api/HttpError";
import type { ProviderProfileDraft } from "@entities/psychologist/model/ProviderProfileDraft";
import type { ProviderProfileResponse } from "@entities/psychologist/api/ProviderProfileResponse";

export async function getMyProviderProfile(): Promise<Result<ProviderProfileDraft, HttpError>> {
  const result = await http.request<ProviderProfileResponse>("GET", "/me/provider-profile");

  return result.map((response) => ({
    firstName: response.first_name,
    lastName: response.last_name,
    maternalLastName: response.maternal_last_name,
    ci: response.ci,
    birthDate: response.birth_date ?? "",
    gender: response.gender ?? "",
    phoneNumber: response.phone_number,
    email: response.email ?? "",
    avatarUrl: response.avatar_url ?? "",
    bio: response.bio,
    sessionPrice: response.session_price,
    tags: response.tags,
    specialty: response.specialty ?? "",
    officeAddress: response.office_address,
  }));
}
