import { expect, test } from "@playwright/test";

test("der Übersetzungswechsel bleibt in beiden Richtungen im Kapitel", async ({ page }) => {
  await page.goto("/lesen/MRK?chapter=4&from=35&to=41");
  await page.getByRole("button", { name: "Leseeinstellungen", exact: true }).click();
  await page.getByRole("button", { name: "Zu Open Translation Bible wechseln", exact: true }).click();
  await expect(page).toHaveURL(/\/offen\/MRK\?chapter=4$/);
  await expect(page.getByRole("heading", { name: "Markus 4", exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Leseeinstellungen", exact: true }).click();
  await page.getByRole("button", { name: "Zu Luther 1912 wechseln", exact: true }).click();
  await expect(page).toHaveURL(/\/lesen\/MRK\?chapter=4$/);
  await expect(page.getByRole("heading", { name: "Markus 4", exact: true })).toBeVisible();
});
