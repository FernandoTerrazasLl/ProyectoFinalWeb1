import type { PersonalIdentity } from "@shared/model/PersonalIdentity";

export interface RegisterUserRequest extends PersonalIdentity {
  password: string;
}
