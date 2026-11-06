import { chromium, expect } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
const root = "docs/evidence/personal-screens";
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
    const file = `${title}-${name}.png`;
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `${root}/${file}` });
    screens.push({
      file,
      width,
      height,
      scenario,
      route: new URL(page.url()).pathname,
      kind: "Chromium simulated viewport with synthetic personal data",
    });
  }
  await page.goto(
    "http://localhost:4173/vorhaben?start=1&book=MRK&chapter=4&from=35&to=35",
  );
  await page
    .getByRole("textbox", { name: "Name deines Vorhabens" })
    .fill("Mehr Raum zum Zuhören");
  await page
    .getByRole("textbox", { name: "Was bewegt dich? (freiwillig)" })
    .fill(
      "Ich möchte im Gespräch aufmerksam sein und meine Fragen ehrlich aussprechen.",
    );
  await page
    .getByRole("textbox", { name: "Dein erster kleiner Schritt (freiwillig)" })
    .fill("Vor meiner Antwort einen Moment innehalten.");
  await expect(
    page.getByText("Entwurf auf diesem Gerät gesichert.", { exact: true }),
  ).toBeVisible();
  await capture(
    "goal-editor",
    "Saved personal-goal draft with real Bible reference",
  );
  await page
    .getByRole("button", { name: "Vorhaben anlegen", exact: true })
    .click();
  await page.getByText("Deine kleinen Schritte").waitFor();
  await page
    .getByRole("button", { name: "Als ausprobiert festhalten", exact: true })
    .click();
  await capture("goal-detail", "Personal goal and explicitly confirmed step");
  await page
    .getByRole("button", {
      name: "Freiwilligen Rückblick schreiben",
      exact: true,
    })
    .click();
  await page
    .getByRole("textbox", { name: "Dein freiwilliger Rückblick" })
    .fill(
      "Heute habe ich zuerst zugehört. Es war ein kleiner Moment, der uns gutgetan hat.",
    );
  await page
    .getByRole("switch", { name: "Erfahrung im Alltag selbst bestätigen" })
    .click();
  await expect(
    page.getByText("Entwurf auf diesem Gerät gesichert.", { exact: true }),
  ).toBeVisible();
  await capture("review-editor", "Voluntary reflection with source snapshot");
  await page
    .getByRole("button", { name: "Rückblick festhalten", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Zurück zu deinen Vorhaben", exact: true })
    .click();
  await page
    .getByRole("button", {
      name: "Vorhaben öffnen: Mehr Raum zum Zuhören",
      exact: true,
    })
    .waitFor();
  await capture("goals", "Active personal goals");
  await page.goto("http://localhost:4173/sammlung");
  await page
    .getByRole("button", { name: "Einen Gedanken festhalten", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Deine Worte", exact: true })
    .fill(
      "Nicht jede Frage braucht heute eine fertige Antwort. Diesen Gedanken möchte ich später weiterdenken.",
    );
  await expect(
    page.getByText("Entwurf auf diesem Gerät gesichert.", { exact: true }),
  ).toBeVisible();
  await capture("journal-draft", "Persisted journal draft");
  await page
    .getByRole("button", { name: "Editor schließen", exact: true })
    .click();
  await capture("journal-resume", "Journal offers draft recovery");
  await context.close();
}
await browser.close();
await writeFile(
  `${root}/manifest.json`,
  JSON.stringify({ capturedAt: new Date().toISOString(), screens }, null, 2),
);
console.log(`${screens.length} personal-feature screenshots captured.`);
