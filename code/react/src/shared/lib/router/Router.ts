import type { Route } from "@shared/lib/router/Route";
import type { RouteMatch } from "@shared/lib/router/RouteMatch";
import type { RoutePage } from "@shared/lib/router/RoutePage";
import { RoutePath } from "@shared/lib/router/RoutePath";

export class Router {
  private routes: Route[] = [];
  private notFound: Route["loader"] | null = null;
  private root: Element | null = null;
  private routePath: RoutePath;
  private unmountPage: (() => void) | null = null;
  private handlePopState = () => void this.resolve();
  private handleClick = (event: MouseEvent) => this.interceptLinks(event);

  constructor(basePath = "/") {
    this.routePath = new RoutePath(basePath);
  }

  add(route: Route): this {
    this.routes.push(route);
    return this;
  }

  setRoutes(routes: Route[]): this {
    this.routes = [...routes];
    return this;
  }

  setNotFound(loader: Route["loader"]): this {
    this.notFound = loader;
    return this;
  }

  start(root: Element): () => void {
    this.stop();
    this.root = root;
    window.addEventListener("popstate", this.handlePopState);
    document.addEventListener("click", this.handleClick);
    void this.resolve();

    return () => this.stop();
  }

  stop() {
    this.unmountCurrentPage();
    window.removeEventListener("popstate", this.handlePopState);
    document.removeEventListener("click", this.handleClick);
    this.root = null;
    document.body.classList.remove("app--dashboard");
  }

  navigate(path: string) {
    window.history.pushState({}, "", this.routePath.withBase(path));
    void this.resolve();
  }

  href(path: string): string {
    return this.routePath.withBase(path);
  }

  private interceptLinks(event: MouseEvent) {
    const link = (event.target as Element | null)?.closest("a[data-link]");
    const href = link?.getAttribute("href");

    if (href) {
      event.preventDefault();
      this.navigate(this.routePath.withoutBase(href));
    }
  }

  private async resolve() {
    if (!this.root) 
      return;

    const pathname = this.routePath.withoutBase(window.location.pathname);

    document.body.classList.toggle("app--dashboard", pathname.startsWith("/dashboard"));

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
      this.mountPage(page, match);

      return;
    }

    if (this.notFound) {
      const page = await this.notFound();
      this.mountPage(page, { params: {} });
    }
  }

  private mountPage(page: RoutePage, match: RouteMatch) {
    if (!this.root)
      return;

    this.unmountCurrentPage();
    this.unmountPage = page.mount(this.root, match) ?? null;
  }

  private unmountCurrentPage() {
    this.unmountPage?.();
    this.unmountPage = null;
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
