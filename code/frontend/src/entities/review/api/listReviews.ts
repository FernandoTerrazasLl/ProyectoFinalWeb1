import type { Result } from "ts-results-es";
import { http } from "@shared/api/http";
import type { HttpError } from "@shared/api/HttpError";
import type { Review } from "@entities/review/model/Review";

export function listReviews(psychologistId: string): Promise<Result<Review[], HttpError>> {
  return http.request<Review[]>("GET", `/psychologists/${psychologistId}/reviews`);
}
