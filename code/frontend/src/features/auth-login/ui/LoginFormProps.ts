import type { BlockOwnProps } from "@shared/lib/block/BlockOwnProps";
import type { LoginUserRequest } from "@entities/user";

export interface LoginFormProps extends BlockOwnProps {
  onSubmit: (request: LoginUserRequest) => void;
  error?: string;
}
