import type { Result } from "ts-results-es";
import { http } from "@shared/api/http";
import type { HttpError } from "@shared/api/HttpError";
import type { RegisterUserRequest } from "@entities/user/api/RegisterUserRequest";

export function registerUser(request: RegisterUserRequest): Promise<Result<unknown, HttpError>> {
  return http.request("POST", "/auth/register", {
    email: request.email,
    password: request.password,
    first_name: request.firstName,
    last_name: request.lastName,
    maternal_last_name: request.maternalLastName,
    ci: request.ci,
    birth_date: request.birthDate,
    gender: request.gender,
    phone_number: request.phoneNumber,
    role: "PATIENT",
  });
}
