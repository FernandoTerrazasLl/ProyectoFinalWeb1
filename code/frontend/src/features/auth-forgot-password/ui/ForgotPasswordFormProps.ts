import type { BlockOwnProps } from "@shared/lib/block/BlockOwnProps";

export interface ForgotPasswordFormProps extends BlockOwnProps {
  submitted?: boolean;
  error?: string;
}
