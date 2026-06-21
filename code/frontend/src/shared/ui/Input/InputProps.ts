import type { BlockOwnProps } from "@shared/lib/block/BlockOwnProps";

export interface InputProps extends BlockOwnProps {
  id?: string;
  type?: "text" | "email" | "password";
  placeholder?: string;
  value?: string;
  name?: string;
}
