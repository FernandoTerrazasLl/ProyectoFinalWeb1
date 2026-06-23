export interface ProviderProfileResponse {
  first_name: string;
  last_name: string;
  maternal_last_name: string;
  ci: string;
  birth_date: string | null;
  gender: string | null;
  phone_number: string;
  email?: string;
  bio: string;
  session_price: number;
  tags: string[];
  specialty: string | null;
  office_address: string;
}
