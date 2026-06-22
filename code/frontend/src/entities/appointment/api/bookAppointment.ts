import type { Result } from "ts-results-es";
import { http } from "@shared/api/http";
import type { HttpError } from "@shared/api/HttpError";
import type { BookAppointmentRequest } from "@entities/appointment/api/BookAppointmentRequest";

export function bookAppointment(request: BookAppointmentRequest): Promise<Result<unknown, HttpError>> {
  return http.request("POST", "/appointments", {
    provider_id: request.psychologistId,
    date: request.date,
    time: request.time,
    reason: request.reason,
  });
}
