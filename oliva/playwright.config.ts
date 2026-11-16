import { existsSync } from "node:fs";
import { defineConfig } from "@playwright/test";
const testPort = Number(process.env.OLIVA_TEST_PORT ?? 4173);
if (!Number.isInteger(testPort) || testPort < 1024 || testPort > 65535)
  throw new Error("OLIVA_TEST_PORT must be a port between 1024 and 65535");
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 120000,
  expect: { timeout: 15000 },
  use: {
    baseURL: `http://localhost:${testPort}`,
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
    ["json", { outputFile: process.env.PLAYWRIGHT_JSON_OUTPUT_NAME ?? "docs/evidence/latest/e2e-results.json" }],
  ],
  webServer: {
    command: `PORT=${testPort} node scripts/serve.mjs`,
    port: testPort,
    reuseExistingServer: true,
  },
});
