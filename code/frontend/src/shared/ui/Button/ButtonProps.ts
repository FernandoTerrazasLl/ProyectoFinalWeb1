import type { BlockOwnProps } from "@shared/lib/block/BlockOwnProps";

export interface ButtonProps extends BlockOwnProps {
  label: string;
  variant?: "primary" | "secondary" | "danger" | "ink";
  disabled?: boolean;
  onClick?: (event: Event) => void;
}
