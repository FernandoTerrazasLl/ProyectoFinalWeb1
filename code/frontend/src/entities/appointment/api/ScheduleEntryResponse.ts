import type { AppointmentState } from "@entities/appointment/model/AppointmentState";

export interface ScheduleEntryResponse {
  appointment_id: string | null;
  time: string;
  state: AppointmentState;
  patient_name: string | null;
}
