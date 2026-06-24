import type { Result } from "ts-results-es";
import { http } from "@shared/api/http";
import type { HttpError } from "@shared/api/HttpError";

export function changePassword(currentPassword: string, newPassword: string): Promise<Result<unknown, HttpError>> {
  return http.request("PUT", "/auth/change-password", {
    current_password: currentPassword,
    new_password: newPassword,
  });
}
