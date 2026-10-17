import { chromium } from "playwright";
import fs from "node:fs";
import assert from "node:assert/strict";
import path from "node:path";
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const out = "prototypes/uiux6",
  base = process.env.UIUX6_URL || "http://localhost:4482",
  results = [],
  failures = [],
  errors = [],
  external = [],
  screens = ["today", "bible", "path", "journal", "discover"];
const axe = fs.readFileSync("node_modules/axe-core/axe.min.js", "utf8");
async function test(name, fn) {
  if (process.env.UIUX6_FUNCTIONAL && /^[ABC]\//.test(name)) return;
  console.log("RUN", name);
  try {
    await fn();
    results.push({ name, status: "PASS" });
    console.log("PASS", name);
  } catch (e) {
    failures.push({ name, error: String(e) });
    console.log("FAIL", name, String(e));
    results.push({ name, status: "FAIL", error: String(e) });
  } finally {
    for (const c of browser.contexts()) await c.close();
  }
}
async function pageFor(
  direction = "A",
  screen = "today",
  width = 390,
  height = 844,
  theme = "",
) {
  const page = await browser.newPage({
    viewport: { width, height },
    reducedMotion: "reduce",
  });
  page.setDefaultTimeout(5000);
  page.setDefaultNavigationTimeout(15000);
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("request", (r) => {
    if (
      !r.url().startsWith(base) &&
      !r.url().startsWith("file:") &&
      !r.url().startsWith("data:")
    )
      external.push(r.url());
  });
  await page.goto(
    `${base}/view.html?direction=${direction}&screen=${screen}${theme ? "&theme=" + theme : ""}`,
  );
  await page.evaluate(() => document.fonts.ready);
  return page;
}
for (const d of ["A", "B", "C"]) {
  for (const screen of screens) {
    for (const [width, height] of [
      [320, 568],
      [430, 932],
      [1440, 900],
    ])
      await test(`${d}/${screen}/${width}: responsive & screenshot`, async () => {
        const p = await pageFor(d, screen, width, height);
        assert.equal(
          await p.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
        );
        await p.screenshot({
          path: `${out}/screenshots/${d}-${screen}-${width}.png`,
        });
        await p.close();
      });
    for (const theme of ["light", "atmospheric", "paper", "night"])
      await test(`${d}/${screen}/${theme}: axe, 390 screenshot`, async () => {
        const p = await pageFor(d, screen, 390, 844, theme);
        await p.addScriptTag({ content: axe });
        const a = await p.evaluate(() =>
          axe.run(document, {
            runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
          }),
        );
        if (a.violations.length)
          throw Error(
            JSON.stringify(
              a.violations.map((x) => ({
                id: x.id,
                impact: x.impact,
                nodes: x.nodes.map((n) => n.target),
              })),
            ),
          );
        await p.screenshot({
          path: `${out}/screenshots/${d}-${screen}-${theme}.png`,
        });
        await p.close();
      });
    await test(`${d}/${screen}: 200% text at 320 + reduced motion`, async () => {
      const p = await pageFor(d, screen, 320, 568);
      await p.addStyleTag({ content: "html{font-size:200%}" });
      assert.equal(
        await p.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
      );
      await p.screenshot({
        path: `${out}/screenshots/${d}-${screen}-text200.png`,
        fullPage: true,
      });
      const animations = await p.evaluate(
        () => document.getAnimations().length,
      );
      assert.equal(animations, 0);
      await p.close();
    });
  }
  await test(`${d}: verse → highlight → note → journal → path; historical truth; no tree growth`, async () => {
    const p = await pageFor(d, "bible");
    await p.locator('[data-verse="5"]').click();
    await p.locator('[data-action="highlight"]').click();
    assert(
      await p
        .locator('[data-verse="5"]')
        .evaluate((e) => e.classList.contains("highlighted")),
    );
    await p.locator('[data-action="note"]').last().click();
    await p
      .locator("#note-text")
      .fill("Synthetische QA-Notiz <script>kein Code</script>");
    await p.locator('form button[type="submit"]').click();
    assert(
      await p
        .locator("#content")
        .innerText()
        .then((x) => x.includes("Synthetische QA-Notiz")),
    );
    assert(
      await p
        .locator(".entry")
        .first()
        .innerText()
        .then((x) => x.includes("Johannes 15,5")),
    );
    await p.locator(".entry").first().click();
    await p.getByRole("button", { name: "Zum verbundenen Weg" }).click();
    assert.equal(await p.locator("#stage").inputValue(), "5");
    await p.locator('[data-action="step"]').click();
    assert.equal(await p.locator("#stage").inputValue(), "5");
    assert.equal(
      await p.locator('[data-action="step"]').getAttribute("aria-pressed"),
      "true",
    );
    await p.locator('[data-action="review"]').click();
    assert((await p.locator("dialog").innerText()).includes("9. Oktober"));
    await p.keyboard.press("Escape");
    assert.equal(
      await p.evaluate(() => document.querySelector("dialog").open),
      false,
    );
    assert.deepEqual(await p.evaluate(() => Object.keys(localStorage)), []);
    await p.close();
  });
  await test(`${d}: both exact translations, local chapter navigation`, async () => {
    const p = await pageFor(d, "bible");
    for (const tr of ["otb", "l1912"])
      for (const chapter of ["1", "3", "15", "16"]) {
        await p.locator("#chapter").selectOption(chapter);
        await p.locator("#translation").selectOption(tr);
        const actual = await p
          .locator(".verse>span:last-child")
          .allTextContents();
        const expected = await p.evaluate(
          ({ tr, chapter }) => FaithPathScripture[tr][chapter].map((x) => x[1]),
          { tr, chapter },
        );
        assert.deepEqual(actual, expected);
      }
    await p.close();
  });
  await test(`${d}: all seven existing tree assets`, async () => {
    const p = await pageFor(d, "path");
    for (let i = 1; i <= 7; i++) {
      await p.locator("#stage").selectOption(String(i));
      await p.waitForFunction(() => {
        const img = document.querySelector(".grove img");
        return img.complete && img.naturalWidth > 0;
      });
      assert(
        await p
          .locator(".grove img")
          .evaluate((e) => e.complete && e.naturalWidth > 0),
      );
      assert(
        (await p.locator(".grove img").getAttribute("src")).endsWith(
          `tree-stage-${i}.webp`,
        ),
      );
    }
    await p.close();
  });
  await test(`${d}: journal search, draft across navigation, keyboard dialog`, async () => {
    const p = await pageFor(d, "journal");
    await p.locator("#journal-search").fill("JOHANNES 15");
    assert.equal(await p.locator(".entry").count(), 2);
    await p.locator("#journal-search").fill("zzzz");
    assert.equal(await p.locator(".entry").count(), 0);
    await p.locator('[data-action="note"]').last().click();
    await p.locator("#note-text").fill("Noch nicht fertig.");
    await p.keyboard.press("Escape");
    await p.locator('[data-go="today"]').first().click();
    await p.locator('nav [data-go="journal"]').click();
    await p.locator('[data-action="note"]').last().click();
    assert.equal(
      await p.locator("#note-text").inputValue(),
      "Noch nicht fertig.",
    );
    for (let i = 0; i < 10; i++) await p.keyboard.press("Tab");
    assert(
      await p.evaluate(() =>
        document.querySelector("dialog").contains(document.activeElement),
      ),
    );
    await p.screenshot({ path: `${out}/screenshots/${d}-composer.png` });
    await p.close();
  });
  await test(`${d}: original quiz, wrong/right, all 6, reflection`, async () => {
    const p = await pageFor(d, "discover");
    await p.locator('[data-action="sample-story"]').click();
    await p.locator('[data-action="start-quiz"]').click();
    const correct = await p.evaluate(() =>
      FaithPathCatalog.story.questions.map((q) => q.c),
    );
    for (let n = 0; n < correct.length; n++) {
      await p
        .locator(
          `[data-answer="${n === 0 ? (correct[n] + 1) % 4 : correct[n]}"]`,
        )
        .click();
      assert.equal(await p.locator(".correct").count(), 1);
      assert(await p.locator(".explanation").isVisible());
      if (n === 0)
        await p.screenshot({
          path: `${out}/screenshots/${d}-quiz-explanation.png`,
        });
      await p.locator('[data-action="next-question"]').click();
    }
    assert(
      (await p.locator("dialog").innerText()).includes(
        "Was bedeutet das für dich",
      ),
    );
    await p.locator('[data-action="reflect"]').click();
    await p.locator("#note-text").fill("Mein freiwilliger Gedanke.");
    await p.locator('form button[type="submit"]').click();
    assert(
      await p
        .locator(".entry")
        .first()
        .innerText()
        .then((t) => t.includes("Mein freiwilliger Gedanke")),
    );
    await p.close();
  });
  await test(`${d}: search stories, filter, result cap`, async () => {
    const p = await pageFor(d, "discover");
    assert((await p.locator("[data-story]").count()) <= 12);
    await p.locator("#discover-search").fill("Johannes");
    assert((await p.locator("[data-story]").count()) > 0);
    await p.locator("#discover-search").fill("zzzz");
    assert.equal(await p.locator("[data-story]").count(), 0);
    await p.locator('[data-filter="themes"]').click();
    await p.locator("#discover-search").fill("");
    assert.equal(await p.locator('[data-action="theme"]').count(), 3);
    await p.locator('[data-action="theme"]').first().click();
    assert(await p.locator(".scripture").isVisible());
    await p.close();
  });
  await test(`${d}: short viewport typing + safe areas`, async () => {
    const p = await pageFor(d, "journal", 320, 360);
    await p.locator('[data-action="note"]').last().click();
    await p
      .locator("#note-text")
      .fill("Tastaturprüfung mit reduzierter sichtbarer Höhe.");
    await p.locator('form button[type="submit"]').scrollIntoViewIfNeeded();
    await p.locator('form button[type="submit"]').click();
    assert(await p.locator(".entry").first().isVisible());
    await p.close();
  });
}
await test("Previously loaded prototype works offline, no service worker", async () => {
  const p = await pageFor("A", "today");
  await p.evaluate(async () => {
    await Promise.all(
      Array.from(
        { length: 7 },
        (_, i) =>
          new Promise((resolve) => {
            const image = new Image();
            image.onload = resolve;
            image.src = `assets/trees/tree-stage-${i + 1}.webp`;
          }),
      ),
    );
  });
  await p.context().setOffline(true);
  await p.locator('nav [data-go="bible"]').click();
  await p.locator('[data-verse="5"]').click();
  await p.getByRole("button", { name: "Notiz", exact: true }).click();
  await p.locator("#note-text").fill("Offline festgehalten.");
  await p.locator('form button[type="submit"]').click();
  assert(
    (await p.locator(".entry").first().innerText()).includes(
      "Offline festgehalten",
    ),
  );
  assert.equal(
    await p.evaluate(() => navigator.serviceWorker.controller),
    null,
  );
  await p.close();
});
await test("Sword demo: 0,1,7,100,1189; exact quotation; no automatic reading count", async () => {
  const p = await pageFor("A", "bible");
  await p.locator('.reader-top [data-action="sword"]').click();
  for (const n of [0, 1, 7, 100, 1189]) {
    await p.locator("#sword-state").selectOption(String(n));
    assert(
      (await p.locator(".sword-count").textContent()).startsWith(String(n)),
    );
    assert.equal(await p.locator(".journey-sword").count(), 1);
    await p.screenshot({ path: `${out}/screenshots/sword-${n}.png` });
  }
  const quote = await p.evaluate(() => FaithPathScripture.otb.ephesians6_17);
  assert.equal(await p.locator("dialog blockquote").textContent(), quote);
  await p.keyboard.press("Escape");
  await p.locator("#chapter").selectOption("3");
  await p.locator('.reader-top [data-action="sword"]').click();
  assert.equal(await p.locator("#sword-state").inputValue(), "1189");
  await p.close();
});
results.push({
  name: "File:// direct opening",
  status: "OPEN",
  reason:
    "Managed Chromium URL policy blocks file:/// (ERR_BLOCKED_BY_ADMINISTRATOR). No policy bypass. Run manually after extracting ZIP.",
});
await test("Local gallery with all three live frames", async () => {
  const p = await browser.newPage();
  await p.goto(base + "/index.html");
  await p.evaluate(() => document.fonts.ready);
  assert.equal(await p.locator("iframe").count(), 1);
  await p.locator("#compare").check();
  assert.equal(await p.locator("iframe").count(), 3);
  await p.screenshot({
    path: `${out}/screenshots/gallery-desktop.png`,
    fullPage: true,
  });
  await p.close();
});
await test("No runtime JavaScript errors or external requests", async () => {
  assert.deepEqual(errors, []);
  assert.deepEqual(external, []);
});
await browser.close();
fs.writeFileSync(
  `${out}/qa/browser.json`,
  JSON.stringify(
    {
      passed: results.filter((r) => r.status === "PASS").length,
      open: results.filter((r) => r.status === "OPEN").length,
      failed: failures.length,
      results,
      failures,
      errors,
      external,
    },
    null,
    2,
  ),
);
console.log(
  JSON.stringify(
    {
      passed: results.filter((r) => r.status === "PASS").length,
      open: results.filter((r) => r.status === "OPEN").length,
      failed: failures.length,
      failures,
    },
    null,
    2,
  ),
);
process.exitCode = failures.length ? 1 : 0;
