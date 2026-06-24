import type { RouteMatch } from "@shared/lib/router/RouteMatch";

export interface RoutePage {
  mount(root: Element, match: RouteMatch): void | (() => void);
}
