import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { chromium, expect } from "@playwright/test";

const origin = process.env.OLIVA_DESIGN_ORIGIN ?? "http://localhost:4184";
const path = "/docs/ux/kiss-faith-journey/preview.html";
const out = "docs/evidence/kiss-faith-journey";
const sizes = [[320, 568], [375, 812], [390, 844], [430, 932]];
const bible = JSON.parse(await readFile("src/data/bible.json", "utf8"));
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
  args: ["--no-sandbox"],
});
const context = await browser.newContext({ isMobile: true, hasTouch: true, reducedMotion: "reduce" });
const page = await context.newPage();
const report = { browser: browser.version(), staticDesignPrototype: true, deviceTest: false, layouts: [], tasks: [], screens: [] };
const main = page.locator("#content");
const button = (name) => page.locator(".phone").getByRole("button", { name, exact: true }).filter({ visible: true });
const heading = (name) => main.getByRole("heading", { name, exact: true }).filter({ visible: true });
const navigate = (view = "today", theme = "light", profile = "guest") =>
  page.goto(`${origin}${path}?capture&view=${view}&theme=${theme}&profile=${profile}`);

async function capture(name) {
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await page.screenshot({ path: `${out}/${name}.png` });
  report.screens.push({ file: `${name}.png`, viewport: page.viewportSize() });
}

async function accessibility() {
  const results = await new AxeBuilder({ page }).include(".phone").withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  assert.deepEqual(results.violations.map(({ id, nodes }) => ({ id, targets: nodes.map(({ target }) => target) })), []);
}

async function hasNoHorizontalOverflow() {
  return page.evaluate(() => {
    const main = document.querySelector("#content");
    return document.documentElement.scrollWidth <= innerWidth + 1 && main.scrollWidth <= main.clientWidth + 1;
  });
}

async function checkLayouts() {
  for (const [width, height] of sizes) {
    await page.setViewportSize({ width, height });
    for (const theme of ["light", "dark"]) {
      await navigate("today", theme);
      await expect(heading("Lass deinen Glaubensweg wachsen.")).toBeVisible();
      await expect.poll(async () => page.locator(".today .tree-image").evaluate((image) => image.naturalWidth)).toBe(384);
      await page.evaluate(() => document.fonts.ready.then(() => undefined));
      const action = await button("Jetzt Bibel lesen").boundingBox();
      const tree = await page.locator(".today .tree-slot").boundingBox();
      const nav = await page.getByRole("navigation", { name: "Hauptnavigation" }).boundingBox();
      assert.ok(action && tree && nav);
      assert.ok(action.height >= 44 && action.y + action.height <= nav.y, `Leseaktion verdeckt bei ${width} px und ${theme}`);
      assert.ok(nav.y - tree.y >= Math.min(tree.height, 44) - 1, `Baum erst nach Scrollen bei ${width} px und ${theme}`);
      const geometry = {
        width, height, theme, actionTop: Math.round(action.y), actionBottom: Math.round(action.y + action.height),
        treeTop: Math.round(tree.y), treeHeight: Math.round(tree.height), contentBottom: Math.round(nav.y),
        treeVisible: Math.round(Math.min(tree.height, nav.y - tree.y)),
      };
      assert.equal(await hasNoHorizontalOverflow(), true);
      await accessibility();
      if (theme === "light") await capture(`draft-today-new-${width}`);
      if (theme === "dark" && width === 320) await capture("draft-today-dark-320");
      await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
      assert.equal(await hasNoHorizontalOverflow(), true, `Horizontaler Überlauf bei 200 Prozent, ${width} px, ${theme}`);
      assert.equal(await button("Jetzt Bibel lesen").isEnabled(), true);
      report.layouts.push({ ...geometry, axeViolations: 0, enlargedCssTextOverflow: false });
    }
  }
}

