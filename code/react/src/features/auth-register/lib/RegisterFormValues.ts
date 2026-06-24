import type { RegisterUserRequest } from "@entities/user";

export interface RegisterFormValues extends RegisterUserRequest {
  confirmPassword: string;
}
