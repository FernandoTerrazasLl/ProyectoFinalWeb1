import type { BlockOwnProps } from "@shared/lib/block/BlockOwnProps";
import type { AvailabilitySlot } from "@entities/appointment";

export interface BookingCalendarProps extends BlockOwnProps {
  psychologistId: string;
  onSelectSlot: (date: string, time: string) => void;
  date?: string;
  slots?: AvailabilitySlot[];
  loading?: boolean;
}
