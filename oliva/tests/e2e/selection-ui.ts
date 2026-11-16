import { expect, type Page } from "@playwright/test";
export const selectionBar = (page: Page) =>
  page.getByRole("toolbar", { name: "Versauswahl", exact: true });
export const noteDialog = (page: Page) =>
  page
    .getByRole("dialog", { name: "Deine Notiz", exact: true })
    .filter({ visible: true });
export async function openNote(page: Page) {
  await selectionBar(page)
    .getByRole("button", { name: "Notiz", exact: true })
    .click();
  await expect(noteDialog(page)).toBeVisible();
}
export async function closeNote(page: Page) {
  await page
    .getByRole("dialog")
    .filter({ visible: true })
    .getByRole("button", { name: "Schließen", exact: true })
    .click();
  await expect(page.getByRole("dialog").filter({ visible: true })).toHaveCount(
    0,
  );
}
export async function markSelection(page: Page, color: string) {
  await selectionBar(page)
    .getByRole("button", { name: "Markieren", exact: true })
    .click();
  await selectionBar(page)
    .getByRole("button", { name: `${color} markieren`, exact: true })
    .click();
}
export async function bookmarkSelection(page: Page) {
  await selectionBar(page)
    .getByRole("button", { name: "Mehr", exact: true })
    .click();
  await page
    .getByRole("dialog", { name: "Weitere Versaktionen", exact: true })
    .getByRole("button", { name: "Merken", exact: true })
    .click();
  await expect(
    page.getByText("Auswahl gemerkt.", { exact: true }),
  ).toBeVisible();
  await closeNote(page);
}
