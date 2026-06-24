export const APPOINTMENT_STATES = [
  "available",
  "pending",
  "confirmed",
  "completed",
  "blocked",
  "cancelled",
] as const;

export type AppointmentState = (typeof APPOINTMENT_STATES)[number];
