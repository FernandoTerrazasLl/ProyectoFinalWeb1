import { Router } from "@shared/lib/router/Router";
import { registerComponents } from "@app/registerComponents";
import { routes } from "@app/routing/routes";
import "@app/styles/global.css";

export function startApp(root: Element) {
  registerComponents();
  const router = new Router(root);
  routes.forEach((route) => router.add(route));
  router.start();
}
