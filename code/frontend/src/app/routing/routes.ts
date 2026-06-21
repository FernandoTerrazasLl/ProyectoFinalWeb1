import type { Route } from "@shared/lib/router/Route";
import { mountPage } from "@shared/lib/router/mountPage";
import { hasActiveSession } from "@entities/user";

export const routes: Route[] = [
  {
    path: "/auth",
    loader: async () => {
      const { AuthPage } = await import("@pages/auth");
      return mountPage(AuthPage, {});
    },
  },
  {
    path: "/signup",
    loader: async () => {
      const { SignupPage } = await import("@pages/signup");
      return mountPage(SignupPage, {});
    },
  },
  {
    path: "/directory",
    guard: hasActiveSession,
    loader: async () => {
      const { DirectoryPage } = await import("@pages/directory");
      return mountPage(DirectoryPage, {});
    },
  },
];
