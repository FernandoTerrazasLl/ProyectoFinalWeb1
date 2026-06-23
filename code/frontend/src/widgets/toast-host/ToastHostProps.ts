import type { BlockOwnProps } from "@shared/lib/block/BlockOwnProps";
import type { ToastMessage } from "@shared/lib/toast/ToastMessage";

export interface ToastHostProps extends BlockOwnProps {
  toasts?: ToastMessage[];
}
