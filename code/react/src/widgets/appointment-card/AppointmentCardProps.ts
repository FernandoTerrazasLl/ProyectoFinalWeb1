import type { BlockOwnProps } from "@shared/lib/block/BlockOwnProps";
import type { PatientAppointment } from "@entities/appointment";

export interface AppointmentCardProps extends BlockOwnProps {
  appointment: PatientAppointment;
  onReview: (appointment: PatientAppointment) => void;
  onCancel: (appointment: PatientAppointment) => void;
  onBookAgain: (appointment: PatientAppointment) => void;
  stateLabel?: string;
  stateTone?: "neutral" | "success" | "warning" | "danger";
  canCancel?: boolean;
  canBookAgain?: boolean;
  dateLabel?: string;
}
