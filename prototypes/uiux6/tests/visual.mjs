import { chromium } from "playwright";
import fs from "node:fs";
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const results = [];
for (const direction of ["A", "B", "C"])
  for (const screen of ["today", "bible", "path", "journal", "discover"]) {
    const page = await browser.newPage({
      viewport: { width: 390, height: 844 },
    });
    await page.goto(
      `http://localhost:4482/view.html?direction=${direction}&screen=${screen}`,
    );
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: `prototypes/uiux6/screenshots/${direction}-${screen}-390.png`,
      fullPage: false,
    });
    await page.screenshot({
      path: `prototypes/uiux6/screenshots/${direction}-${screen}-390-full.png`,
      fullPage: true,
    });
    results.push({
      direction,
      screen,
      overflow: await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    });
    await page.close();
  }
await browser.close();
fs.writeFileSync(
  "prototypes/uiux6/qa/visual-canonical.json",
  JSON.stringify(results, null, 2),
);
