import type { BlockOwnProps } from "@shared/lib/block/BlockOwnProps";
import type { ScheduleEntry } from "@entities/appointment";

export interface ScheduleSlotProps extends BlockOwnProps {
  entry: ScheduleEntry;
  onViewInfo: (appointmentId: string) => void;
  onBlock: (time: string) => void;
  onCancel: (appointmentId: string) => void;
  onComplete: (appointmentId: string) => void;
  isReserved?: boolean;
  isFree?: boolean;
  isBlocked?: boolean;
  canCancel?: boolean;
  canComplete?: boolean;
  stateLabel?: string;
  stateClass?: string;
  stateBodyClass?: string;
}
