import type { AppointmentState } from "@entities/appointment/model/AppointmentState";

export interface Appointment {
  id: string;
  psychologistId: string;
  patientId: string | null;
  date: string;
  time: string;
  state: AppointmentState;
  reason?: string;
}
