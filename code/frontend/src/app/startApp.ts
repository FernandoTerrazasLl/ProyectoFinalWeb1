import { registerComponents } from "@app/registerComponents";
import { routes } from "@app/routing/routes";
import { routerInstance } from "@shared/lib/router/routerInstance";
import { mountPage } from "@shared/lib/router/mountPage";
import { Header } from "@widgets/header";
import "@app/styles/global.css";

export function startApp(root: Element) {
  registerComponents();

  const header = new Header({});
  const headerElement = header.element();
  const content = document.createElement("div");
  content.className = "app__content";

  if (headerElement) 
    root.append(headerElement, content);
  else 
    root.append(content);

  routes.forEach((route) => routerInstance.add(route));

  routerInstance.setNotFound(async () => {
    const { NotFoundPage } = await import("@pages/not-found");
    return mountPage(NotFoundPage, () => ({}));
  });
  
  routerInstance.start(content);
}
