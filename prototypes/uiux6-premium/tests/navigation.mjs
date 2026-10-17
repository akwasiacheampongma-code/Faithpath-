import { chromium } from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs";
const b = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const results = [];
async function test(name, fn) {
  const p = await b.newPage({
    viewport: { width: 320, height: 568 },
    reducedMotion: "reduce",
  });
  const errors = [];
  p.on("pageerror", (e) => errors.push(String(e)));
  p.setDefaultTimeout(6000);
  try {
    await p.goto("http://localhost:4492/view.html");
    await fn(p);
    assert.deepEqual(errors, []);
    results.push({ name, status: "PASS" });
  } catch (e) {
    results.push({ name, status: "FAIL", error: String(e) });
  } finally {
    await p.close();
  }
}
await test("Both voluntary onboarding choices open the promised areas", async (p) => {
  for (const target of ["discover", "reader"]) {
    await p.evaluate(() => PremiumDemo.open("onboarding"));
    await p.locator(`.onboarding-choices [data-go="${target}"]`).click();
    assert.equal(await p.locator(".screen-" + target).count(), 1);
  }
});
await test("Discovery search, every filter, bounded pagination and empty reset", async (p) => {
  await p.evaluate(() => PremiumDemo.open("discover"));
  for (const kind of ["story", "chapter", "themes", "guided"]) {
    await p
      .locator(`[data-action="discovery-filter"][data-kind="${kind}"]`)
      .first()
      .click();
    assert.equal(
      await p
        .locator(`[data-action="discovery-filter"][data-kind="${kind}"]`)
        .first()
        .getAttribute("aria-pressed"),
      "true",
    );
    assert((await p.locator("#discovery-results").innerText()).length > 40);
  }
  await p
    .locator('[data-action="discovery-filter"][data-kind="story"]')
    .click();
  const first = await p
    .locator('#discovery-results [data-action="open-content"]')
    .count();
  assert.equal(first, 12);
  await p.locator('[data-action="more-discovery"]').click();
  assert.equal(
    await p.locator('#discovery-results [data-action="open-content"]').count(),
    24,
  );
  await p.locator("#discovery-query").fill("xxxxxxxxnichtvorhanden");
  assert.equal(
    await p.locator('#discovery-results [data-action="open-content"]').count(),
    0,
  );
  await p.locator('[data-action="reset-discovery"]').click();
  await p.locator("#discovery-query").fill("Weinstock");
  await p
    .locator(
      '#discovery-results [data-action="open-content"][data-id="NS-0297"]',
    )
    .click();
  assert(
    (await p.locator(".story-opening").innerText()).includes(
      "Der rechte Weinstock",
    ),
  );
});
await test("Default search includes themes and guided ways as its label promises", async (p) => {
  await p.evaluate(() => PremiumDemo.open("discover"));
  const examples = await p.evaluate(() => [
    {
      kind: "theme",
      id: PremiumContent.themes[0].id,
      title: PremiumContent.themes[0].title,
    },
    {
      kind: "guided",
      id: PremiumContent.guided[0].id,
      title: PremiumContent.guided[0].title,
    },
  ]);
  for (const item of examples) {
    await p.locator("#discovery-query").fill(item.title);
    assert.equal(
      await p
        .locator(
          `#discovery-results [data-action="open-content"][data-kind="${item.kind}"][data-id="${item.id}"]`,
        )
        .count(),
      1,
    );
  }
});
await test("Theme/guide references open real bundled reading; browser Back retains prior area", async (p) => {
  for (const screen of ["topic", "guided"]) {
    await p.evaluate((screen) => PremiumDemo.open(screen), screen);
    await p.locator('#main [data-go="reader"]').first().click();
    await p.locator(".screen-reader").waitFor();
    assert((await p.locator(".bible-text .verse[data-verse]").count()) > 0);
    await p.goBack();
    await p.locator(".screen-" + screen).waitFor({ state: "visible" });
    assert.equal(await p.locator(".screen-" + screen).count(), 1);
  }
});
await test("Journal Bible reference opens the actual verse and returns to its entry", async (p) => {
  await p.evaluate(() => PremiumDemo.open("entry", { id: "j-now" }));
  await p.locator('.entry-links [data-go="reader"]').click();
  await p.locator(".screen-reader").waitFor();
  assert.equal(
    await p
      .locator('.bible-text .verse[data-verse="5"]')
      .getAttribute("aria-pressed"),
    "true",
  );
  await p.goBack();
  await p.locator(".screen-entry").waitFor();
  assert(
    (await p.locator(".entry-body").innerText()).includes(
      "Ich muss nicht sofort",
    ),
  );
});
await test("Leaving and returning to the same backup route invalidates a delayed read", async (p) => {
  await p.evaluate(() => PremiumDemo.open("backup"));
  const bytes = await p.evaluate(() =>
    JSON.stringify(PremiumModel.makeBackup(PremiumDemo.getState())),
  );
  await p.evaluate(() => {
    const old = File.prototype.text;
    File.prototype.text = async function () {
      const t = await old.call(this);
      return new Promise(
        (resolve) => (window.finishDelayed = () => resolve(t)),
      );
    };
  });
  await p.locator("#backup-file").setInputFiles({
    name: "slow.json",
    mimeType: "application/json",
    buffer: Buffer.from(bytes),
  });
  await p.waitForFunction(() => window.finishDelayed);
  await p.evaluate(() => PremiumDemo.open("journal"));
  await p.evaluate(() => PremiumDemo.open("backup"));
  await p.evaluate(() => window.finishDelayed());
  await p.waitForTimeout(100);
  assert.equal(await p.locator(".backup-preview").count(), 0);
  assert.equal(await p.locator(".loading-line").count(), 0);
});
await test("State examples expose loading/error/success honestly; retry functions", async (p) => {
  await p.evaluate(() => PremiumDemo.open("states"));
  await p.locator('[data-action="state-example"][data-kind="loading"]').click();
  assert(await p.locator('[aria-busy="true"]').isVisible());
  await p.locator('[data-action="state-example"][data-kind="error"]').click();
  assert(await p.locator(".error-state").isVisible());
  await p.locator('[data-action="retry-state"]').click();
  await p.locator(".success-state").waitFor({ state: "visible" });
});
await b.close();
const out = {
  passed: results.filter((x) => x.status === "PASS").length,
  failed: results.filter((x) => x.status === "FAIL").length,
  results,
};
fs.writeFileSync(
  "prototypes/uiux6-premium/qa/navigation.json",
  JSON.stringify(out, null, 2),
);
console.log(JSON.stringify(out, null, 2));
process.exitCode = out.failed ? 1 : 0;