async function checkIntro() {
  await page.setViewportSize({ width: 390, height: 844 });
  await navigate("intro-1");
  await page.keyboard.press("Tab");
  await expect(button("Überspringen")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(heading("Lass deinen Glaubensweg wachsen.")).toBeVisible();
  await button("Einstellungen").click();
  await button("Einführung noch einmal ansehen").click();
  await expect(heading("Gottes Wort entdecken")).toBeVisible();
  await accessibility();
  await capture("draft-intro-1-390");
  await button("Weiter").click();
  await expect(heading("Deine Gedanken festhalten")).toBeVisible();
  await capture("draft-intro-2-390");
  await button("Weiter").click();
  await expect(heading("Deinen Weg wachsen sehen")).toBeVisible();
  await capture("draft-intro-3-390");
  await button("OLIVA entdecken").click();
  await expect(button("Jetzt Bibel lesen")).toBeVisible();
  report.tasks.push({ name: "Drei Entwurfsansichten", canSkipWithKeyboard: true, canReopen: true, target: "Heute" });
}

async function checkFlow() {
  await button("Jetzt Bibel lesen").click();
  await expect(heading("Markus 4,35–41")).toBeVisible();
  const passage = bible.MRK[4].filter(({ n }) => n >= 35 && n <= 41).map(({ n, text }) => `${n} ${text}`);
  assert.deepEqual(await main.locator(".verses p").allTextContents(), passage);
  const reflect = button("Darüber nachdenken");
  await reflect.scrollIntoViewIfNeeded();
  const before = await main.evaluate((element) => element.scrollTop);
  await reflect.click();
  await expect(heading("Darüber nachdenken")).toBeVisible();
  await capture("draft-reflection-390");
  await button("Weiterlesen").click();
  await expect(heading("Markus 4,35–41")).toBeVisible();
  const after = await main.evaluate((element) => element.scrollTop);
  assert.ok(before > 0 && Math.abs(after - before) < 2);
  await reflect.click();
  await button("Gedanken festhalten").click();
  const editor = main.getByRole("textbox", { name: "Notiztext", exact: true });
  await expect(editor).toBeFocused();
  await expect(button("Markus 4,35–41 →")).toBeVisible();
  const phrase = "Ein Moment der Ruhe\n\nBeispieltext für den lokalen Entwurf.";
  await editor.fill(phrase);
  await accessibility();
  await capture("draft-linked-note-390");
  await button("Meine Notizen ansehen").click();
  await expect(heading("Meine Notizen")).toBeVisible();
  await main.getByRole("button", { name: "Ein Moment der Ruhe Markus 4,35–41" }).click();
  await expect(editor).toHaveValue(phrase);
  await button("Markus 4,35–41 →").click();
  await expect(heading("Markus 4,35–41")).toBeVisible();
  assert.ok(!(await page.evaluate((value) => location.href.includes(value) || localStorage.length || sessionStorage.length, phrase)));
  report.tasks.push({ name: "Lesen, reflektieren und wiederfinden", reference: "Markus 4,35–41", retainedReaderScroll: true,
    editorFocused: true, prototypeNoteStoredInMemoryOnly: true });

  await button("Wege").click();
  await button("Zur Reflexionsfrage der Geschichte").click();
  await button("Gedanken festhalten").click();
  await expect(button("Schweig und verstumme · Reflexionsfrage →")).toBeVisible();
  await button("Wege").click();
  await button("Zu seiner Reflexionsfrage").click();
  await button("Gedanken festhalten").click();
  await expect(button("Wer ist Jesus? · Reflexionsfrage →")).toBeVisible();
  report.tasks.push({ name: "Vorhandene Reflexionsbezüge", sources: ["NS-0203", "jesus:0"] });

  await page.setViewportSize({ width: 320, height: 568 });
  await navigate("today", "light", "returning");
  await expect(button("In der Bibel weiterlesen")).toBeVisible();
  await expect.poll(async () => page.locator(".today .tree-image").evaluate((img) => img.naturalWidth)).toBe(384);
  const returningTree = await page.locator(".today .tree-slot").boundingBox();
  const returningNav = await page.getByRole("navigation", { name: "Hauptnavigation" }).boundingBox();
  assert.ok(returningTree && returningNav && returningTree.y + returningTree.height <= returningNav.y);
  await capture("draft-today-returning-320");
  await page.setViewportSize({ width: 390, height: 844 });
  await navigate("today", "light", "returning");
  await expect.poll(async () => page.locator(".today .tree-image").evaluate((img) => img.naturalWidth)).toBe(384);
  await capture("draft-today-returning-390");
  await navigate("today", "dark", "returning");
  await expect(main.getByText("Schön, dass du wieder da bist, Mara.", { exact: true })).toBeVisible();
  await expect(button("In der Bibel weiterlesen")).toBeVisible();
  await expect.poll(async () => page.locator(".today .tree-image").evaluate((img) => img.naturalWidth)).toBe(384);
  await capture("draft-today-returning-dark-390");
  await button("Meinen Garten ansehen").click();
  await expect(heading("Mein Garten.")).toBeVisible();
  await expect(heading("Wachsender Olivenbaum")).toBeVisible();
  await button("Momente auf deinem Weg").click();
  await expect(heading("Frühere FaithPath-Momente")).toBeVisible();
  await button("In der Sammlung ansehen").click();
  await expect(heading("Deine Sammlung.")).toBeVisible();
  report.tasks.push({ name: "Persönlicher Weg", existingA51Stage: 4, target: "Sammlung" });
}

try {
  await checkLayouts();
  await checkIntro();
  await checkFlow();
  report.passed = true;
} finally {
  await browser.close();
  await writeFile(`${out}/prototype.json`, JSON.stringify(report, null, 2) + "\n");
}
