import type { BlockOwnProps } from "@shared/lib/block/BlockOwnProps";
import type { PatientAppointment } from "@entities/appointment";

export interface AppointmentCardProps extends BlockOwnProps {
  appointment: PatientAppointment;
  onReview: (appointment: PatientAppointment) => void;
  stateLabel?: string;
}
