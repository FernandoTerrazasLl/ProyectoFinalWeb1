import type { BlockOwnProps } from "@shared/lib/block/BlockOwnProps";
import type { SelectOption } from "@shared/ui/Select/SelectOption";
import type { PsychologistQuery } from "@entities/psychologist";

export interface FiltersPanelProps extends BlockOwnProps {
  specialtyOptions: SelectOption[];
  maxRate: number;
  onChange: (filters: PsychologistQuery) => void;
}
