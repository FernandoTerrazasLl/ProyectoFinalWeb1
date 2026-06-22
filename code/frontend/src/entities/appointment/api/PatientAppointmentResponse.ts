import type { AppointmentState } from "@entities/appointment/model/AppointmentState";

export interface PatientAppointmentResponse {
  id: string;
  provider_id: string;
  provider_name: string;
  provider_phone: string;
  provider_address: string;
  date: string;
  time: string;
  state: AppointmentState;
}
