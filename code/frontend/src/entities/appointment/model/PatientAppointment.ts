import type { AppointmentState } from "@entities/appointment/model/AppointmentState";

export interface PatientAppointment {
  id: string;
  providerId: string;
  providerName: string;
  providerPhone: string;
  providerAddress: string;
  providerAvatar?: string;
  date: string;
  time: string;
  state: AppointmentState;
  reviewable: boolean;
}
