import { chromium, expect } from "@playwright/test";
import { spawn } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import net from "node:net";
import path from "node:path";

const directory = path.resolve(process.argv[2] ?? "dist");
const output = process.argv[3];
const repetitions = Number(process.argv[4] ?? 3);
if (!output || !Number.isInteger(repetitions) || repetitions < 0) {
  throw new Error("Usage: node scripts/measure-web-start.mjs <build-directory> <report.json> [cold-repetitions; 0 is offline only]");
}
const html = await readFile(path.join(directory, "index.html"), "utf8");
const build = html.match(/name="oliva-build" content="([^"]+)"/)?.[1];
if (!build) throw new Error("No OLIVA build marker in index.html");
const port = await new Promise((resolve) => {
  const socket = net.createServer();
  socket.listen(0, "127.0.0.1", () => {
    const { port } = socket.address();
    socket.close(() => resolve(port));
  });
});
const origin = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ["scripts/serve.mjs", directory], {
  env: { ...process.env, PORT: String(port) },
  stdio: "ignore",
});
const viewport = { width: 390, height: 844 };
const network = { latency: 150, downloadThroughput: 200_000, uploadThroughput: 93_750 };
const timeout = 80_000;
const cases = [
  { name: "Heute", route: "/", target: '[data-testid="home-primary-action"]' },
  { name: "Noah", route: "/geschichte/NS-0006", target: '[data-testid="story-artwork-noah"]' },
];
const report = { build, viewport, deviceScaleFactor: 2, network, repetitions, results: [], offline: null };

async function instrument(context) {
  await context.addInitScript(() => {
    performance.setResourceTimingBufferSize(600);
    const dbOpens = [];
    const dbTransactions = [];
    window.olivaStartProbe = { dbOpens, dbTransactions };
    const open = IDBFactory.prototype.open;
    IDBFactory.prototype.open = function (name, ...args) {
      const request = open.call(this, name, ...args);
      if (name === "oliva-local-v1") {
        const start = performance.now();
        request.addEventListener("success", () => dbOpens.push({ start, end: performance.now() }), { once: true });
      }
      return request;
    };
    const transaction = IDBDatabase.prototype.transaction;
    IDBDatabase.prototype.transaction = function (...args) {
      const request = transaction.apply(this, args);
      if (this.name === "oliva-local-v1") {
        const start = performance.now();
        request.addEventListener("complete", () => dbTransactions.push({ start, end: performance.now() }), { once: true });
      }
      return request;
    };
  });
}

async function ready(page, sample) {
  await page.goto(origin + sample.route, { waitUntil: "domcontentloaded", timeout });
  await expect(page.locator('meta[name="oliva-build"]')).toHaveAttribute("content", build);
  await expect(page.locator(sample.target).first()).toBeVisible({ timeout });
  if (sample.name === "Noah") {
    await expect(page.locator(sample.target)).toHaveAttribute("aria-busy", "false", { timeout });
  }
  await page.evaluate(() => document.fonts.ready);
  await expect.poll(() => page.getByRole("main").locator("img").evaluateAll((imgs) =>
    imgs.every((image) => image.complete && image.naturalWidth > 0)), { timeout }).toBe(true);
  const result = await page.evaluate(() => {
    const round = (value) => Math.round(value);
    const entries = performance.getEntriesByType("resource");
    const groups = { javascript: [], fonts: [], images: [], styles: [] };
    for (const entry of entries) {
      const resource = new URL(entry.name);
      if (resource.origin !== location.origin) continue;
      const file = resource.pathname;
      const kind = /\.js$/.test(file) ? "javascript" : /\.(?:ttf|woff2?)$/.test(file) ? "fonts"
        : /\.(?:png|webp|svg|jpe?g)$/.test(file) ? "images" : /\.css$/.test(file) ? "styles" : null;
      if (!kind) continue;
      groups[kind].push({ file, startMs: round(entry.startTime), endMs: round(entry.responseEnd),
        transferBytes: entry.transferSize, encodedBytes: entry.encodedBodySize, decodedBytes: entry.decodedBodySize });
    }
    const resources = Object.fromEntries(Object.entries(groups).map(([kind, files]) => [kind, {
      transferBytes: files.reduce((total, file) => total + file.transferBytes, 0),
      firstStartMs: files.length ? Math.min(...files.map((file) => file.startMs)) : null,
      lastEndMs: files.length ? Math.max(...files.map((file) => file.endMs)) : null,
      files,
    }]));
    const dom = performance.getEntriesByType("navigation")[0];
    const fields = ["dbOpens", "dbTransactions"];
    const storage = Object.fromEntries(fields.map((field) => [field, window.olivaStartProbe[field].map(({ start, end }) =>
      ({ startMs: round(start), endMs: round(end), durationMs: round(end - start) }))]));
    return { readyMs: round(performance.now()), ttfbMs: round(dom.responseStart),
      domContentLoadedMs: round(dom.domContentLoadedEventEnd), resources, storage,
      fontFaces: Array.from(document.fonts).map(({ family, status }) => ({ family, status })) };
  });
  expect(result.fontFaces.filter((face) => face.status === "loaded").length).toBeGreaterThanOrEqual(2);
  return result;
}

