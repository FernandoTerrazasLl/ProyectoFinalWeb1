import type { Result } from "ts-results-es";
import { http } from "@shared/api/http";
import type { HttpError } from "@shared/api/HttpError";

export function requestPasswordReset(email: string): Promise<Result<unknown, HttpError>> {
  return http.request("POST", "/auth/forgot-password", { email });
}
