import { chromium } from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs";
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const results = [];
async function test(name, fn) {
  const p = await browser.newPage({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  p.setDefaultTimeout(6000);
  try {
    await p.goto("http://localhost:4492/view.html");
    await fn(p);
    results.push({ name, status: "PASS" });
  } catch (e) {
    results.push({ name, status: "FAIL", error: String(e) });
  } finally {
    await p.close();
  }
}
await test("Discard/back buttons do not submit the journal form", async (p) => {
  await p.evaluate(() => PremiumDemo.open("editor"));
  const before = await p.evaluate(() => PremiumDemo.getState().journal.length);
  await p
    .locator("#note-text")
    .fill("Diese Worte sind noch nicht gespeichert.");
  await p.locator('[data-action="discard-draft"]').click();
  assert(await p.locator("dialog").evaluate((e) => e.open));
  assert.equal(
    await p.evaluate(() => PremiumDemo.getState().journal.length),
    before,
  );
  await p
    .getByRole("button", { name: "Dialog schließen", exact: true })
    .click();
  await p.locator('[data-action="editor-back"]').click();
  assert.equal(
    await p.evaluate(() => PremiumDemo.getState().journal.length),
    before,
  );
  assert.equal(
    await p.evaluate(() => PremiumDemo.getState().draft.text),
    "Diese Worte sind noch nicht gespeichert.",
  );
});
await test("Late file cannot change the candidate already previewed and confirmed", async (p) => {
  await p.evaluate(() => PremiumDemo.open("backup"));
  const late = await p.evaluate(() => {
    const b = PremiumModel.makeBackup(PremiumDemo.getState());
    b.data.journal[0].title = "LATE FILE NEVER PREVIEWED";
    return b;
  });
  await p.evaluate(() => {
    const native = File.prototype.text;
    File.prototype.text = async function () {
      const text = await native.call(this);
      return new Promise((resolve) => {
        window.finishFileRead = () => resolve(text);
        window.fileStarted = true;
      });
    };
  });
  await p
    .locator("#backup-file")
    .setInputFiles({
      name: "late.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(late)),
    });
  await p.waitForFunction(() => window.fileStarted);
  await p.locator('[data-action="sample-backup"]').click();
  await p.locator('[data-action="confirm-restore"]').click();
  await p.evaluate(() => window.finishFileRead());
  await p.waitForTimeout(100);
  assert(await p.locator("dialog").evaluate((e) => e.open));
  await p.locator('[data-action="restore-backup"]').click();
  assert.notEqual(
    await p.evaluate(() => PremiumDemo.getState().journal[0].title),
    "LATE FILE NEVER PREVIEWED",
  );
});
for (const [name, mutate] of [
  ["translation", (b) => (b.data.reader.translation = "bogus")],
  [
    "unavailable reader",
    (b) => {
      b.data.reader.book = "GEN";
      b.data.reader.chapter = 50;
    },
  ],
  [
    "quiz index",
    (b) =>
      (b.data.quiz = {
        unitId: "chapter:JHN:15",
        index: 99,
        answers: {},
        complete: false,
      }),
  ],
])
  await test(`Untrusted ${name} backup rejected before valid preview`, async (p) => {
    await p.evaluate(() => PremiumDemo.open("backup"));
    const before = await p.evaluate(() => PremiumDemo.getState().journal);
    const b = await p.evaluate(() =>
      PremiumModel.makeBackup(PremiumDemo.getState()),
    );
    mutate(b);
    await p
      .locator("#backup-file")
      .setInputFiles({
        name: "invalid.json",
        mimeType: "application/json",
        buffer: Buffer.from(JSON.stringify(b)),
      });
    await p.locator(".error-state").waitFor();
    assert.equal(await p.locator(".backup-preview").count(), 0);
    assert.deepEqual(
      await p.evaluate(() => PremiumDemo.getState().journal),
      before,
    );
  });
await test("New unrelated path never inherits old Bible links or historical review", async (p) => {
  await p.evaluate(() => PremiumDemo.open("paths"));
  await p.locator('[data-action="new-path"]').click();
  await p.locator("#path-title").fill("Ein neuer Weg ohne Geschichte");
  await p.locator('form button[type="submit"]').click();
  assert.equal(await p.locator(".connected-scripture").count(), 0);
  assert.equal(await p.locator(".review-teaser").count(), 0);
});
await test("Reflection from an old review retains the words and date actually displayed there", async (p) => {
  await p.evaluate(() => PremiumDemo.open("entry", { id: "j-before" }));
  await p.locator('[data-action="edit-note"]').click();
  await p.locator("#note-text").fill("Neu bearbeitete Worte vom 17. Oktober.");
  await p.locator('form button[type="submit"]').click();
  await p.evaluate(() => PremiumDemo.open("review", { id: "r-listen" }));
  const oldText = await p
    .locator(".review-pair article")
    .first()
    .locator("blockquote")
    .textContent();
  await p.locator('[data-action="review-note"]').click();
  assert.equal(
    await p.locator(".original-thought>p:last-child").textContent(),
    oldText,
  );
  assert(
    (await p.locator(".original-thought").textContent()).includes("9. Oktober"),
  );
});
await browser.close();
const result = {
  passed: results.filter((r) => r.status === "PASS").length,
  failed: results.filter((r) => r.status === "FAIL").length,
  results,
};
fs.writeFileSync(
  `prototypes/uiux6-premium/qa/regressions-${process.env.RED ? "red" : "green"}.json`,
  JSON.stringify(result, null, 2),
);
console.log(JSON.stringify(result, null, 2));
process.exitCode = result.failed ? 1 : 0;
