import { chromium } from "playwright";
import { phase5Fixture } from "../../../tests/phase5-fixtures.mjs";
import { KEYS } from "../../../src/store.js";
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
for (const [screen, hash] of Object.entries({
  today: "today",
  bible: "read/JHN/15/otb",
  path: "paths",
  journal: "journal",
  discover: "discover",
})) {
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    serviceWorkers: "block",
  });
  await page.addInitScript(
    ({ d, keys }) => {
      localStorage.setItem(keys.main, JSON.stringify(d));
      localStorage.setItem(keys.onboard, "1");
    },
    { d: phase5Fixture("active"), keys: KEYS },
  );
  await page.goto("http://localhost:4481/#" + hash);
  await page.waitForTimeout(1200);
  await page.evaluate(() => document.fonts.ready);
  const dismiss = page.getByText("Meldung schließen", { exact: true });
  if (await dismiss.isVisible()) await dismiss.click();
  await page.screenshot({
    path: `prototypes/uiux6/screenshots/before-${screen}-390.png`,
    fullPage: true,
  });
  await page.screenshot({
    path: `prototypes/uiux6/screenshots/before-${screen}-viewport.png`,
  });
  await page.close();
}
await browser.close();
