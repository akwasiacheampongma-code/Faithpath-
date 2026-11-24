import { expect, type Page } from "@playwright/test";
import type { DraftOf } from "../../src/features/personal/schema";
import type { AppData, Note } from "../../src/state/model";
import { localData, rawData } from "./persistence";

export const fixtureTime = "2026-11-17T12:00:00.000Z";

export function legacyThought(text: string): Note {
  return { id: "fixture-thought", text, kind: "note", createdAt: fixtureTime, updatedAt: fixtureTime };
}

export function legacyJournalDraft(text = ""): DraftOf<"journal"> {
  return {
    id: "fixture-journal", key: "journal", revision: 1, type: "journal", updatedAt: fixtureTime,
    values: { entityId: "fixture-draft-note", targetId: null, baseUpdatedAt: null, text, kind: "note" },
  };
}

export async function seedCollectionProfile(page: Page, change: (data: AppData) => void, base = "") {
  await page.goto(base + "/einstellungen");
  await page.getByRole("textbox", { name: "Dein Vorname (freiwillig)", exact: true }).fill("Ada");
  await page.getByRole("button", { name: "Namen speichern", exact: true }).click();
  await expect.poll(async () => (await localData(page))?.name).toBe("Ada");
  const raw = await rawData(page);
  change(raw.data);
  await page.evaluate((value) => new Promise<void>((resolve, reject) => {
    const request = indexedDB.open("oliva-local-v1", 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction("state", "readwrite");
      transaction.objectStore("state").put(value, "main");
      transaction.oncomplete = () => { db.close(); resolve(); };
      transaction.onerror = () => { db.close(); reject(transaction.error); };
    };
  }), raw);
}

export async function openJournalDraft(page: Page) {
  await page.goto("/sammlung?tab=Entw%C3%BCrfe");
  await page.getByRole("button", { name: "Entwurf fortsetzen: Deine Journalworte", exact: true }).click();
}
