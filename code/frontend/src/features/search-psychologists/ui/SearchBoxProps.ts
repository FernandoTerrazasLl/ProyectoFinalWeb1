import type { BlockOwnProps } from "@shared/lib/block/BlockOwnProps";

export interface SearchBoxProps extends BlockOwnProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}
