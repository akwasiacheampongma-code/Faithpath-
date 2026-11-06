import { chromium, expect } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { faithpathFixture } from "../tests/fixtures/faithpath-v5.ts";
const root = "docs/evidence/import-screens";
await mkdir(root, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const screens = [];
for (const [name, width, height] of [
  ["mobile", 390, 844],
  ["desktop", 1440, 1080],
]) {
  const context = await browser.newContext({ viewport: { width, height } }),
    page = await context.newPage();
  async function capture(title, scenario) {
    await page.evaluate(() => document.fonts.ready);
    const file = `${title}-${name}.png`;
    await page.screenshot({ path: `${root}/${file}` });
    screens.push({
      file,
      width,
      height,
      scenario,
      route: new URL(page.url()).pathname,
      kind: "Chromium simulated viewport; synthetic V5 source, no personal user data",
    });
  }
  await page.goto("http://localhost:4173/importieren");
  await expect(
    page.getByText("Von FaithPath zu OLIVA.", { exact: true }),
  ).toBeVisible();
  await capture("import-start", "Read-only file choice and explanation");
  const chooser = page.waitForEvent("filechooser");
  await page
    .getByRole("button", { name: "FaithPath-Datei auswählen", exact: true })
    .click();
  await (
    await chooser
  ).setFiles({
    name: "synthetic-faithpath-v5.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(faithpathFixture(), null, 2)),
  });
  await expect(page.getByText("Das kommt mit.", { exact: true })).toBeVisible();
  await page
    .getByText("Das kommt mit.", { exact: true })
    .scrollIntoViewIfNeeded();
  await capture("import-preview", "Validated preview before mutation");
  await page
    .getByRole("button", {
      name: "Jetzt sichern und Import übernehmen",
      exact: true,
    })
    .click();
  await expect(page.getByText(/Import abgeschlossen/)).toBeVisible();
  await page
    .getByRole("button", { name: "Originalarchiv öffnen", exact: true })
    .click();
  await expect(
    page.getByText("Was du mitgebracht hast.", { exact: true }),
  ).toBeVisible();
  await capture("import-archive", "Immutable original source and exact export");
  await page.goto("http://localhost:4173/vorhaben");
  await page
    .getByRole("button", {
      name: "Vorhaben öffnen: In Ruhe zuhören",
      exact: true,
    })
    .click();
  await page
    .getByText("Der damalige Gedanke.", { exact: true })
    .scrollIntoViewIfNeeded();
  await expect(
    page.getByText("Der damalige Gedanke.", { exact: true }),
  ).toBeVisible();
  await capture(
    "import-history",
    "Historic source snapshot, distinct from new OLIVA reviews",
  );
  await page.goto("http://localhost:4173/importieren");
  await page
    .getByRole("button", { name: "Rückkehr prüfen", exact: true })
    .click();
  await page
    .getByText("Alle Änderungen seit diesem Sicherungsstand werden ersetzt.", {
      exact: true,
    })
    .scrollIntoViewIfNeeded();
  await capture(
    "import-rollback",
    "Explicit replacement warning before rollback",
  );
  await context.close();
}
await browser.close();
await writeFile(
  `${root}/manifest.json`,
  JSON.stringify({ capturedAt: new Date().toISOString(), screens }, null, 2) +
    "\n",
);
console.log(`${screens.length} import screenshots captured.`);
