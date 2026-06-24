import type { Result } from "ts-results-es";
import { http } from "@shared/api/http";
import type { HttpError } from "@shared/api/HttpError";
import type { AvailabilitySlot } from "@entities/appointment/model/AvailabilitySlot";

export function getAvailability(
  psychologistId: string,
  date: string,
): Promise<Result<AvailabilitySlot[], HttpError>> {
  return http.request<AvailabilitySlot[]>("GET", `/psychologists/${psychologistId}/availability?date=${date}`);
}
