import type { Result } from "ts-results-es";
import { http } from "@shared/api/http";
import type { HttpError } from "@shared/api/HttpError";

export function blockSlot(date: string, time: string): Promise<Result<unknown, HttpError>> {
  return http.request("POST", "/me/blocked-slots", { date, time });
}
