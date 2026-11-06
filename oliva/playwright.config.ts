import { existsSync } from "node:fs";
import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  use: {
    baseURL: "http://localhost:4173",
    viewport: { width: 390, height: 844 },
    headless: true,
    launchOptions: {
      executablePath:
        process.env.CHROMIUM_PATH ??
        (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
      args: ["--no-sandbox"],
    },
  },
  reporter: [
    ["list"],
    ["json", { outputFile: "docs/evidence/e2e-results.json" }],
  ],
  webServer: {
    command: "node scripts/serve.mjs",
    port: 4173,
    reuseExistingServer: true,
  },
});
