import type { Role } from "@entities/user/model/Role";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}
