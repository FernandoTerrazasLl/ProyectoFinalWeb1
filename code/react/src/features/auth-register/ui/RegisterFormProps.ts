import type { BlockOwnProps } from "@shared/lib/block/BlockOwnProps";
import type { RegisterUserRequest } from "@entities/user";

export interface RegisterFormProps extends BlockOwnProps {
  onSubmit: (request: RegisterUserRequest) => void;
}
