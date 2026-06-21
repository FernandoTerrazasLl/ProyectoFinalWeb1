import type { BlockOwnProps } from "@shared/lib/block/BlockOwnProps";
import type { SelectOption } from "@shared/ui/Select/SelectOption";

export interface SelectProps extends BlockOwnProps {
  options: SelectOption[];
  name?: string;
  value?: string;
  onChange?: (value: string) => void;
}
