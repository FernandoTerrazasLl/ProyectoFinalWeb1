import type { Block } from "@shared/lib/block/Block";
import type { BlockOwnProps } from "@shared/lib/block/BlockOwnProps";

export interface ModalProps extends BlockOwnProps {
  title: string;
  body: Block;
  onClose: () => void;
}
