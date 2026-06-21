import type { Route } from "@shared/lib/router/Route";
import type { RouteMatch } from "@shared/lib/router/RouteMatch";

export class Router {
  private routes: Route[] = [];
  private notFound: Route["loader"] | null = null;
  private root: Element | null = null;

  add(route: Route): this {
    this.routes.push(route);
    return this;
  }

  setNotFound(loader: Route["loader"]): this {
    this.notFound = loader;
    return this;
  }

  start(root: Element) {
    this.root = root;
    window.addEventListener("popstate", () => void this.resolve());
    document.addEventListener("click", (event) => this.interceptLinks(event));
    void this.resolve();
  }

  navigate(path: string) {
    window.history.pushState({}, "", path);
    void this.resolve();
  }

  private interceptLinks(event: MouseEvent) {
    const link = (event.target as Element | null)?.closest("a[data-link]");
    const href = link?.getAttribute("href");

    if (href) {
      event.preventDefault();
      this.navigate(href);
    }
  }

  private async resolve() {
    if (!this.root) 
      return;

    const pathname = window.location.pathname;

    for (const route of this.routes) {
      const match = this.match(route.path, pathname);

      if (!match) 
        continue;
      if (route.guard && !route.guard()) {
        this.navigate("/auth");
        return;
      }

      const page = await route.loader();
      window.scrollTo(0, 0);
      page.mount(this.root, match);

      return;
    }

    if (this.notFound) {
      const page = await this.notFound();
      page.mount(this.root, { params: {} });
    }
  }

  private match(pattern: string, pathname: string): RouteMatch | null {
    const patternParts = pattern.split("/").filter(Boolean);
    const pathParts = pathname.split("/").filter(Boolean);

    if (patternParts.length !== pathParts.length) 
      return null;

    const params: Record<string, string> = {};

    for (const [index, patternPart] of patternParts.entries()) {
      const pathPart = pathParts[index];

      if (pathPart === undefined) 
        return null;
      if (patternPart.startsWith(":")) 
        params[patternPart.slice(1)] = pathPart;
      else if (patternPart !== pathPart) 
        return null;
    }

    return { params };
  }
}
