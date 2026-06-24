import type { BlockOwnProps } from "@shared/lib/block/BlockOwnProps";

export interface BadgeProps extends BlockOwnProps {
  text: string;
  tone?: "neutral" | "success" | "warning" | "danger";
}
