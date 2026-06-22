import type { AppointmentState } from "@entities/appointment/model/AppointmentState";

export interface ScheduleEntry {
  appointmentId: string | null;
  time: string;
  state: AppointmentState;
  patientName: string | null;
}
