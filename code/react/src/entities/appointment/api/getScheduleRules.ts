import type { Result } from "ts-results-es";
import { http } from "@shared/api/http";
import type { HttpError } from "@shared/api/HttpError";
import type { ScheduleRule } from "@entities/appointment/model/ScheduleRule";
import type { ScheduleRuleResponse } from "@entities/appointment/api/ScheduleRuleResponse";

function toScheduleRule(response: ScheduleRuleResponse): ScheduleRule {
  return {
    id: response.id,
    dayOfWeek: response.day_of_week,
    startTime: response.start_time.slice(0, 5),
    endTime: response.end_time.slice(0, 5),
  };
}

export async function getScheduleRules(): Promise<Result<ScheduleRule[], HttpError>> {
  const result = await http.request<ScheduleRuleResponse[]>("GET", "/me/schedule-rules");

  return result.map((responses) => responses.map(toScheduleRule));
}
