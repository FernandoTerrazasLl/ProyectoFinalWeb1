import type { Result } from "ts-results-es";
import { http } from "@shared/api/http";
import type { HttpError } from "@shared/api/HttpError";
import type { ScheduleEntry } from "@entities/appointment/model/ScheduleEntry";
import type { ScheduleEntryResponse } from "@entities/appointment/api/ScheduleEntryResponse";
import { toScheduleEntry } from "@entities/appointment/api/toScheduleEntry";

export async function getProviderSchedule(date: string): Promise<Result<ScheduleEntry[], HttpError>> {
  const result = await http.request<ScheduleEntryResponse[]>("GET", `/me/schedule?date=${date}`);
  return result.map((responses) => responses.map(toScheduleEntry));
}
