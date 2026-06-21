import type { BlockOwnProps } from "@shared/lib/block/BlockOwnProps";

export interface AvatarProps extends BlockOwnProps {
  alt: string;
  src?: string;
  initials?: string;
  size?: "sm" | "md" | "lg";
}
