// Browser acceptance tests against the production build. No application runtime dependencies.
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createRequire } from "node:module";
import { empty, KEYS } from "../src/store.js";
const require = createRequire(import.meta.url),
  { chromium } = require("playwright");
const root = process.cwd(),
  out = path.join(root, "qa-output");
fs.mkdirSync(out, { recursive: true });
const server = spawn(process.execPath, ["scripts/serve.mjs", "dist"], {
  stdio: ["ignore", "pipe", "inherit"],
  env: { ...process.env, PORT: process.env.FAITHPATH_PORT || "4176" },
});
await once(server.stdout, "data");
const browser = await chromium.launch({
  headless: true,
  ...(process.env.FAITHPATH_CHROMIUM
    ? { executablePath: process.env.FAITHPATH_CHROMIUM }
    : {}),
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
});
const base = `http://127.0.0.1:${process.env.FAITHPATH_PORT || "4176"}/`,
  results = [],
  jsErrors = [];
const axeSource = fs.readFileSync(
  process.env.FAITHPATH_AXE || require.resolve("axe-core/axe.min.js"),
  "utf8",
);
let appState;
async function context(seed, opts = {}) {
  const c = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
    ...opts,
  });
  if (seed !== undefined)
    await c.addInitScript(
      ({ seed, keys }) => {
        if (!sessionStorage.getItem("seeded")) {
          localStorage.setItem(keys.onboard, "done");
          if (seed)
            localStorage.setItem(
              keys.main,
              typeof seed === "string" ? seed : JSON.stringify(seed),
            );
          sessionStorage.setItem("seeded", "1");
        }
      },
      { seed, keys: KEYS },
    );
  const p = await c.newPage();
  p.setDefaultTimeout(12000);
  p.on("pageerror", (e) => jsErrors.push(e.message));
  return { c, p };
}
async function visit(p, route, heading) {
  await p.goto(base + "#" + route);
  if (heading)
    await p.getByRole("heading", { name: heading, exact: true }).waitFor();
  else await p.locator("main h1").waitFor();
}
async function state(p) {
  return p.evaluate((k) => JSON.parse(localStorage.getItem(k)), KEYS.main);
}
async function snap(p, name) {
  await p.screenshot({ path: path.join(out, name + ".png"), fullPage: false });
}
async function axe(p, name) {
  await p.evaluate(axeSource);
  const audit = await p.evaluate(
    async () =>
      await axe.run(document, {
        runOnly: {
          type: "tag",
          values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"],
        },
      }),
  );
  fs.writeFileSync(
    path.join(out, name + "-axe.json"),
    JSON.stringify(audit.violations, null, 2),
  );
  assert.deepEqual(
    audit.violations.map((x) => ({
      id: x.id,
      impact: x.impact,
      targets: x.nodes.map((n) => n.target),
    })),
    [],
    name + " accessibility",
  );
}
async function overflow(p) {
  assert.equal(
    await p.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 1,
    ),
    false,
    "No horizontal overflow",
  );
}
async function test(name, fn) {
  if (process.env.FAITHPATH_BROWSER_ONLY && !name.startsWith(process.env.FAITHPATH_BROWSER_ONLY)) return;
  const before = jsErrors.length;
  try {
    await fn();
    assert.equal(
      jsErrors.length,
      before,
      "No uncaught JS errors: " + jsErrors.slice(before),
    );
    results.push({ name, status: "passed" });
    console.log("PASS " + name);
  } catch (err) {
    results.push({ name, status: "failed", error: err.stack });
    console.log("FAIL " + name + "\n" + err.stack);
  }
}
try {
  await test("Neuer Nutzer: Onboarding → Situation → Bibel → Reflexion → Weg → Schritt", async () => {
    const { c, p } = await context();
    try {
      await p.goto(base);
      await p.getByRole("dialog").waitFor();
      await snap(p, "onboarding-mobile");
      await p.getByRole("button", { name: "Weiter", exact: true }).click();
      await p
        .getByText("Ein Gedanke kann dich weiter begleiten.", { exact: true })
        .waitFor();
      await p.getByRole("button", { name: "Weiter", exact: true }).click();
      await p.getByRole("button", { name: "Meinen Anfang finden" }).click();
      await p
        .getByRole("heading", { name: "Was beschäftigt dich?", exact: true })
        .waitFor();
      await p.locator(".topic-grid a").first().click();
      await p.locator(".passage-list a").first().click();
      await p.locator(".reading-text").waitFor();
      await snap(p, "reader-context-mobile");
      await axe(p, "reader");
      await p
        .getByRole("button", { name: "Meinen Gedanken festhalten" })
        .click();
      await p
        .getByLabel("Dein Gedanke", { exact: true })
        .fill("In meiner Sorge möchte ich den nächsten kleinen Schritt sehen.");
      await p
        .getByRole("button", { name: "Gedanken speichern", exact: true })
        .click();
      await p.getByRole("button", { name: "Einen neuen Weg beginnen" }).click();
      await p.getByLabel("Name deines Weges").fill("Geduld im Alltag");
      await p
        .getByLabel("Ein kleiner Schritt (optional)")
        .fill("Im nächsten Gespräch zuerst zuhören.");
      await p
        .getByRole("button", { name: "Weg beginnen", exact: true })
        .click();
      if (process.env.FAITHPATH_BROWSER_ONLY) console.log("DEBUG", await p.evaluate(() => ({url:location.href, dialog:document.querySelector("dialog").innerText, main:document.querySelector("main").innerText, state:localStorage.getItem("faithpath.v1.rebuild")})));
      await p
        .getByRole("heading", { name: "Geduld im Alltag", exact: true })
        .waitFor();
      const d = await state(p);
      assert.equal(d.paths.length, 1);
      assert.equal(d.journal.length, 1);
      assert.equal(d.reflections.length, 1);
      assert.equal(d.paths[0].steps.length, 1);
      assert.equal(d.paths[0].links[0].journalId, d.journal[0].id);
      assert.ok(d.journal[0].ref);
      appState = d;
      await overflow(p);
      await axe(p, "path");
      await snap(p, "path-mobile");
    } finally {
      await c.close();
    }
  });
  await test("Erfahren: Buch/Kapitel, markieren, Notiz, Wegverbindung, Übersetzung, Kopieren", async () => {
    assert.ok(appState);
    const { c, p } = await context(appState);
    try {
      await visit(p, "bible", "Die Bibel. Raum zum Verstehen.");
      await p.getByLabel("Buch finden").fill("Römer");
      await p.locator("#book-list a").click();
      await p.getByRole("link", { name: "12", exact: true }).click();
      await p.locator(".reading-text").waitFor();
      await p.locator('[data-v="12"]').click();
      await p.getByRole("button", { name: "Markieren", exact: true }).click();
      await p.getByRole("button", { name: "Notiz", exact: true }).click();
      await p
        .getByLabel("Dein Gedanke", { exact: true })
        .fill("Geduldig bleiben heißt für mich, erst einmal zuzuhören.");
      await p
        .getByLabel("Persönlicher Weg (optional)")
        .selectOption(appState.paths[0].id);
      await p
        .getByRole("button", { name: "Gedanken speichern", exact: true })
        .click();
      await p.locator(".entry-text").waitFor();
      const d = await state(p);
      assert.equal(d.highlights.length, 1);
      assert.equal(d.highlights[0].from, 12);
      assert.equal(d.journal[0].ref.from, 12);
      assert.ok(d.journal[0].pathIds.includes(d.paths[0].id));
      await visit(p, "read/ROM/12/otb?from=12&to=12");
      await p.locator(".reading-text").waitFor();
      await p.getByLabel("Übersetzung", { exact: true }).selectOption("l1912");
      await p.waitForURL(/l1912/);
      await p.locator(".reading-text").waitFor();
      await p.locator('[data-v="12"]').focus();
      await p.keyboard.press("Enter");
      assert.equal(
        await p.locator('[data-v="12"]').getAttribute("aria-pressed"),
        "true",
      );
      await c.grantPermissions(["clipboard-read", "clipboard-write"]);
      await p.getByRole("button", { name: "Kopieren", exact: true }).click();
      await p.waitForFunction(() =>
        navigator.clipboard.readText().then((t) => t.includes("Römer 12")),
      );
      await snap(p, "reader-mobile");
      appState = await state(p);
    } finally {
      await c.close();
    }
  });
  await test("Weg: Schritt ist keine Entwicklung; Reflexion, bestätigter Rückblick, Archiv", async () => {
    const { c, p } = await context(appState);
    try {
      const pid = appState.paths[0].id;
      await visit(p, "path/" + pid, "Geduld im Alltag");
      await p.locator('[data-change="step-done"]').first().check();
      assert.equal((await state(p)).paths[0].milestones.length, 0);
      await p.getByRole("button", { name: "Schritt hinzufügen" }).click();
      await p
        .getByLabel("Dein Schritt", { exact: true })
        .fill("Eine Pause einlegen, bevor ich antworte.");
      await p.getByRole("button", { name: "Schritt festhalten" }).click();
      await p
        .getByRole("button", { name: "Gedanken festhalten", exact: true })
        .click();
      await p
        .getByLabel("Dein Gedanke", { exact: true })
        .fill("Heute habe ich wirklich zugehört.");
      await p.getByRole("button", { name: "Gedanken speichern" }).click();
      await p.locator(".entry-text").waitFor();
      await visit(p, "path/" + pid);
      await p
        .getByRole("button", { name: "Zurückblicken", exact: true })
        .click();
      await p.getByLabel("Wo stehst du gerade?").selectOption("changed");
      await p.getByRole("button", { name: "Rückblick speichern" }).click();
      await p
        .locator("#form-error")
        .filter({ hasText: "Beschreibe kurz" })
        .waitFor();
      await p
        .getByLabel("Was möchtest du dazu festhalten?")
        .fill("Ich reagiere in schwierigen Gesprächen ruhiger.");
      await p.getByLabel("Das ist für mich eine echte Entwicklung.").check();
      await axe(p, "review-dialog");
      await p.getByRole("button", { name: "Rückblick speichern" }).click();
      if (process.env.FAITHPATH_BROWSER_ONLY) console.log("DEBUG", await p.evaluate(() => ({url:location.href, dialog:document.querySelector("dialog").innerText, main:document.querySelector("main").innerText, state:localStorage.getItem("faithpath.v1.rebuild")})));
      await p
        .getByRole("heading", { name: "Geduld im Alltag", exact: true })
        .waitFor();
      assert.equal((await state(p)).paths[0].milestones.length, 1);
      await p.getByText("Weg verwalten", { exact: true }).click();
      await p.getByRole("button", { name: "Weg archivieren" }).click();
      assert.equal((await state(p)).paths[0].milestones.length, 1);
      await visit(p, "tree", "Keimling");
      await snap(p, "tree-mobile");
      appState = await state(p);
    } finally {
      await c.close();
    }
  });
  await test("Erinnerungslücke: alte Aktivität → später erinnern → Rückblick ohne Bewertung", async () => {
    const d = empty();
    d.journal = [
      {
        id: "old",
        text: "Ich wollte einem Menschen vergeben.",
        date: "2025-01-12T12:00:00Z",
        type: "Journal",
      },
    ];
    d.highlights = [
      {
        id: "h",
        book: "ROM",
        chapter: 12,
        from: 12,
        to: 12,
        at: "2025-02-12T12:00:00Z",
        label: "Römer 12,12",
        translation: "otb",
      },
    ];
    const { c, p } = await context(d);
    try {
      await visit(p, "today", "Was bewegt dich gerade?");
      await snap(p, "returning-home-mobile");
      await p.getByRole("button", { name: "In Ruhe zurückblicken" }).click();
      await p.getByRole("button", { name: "In zwei Wochen erinnern" }).click();
      assert.ok((await state(p)).reminderSnoozes["journal:old"]);
      await p.getByRole("button", { name: "In Ruhe zurückblicken" }).click();
      await p.getByRole("button", { name: "Jetzt zurückblicken" }).click();
      await p.getByLabel("Wo stehst du gerade?").selectOption("working");
      await p.getByRole("button", { name: "Rückblick speichern" }).click();
      await p
        .getByRole("heading", {
          name: "Damals wichtig. Heute Teil von dir.",
          exact: true,
        })
        .waitFor();
      const saved = await state(p);
      assert.equal(saved.reviews[0].status, "working");
      assert.equal(saved.reviews[0].confirmedDevelopment, false);
      assert.equal(saved.highlights.length, 1);
      assert.equal(saved.journal.length, 1);
      await axe(p, "history");
    } finally {
      await c.close();
    }
  });
  await test("Journal: Predigtnotiz, Filter, Suche, Öffnen und chronologischer Verlauf", async () => {
    const { c, p } = await context(appState);
    try {
      await visit(p, "journal", "Festhalten, was bleibt.");
      await p.getByRole("button", { name: "Neuer Eintrag" }).click();
      await p
        .getByLabel("Dein Gedanke", { exact: true })
        .fill("Predigt am Sonntag: Einander zuhören.");
      await p.getByLabel("Art des Eintrags").selectOption("Predigt");
      await p.getByRole("button", { name: "Gedanken speichern" }).click();
      await p
        .getByRole("button", { name: "Für jetzt reicht der Gedanke" })
        .click();
      await visit(p, "journal");
      await p.getByRole("button", { name: "Predigt", exact: true }).click();
      await p.getByLabel("In deinen Einträgen suchen").fill("Sonntag");
      assert.equal(await p.locator(".timeline li").count(), 1);
      await p.locator(".timeline-title").click();
      await p
        .getByText("Predigt am Sonntag: Einander zuhören.", { exact: true })
        .waitFor();
      await visit(p, "history");
      await axe(p, "journal-history");
      await snap(p, "history-mobile");
      appState = await state(p);
    } finally {
      await c.close();
    }
  });
  await test("Quiz: Story → fünf Fragen → Erklärungen → Reflexion ohne Punktzahl", async () => {
    const { c, p } = await context(appState);
    try {
      await visit(p, "discover", "Verstehen, was du liest.");
      await p.locator("#story-results a").first().click();
      await p.locator('[data-action="quiz"]').click();
      for (let i = 0; i < 5; i++) {
        await p.locator(".answer").first().click();
        await p.locator(".explanation").waitFor();
        if (i === 0) {
          await axe(p, "quiz");
          await snap(p, "quiz-mobile");
        }
        await p.locator('[data-action="next-question"]').click();
      }
      await p.locator('[data-action="reflect-story"]').waitFor();
      await p.locator('[data-action="reflect-story"]').click();
      await p
        .getByLabel("Dein Gedanke", { exact: true })
        .fill("Ich möchte den Zusammenhang noch einmal lesen.");
      await p.getByRole("button", { name: "Gedanken speichern" }).click();
      await p
        .getByRole("button", { name: "Für jetzt reicht der Gedanke" })
        .click();
      const d = await state(p);
      assert.equal(Object.keys(d.quiz).length, 1);
      assert.ok(d.journal[0].storyId != null);
      appState = d;
    } finally {
      await c.close();
    }
  });
  await test("Geführter Weg: Abschnitt lesen → Reflexion → Fortschritt bleibt nach Reload", async () => {
    const { c, p } = await context(appState);
    try {
      await visit(p, "plans");
      await p.locator("main .list a").first().click();
      await p.locator(".plan-sections a").first().click();
      await p.locator(".reading-text").waitFor();
      await p
        .getByRole("button", { name: "Meinen Gedanken festhalten" })
        .click();
      await p
        .getByLabel("Dein Gedanke", { exact: true })
        .fill("Diesen Gedanken aus dem begleiteten Weg nehme ich mit.");
      await p.getByRole("button", { name: "Gedanken speichern" }).click();
      await p
        .getByRole("button", { name: "Für jetzt reicht der Gedanke" })
        .click();
      const d = await state(p);
      assert.equal(
        Object.values(d.guidedPlans)
          .flatMap((x) => Object.values(x))
          .filter(Boolean).length,
        1,
      );
      await p.reload();
      await p.locator("main h1").waitFor();
      assert.deepEqual((await state(p)).guidedPlans, d.guidedPlans);
      appState = await state(p);
    } finally {
      await c.close();
    }
  });
  await test("Backup: Export → Importvorschau → Restore; beschädigte Datei verändert nichts", async () => {
    const { c, p } = await context(appState);
    try {
      await visit(p, "more", "Deine Daten. Deine Entscheidung.");
      const dl = p.waitForEvent("download");
      await p.getByRole("button", { name: "Backup exportieren" }).click();
      const downloaded = await dl,
        file = path.join(out, "acceptance-backup.json");
      await downloaded.saveAs(file);
      const exported = JSON.parse(fs.readFileSync(file));
      assert.equal(exported.data.journal.length, appState.journal.length);
      const before = await state(p);
      await p
        .locator("#import-file")
        .setInputFiles({
          name: "broken.json",
          mimeType: "application/json",
          buffer: Buffer.from("{invalid"),
        });
      await p
        .locator("#toast")
        .filter({ hasText: "Import abgebrochen" })
        .waitFor();
      assert.deepEqual(await state(p), before);
      await p.locator("#import-file").setInputFiles(file);
      await p
        .getByRole("heading", { name: "Backup wiederherstellen?", exact: true })
        .waitFor();
      await p
        .getByRole("button", { name: "Backup wiederherstellen", exact: true })
        .click();
      await p
        .getByRole("heading", {
          name: "Deine Daten. Deine Entscheidung.",
          exact: true,
        })
        .waitFor();
      assert.deepEqual(await state(p), before);
      assert.ok(await p.evaluate((k) => localStorage.getItem(k), KEYS.restore));
      await axe(p, "more");
    } finally {
      await c.close();
    }
  });
  await test("PWA: vollständige Offline-Vorbereitung → offline Reload → beide Bibeln", async () => {
    const { c, p } = await context(appState);
    try {
      await visit(p, "more");
      await p
        .locator("#offline-state")
        .filter({
          hasText:
            "Beide Bibeln und die App sind für dieses Gerät offline bereit.",
        })
        .waitFor({ timeout: 60000 });
      await c.setOffline(true);
      await p.reload();
      await p
        .getByRole("heading", {
          name: "Deine Daten. Deine Entscheidung.",
          exact: true,
        })
        .waitFor();
      for (const tr of ["otb", "l1912"]) {
        await visit(p, "read/GEN/50/" + tr);
        await p.locator(".verse").first().waitFor();
        assert.ok((await p.locator(".verse").count()) > 20);
      }
      assert.equal((await state(p)).journal.length, appState.journal.length);
      await p.reload();
      await p.locator(".verse").first().waitFor();
      await snap(p, "offline-bible-mobile");
    } finally {
      await c.close();
    }
  });
  await test("Fehlerzustände: ungültiger Vers, beschädigter Speicher, fehlende Datei", async () => {
    const { c, p } = await context(null, { serviceWorkers: "block" });
    try {
      await visit(p, "read/ROM/12/otb?from=900&to=999");
      await p
        .getByRole("heading", {
          name: "Dieser Inhalt ist gerade nicht verfügbar.",
          exact: true,
        })
        .waitFor();
      await p.route("**/data/bibles/otb/GEN.json", (route) =>
        route.fulfill({ status: 404, body: "Missing" }),
      );
      await visit(p, "read/GEN/1/otb");
      await p
        .getByRole("heading", {
          name: "Dieser Inhalt ist gerade nicht verfügbar.",
          exact: true,
        })
        .waitFor();
    } finally {
      await c.close();
    }
    const x = await context("{not json");
    try {
      await visit(x.p, "today");
      await x.p.getByRole("alert").waitFor();
      assert.equal(
        await x.p.evaluate((k) => localStorage.getItem(k), KEYS.main),
        "{not json",
      );
      await snap(x.p, "recovery-mobile");
    } finally {
      await x.c.close();
    }
  });
  await test("Responsive, lange Texte, viele Einträge, Zoom, Fokus und Reduced Motion", async () => {
    const d = structuredClone(appState);
    d.paths[0].title = "Ein sehr langer persönlicher Wegname ".repeat(14);
    d.journal[0].text = "EinGedankeOhneLeerzeichen".repeat(2500);
    for (let i = 0; i < 180; i++)
      d.journal.push({
        id: "many-" + i,
        text: "Gedanke " + i,
        date: new Date(Date.now() - i * 86400000).toISOString(),
        type: "Journal",
      });
    for (let i = 0; i < 120; i++)
      d.highlights.push({
        id: "mark-" + i,
        book: "ROM",
        chapter: 12,
        from: 12,
        to: 12,
        label: "Römer 12,12",
        at: new Date().toISOString(),
        translation: "otb",
      });
    const { c, p } = await context(d, { reducedMotion: "reduce" });
    try {
      for (const [w, h] of [
        [320, 568],
        [390, 844],
        [768, 1024],
        [1440, 1000],
      ]) {
        await p.setViewportSize({ width: w, height: h });
        for (const r of [
          "today",
          "paths",
          "path/" + d.paths[0].id,
          "journal",
          "marks",
          "discover",
        ]) {
          await visit(p, r);
          await overflow(p);
        }
        await snap(p, "home-" + w);
      }
      await p.setViewportSize({ width: 390, height: 844 });
      await visit(p, "journal");
      assert.equal(await p.locator(".timeline li").count(), 40);
      await p.getByRole("button", { name: "Weitere Einträge" }).click();
      assert.equal(await p.locator(".timeline li").count(), 80);
      await visit(p, "entry/" + d.journal[0].id);
      assert.equal(
        (await p.locator(".entry-text").textContent()).length,
        d.journal[0].text.length,
      );
      await overflow(p);
      await visit(p, "today");
      await p.locator(".skip-link").focus();
      await p.keyboard.press("Enter");
      assert.equal(await p.evaluate(() => document.activeElement.id), "main");
      await p.evaluate(
        () => (document.documentElement.style.fontSize = "32px"),
      );
      await overflow(p);
      await p.evaluate(() => (document.documentElement.style.fontSize = ""));
      await p.getByRole("link", { name: "Mehr und Einstellungen" }).click();
      await p.getByRole("button", { name: "Einführung ansehen" }).click();
      await p.keyboard.press("Escape");
      assert.equal(await p.locator("dialog[open]").count(), 0);
      await visit(p, "today");
      await axe(p, "home");
      await snap(p, "home-final-mobile");
    } finally {
      await c.close();
    }
  });
  await test("Direkte Adresse und Browser-Reload starten mit richtigen Asset-Pfaden", async () => {
    const { c, p } = await context(null, { serviceWorkers: "block" });
    try {
      await p.goto(base + "app/deep/link#read/ROM/12/otb");
      await p.locator(".verse").first().waitFor();
      await p.reload();
      await p.locator(".verse").first().waitFor();
      assert.equal(await p.locator("#reader-chapter").inputValue(), "12");
    } finally {
      await c.close();
    }
  });
} finally {
  await browser.close();
  server.kill();
  fs.writeFileSync(
    path.join(out, "browser-results.json"),
    JSON.stringify(
      { engine: "Chromium", results, uncaughtErrors: jsErrors },
      null,
      2,
    ),
  );
}
if (results.some((x) => x.status === "failed")) process.exitCode = 1;
