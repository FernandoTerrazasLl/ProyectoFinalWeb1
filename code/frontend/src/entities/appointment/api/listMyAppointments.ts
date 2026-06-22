import type { Result } from "ts-results-es";
import { http } from "@shared/api/http";
import type { HttpError } from "@shared/api/HttpError";
import type { PatientAppointment } from "@entities/appointment/model/PatientAppointment";
import type { PatientAppointmentResponse } from "@entities/appointment/api/PatientAppointmentResponse";
import { toPatientAppointment } from "@entities/appointment/api/toPatientAppointment";

export async function listMyAppointments(): Promise<Result<PatientAppointment[], HttpError>> {
  const result = await http.request<PatientAppointmentResponse[]>("GET", "/me/appointments");
  return result.map((responses) => responses.map(toPatientAppointment));
}
