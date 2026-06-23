import type { BlockOwnProps } from "@shared/lib/block/BlockOwnProps";

export interface ChangePasswordFormProps extends BlockOwnProps {
  saved?: boolean;
  error?: string;
}
