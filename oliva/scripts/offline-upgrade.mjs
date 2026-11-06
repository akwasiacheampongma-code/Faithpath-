import { chromium, expect as baseExpect } from "@playwright/test";
import { spawn } from "node:child_process";
import {
  mkdtemp,
  symlink,
  rename,
  rm,
  writeFile,
  mkdir,
} from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import net from "node:net";
import { faithpathFixture } from "../tests/fixtures/faithpath-v5.ts";
const expect = baseExpect.configure({ timeout: 30000 });
const baseline = process.argv[2],
  current = path.resolve(process.argv[3] ?? "dist");
if (!baseline)
  throw new Error(
    "Usage: node scripts/offline-upgrade.mjs <v0.3-dist> [current-dist]",
  );
const temp = await mkdtemp(path.join(tmpdir(), "oliva-upgrade-")),
  live = path.join(temp, "live");
await symlink(path.resolve(baseline), live);
const port = await new Promise((resolve) => {
  const s = net.createServer();
  s.listen(0, "127.0.0.1", () => {
    const p = s.address().port;
    s.close(() => resolve(p));
  });
});
const server = spawn(process.execPath, ["scripts/serve.mjs", live], {
    env: { ...process.env, PORT: String(port) },
    stdio: "ignore",
  }),
  base = "http://127.0.0.1:" + port;
