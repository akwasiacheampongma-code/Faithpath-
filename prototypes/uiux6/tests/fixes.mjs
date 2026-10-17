import { chromium } from "playwright";
import assert from "node:assert/strict";
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
let failed = 0;
async function test(name, fn) {
  const p = await browser.newPage({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  p.setDefaultTimeout(5000);
  try {
    await p.goto("http://localhost:4482/view.html?screen=bible");
    await fn(p);
    console.log("PASS", name);
  } catch (e) {
    failed++;
    console.log("FAIL", name, String(e));
  } finally {
    await p.close();
  }
}
await test("Personal note titles stay literal in entry dialog", async (p) => {
  await p.locator('[data-verse="5"]').click();
  await p.getByRole("button", { name: "Notiz", exact: true }).click();
  await p
    .locator("#note-text")
    .fill('<img data-injected src=x onerror="alert(1)">');
  await p.locator('form button[type="submit"]').click();
  await p.locator(".entry").first().click();
  assert.equal(await p.locator("dialog [data-injected]").count(), 0);
});
await test("Cancelled draft preserves original Bible reference across navigation", async (p) => {
  await p.locator('[data-verse="5"]').click();
  await p.getByRole("button", { name: "Notiz", exact: true }).click();
  await p.locator("#note-text").fill("Gedanke zu Johannes 15,5.");
  await p.keyboard.press("Escape");
  await p.locator("#chapter").selectOption("3");
  await p.locator('[data-verse="2"]').click();
  await p.getByRole("button", { name: "Notiz", exact: true }).click();
  assert((await p.locator("dialog .reference").textContent()).includes("15,5"));
  await p.locator('form button[type="submit"]').click();
  assert(
    (await p.locator(".entry").first().innerText()).includes("Johannes 15,5"),
  );
});
await test("Explicit Johannes 15 link actually opens chapter 15", async (p) => {
  await p.locator("#chapter").selectOption("3");
  await p.locator('[data-go="path"]').click();
  await p.getByRole("button", { name: "Johannes 15 lesen" }).click();
  assert.equal(await p.locator("#chapter").inputValue(), "15");
});
await browser.close();
process.exitCode = failed ? 1 : 0;
