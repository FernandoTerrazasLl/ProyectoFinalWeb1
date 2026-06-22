import type { BlockOwnProps } from "@shared/lib/block/BlockOwnProps";

export interface TextareaProps extends BlockOwnProps {
  id?: string;
  name?: string;
  placeholder?: string;
  rows?: number;
}
