import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
const root = "docs/evidence/screens";
await mkdir(root, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const results = [];
for (const viewport of [
  { width: 1440, height: 1080, name: "desktop" },
  { width: 390, height: 844, name: "mobile" },
]) {
  const context = await browser.newContext({ viewport }),
    page = await context.newPage();
  const routes = [
    ["home", "/"],
    ["bible", "/bibel"],
    ["paths", "/wege"],
    ["path", "/weg/jesus"],
    ["reader", "/lesen/MRK?chapter=4&from=35&to=41&mode=deep"],
    ["garden", "/garten"],
    ["collection", "/sammlung"],
    ["settings", "/einstellungen"],
  ];
  for (const [name, route] of routes) {
    await page.goto("http://localhost:4173" + route);
    await page.getByRole("button").first().waitFor();
    await page.evaluate(() => document.fonts.ready);
    const file = `${name}-${viewport.name}.png`;
    await page.screenshot({ path: path.join(root, file) });
    results.push({
      file,
      route,
      viewport: { width: viewport.width, height: viewport.height },
      kind: "Chromium simulated viewport",
    });
  }
  await page.goto("http://localhost:4173/garten");
  await page
    .getByRole("button", {
      name: "Stadium 7 ansehen: Erste Früchte",
      exact: true,
    })
    .click();
  await page.screenshot({
    path: path.join(root, `garden-preview-${viewport.name}.png`),
  });
  await page.goto("http://localhost:4173/sammlung");
  await page
    .getByRole("button", { name: "Buchschwerter", exact: true })
    .click();
  await page.screenshot({
    path: path.join(root, `swords-${viewport.name}.png`),
  });
  await page.goto("http://localhost:4173/");
  await page
    .getByRole("button", { name: "Dunklen Modus aktivieren", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Hellen Modus aktivieren", exact: true })
    .waitFor();
  await page.screenshot({
    path: path.join(root, `home-dark-${viewport.name}.png`),
  });
  await context.close();
}
await browser.close();
await writeFile(
  path.join(root, "manifest.json"),
  JSON.stringify(
    { captured_on: new Date().toISOString(), screens: results },
    null,
    2,
  ),
);
console.log(
  `Captured main views, two viewport sizes, tree preview, swords and dark mode.`,
);
