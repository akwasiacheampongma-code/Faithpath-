import { chromium } from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs";
const base = "http://localhost:4492";
const b = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const results = [],
  axe = fs.readFileSync("node_modules/axe-core/axe.min.js", "utf8");
async function test(name, run) {
  const p = await b.newPage({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
    acceptDownloads: true,
  });
  p.setDefaultTimeout(6000);
  try {
    await p.goto(base + "/view.html");
    await run(p);
    results.push({ name, status: "PASS" });
  } catch (e) {
    results.push({ name, status: "FAIL", error: String(e) });
  } finally {
    await p.close();
  }
}
await test("Keyboard verse, unobtrusive focus mode, modal trap and focus return", async (p) => {
  await p.evaluate(() => PremiumDemo.open("reader"));
  await p.locator('[data-verse="1"]').focus();
  await p.keyboard.press("Enter");
  assert.equal(
    await p.locator('[data-verse="1"]').getAttribute("aria-pressed"),
    "true",
  );
  await p.locator('[data-action="clear-verse"]').click();
  await p.locator('.reader-toolbar [data-action="focus"]').click();
  assert(
    await p
      .locator('.focus-bar [data-action="focus"]')
      .evaluate((e) => e === document.activeElement),
  );
  await p.keyboard.press("Escape");
  assert(
    !(await p.locator("body").getAttribute("class")).includes("reading-focus"),
  );
  await p.locator('[data-action="chapter-picker"]').click();
  for (let i = 0; i < 9; i++) {
    await p.keyboard.press("Tab");
    assert(
      await p.evaluate(
        () =>
          document.activeElement === document.body ||
          document.querySelector("dialog").contains(document.activeElement),
      ),
    );
  }
  await p.keyboard.press("Escape");
  assert(
    await p
      .locator('[data-action="chapter-picker"]')
      .evaluate((e) => e === document.activeElement),
  );
});
await test("Path steps, archive and restore preserve connections and stage", async (p) => {
  const before = await p.evaluate(() => PremiumDemo.getState());
  await p.evaluate(() => PremiumDemo.open("path", { id: "p-listen" }));
  await p.locator('[data-action="add-step"]').click();
  await p
    .locator("#step-text")
    .fill("Beim nächsten Gespräch wirklich nachfragen.");
  await p.locator('#step-form button[type="submit"]').click();
  await p.locator('[data-action="edit-step"]').last().click();
  await p.locator("#step-text").fill("Erst nachfragen, dann antworten.");
  await p.locator('#step-form button[type="submit"]').click();
  await p.locator('[data-action="toggle-step"]').last().click();
  await p.locator('[data-action="path-options"]').click();
  await p.locator('[data-action="archive-path"]').click();
  await p.locator('[data-action="archive-confirm"]').click();
  await p.locator('[data-action="restore-path"]').click();
  const after = await p.evaluate(() => PremiumDemo.getState());
  assert.equal(after.stage, before.stage);
  assert.equal(after.paths[0].archived, false);
  assert.deepEqual(after.paths[0].links, before.paths[0].links);
  assert.equal(after.paths[0].steps.at(-1).done, true);
});
await test("All seven original stage labels and new illustrations are view-only", async (p) => {
  await p.evaluate(() => PremiumDemo.open("tree"));
  const before = await p.evaluate(() => PremiumDemo.getState());
  await p.locator("summary").click();
  for (let stage = 1; stage <= 7; stage++) {
    await p
      .locator(`[data-action="tree-example"][data-stage="${stage}"]`)
      .click();
    assert.equal(
      await p.locator(".tree-stage-name").innerText(),
      [
        "Samen",
        "Keimling",
        "Junger Olivenbaum",
        "Wachsender Olivenbaum",
        "Starker Olivenbaum",
        "Erste Früchte",
        "Fruchttragender Olivenbaum",
      ][stage - 1],
    );
    assert(
      await p
        .locator(".tree-exhibit img")
        .evaluate((e) => e.complete && e.naturalWidth > 0),
    );
    await p.screenshot({
      path: `prototypes/uiux6-premium/screenshots/tree-stage-${stage}.png`,
    });
  }
  assert.deepEqual(await p.evaluate(() => PremiumDemo.getState()), before);
});
await test("Sword alternatives at zero, one, 100 and all1189 documented chapters", async (p) => {
  for (const count of [0, 1, 100, 1189]) {
    await p.goto(`${base}/view.html?screen=journey&reading=${count}`);
    assert.equal(
      await p.evaluate(() => PremiumDemo.getState().explored.length),
      count,
    );
    for (const variant of ["seal", "vertical"]) {
      await p
        .locator(`[data-action="sword-variant"][data-variant="${variant}"]`)
        .click();
      assert(
        await p
          .locator(".sword-art")
          .evaluate((e) => e.complete && e.naturalWidth > 0),
      );
      await p.screenshot({
        path: `prototypes/uiux6-premium/screenshots/sword-${count}-${variant}.png`,
      });
    }
  }
});
await test("Journal reminder can be deliberately chosen and removed", async (p) => {
  await p.evaluate(() => PremiumDemo.open("entry", { id: "j-now" }));
  await p.locator('[data-action="entry-options"]').click();
  await p.locator('dialog [data-action="remind-note"]').click();
  await p.locator("#reminder-date").fill("2026-10-25");
  await p.locator("#reminder-form button").click();
  assert.equal(
    await p.evaluate(() => PremiumDemo.getState().reminders.length),
    1,
  );
  await p.evaluate(() => PremiumDemo.open("reminders"));
  await p.locator('[data-action="remove-reminder"]').click();
  assert.equal(
    await p.evaluate(() => PremiumDemo.getState().reminders.length),
    0,
  );
});
await test("Actual download and file upload roundtrip retain IDs, snapshots and refs", async (p) => {
  await p.evaluate(() => PremiumDemo.open("backup"));
  const before = await p.evaluate(() => PremiumDemo.getState());
  const wait = p.waitForEvent("download");
  await p.locator('[data-action="export-backup"]').click();
  const d = await wait,
    bytes = fs.readFileSync(await d.path());
  const envelope = JSON.parse(bytes);
  assert.equal(envelope.schema, "faithpath-premium-demo");
  await p
    .locator("#backup-file")
    .setInputFiles({
      name: "demo.json",
      mimeType: "application/json",
      buffer: bytes,
    });
  await p.locator('[data-action="confirm-restore"]').click();
  await p.locator('[data-action="restore-backup"]').click();
  const after = await p.evaluate(() => PremiumDemo.getState());
  for (const k of ["journal", "paths", "reviews", "explored", "reader"])
    assert.deepEqual(after[k], before[k]);
});
await test("Malicious-looking journal text is rendered as text and remains searchable", async (p) => {
  await p.evaluate(() => PremiumDemo.open("editor"));
  await p
    .locator("#note-text")
    .fill('<img src=x onerror="window.injected=1"> Mein Gedanke.');
  await p.locator('#editor-form button[type="submit"]').click();
  assert.equal(await p.evaluate(() => window.injected), undefined);
  assert.equal(await p.locator(".entry-body img").count(), 0);
  await p.evaluate(() => PremiumDemo.open("journal"));
  await p.locator('[data-action="journal-search"]').click();
  await p.locator("#journal-query").fill("onerror");
  assert(
    (await p.locator("#journal-results").innerText()).includes("Mein Gedanke"),
  );
  await p.locator("#journal-query").fill("diesergibtnichtszurueck");
  assert((await p.locator("#journal-results").innerText()).includes("Kein"));
});
await test("Long writing at200% and reduced viewport keeps save reachable", async (p) => {
  await p.setViewportSize({ width: 320, height: 360 });
  await p.goto(base + "/view.html?screen=entry&scenario=long");
  await p.locator('[data-action="edit-note"]').click();
  await p.addStyleTag({ content: "html{font-size:200%}" });
  assert((await p.locator("#note-text").inputValue()).length > 10000);
  await p.locator("#note-text").focus();
  await p.keyboard.press("End");
  assert.equal(
    await p.evaluate(() => document.documentElement.scrollWidth > innerWidth),
    false,
  );
  const save = p.locator('#editor-form button[type="submit"]');
  await save.scrollIntoViewIfNeeded();
  assert(await save.isVisible());
  await p.screenshot({
    path: "prototypes/uiux6-premium/screenshots/editor-long-text200-short-viewport.png",
  });
});
await test("Interactive feedback, restore modal and marked verse pass automatic axe rules", async (p) => {
  for (const state of ["answer", "restore", "verse"]) {
    if (state === "answer") {
      await p.evaluate(() =>
        PremiumDemo.open("story", { unit: "chapter:JHN:15" }),
      );
      await p.locator('[data-action="start-quiz"]').click();
      await p.locator('[data-action="answer"]').first().click();
    }
    if (state === "restore") {
      await p.evaluate(() => PremiumDemo.open("backup"));
      await p.locator('[data-action="sample-backup"]').click();
      await p.locator('[data-action="confirm-restore"]').click();
    }
    if (state === "verse") {
      await p.keyboard.press("Escape");
      await p.evaluate(() => PremiumDemo.open("reader"));
      await p.locator('[data-verse="1"]').click();
      await p.locator('[data-action="mark"]').first().click();
    }
    await p.addScriptTag({ content: axe });
    const a = await p.evaluate(() =>
      axe.run({
        runOnly: {
          type: "tag",
          values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"],
        },
      }),
    );
    fs.writeFileSync(
      `prototypes/uiux6-premium/qa/axe-active-${state}.json`,
      JSON.stringify(
        { violations: a.violations, incomplete: a.incomplete },
        null,
        2,
      ),
    );
    assert.deepEqual(
      a.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
      [],
    );
    await p.screenshot({
      path: `prototypes/uiux6-premium/screenshots/active-${state}.png`,
    });
  }
});
await test("Loaded prototype works offline without a worker or storage writes", async (p) => {
  await p.evaluate(async () => {
    for (const src of [
      ...Array.from({ length: 7 }, (_, i) => `assets/art/tree-${i + 1}.svg`),
      "assets/art/sword-seal.svg",
      "assets/art/sword-vertical.svg",
    ]) {
      const i = new Image();
      i.src = src;
      await i.decode();
    }
  });
  await p.context().setOffline(true);
  await p.evaluate(() =>
    PremiumDemo.open("reader", { book: "PSA", chapter: 119 }),
  );
  assert.equal(await p.locator("[data-verse]").count(), 176);
  await p.locator('[data-verse="5"]').click();
  await p.locator('.verse-dock [data-action="note-reader"]').click();
  await p.locator("#note-text").fill("Offline innerhalb der geöffneten Demo.");
  await p.locator('#editor-form button[type="submit"]').click();
  assert((await p.locator(".entry-body").innerText()).includes("Offline"));
  assert.deepEqual(await p.evaluate(() => Object.keys(localStorage)), []);
  assert.equal(
    await p.evaluate(
      async () => (await navigator.serviceWorker.getRegistrations()).length,
    ),
    0,
  );
});
await test("Gallery controls and unchanged live reference are reachable", async (p) => {
  await p.goto(base + "/index.html");
  await p.locator("#compare").check();
  await p.locator("#reference").selectOption("B");
  await p
    .frameLocator('iframe[title^="Unveränderte"]')
    .locator("body")
    .waitFor();
  await p.locator("#screen").selectOption("editor");
  assert(
    (await p.locator(".frame-label").first().innerText()).includes("390 × 844"),
  );
  await p.locator("#theme").selectOption("night");
  await p.locator("#size").selectOption("320");
  await p.waitForFunction(
    () =>
      document.querySelector('iframe[title="FaithPath Premium-Prototyp"]')
        .contentDocument?.documentElement.dataset.theme === "night",
  );
});
await b.close();
const out = {
  passed: results.filter((r) => r.status === "PASS").length,
  failed: results.filter((r) => r.status === "FAIL").length,
  results,
};
fs.writeFileSync(
  "prototypes/uiux6-premium/qa/product.json",
  JSON.stringify(out, null, 2),
);
console.log(JSON.stringify(out, null, 2));
process.exitCode = out.failed ? 1 : 0;