let browser;
try {
  for (let i = 0; i < 50; i++) {
    try { if ((await fetch(origin)).ok) break; } catch { /* Starting the local server. */ }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? "/usr/bin/chromium", args: ["--no-sandbox"] });
  report.browser = browser.version();
  const contextOptions = { viewport, deviceScaleFactor: 2, reducedMotion: "reduce" };
  for (let index = 0; index < repetitions; index++) {
    for (const sample of cases) {
      const context = await browser.newContext({ ...contextOptions, serviceWorkers: "block" });
      try {
        await instrument(context);
        const page = await context.newPage();
        const session = await context.newCDPSession(page);
        await session.send("Network.enable");
        await session.send("Network.setCacheDisabled", { cacheDisabled: true });
        await session.send("Network.emulateNetworkConditions", { ...network, offline: false });
        const result = { name: sample.name, index: index + 1, ...await ready(page, sample) };
        report.results.push(result);
        console.log(JSON.stringify({ ...sample, run: index + 1, readyMs: result.readyMs }));
      } finally {
        await context.close();
      }
    }
  }
  const context = await browser.newContext(contextOptions);
  try {
    await instrument(context);
    const page = await context.newPage();
    const first = await ready(page, cases[0]);
    await expect(page.getByText("Für den Offline-Neustart bereit.", { exact: true })).toBeVisible({ timeout });
    const prepared = await page.evaluate(async (build) => {
      const now = Math.round(performance.now());
      const cache = await caches.open(build);
      const keys = await cache.keys();
      return { readyMs: now, firstOfflineWorkerResponseMs: Math.round(performance.getEntriesByName(location.origin + "/sw.js")[0]?.responseEnd ?? 0), paths: keys.map((key) => new URL(key.url).pathname).sort() };
    }, build);
    const sw = await readFile(path.join(directory, "sw.js"), "utf8");
    const expected = JSON.parse(sw.match(/,URLS=(\[.*?\]),VERSION=/)?.[1] ?? "[]");
    expect(prepared.paths).toEqual([...expected].map((url) => new URL(url, origin).pathname).sort());
    await page.close();
    await context.setOffline(true);
    const offlinePage = await context.newPage();
    const restarted = await ready(offlinePage, cases[1]);
    report.offline = { networkCondition: "unthrottled loopback; worker enabled", first, prepared, restarted };
  } finally {
    await context.close();
  }
  report.passed = true;
} catch (error) {
  report.failure = String(error.stack ?? error);
  process.exitCode = 1;
} finally {
  await writeFile(output, JSON.stringify(report, null, 2) + "\n");
  await browser?.close();
  server.kill("SIGTERM");
}
