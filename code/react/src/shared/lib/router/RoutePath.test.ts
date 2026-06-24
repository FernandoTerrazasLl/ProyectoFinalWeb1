import { describe, expect, it } from "vitest";
import { RoutePath } from "@shared/lib/router/RoutePath";

describe("RoutePath", () => {
  it("mantiene rutas normales cuando no hay base path", () => {
    const routePath = new RoutePath("/");

    expect(routePath.withBase("/directory")).toBe("/directory");
    expect(routePath.withoutBase("/directory")).toBe("/directory");
  });

  it("agrega el base path a rutas internas", () => {
    const routePath = new RoutePath("/react/");

    expect(routePath.withBase("/directory")).toBe("/react/directory");
  });

  it("quita el base path antes de hacer match con las rutas", () => {
    const routePath = new RoutePath("/react/");

    expect(routePath.withoutBase("/react/profile/5")).toBe("/profile/5");
  });

  it("interpreta la raiz del base path como raiz de la app", () => {
    const routePath = new RoutePath("/react/");

    expect(routePath.withoutBase("/react")).toBe("/");
  });
});
