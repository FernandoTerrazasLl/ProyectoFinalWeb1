import { registerComponents } from "@app/registerComponents";
import { routes } from "@app/routing/routes";
import { routerInstance } from "@shared/lib/router/routerInstance";
import { mountReactPage } from "@shared/lib/router/mountReactPage";
import { applySession, loadStoredSession } from "@entities/user";

export function startApp(root: Element) {
  registerComponents();

  const storedSession = loadStoredSession();

  if (storedSession)
    applySession(storedSession);

  routerInstance
    .setRoutes(routes)
    .setNotFound(async () => {
      const { NotFoundPage } = await import("@pages/not-found");
      return mountReactPage(NotFoundPage, () => ({}));
    });
  
  return routerInstance.start(root);
}
