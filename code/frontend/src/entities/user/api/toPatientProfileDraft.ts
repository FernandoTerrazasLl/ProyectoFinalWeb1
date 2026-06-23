import type { MyProfileResponse } from "@entities/user/api/MyProfileResponse";
import type { PatientProfileDraft } from "@entities/user/model/PatientProfileDraft";

export function toPatientProfileDraft(response: MyProfileResponse): PatientProfileDraft {
  return {
    firstName: response.first_name,
    lastName: response.last_name,
    maternalLastName: response.maternal_last_name,
    ci: response.ci,
    birthDate: response.birth_date,
    gender: response.gender,
    phoneNumber: response.phone_number,
    email: response.email,
  };
}
