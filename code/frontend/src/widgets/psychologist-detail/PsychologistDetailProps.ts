import type { BlockOwnProps } from "@shared/lib/block/BlockOwnProps";
import type { Psychologist } from "@entities/psychologist";

export interface PsychologistDetailProps extends BlockOwnProps {
  psychologist: Psychologist;
}
