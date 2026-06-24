import type { BlockOwnProps } from "@shared/lib/block/BlockOwnProps";

export interface BookAppointmentFormProps extends BlockOwnProps {
  psychologistId: string;
  onBooked: () => void;
  error?: string;
  submitted?: boolean;
}
