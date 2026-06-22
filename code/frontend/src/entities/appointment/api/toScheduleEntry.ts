import type { ScheduleEntry } from "@entities/appointment/model/ScheduleEntry";
import type { ScheduleEntryResponse } from "@entities/appointment/api/ScheduleEntryResponse";

export function toScheduleEntry(response: ScheduleEntryResponse): ScheduleEntry {
  return {
    appointmentId: response.appointment_id,
    time: response.time,
    state: response.state,
    patientName: response.patient_name,
  };
}
