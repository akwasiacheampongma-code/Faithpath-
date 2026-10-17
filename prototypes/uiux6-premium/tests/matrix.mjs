import { chromium } from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs";
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const base = process.env.PREMIUM_URL || "http://localhost:4492";
const screens = [
    "today",
    "reader",
    "journal",
    "paths",
    "path",
    "editor",
    "entry",
    "review",
    "tree",
    "journey",
    "discover",
    "story",
    "quiz",
    "collection",
    "topic",
    "guided",
    "onboarding",
    "settings",
    "reminders",
    "backup",
    "archive",
    "states",
  ],
  core = ["today", "reader", "journal", "path", "journey", "discover"],
  results = [],
  errors = [],
  external = [],
  assets = [],
  axe = fs.readFileSync("node_modules/axe-core/axe.min.js", "utf8");
async function visit(
  screen,
  width = 390,
  height = 844,
  theme = "light",
  scenario = "returning",
  extra = "",
) {
  const p = await browser.newPage({
    viewport: { width, height },
    reducedMotion: "reduce",
  });
  p.setDefaultTimeout(6000);
  p.on("pageerror", (e) => errors.push(String(e)));
  p.on("request", (r) => {
    if (
      !r.url().startsWith(base) &&
      !r.url().startsWith("blob:") &&
      !r.url().startsWith("data:")
    )
      external.push(r.url());
  });
  p.on("response", (r) => {
    if (r.status() >= 400) assets.push({ url: r.url(), status: r.status() });
  });
  await p.goto(
    `${base}/view.html?screen=${screen}&theme=${theme}&scenario=${scenario}${extra}`,
  );
  await p.evaluate(() => document.fonts.ready);
  if (screen === "quiz") {
    await p.evaluate(() =>
      PremiumDemo.open("story", { unit: "chapter:JHN:15" }),
    );
    await p.locator('[data-action="start-quiz"]').click();
  }
  return p;
}
async function check(name, fn) {
  console.log("RUN", name);
  let p;
  try {
    await fn((x) => (p = x));
    results.push({ name, status: "PASS" });
  } catch (e) {
    results.push({ name, status: "FAIL", error: String(e) });
    console.log("FAIL", name, String(e));
    if (p)
      await p
        .screenshot({
          path: `prototypes/uiux6-premium/qa/failure-${results.length}.png`,
          fullPage: true,
        })
        .catch(() => {});
  } finally {
    if (p) await p.close();
  }
}
for (const screen of screens) {
  for (const theme of ["light", "atmospheric", "paper", "night"])
    await check(`${screen}/${theme}: axe & original assets`, async (track) => {
      const p = await visit(screen, 390, 844, theme);
      track(p);
      assert.equal(
        await p.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
      );
      assert.deepEqual(
        await p.evaluate(() =>
          [...document.images]
            .filter((i) => !i.complete || !i.naturalWidth)
            .map((i) => i.src),
        ),
        [],
      );
      await p.addScriptTag({ content: axe });
      const a = await p.evaluate(() =>
        axe.run(document, {
          runOnly: {
            type: "tag",
            values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"],
          },
        }),
      );
      const record = {
        screen,
        theme,
        violations: a.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          nodes: v.nodes.map((n) => ({
            target: n.target,
            summary: n.failureSummary,
          })),
        })),
        incomplete: a.incomplete.map((v) => ({
          id: v.id,
          targets: v.nodes.map((n) => n.target),
        })),
      };
      fs.writeFileSync(
        `prototypes/uiux6-premium/qa/axe-${screen}-${theme}.json`,
        JSON.stringify(record, null, 2),
      );
      assert.deepEqual(record.violations, []);
      if (core.includes(screen))
        await p.screenshot({
          path: `prototypes/uiux6-premium/screenshots/${screen}-${theme}.png`,
        });
    });
  for (const [width, height] of [
    [320, 568],
    [430, 932],
    [1440, 900],
  ])
    await check(`${screen}/${width}: responsive`, async (track) => {
      const p = await visit(screen, width, height);
      track(p);
      const overflow = await p.evaluate(() =>
        [...document.querySelectorAll("body *")]
          .filter(
            (e) =>
              e.getBoundingClientRect().right > innerWidth + 1 &&
              getComputedStyle(e).position !== "fixed",
          )
          .map((e) => ({ tag: e.tagName, cls: String(e.className) })),
      );
      assert.equal(
        await p.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
        JSON.stringify(overflow),
      );
      if (
        core.includes(screen) ||
        ["onboarding", "editor", "backup", "quiz"].includes(screen)
      )
        await p.screenshot({
          path: `prototypes/uiux6-premium/screenshots/${screen}-${width}.png`,
        });
    });
  await check(
    `${screen}/320: actual 200% text & reduced motion`,
    async (track) => {
      const p = await visit(screen, 320, 568);
      track(p);
      await p.addStyleTag({ content: "html{font-size:200%}" });
      const overflow = await p.evaluate(() =>
        [...document.querySelectorAll("body *")]
          .filter((e) => e.getBoundingClientRect().right > innerWidth + 1)
          .map((e) => ({
            tag: e.tagName,
            cls: String(e.className),
            right: e.getBoundingClientRect().right,
            text: e.textContent.slice(0, 35),
          })),
      );
      assert.equal(
        await p.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
        JSON.stringify(overflow),
      );
      assert.equal(
        await p.evaluate(() => getComputedStyle(document.body).fontSize),
        "32px",
      );
      assert.equal(await p.evaluate(() => document.getAnimations().length), 0);
      await p.screenshot({
        path: `prototypes/uiux6-premium/screenshots/${screen}-text200.png`,
      });
    },
  );
}
await check(
  "Long chapter Psalm119 both translations and all176verses",
  async (track) => {
    const p = await visit(
      "reader",
      320,
      568,
      "light",
      "returning",
      "&book=PSA&chapter=119",
    );
    track(p);
    for (const tr of ["otb", "l1912"]) {
      await p.evaluate(
        (tr) =>
          PremiumDemo.open("reader", {
            book: "PSA",
            chapter: 119,
            translation: tr,
          }),
        tr,
      );
      assert.equal(await p.locator("[data-verse]").count(), 176);
      const actual = await p.locator("[data-verse]>span").allTextContents(),
        expected = await p.evaluate(
          (tr) => PremiumContent.bibles[tr].PSA[119].map((v) => v[1]),
          tr,
        );
      assert.deepEqual(actual, expected);
    }
    await p.screenshot({
      path: "prototypes/uiux6-premium/screenshots/psalm119-start.png",
    });
    await p.locator(".chapter-ending").scrollIntoViewIfNeeded();
    await p.screenshot({
      path: "prototypes/uiux6-premium/screenshots/psalm119-end.png",
    });
  },
);
for (const scenario of ["empty", "many", "long", "archived"])
  for (const screen of ["journal", "paths", "entry"])
    await check(`${scenario}/${screen}/320: edge state`, async (track) => {
      const p = await visit(screen, 320, 568, "light", scenario);
      track(p);
      assert.equal(
        await p.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
      );
      await p.screenshot({
        path: `prototypes/uiux6-premium/screenshots/${scenario}-${screen}.png`,
      });
    });
await check(
  "No external request, asset failure or runtime exception",
  async () => {
    assert.deepEqual(errors, []);
    assert.deepEqual(external, []);
    assert.deepEqual(assets, []);
  },
);
await browser.close();
const out = {
  passed: results.filter((r) => r.status === "PASS").length,
  failed: results.filter((r) => r.status === "FAIL").length,
  errors,
  external,
  assets,
  results,
};
fs.writeFileSync(
  "prototypes/uiux6-premium/qa/matrix.json",
  JSON.stringify(out, null, 2),
);
console.log(
  JSON.stringify(
    {
      passed: out.passed,
      failed: out.failed,
      failures: results.filter((r) => r.status === "FAIL"),
    },
    null,
    2,
  ),
);
process.exitCode = out.failed ? 1 : 0;
