export const APPOINTMENT_STATES = [
  "available",
  "pending",
  "completed",
  "blocked",
  "cancelled",
] as const;

export type AppointmentState = (typeof APPOINTMENT_STATES)[number];
