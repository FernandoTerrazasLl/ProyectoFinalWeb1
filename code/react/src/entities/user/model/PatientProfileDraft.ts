import type { PersonalIdentity } from "@shared/model/PersonalIdentity";

export interface PatientProfileDraft extends PersonalIdentity {
  avatarUrl: string;
}
