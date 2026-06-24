import type { AppointmentState } from "@entities/appointment/model/AppointmentState";
import type { PatientAppointment } from "@entities/appointment/model/PatientAppointment";
import type { PatientAppointmentResponse } from "@entities/appointment/api/PatientAppointmentResponse";

export function toPatientAppointment(response: PatientAppointmentResponse): PatientAppointment {
  const state = response.state.toLowerCase() as AppointmentState;

  return {
    id: response.id,
    providerId: response.provider_id,
    providerName: response.provider_name,
    providerPhone: response.provider_phone,
    providerAddress: response.provider_address,
    providerAvatar: response.provider_avatar || "",
    date: response.date,
    time: response.time,
    state,
    reviewable: state === "completed" && !response.has_reviewed,
  };
}