const browser = await chromium.launch({
    executablePath:
      process.env.CHROMIUM_PATH ??
      (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
    args: ["--no-sandbox"],
  }),
  context = await browser.newContext({ viewport: { width: 390, height: 844 } }),
  page = await context.newPage();
page.setDefaultTimeout(30000);
async function raw() {
  return page.evaluate(
    () =>
      new Promise((resolve) => {
        const r = indexedDB.open("oliva-local-v1", 1);
        r.onsuccess = () => {
          const q = r.result
            .transaction("state", "readonly")
            .objectStore("state")
            .get("main");
          q.onsuccess = () => resolve(q.result);
        };
      }),
  );
}
const result = {
  baseline_version: "0.3.0",
  target_version: "0.4.0",
  synthetic_data: true,
  passed: false,
};
try {
  for (let attempt = 0; attempt < 50; attempt++) {
    try {
      const r = await fetch(base);
      if (r.ok) break;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  await page.goto(base + "/einstellungen");
  await expect(
    page.getByText("OLIVA · lokale Entwicklungsausgabe 0.3.0", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "Dein Vorname (freiwillig)" })
    .fill("Ada");
  await page
    .getByRole("button", { name: "Namen speichern", exact: true })
    .click();
  await expect.poll(async () => (await raw())?.name).toBe("Ada");
  const source = JSON.stringify(faithpathFixture(), null, 2) + "\n";
  await page.goto(base + "/importieren");
  const chooser = page.waitForEvent("filechooser");
  await page
    .getByRole("button", { name: "FaithPath-Datei auswählen", exact: true })
    .click();
  await (
    await chooser
  ).setFiles({
    name: "synthetic-v5.json",
    mimeType: "application/json",
    buffer: Buffer.from(source),
  });
  await page
    .getByRole("button", {
      name: "Jetzt sichern und Import übernehmen",
      exact: true,
    })
    .click();
  await expect(page.getByText(/Import abgeschlossen/)).toBeVisible();
  await page.goto(base + "/sammlung");
  await page
    .getByRole("button", { name: "Einen Gedanken festhalten", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Deine Worte", exact: true })
    .fill("Mein offener Entwurf aus Version 0.3.");
  await expect(
    page.getByText("Entwurf auf diesem Gerät gesichert.", { exact: true }),
  ).toBeVisible();
  const before = await raw();
  if (before.version !== 3) throw new Error("Control is not V3 inline data");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller)
      await new Promise((resolve) =>
        navigator.serviceWorker.addEventListener("controllerchange", resolve, {
          once: true,
        }),
      );
  });
  await symlink(current, path.join(temp, "next"));
  const updateStartedAt = Date.now();
  await rename(path.join(temp, "next"), live);
  await page.goto(base + "/einstellungen");
  await expect(
    page.getByText("OLIVA · lokale Entwicklungsausgabe 0.4.0", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Dein Vorname (freiwillig)" }),
  ).toHaveValue("Ada");
  await page
    .getByRole("textbox", { name: "Dein Vorname (freiwillig)" })
    .fill("Ada, weiter unterwegs");
  await page
    .getByRole("button", { name: "Namen speichern", exact: true })
    .click();
  await expect.poll(async () => (await raw())?.storageVersion).toBe(1);
  await expect(
    page.getByText("Für den Offline-Neustart bereit.", { exact: true }),
  ).toBeVisible({ timeout: 30000 });
  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByRole("textbox", { name: "Dein Vorname (freiwillig)" }),
  ).toHaveValue("Ada, weiter unterwegs");
  await page.goto(base + "/sammlung");
  await page
    .getByRole("button", { name: "Entwurf fortsetzen", exact: true })
    .click();
  await expect(
    page.getByRole("textbox", { name: "Deine Worte", exact: true }),
  ).toHaveValue("Mein offener Entwurf aus Version 0.3.");
  const physical = await raw();
  expect(physical.data.notes).toEqual(before.notes);
  expect(physical.data.goals).toEqual(before.goals);
  expect(physical.data.imports[0].sourceText).toBeUndefined();
  const hash = physical.data.imports[0].sourceHash,
    blob = await page.evaluate(
      (hash) =>
        new Promise((resolve) => {
          const r = indexedDB.open("oliva-local-v1", 1);
          r.onsuccess = () => {
            const q = r.result
              .transaction("state", "readonly")
              .objectStore("state")
              .get("archive:" + hash);
            q.onsuccess = () => resolve(q.result);
          };
        }),
      hash,
    );
  expect(blob).toBe(source);
  Object.assign(result, {
    passed: true,
    profile_preserved: true,
    journal_draft_preserved: true,
    notes_preserved: true,
    goals_preserved: true,
    original_source_preserved: true,
    offline_reload_passed: true,
    cache_count: await page.evaluate(
      async () =>
        (await caches.keys()).filter((x) => x.startsWith("oliva-")).length,
    ),
    data_version: physical.data.version,
    storage_format: physical.storageVersion,
    update_and_offline_check_ms: Date.now() - updateStartedAt,
    current_build_id: await page
      .locator('meta[name="oliva-build"]')
      .getAttribute("content"),
  });
  await mkdir("docs/evidence/session-04-screens", { recursive: true });
  await page.screenshot({
    path: "docs/evidence/session-04-screens/offline-upgrade-mobile.png",
  });
} catch (error) {
  result.error = String(error);
  result.worker_diagnostic = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    const controller = navigator.serviceWorker.controller;
    async function inspect(worker) {
      return await new Promise((resolve) => {
        if (!worker) return resolve(null);
        const channel = new MessageChannel();
        const timer = setTimeout(() => resolve("message timeout"), 2000);
        channel.port1.onmessage = (event) => {
          clearTimeout(timer);
          channel.port1.close();
          resolve(event.data);
        };
        worker.postMessage({ type: "OLIVA_BUILD" }, [channel.port2]);
      });
    }
    const [reported, waitingReported] = await Promise.all([
      inspect(controller ?? registration?.active),
      inspect(registration?.waiting),
    ]);
    return {
      expected: document
        .querySelector('meta[name="oliva-build"]')
        ?.getAttribute("content"),
      controller: controller?.scriptURL,
      active: registration?.active?.state,
      installing: registration?.installing?.state,
      waiting: registration?.waiting?.state,
      reported,
      waitingReported,
      fetched_worker: (
        await (await fetch("/sw.js", { cache: "no-store" })).text()
      ).slice(0, 60),
      caches: await caches.keys(),
    };
  });
  throw error;
} finally {
  await mkdir("docs/evidence", { recursive: true });
  await writeFile(
    "docs/evidence/offline-upgrade.json",
    JSON.stringify(
      { ...result, checkedAt: new Date().toISOString() },
      null,
      2,
    ) + "\n",
  );
  await browser.close();
  server.kill();
  await rm(temp, { recursive: true, force: true });
}
console.log(JSON.stringify(result, null, 2));
