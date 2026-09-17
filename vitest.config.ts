import path from "path";
import { defineConfig } from "vitest/config";

// Separate from vite.config.ts on purpose: vite.config.ts sets `root: "client"`
// (needed for the app build), which would stop vitest from discovering test
// files outside client/ such as shared/scorecard.test.ts. This config keeps
// the repo root as the test root while still resolving the same aliases.
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
    },
  },
  test: {
    environment: "node",
    include: ["**/*.{test,spec}.{ts,tsx}"],
    exclude: ["**/node_modules/**", "**/dist/**"],
  },
});
