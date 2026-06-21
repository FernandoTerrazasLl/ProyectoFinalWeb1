import type { RoutePage } from "@shared/lib/router/RoutePage";

export interface Route {
  path: string;
  loader: () => Promise<RoutePage>;
  guard?: () => boolean;
}
