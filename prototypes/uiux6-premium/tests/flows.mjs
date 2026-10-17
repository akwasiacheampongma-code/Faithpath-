import { chromium } from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs";
const b = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
let results = [];
async function test(name, fn) {
  const p = await b.newPage({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  p.setDefaultTimeout(process.env.RED ? 1200 : 7000);
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
await test("Reader to original-reference note, focused reading and stable draft", async (p) => {
  await p
    .getByRole("navigation", { name: "Hauptbereiche" })
    .getByRole("button", { name: "Bibel", exact: true })
    .click();
  await p.locator('[data-verse="5"]').click();
  await p
    .getByRole("button", { name: "Salbei markieren", exact: true })
    .click();
  await p.getByRole("button", { name: "Notiz", exact: true }).click();
  await p
    .locator("#note-text")
    .fill("Gedanke zum unveränderten Wort aus Johannes 15,5.");
  await p.getByRole("button", { name: "Zurück", exact: true }).click();
  await p
    .getByRole("navigation", { name: "Hauptbereiche" })
    .getByRole("button", { name: "Journal", exact: true })
    .click();
  await p.locator(".journal-compose").click();
  assert(
    (await p.locator(".writing-reference").innerText()).includes(
      "Johannes 15,5",
    ),
  );
  await p
    .getByRole("button", { name: "Festhalten", exact: false })
    .first()
    .click();
  assert(
    (await p.locator(".entry-body").innerText()).includes("unveränderten Wort"),
  );
  assert(
    (await p.locator(".entry-links").innerText()).includes("Johannes 15,5"),
  );
});
await test("Journal edit and delete/undo preserve original snapshot truth", async (p) => {
  await p.evaluate(() => PremiumDemo.open("entry", { id: "j-before" }));
  await p.getByRole("button", { name: "Bearbeiten", exact: false }).click();
  await p
    .locator("#note-text")
    .fill("Heute anders bearbeiteter Originaleintrag.");
  await p.locator('form button[type="submit"]').click();
  await p
    .getByRole("button", { name: "Rückblick öffnen", exact: false })
    .click();
  assert(
    (await p.locator(".review-pair").innerText()).includes(
      "auch mitten im Alltag bei Jesus",
    ),
  );
  assert(
    !(await p.locator(".review-pair").innerText()).includes(
      "Heute anders bearbeiteter",
    ),
  );
  await p.evaluate(() => PremiumDemo.open("entry", { id: "j-before" }));
  await p.locator('[data-action="entry-options"]').click();
  await p.getByRole("button", { name: "Eintrag löschen", exact: true }).click();
  await p.locator('[data-action="delete-note"]').click();
  assert.equal(
    await p.evaluate(() =>
      PremiumDemo.getState().journal.some((n) => n.id === "j-before"),
    ),
    false,
  );
  await p.getByRole("button", { name: "Rückgängig", exact: true }).click();
  assert.equal(
    await p.evaluate(
      () =>
        PremiumDemo.getState().journal.filter((n) => n.id === "j-before")
          .length,
    ),
    1,
  );
});
await test("Original questions: wrong/right, resume, voluntary reflection", async (p) => {
  await p.evaluate(() => PremiumDemo.open("story", { unit: "chapter:JHN:15" }));
  await p.locator('[data-action="start-quiz"]').click();
  const correct = await p.evaluate(() =>
    PremiumContent.units["chapter:JHN:15"].questions.map((q) => q.c),
  );
  for (let i = 0; i < correct.length; i++) {
    await p
      .locator(
        `[data-action="answer"][data-choice="${i === 0 ? (correct[i] + 1) % 4 : correct[i]}"]`,
      )
      .click();
    assert.equal(await p.locator(".answer.correct").count(), 1);
    if (i === 1) {
      await p
        .getByRole("button", { name: "Später fortsetzen", exact: false })
        .click();
      await p
        .getByRole("button", { name: "Fragenfolge fortsetzen", exact: false })
        .click();
      assert.equal(
        await p.evaluate(() => PremiumDemo.getState().quiz.index),
        1,
      );
    }
    await p.locator('[data-action="next-question"]').click();
  }
  assert(await p.locator(".quiz-complete").isVisible());
  await p.locator('[data-action="reflect-unit"]').click();
  assert(await p.locator("#note-text").isVisible());
});
await test("Backup rejection and two-stage synthetic restore never touch original app keys", async (p) => {
  await p.evaluate(() => PremiumDemo.open("backup"));
  await p
    .getByRole("button", { name: "Fehlerfall ansehen", exact: true })
    .click();
  assert(await p.locator(".error-state").isVisible());
  await p
    .getByRole("button", {
      name: "Mit gültiger Beispieldatei ausprobieren",
      exact: true,
    })
    .click();
  assert(await p.locator(".backup-preview").isVisible());
  const before = await p.evaluate(() => PremiumDemo.getState().journal.length);
  await p.locator('[data-action="confirm-restore"]').click();
  assert.equal(
    await p.evaluate(() => PremiumDemo.getState().journal.length),
    before,
  );
  await p.locator('[data-action="restore-backup"]').click();
  assert.equal(
    await p.evaluate(() => PremiumDemo.getState().journal.length),
    before,
  );
  assert.deepEqual(await p.evaluate(() => Object.keys(localStorage)), []);
});
await test("Chapter opening does not count; explicit completion deduplicates; step does not grow tree", async (p) => {
  const before = await p.evaluate(() => PremiumDemo.getState());
  await p.evaluate(() =>
    PremiumDemo.open("reader", { book: "JHN", chapter: 16 }),
  );
  assert.equal(
    await p.evaluate(() => PremiumDemo.getState().explored.length),
    before.explored.length,
  );
  await p.locator('[data-action="explore"]').click();
  assert.equal(
    await p.evaluate(() => PremiumDemo.getState().explored.length),
    before.explored.length + 1,
  );
  await p.evaluate(() => PremiumDemo.open("path", { id: "p-listen" }));
  await p.locator('[data-action="toggle-step"]').first().click();
  assert.equal(
    await p.evaluate(() => PremiumDemo.getState().stage),
    before.stage,
  );
});
await b.close();
const out = {
  passed: results.filter((r) => r.status === "PASS").length,
  failed: results.filter((r) => r.status === "FAIL").length,
  results,
};
fs.writeFileSync(
  `prototypes/uiux6-premium/qa/flows-${process.env.RED ? "red" : "green"}.json`,
  JSON.stringify(out, null, 2),
);
console.log(JSON.stringify(out, null, 2));
process.exitCode = out.failed ? 1 : 0;
