import type { Result } from "ts-results-es";
import { http } from "@shared/api/http";
import type { HttpError } from "@shared/api/HttpError";
import type { RegisterUserRequest } from "@entities/user/api/RegisterUserRequest";

export function registerUser(request: RegisterUserRequest): Promise<Result<unknown, HttpError>> {
  const [firstName, ...lastNameParts] = request.name.trim().split(" ");

  return http.request("POST", "/auth/register", {
    email: request.email,
    password: request.password,
    first_name: firstName,
    last_name: lastNameParts.join(" "),
    role: "PATIENT",
  });
}
