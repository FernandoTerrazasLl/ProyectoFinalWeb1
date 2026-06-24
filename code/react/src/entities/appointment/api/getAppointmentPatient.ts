import type { Result } from "ts-results-es";
import { http } from "@shared/api/http";
import type { HttpError } from "@shared/api/HttpError";
import type { PatientInfo } from "@entities/appointment/model/PatientInfo";

export function getAppointmentPatient(appointmentId: string): Promise<Result<PatientInfo, HttpError>> {
  return http.request<PatientInfo>("GET", `/appointments/${appointmentId}/patient`);
}
