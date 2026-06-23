import type { Psychologist } from "@entities/psychologist/model/Psychologist";
import type { PsychologistResponse } from "@entities/psychologist/api/PsychologistResponse";

export function toPsychologist(response: PsychologistResponse): Psychologist {
  return {
    id: response.id,
    name: `${response.first_name} ${response.last_name}`.trim(),
    specialty: response.specialty ?? "",
    rate: response.session_price,
    rating: response.average_rating,
    reviewsCount: response.review_count,
    tags: response.tags ?? [],
    image: response.avatar_url ?? "",
    bio: response.bio,
    active: response.is_approved,
  };
}
