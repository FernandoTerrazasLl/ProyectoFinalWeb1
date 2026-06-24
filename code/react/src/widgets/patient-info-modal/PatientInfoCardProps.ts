import type { BlockOwnProps } from "@shared/lib/block/BlockOwnProps";
import type { PatientInfo } from "@entities/appointment";

export interface PatientInfoCardProps extends BlockOwnProps {
  info: PatientInfo;
  initial?: string;
  timeLabel?: string;
  ageLabel?: string;
}
