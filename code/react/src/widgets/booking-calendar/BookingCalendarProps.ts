import type { BlockOwnProps } from "@shared/lib/block/BlockOwnProps";
import type { AvailabilitySlot } from "@entities/appointment";

export interface BookingCalendarProps extends BlockOwnProps {
  psychologistId: string;
  onSelectSlot: (date: string, time: string) => void;
  date?: string;
  min?: string;
  dateLabel?: string;
  slots?: Array<AvailabilitySlot & { label: string }>;
  loading?: boolean;
}
