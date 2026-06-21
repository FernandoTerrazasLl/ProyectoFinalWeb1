export interface PsychologistResponse {
  id: string;
  first_name: string;
  last_name: string;
  specialty: string | null;
  session_price: number;
  bio: string;
  is_approved: boolean;
  average_rating: number;
  review_count: number;
}
