import { expect, type Page } from "@playwright/test";

export async function requestPlainBackup(page: Page) {
  await page.getByRole("button", { name: "Sicherung erstellen", exact: true }).click();
  await page.getByRole("button", { name: "Unverschlüsselte Sicherung", exact: true }).click();
  await expect(page.getByText(/vollständigen Originalarchive im Klartext/)).toBeVisible();
  await page.getByRole("button", { name: "Unverschlüsselt exportieren", exact: true }).click();
}
