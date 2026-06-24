import { http } from "@shared/api/http";

export async function logoutUser(): Promise<void> {
  await http.logout();
}
