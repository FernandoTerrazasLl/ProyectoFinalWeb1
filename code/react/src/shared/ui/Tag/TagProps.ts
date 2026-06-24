import type { BlockOwnProps } from "@shared/lib/block/BlockOwnProps";

export interface TagProps extends BlockOwnProps {
  text: string;
  removable?: boolean;
  onRemove?: () => void;
}
