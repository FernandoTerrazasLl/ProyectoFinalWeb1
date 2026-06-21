import type { BlockOwnProps } from "@shared/lib/block/BlockOwnProps";

export interface LabelProps extends BlockOwnProps {
  text: string;
  forId?: string;
  optional?: boolean;
}
