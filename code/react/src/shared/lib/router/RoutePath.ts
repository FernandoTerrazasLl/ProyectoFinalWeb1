export class RoutePath {
  private basePath: string;

  constructor(basePath = "/") {
    this.basePath = this.normalize(basePath);
  }

  withoutBase(pathname: string): string {
    if (this.basePath === "/")
      return pathname;

    if (pathname === this.basePath)
      return "/";

    return pathname.startsWith(`${this.basePath}/`) ? pathname.slice(this.basePath.length) : pathname;
  }

  withBase(path: string): string {
    if (this.basePath === "/" || !path.startsWith("/"))
      return path;

    return `${this.basePath}${path}`;
  }

  private normalize(path: string): string {
    if (!path || path === "/")
      return "/";

    const normalized = path.startsWith("/") ? path : `/${path}`;
    return normalized.endsWith("/") ? normalized.slice(0, -1) : normalized;
  }
}
