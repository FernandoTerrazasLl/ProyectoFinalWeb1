import type { BlockOwnProps } from "@shared/lib/block/BlockOwnProps";

export interface RangeSliderProps extends BlockOwnProps {
  min: number;
  max: number;
  value: number;
  onChange?: (value: number) => void;
}
