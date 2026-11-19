import { existsSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";

const origin = process.env.OLIVA_AUDIT_ORIGIN ?? "http://localhost:4183";
const output = process.env.OLIVA_AUDIT_OUTPUT ?? "docs/evidence/kiss-faith-journey/baseline-timing.json";
const journey = process.env.OLIVA_AUDIT_ENTRY === "journey";
const viewport = { width: 390, height: 844 };
const network = { offline: false, latency: 150, downloadThroughput: 200000, uploadThroughput: 93750 };
const cpuRate = 4;
const iterations = 3;
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
  args: ["--no-sandbox"],
});
const measurements = {
  [journey ? "Einführung · Weiter sichtbar" : "Heute · Leseaktion sichtbar"]: {
    path: "/", testId: journey ? "journey-intro" : "home-primary-action", action: journey ? "Weiter" : null, trials: [],
  },
  "Markus 4,35–41 · Fließtext sichtbar": { path: "/lesen/MRK?chapter=4&from=35&to=41", testId: "reader-flow", trials: [] },
};
let build;
try {
  for (let index = 0; index < iterations; index++) {
    for (const outcome of Object.values(measurements)) {
      const context = await browser.newContext({
        viewport, isMobile: true, hasTouch: true, reducedMotion: "reduce", serviceWorkers: "block",
      });
      try {
        const page = await context.newPage();
        const cdp = await context.newCDPSession(page);
        await cdp.send("Network.enable");
        await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
        await cdp.send("Network.emulateNetworkConditions", network);
        await cdp.send("Emulation.setCPUThrottlingRate", { rate: cpuRate });
        const started = performance.now();
        await page.goto(origin + outcome.path, { waitUntil: "commit", timeout: 70000 });
        const element = page.getByTestId(outcome.testId);
        await (outcome.action ? element.getByRole("button", { name: outcome.action, exact: true }) : element)
          .waitFor({ state: "visible", timeout: 70000 });
        const readyMs = Math.round(performance.now() - started);
        const transferredBytes = await page.evaluate(() =>
          performance.getEntriesByType("resource").reduce((bytes, resource) => bytes + resource.transferSize, 0));
        build = await page.locator('meta[name="oliva-build"]').getAttribute("content");
        outcome.trials.push({ readyMs, transferredBytes });
        console.log(JSON.stringify({ route: outcome.path, trial: index + 1, readyMs }));
      } finally {
        await context.close();
      }
    }
  }
} finally {
  await browser.close();
}
for (const outcome of Object.values(measurements)) {
  const sorted = outcome.trials.map(({ readyMs }) => readyMs).sort((a, b) => a - b);
  outcome.medianMs = sorted[1];
}
await writeFile(output, JSON.stringify({
  build, chromiumVersion: browser.version(), loopback: true, viewport, cpuRate, network,
  cacheDisabled: true, serviceWorkersBlocked: true, deviceTest: false, measurements,
}, null, 2) + "\n");
