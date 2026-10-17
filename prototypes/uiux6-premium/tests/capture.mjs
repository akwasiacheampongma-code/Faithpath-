import { chromium } from "playwright";
import fs from "node:fs";
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
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
];
let results = [];
for (const screen of screens) {
  const p = await browser.newPage({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  p.on("pageerror", (e) => console.log("ERROR", screen, String(e)));
  await p.goto(`http://localhost:4492/view.html?screen=${screen}`);
  await p.evaluate(() => document.fonts.ready);
  if (screen === "quiz") {
    await p.evaluate(() => {
      PremiumModel.startQuiz(PremiumDemo.getState(), "chapter:JHN:15");
    });
    await p.evaluate(() =>
      PremiumDemo.open("story", { unit: "chapter:JHN:15" }),
    );
    await p.locator('[data-action="start-quiz"]').click();
  }
  await p.screenshot({
    path: `prototypes/uiux6-premium/screenshots/new-${screen}-390.png`,
  });
  await p.screenshot({
    path: `prototypes/uiux6-premium/screenshots/new-${screen}-390-full.png`,
    fullPage: true,
  });
  results.push({
    screen,
    overflow: await p.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  });
  await p.close();
}
await browser.close();
fs.writeFileSync(
  "prototypes/uiux6-premium/qa/canonical.json",
  JSON.stringify(results, null, 2),
);
