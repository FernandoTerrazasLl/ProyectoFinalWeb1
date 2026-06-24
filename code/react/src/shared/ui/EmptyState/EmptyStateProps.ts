import type { BlockOwnProps } from "@shared/lib/block/BlockOwnProps";

export interface EmptyStateProps extends BlockOwnProps {
  title: string;
  description?: string;
}
