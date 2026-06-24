import type { Result } from "ts-results-es";
import { http } from "@shared/api/http";
import type { HttpError } from "@shared/api/HttpError";
import type { PatientProfileDraft } from "@entities/user/model/PatientProfileDraft";

export function updateMyProfile(draft: PatientProfileDraft): Promise<Result<unknown, HttpError>> {
  return http.request("PUT", "/me/profile", {
    first_name: draft.firstName,
    last_name: draft.lastName,
    maternal_last_name: draft.maternalLastName,
    ci: draft.ci,
    birth_date: draft.birthDate,
    gender: draft.gender,
    phone_number: draft.phoneNumber,
    avatar_url: draft.avatarUrl,
  });
}
