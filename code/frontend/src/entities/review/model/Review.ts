export interface Review {
  id: string;
  psychologistId: string;
  appointmentId: string;
  rating: number;
  text: string;
  date: string;
  verified: boolean;
}
