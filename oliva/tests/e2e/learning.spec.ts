import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { localData } from "./persistence";
test("Textfragen zeigen belegte Rückmeldung und verändern keinen Fortschritt", async ({
  page,
}) => {
  await page.goto("/lesen/MRK?chapter=4&mode=deep");
  await expect
    .poll(async () => (await localData(page))?.reading.chapter)
    .toBe(4);
  const before = await localData(page);
  await page
    .getByRole("button", { name: "Eine kleine Frage zum Text", exact: true })
    .click();
  await page
    .getByRole("radio", {
      name: "Sie verlassen gemeinsam das Boot.",
      exact: true,
    })
    .click();
  await expect(
    page.getByText("Schau noch einmal in den Text.", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("radio", {
      name: "Sie wecken Jesus und sprechen ihre Not an.",
      exact: true,
    })
    .click();
  await expect(
    page.getByText("Das passt zu diesem Abschnitt.", { exact: true }),
  ).toBeVisible();
  await page.keyboard.press("ArrowDown");
  await expect(
    page.getByRole("radio", {
      name: "Sie verlassen gemeinsam das Boot.",
      exact: true,
    }),
  ).toBeChecked();
  await page.keyboard.press("ArrowUp");
  await expect(
    page.getByRole("radio", {
      name: "Sie wecken Jesus und sprechen ihre Not an.",
      exact: true,
    }),
  ).toBeChecked();
  await expect(
    page.getByText(/BIBELTEXT · LUTHER 1912 · Markus 4,38/),
  ).toBeVisible();
  expect(await localData(page)).toEqual(before);
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(result.violations).toEqual([]);
});
test("Ostergeschichte trennt Illustration und Einordnung vom Bibeltext und zählt nur den Abschnitt", async ({
  page,
  context,
}) => {
  await page.goto("/bibel");
  await page
    .getByRole("button", { name: "Eine Geschichte entdecken", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Die Ostergeschichte entdecken", exact: true })
    .click();
  await expect(page).toHaveURL(/chapter=16/);
  await expect(
    page.getByText(
      "Einordnung zu den Versen 1–8. Sie ist keine Zusammenfassung des gesamten Kapitels und ersetzt den Bibeltext nicht.",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(
    page
      .getByRole("img", { name: /Künstlerische Interpretation: drei Frauen/ })
      .last(),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "Abschnitt als gelesen bestätigen",
      exact: true,
    })
    .click();
  await expect
    .poll(async () => (await localData(page)).readPassages)
    .toEqual(["MRK:16:1:8"]);
  expect((await localData(page)).readChapters).toEqual([]);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller)
      await new Promise<void>((resolve) =>
        navigator.serviceWorker.addEventListener(
          "controllerchange",
          () => resolve(),
          { once: true },
        ),
      );
  });
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText(/Einordnung zu den Versen 1–8/)).toBeVisible();
  expect(
    await page.evaluate(() => {
      const images = Array.from(document.images).filter((img) =>
        img.src.includes("easter-dawn"),
      );
      return (
        images.length > 0 &&
        images.every((img) => img.complete && img.naturalWidth > 0)
      );
    }),
  ).toBe(true);
});
