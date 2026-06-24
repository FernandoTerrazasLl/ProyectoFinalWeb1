import { defineConfig } from "vitest/config";
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
  test: {
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "coverage",
      include: [
        "src/entities/**/api/**/*.ts",
        "src/entities/**/lib/**/*.ts",
        "src/features/**/lib/validate*.ts",
        "src/features/**/model/**/*.ts",
        "src/shared/api/describeHttpError.ts",
        "src/shared/api/HttpClient.ts",
        "src/shared/lib/store/Store.ts",
        "src/shared/lib/token/decodeTokenClaims.ts",
        "src/shared/lib/toast/showToast.ts",
        "src/entities/user/model/applySession.ts",
        "src/entities/user/model/isProvider.ts",
        "src/entities/user/model/hasActiveSession.ts",
        "src/entities/user/model/loadStoredSession.ts",
        "src/entities/user/model/clearStoredSession.ts",
        "src/entities/user/model/saveSession.ts",
        "src/entities/user/model/sessionStore.ts",
        "src/entities/triage/model/TriageScoring.ts",
      ],
      exclude: [
        "src/**/*.test.ts",
        "src/**/index.ts",
        "src/**/*.d.ts",
        "src/**/*Request.ts",
        "src/**/*Response.ts",
        "src/**/*Query.ts",
        "src/entities/user/api/AuthSession.ts",
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        statements: 70,
        branches: 70,
      },
    },
  },
});
