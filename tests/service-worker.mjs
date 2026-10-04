import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { execFileSync, spawn } from "node:child_process";
import { once } from "node:events";
import { createRequire } from "node:module";
import { BUILD } from "../src/version.js";
import { KEYS } from "../src/store.js";
const require = createRequire(import.meta.url),
  { chromium } = require("playwright"),
  out = path.resolve("qa-output"),
  root = path.join(out, "sw-origin"),
  results = [];
fs.mkdirSync(out, { recursive: true });
fs.rmSync(root, { recursive: true, force: true });
fs.mkdirSync(root);
const archive = execFileSync(
  "git",
  ["archive", "3c5b221ac958775588a62b49fbc9df5e82eed482"],
  { maxBuffer: 50e6 },
);
execFileSync("tar", ["-x", "-C", root], { input: archive });
const server = spawn(process.execPath, ["scripts/serve.mjs", root], {
  stdio: ["ignore", "pipe", "inherit"],
  env: { ...process.env, PORT: "4175" },
});
await once(server.stdout, "data");
const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.FAITHPATH_CHROMIUM || undefined,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
  }),
  context = await browser.newContext({ viewport: { width: 390, height: 844 } }),
  p = await context.newPage();
p.setDefaultTimeout(20000);
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
async function poll(fn, timeout = 60000) {
  const until = Date.now() + timeout;
  while (Date.now() < until) {
    const value = await fn();
    if (value) return value;
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error("Polling timed out");
}
function deploy(dir) {
  for (const item of fs.readdirSync(root))
    fs.rmSync(path.join(root, item), { recursive: true, force: true });
  fs.cpSync(dir, root, { recursive: true });
}
function variant(build, broken = false) {
  const dir = path.join(out, "release-" + build);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.cpSync("dist", dir, { recursive: true });
  fs.renameSync(
    path.join(dir, "releases", BUILD),
    path.join(dir, "releases", build),
  );
  for (const file of [
    "index.html",
    "sw.js",
    "BUILD.txt",
    "releases/" + build + "/src/version.js",
  ]) {
    const loc = path.join(dir, file);
    fs.writeFileSync(
      loc,
      fs.readFileSync(loc, "utf8").replaceAll(BUILD, build),
    );
  }
  if (broken) fs.rmSync(path.join(dir, "data/bibles/otb/GEN.json"));
  return dir;
}
async function status() {
  return p.evaluate(async () => {
    const r = await navigator.serviceWorker.getRegistration();
    if (!r?.active || r.active.state !== "activated") return null;
    return new Promise((resolve) => {
      const ch = new MessageChannel();
      const t = setTimeout(() => resolve(null), 1000);
      ch.port1.onmessage = (e) => {
        clearTimeout(t);
        resolve(e.data);
      };
      r.active.postMessage({ type: "STATUS" }, [ch.port2]);
    });
  });
}
async function cacheKeys() {
  return p.evaluate(() => caches.keys());
}
try {
  await p.addInitScript(() =>
    localStorage.setItem("faithpath.onboarding.v4", "done"),
  );
  await p.goto("http://127.0.0.1:4175/");
  await poll(() =>
    p.evaluate(() => navigator.serviceWorker.controller?.state === "activated"),
  );
  const stamp = "2025-01-12T12:00:00Z";
  const legacy = {
    version: 4,
    translation: "otb",
    paths: [
      {
        id: "legacy-p",
        title: "Mein alter Weg",
        started: stamp,
        steps: [{ text: "Zuhören", done: true }],
        milestones: [{ text: "Ruhe gelernt", date: stamp }],
        reviews: [{ text: "Noch unterwegs", date: stamp }],
        links: [],
      },
    ],
    journal: [
      {
        id: "legacy-j",
        text: "Mein ungekürzter Gedanke. ".repeat(2500),
        date: stamp,
        type: "Journal",
      },
    ],
    reflections: [],
    highlights: [
      { id: "legacy-h", book: "ROM", chapter: 12, from: 12, to: 12, at: stamp },
    ],
    quiz: { 1: { done: stamp } },
    events: [],
    unknown: { preserve: true },
  };
  await p.evaluate(
    async ({ legacy, keys }) => {
      localStorage.setItem(keys.main, JSON.stringify(legacy));
      localStorage.setItem(
        keys.plans,
        JSON.stringify({ sorge7: { 0: true, 2: true } }),
      );
      const c = await caches.open("unrelated-app-cache");
      await c.put("/unrelated", new Response("keep"));
    },
    { legacy, keys: KEYS },
  );
  deploy("dist");
  await p.goto("http://127.0.0.1:4175/#more");
  await p.reload();
  await p.getByRole("button", { name: "Jetzt aktualisieren" }).waitFor();
  assert.ok(await p.evaluate(() => !!navigator.serviceWorker.controller));
  await Promise.all([
    p.waitForEvent("load"),
    p.getByRole("button", { name: "Jetzt aktualisieren" }).click(),
  ]);
  await poll(async () => (await status())?.build === BUILD);
  await p
    .getByRole("heading", {
      name: "Raum für deine Geschichte.",
      exact: true,
    })
    .waitFor();
  const migrated = await p.evaluate(
    (k) => JSON.parse(localStorage.getItem(k)),
    KEYS.main,
  );
  assert.equal(migrated.journal[0].text, legacy.journal[0].text);
  assert.equal(migrated.paths[0].milestones.length, 1);
  assert.deepEqual(migrated.guidedPlans, { sorge7: { 0: true, 2: true } });
  assert.deepEqual(migrated.unknown, legacy.unknown);
  assert.deepEqual(
    JSON.parse(
      await p.evaluate(
        (k) => JSON.parse(localStorage.getItem(k)).raw,
        KEYS.migration,
      ),
    ),
    legacy,
  );
  assert.ok((await cacheKeys()).includes("unrelated-app-cache"));
  results.push({
    name: "Original Build E → F, echte Migration und fremder Cache erhalten",
    status: "passed",
  });
  console.log("PASS E → F");
  const priorState = await p.evaluate(
    (k) => localStorage.getItem(k),
    KEYS.main,
  );
  await p.goto("http://127.0.0.1:4175/#compose");
  await p
    .getByLabel("Dein Gedanke", { exact: true })
    .fill("Dieser noch offene Entwurf darf ein Update überleben.");
  const next = "FP4-QA-NEXT";
  deploy(variant(next));
  await p.evaluate(async () => {
    const r = await navigator.serviceWorker.getRegistration();
    await r.update();
  });
  await poll(() =>
    p.evaluate(
      async () => !!(await navigator.serviceWorker.getRegistration())?.waiting,
    ),
  );
  assert.equal(
    await p.getByLabel("Dein Gedanke", { exact: true }).inputValue(),
    "Dieser noch offene Entwurf darf ein Update überleben.",
  );
  assert.equal((await status()).build, BUILD);
  assert.equal(
    await p.evaluate((k) => localStorage.getItem(k), KEYS.main),
    priorState,
  );
  await p.getByRole("button", { name: "Schließen", exact: true }).click();
  await Promise.all([
    p.waitForEvent("load"),
    p.getByRole("button", { name: "Jetzt aktualisieren" }).click(),
  ]);
  await poll(async () => (await status())?.build === next);
  await p.goto("http://127.0.0.1:4175/#today");
  await p.getByRole("button", { name: "Entwurf fortsetzen" }).click();
  assert.equal(
    await p.getByLabel("Dein Gedanke", { exact: true }).inputValue(),
    "Dieser noch offene Entwurf darf ein Update überleben.",
  );
  await p.getByRole("button", { name: "Schließen", exact: true }).click();
  assert.ok((await cacheKeys()).includes("unrelated-app-cache"));
  results.push({
    name: "F → Folgerelease wartet auf Zustimmung; Entwurf und Daten erhalten",
    status: "passed",
  });
  console.log("PASS deliberate update and draft");
  const broken = "FP4-QA-BROKEN";
  deploy(variant(broken, true));
  await p.evaluate(async () => {
    const r = await navigator.serviceWorker.getRegistration();
    await r.update();
  });
  await poll(async () => {
    const r = await p.evaluate(async () => {
      const r = await navigator.serviceWorker.getRegistration();
      return { installing: !!r?.installing, waiting: !!r?.waiting };
    });
    return !r.installing && !r.waiting;
  });
  assert.equal((await status()).build, next);
  assert.ok(!(await cacheKeys()).some((k) => k.endsWith(broken)));
  await context.setOffline(true);
  await p.reload();
  await p
    .getByRole("heading", { name: "Was bewegt dich gerade?", exact: true })
    .waitFor();
  assert.equal(
    await p.evaluate((k) => localStorage.getItem(k), KEYS.main),
    priorState,
  );
  assert.ok((await cacheKeys()).includes("unrelated-app-cache"));
  results.push({
    name: "Unvollständiges Update abgewiesen; letzter vollständiger Build offline nutzbar",
    status: "passed",
  });
  console.log("PASS failed update fallback");
  assert.deepEqual(errors, []);
} catch (err) {
  console.log(
    "diagnostic",
    await p.evaluate(async () => ({
      title: document.title,
      body: document.body.innerText.slice(0, 1200),
      reg: await navigator.serviceWorker
        .getRegistration()
        .then((r) => ({
          active: r?.active?.state,
          waiting: r?.waiting?.state,
          installing: r?.installing?.state,
        })),
      cache: await caches.keys(),
    })),
  );
  console.log("errors", errors);
  await p.screenshot({ path: path.join(out, "sw-failure.png") });
  results.push({
    name: "Service Worker acceptance",
    status: "failed",
    error: err.stack,
  });
  console.error(err);
  process.exitCode = 1;
} finally {
  await browser.close();
  server.kill();
  fs.writeFileSync(
    path.join(out, "service-worker-results.json"),
    JSON.stringify({ engine: "Chromium", results, errors }, null, 2),
  );
}
