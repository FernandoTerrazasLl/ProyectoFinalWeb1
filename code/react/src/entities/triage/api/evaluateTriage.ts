import type { Result } from "ts-results-es";
import { http } from "@shared/api/http";
import type { HttpError } from "@shared/api/HttpError";
import type { TriageScores } from "@entities/triage/model/TriageScores";
import type { TriageResult } from "@entities/triage/model/TriageResult";
import type { TriageEvaluationResponse } from "@entities/triage/api/TriageEvaluationResponse";

export async function evaluateTriage(
  userId: string,
  scores: TriageScores,
): Promise<Result<TriageResult, HttpError>> {
  const result = await http.request<TriageEvaluationResponse>("POST", "/triage/evaluate", {
    user_id: userId,
    scores,
  });

  return result.map((response) => ({
    recommendedSpecialty: response.recommended_specialty,
    riskLevel: response.risk_level,
  }));
}
