import type { PatientAppointment } from "@entities/appointment/model/PatientAppointment";
import type { PatientAppointmentResponse } from "@entities/appointment/api/PatientAppointmentResponse";

export function toPatientAppointment(response: PatientAppointmentResponse): PatientAppointment {
  return {
    id: response.id,
    providerId: response.provider_id,
    providerName: response.provider_name,
    providerPhone: response.provider_phone,
    providerAddress: response.provider_address,
    date: response.date,
    time: response.time,
    state: response.state,
    reviewable: response.state === "completed",
  };
}
