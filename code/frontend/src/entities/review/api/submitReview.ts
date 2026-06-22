import type { Result } from "ts-results-es";
import { http } from "@shared/api/http";
import type { HttpError } from "@shared/api/HttpError";
import type { SubmitReviewRequest } from "@entities/review/api/SubmitReviewRequest";

export function submitReview(request: SubmitReviewRequest): Promise<Result<unknown, HttpError>> {
  return http.request("POST", "/ugc/reviews", {
    provider_id: request.providerId,
    user_id: request.userId,
    rating: request.rating,
    comment: request.comment,
  });
}
