import type { BlockOwnProps } from "@shared/lib/block/BlockOwnProps";

export interface HeaderProps extends BlockOwnProps {
  userName?: string | null;
  isProvider?: boolean;
  menuOpen?: boolean;
}
