import type { BlockOwnProps } from "@shared/lib/block/BlockOwnProps";

export interface GoogleButtonProps extends BlockOwnProps {
  onAuthenticated: () => void;
  error?: string;
}
