import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

const fromSrc = (segment: string): string =>
  fileURLToPath(new URL(`./src/${segment}`, import.meta.url));

export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? "/",
  plugins: [react()],
  envDir: fileURLToPath(new URL("../../", import.meta.url)),
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
  server: {
    proxy: {
      "/api": "http://localhost",
    },
  },
});
