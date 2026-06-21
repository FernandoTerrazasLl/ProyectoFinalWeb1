import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

const fromSrc = (segment: string): string =>
  fileURLToPath(new URL(`./src/${segment}`, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@app": fromSrc("app"),
      "@pages": fromSrc("pages"),
      "@widgets": fromSrc("widgets"),
      "@features": fromSrc("features"),
      "@entities": fromSrc("entities"),
      "@shared": fromSrc("shared"),
    },
  },
  build: {
    target: "es2022",
  },
});
