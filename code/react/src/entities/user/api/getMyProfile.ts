import type { Result } from "ts-results-es";
import { http } from "@shared/api/http";
import type { HttpError } from "@shared/api/HttpError";
import type { MyProfileResponse } from "@entities/user/api/MyProfileResponse";
import type { PatientProfileDraft } from "@entities/user/model/PatientProfileDraft";
import { toPatientProfileDraft } from "@entities/user/api/toPatientProfileDraft";

export async function getMyProfile(): Promise<Result<PatientProfileDraft, HttpError>> {
  const result = await http.request<MyProfileResponse>("GET", "/me/profile");
  return result.map(toPatientProfileDraft);
}
