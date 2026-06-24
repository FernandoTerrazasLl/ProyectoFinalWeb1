import type { Result } from "ts-results-es";
import { http } from "@shared/api/http";
import type { HttpError } from "@shared/api/HttpError";
import type { ScheduleRule } from "@entities/appointment/model/ScheduleRule";

export function updateScheduleRules(rules: ScheduleRule[]): Promise<Result<unknown, HttpError>> {
  return http.request("POST", "/me/schedule-rules", rules.map((rule) => ({
    day_of_week: rule.dayOfWeek,
    start_time: rule.startTime,
    end_time: rule.endTime,
  })));
}
