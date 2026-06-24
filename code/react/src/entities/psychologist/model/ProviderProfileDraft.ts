import type { PersonalIdentity } from "@shared/model/PersonalIdentity";

export interface ProviderProfileDraft extends PersonalIdentity {
  avatarUrl: string;
  bio: string;
  sessionPrice: number;
  tags: string[];
  specialty: string;
  officeAddress: string;
}
