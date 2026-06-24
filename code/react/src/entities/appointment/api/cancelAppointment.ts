import type { Result } from "ts-results-es";
import { http } from "@shared/api/http";
import type { HttpError } from "@shared/api/HttpError";

export function cancelAppointment(appointmentId: string): Promise<Result<unknown, HttpError>> {
  return http.request("PATCH", `/appointments/${appointmentId}/cancel`);
}
