import type { BlockOwnProps } from "@shared/lib/block/BlockOwnProps";
import type { Psychologist } from "@entities/psychologist";

export interface PsychologistCardProps extends BlockOwnProps {
  psychologist: Psychologist;
  onOpen: (id: string) => void;
}
