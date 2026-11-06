import { chromium, expect as baseExpect } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
const expect = baseExpect.configure({ timeout: 30000 });
const root = "docs/evidence/session-04-screens";
await mkdir(root, { recursive: true });
const browser = await chromium.launch({
  executablePath:
    process.env.CHROMIUM_PATH ??
    (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
  args: ["--no-sandbox"],
});
const screens = [];
try {
  for (const [name, width, height] of [
    ["mobile", 390, 844],
    ["desktop", 1440, 1080],
  ]) {
    let context = await browser.newContext({
      viewport: { width, height },
      reducedMotion: "reduce",
    });
    let page = await context.newPage();
    async function capture(title, scenario) {
      const file = `${title}-${name}.png`;
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: `${root}/${file}` });
      screens.push({
        file,
        width,
        height,
        scenario,
        route: new URL(page.url()).pathname + new URL(page.url()).search,
        kind: "Chromium simulated viewport; synthetic personal data",
      });
    }
    async function saved() {
      await expect(
        page.getByText("Entwurf auf diesem Gerät gesichert.", { exact: true }),
      ).toBeVisible();
    }
    await page.goto("http://localhost:4173/");
    await page
      .getByRole("textbox", {
        name: "Deine freiwillige Tagesreflexion",
        exact: true,
      })
      .fill(
        "Heute möchte ich einer offenen Frage Raum geben. Ich darf später weiterdenken.",
      );
    await saved();
    await expect(
      page.getByText("Für den Offline-Neustart bereit.", { exact: true }),
    ).toBeVisible({ timeout: 30000 });
    await capture(
      "daily-draft",
      "Daily words saved as draft without creating a reflection",
    );
    await page
      .getByRole("button", { name: "Mein Garten", exact: true })
      .click();
    await page
      .getByRole("textbox", {
        name: "Eine freiwillig gelebte Erfahrung",
        exact: true,
      })
      .fill(
        "Ich habe mir Zeit zum Zuhören genommen. Diesen Moment möchte ich noch beschreiben.",
      );
    await saved();
    await capture(
      "garden-draft",
      "Experience remains a draft until explicit confirmation",
    );
    await page.goto("http://localhost:4173/sammlung?tab=Entw%C3%BCrfe");
    await expect(
      page.getByText("Was du begonnen hast.", { exact: true }),
    ).toBeVisible();
    await capture(
      "draft-inbox",
      "Durable draft overview with links to original editors",
    );
    await page.goto("http://localhost:4173/lesen/MRK?chapter=4&verse=35");
    await page
      .getByRole("textbox", { name: "Notiz zu Vers 35", exact: true })
      .fill("Was kann das gemeinsame Aufbrechen heute für mich bedeuten?");
    await saved();
    await capture(
      "verse-draft",
      "Exact verse navigation and scoped note draft",
    );
    await page.goto("http://localhost:4173/lesen/MRK?chapter=4&mode=deep");
    await page
      .getByRole("button", { name: "Eine kleine Frage zum Text", exact: true })
      .click();
    await page
      .getByRole("radio", {
        name: "Sie wecken Jesus und sprechen ihre Not an.",
        exact: true,
      })
      .click();
    await page
      .getByText("Das passt zu diesem Abschnitt.", { exact: true })
      .scrollIntoViewIfNeeded();
    await capture(
      "text-question",
      "Voluntary question with feedback and actual Bible verse evidence",
    );
    // Independent story views must not depend on a prior editor's lifecycle.
    await context.close();
    context = await browser.newContext({
      viewport: { width, height },
      reducedMotion: "reduce",
    });
    page = await context.newPage();
    await page.goto("http://localhost:4173/bibel");
    await page
      .getByRole("button", { name: "Eine Geschichte entdecken", exact: true })
      .click();
    await page
      .getByText("Ein Blatt und ein neuer Anfang.", { exact: true })
      .scrollIntoViewIfNeeded();
    await capture(
      "story-library",
      "Optional illustrated story collection; no beginner overload before opening",
    );
    await page
      .getByRole("button", { name: "Die Geburtsgeschichte lesen", exact: true })
      .click();
    await expect(page).toHaveURL(/chapter=2/);
    const nativityTitle = page
      .getByText("Ein kleiner Anfang in Bethlehem.", { exact: true })
      .last();
    await expect(nativityTitle).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(() => {
          const images = Array.from(document.images).filter((img) =>
            img.src.includes("nativity"),
          );
          return (
            images.length > 0 &&
            images.every((img) => img.complete && img.naturalWidth > 0)
          );
        }),
      )
      .toBe(true);
    await page
      .getByRole("img", {
        name: /^Künstlerische Interpretation: Ein kleiner Anfang in Bethlehem/,
      })
      .last()
      .evaluate((el) => el.scrollIntoView({ block: "start" }));
    await capture(
      "nativity-context",
      "Lukan nativity pilot with interpretation label and separate explanation",
    );
    await page.goto("http://localhost:4173/einstellungen");
    await page
      .getByRole("textbox", { name: "Dein Vorname (freiwillig)" })
      .fill("Beispielperson");
    await page
      .getByRole("button", { name: "Namen speichern", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Namen speichern", exact: true }),
    ).toBeDisabled();
    // Corrupt synthetic data only, to capture the real recovery screen.
    await page.evaluate(
      () =>
        new Promise((resolve, reject) => {
          const request = indexedDB.open("oliva-local-v1", 1);
          request.onsuccess = () => {
            const db = request.result,
              tx = db.transaction("state", "readwrite"),
              store = tx.objectStore("state"),
              read = store.get("main");
            read.onsuccess = () => {
              const value = read.result;
              value.data.notes = [
                {
                  id: "synthetic-invalid-note",
                  text: "Synthetische Worte für die Reparaturansicht.",
                },
              ];
              store.put(value, "main");
            };
            tx.oncomplete = () => {
              db.close();
              resolve();
            };
            tx.onerror = () => reject(tx.error);
          };
        }),
    );
    await page.reload();
    await expect(
      page.getByText("Dein Speicher braucht Aufmerksamkeit.", { exact: true }),
    ).toBeVisible();
    await capture(
      "recovery",
      "Real read failure blocks ordinary routes and offers unchanged raw export",
    );
    await context.close();
  }
} finally {
  await browser.close();
}
await writeFile(
  `${root}/manifest.json`,
  JSON.stringify({ capturedAt: new Date().toISOString(), screens }, null, 2) +
    "\n",
);
console.log(`${screens.length} continuity screenshots captured.`);
