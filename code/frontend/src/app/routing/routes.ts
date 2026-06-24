import type { Route } from "@shared/lib/router/Route";
import { mountPage } from "@shared/lib/router/mountPage";
import { hasActiveSession, isProvider } from "@entities/user";

export const routes: Route[] = [
  {
    path: "/",
    loader: async () => ({
      mount() {
        window.location.replace(`${window.location.origin}/directory`);
      },
    }),
  },
  {
    path: "/auth",
    loader: async () => {
      const { AuthPage } = await import("@pages/auth");
      return mountPage(AuthPage, () => ({}));
    },
  },
  {
    path: "/signup",
    loader: async () => {
      const { SignupPage } = await import("@pages/signup");
      return mountPage(SignupPage, () => ({}));
    },
  },
  {
    path: "/forgot-password",
    loader: async () => {
      const { ForgotPasswordPage } = await import("@pages/forgot-password");
      return mountPage(ForgotPasswordPage, () => ({}));
    },
  },
  {
    path: "/account/password",
    guard: hasActiveSession,
    loader: async () => {
      const { ChangePasswordPage } = await import("@pages/change-password");
      return mountPage(ChangePasswordPage, () => ({}));
    },
  },
  {
    path: "/directory",
    loader: async () => {
      const { DirectoryPage } = await import("@pages/directory");
      return mountPage(DirectoryPage, () => ({}));
    },
  },
  {
    path: "/profile/:id",
    loader: async () => {
      const { ProviderProfilePage } = await import("@pages/provider-profile");
      return mountPage(ProviderProfilePage, (params) => ({ id: params.id ?? "" }));
    },
  },
  {
    path: "/patient-profile",
    guard: hasActiveSession,
    loader: async () => {
      const { PatientProfilePage } = await import("@pages/patient-profile");
      return mountPage(PatientProfilePage, () => ({}));
    },
  },
  {
    path: "/triage",
    guard: hasActiveSession,
    loader: async () => {
      const { TriagePage } = await import("@pages/triage");
      return mountPage(TriagePage, () => ({}));
    },
  },
  {
    path: "/dashboard/schedule",
    guard: isProvider,
    loader: async () => {
      const { ProviderSchedulePage } = await import("@pages/provider-schedule");
      return mountPage(ProviderSchedulePage, () => ({}));
    },
  },
  {
    path: "/dashboard/profile",
    guard: isProvider,
    loader: async () => {
      const { ProviderSettingsPage } = await import("@pages/provider-settings");
      return mountPage(ProviderSettingsPage, () => ({ active: "profile" as const }));
    },
  },
  {
    path: "/dashboard/configuration",
    guard: isProvider,
    loader: async () => {
      const { ProviderSettingsPage } = await import("@pages/provider-settings");
      return mountPage(ProviderSettingsPage, () => ({ active: "configuration" as const }));
    },
  },
];
