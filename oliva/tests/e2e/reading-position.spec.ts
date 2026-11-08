import { test, expect, type Page } from "@playwright/test";
import { localData, rawData } from "./persistence";
async function anchor(page: Page, verse: number) {
  await expect.poll(async () => (await localData(page))?.readingPosition?.verse).toBe(verse);
}
async function atVerse(page: Page, verse: number) {
  await expect.poll(async () => {
    const box = await page.getByRole("button", {name:new RegExp(`^Vers ${verse}:`)}).boundingBox();
    return box ? box.y >= 0 && box.y < 120 : false;
  }).toBe(true);
}
test("Weiterlesen führt nach Bereichswechsel und Offline-Neustart zum tatsächlichen Vers", async ({page,context}) => {
  await page.goto("/lesen/JHN?chapter=6&verse=35");
  await anchor(page,35); await atVerse(page,35);
  await page.goto("/bibel");
  await expect(page.getByText("Zuletzt bei Vers 35",{exact:true})).toBeVisible();
  await page.getByRole("button",{name:"Weiterlesen",exact:true}).click();
  await atVerse(page,35);
  await expect(page.getByText("Für den Offline-Neustart bereit.",{exact:true})).toBeVisible();
  await context.setOffline(true); await page.reload(); await atVerse(page,35);
  const data = await localData(page);
  expect(data.readChapters).toEqual([]);expect(data.readPassages).toEqual([]);expect(data.completedSteps).toEqual([]);expect(data.growthStage).toBe(0);
});
test("ein langer Psalm behält den Vers bei Display- und Schriftänderungen", async ({page}) => {
  await page.goto("/lesen/PSA?chapter=119&verse=90");
  await anchor(page,90);
  await page.getByRole("button",{name:/^Vers 120:/}).evaluate(el=>el.scrollIntoView({block:"start"}));
  await anchor(page,120);
  await page.setViewportSize({width:1440,height:1000}); await atVerse(page,120);
  await page.getByRole("button",{name:"Leseeinstellungen",exact:true}).click();
  await page.getByRole("button",{name:"Größer",exact:true}).click();
  await page.getByRole("button",{name:"2,1",exact:true}).click();
  await page.getByRole("button",{name:"Leseeinstellungen schließen",exact:true}).click();
  await atVerse(page,120); await anchor(page,120);
  await page.reload(); await atVerse(page,120);
  await page.getByRole("button",{name:"Zum Kapitelanfang",exact:true}).click();
  await expect.poll(async()=> (await localData(page))?.readingPosition).toBeNull();
  await page.reload();
  await expect(page.getByRole("button",{name:"Leseeinstellungen",exact:true})).toBeInViewport();
});
test("Abschnitt und ausdrücklicher Verslink bleiben maßgeblich; Kapitelwechsel verwirft alte Anker", async ({page}) => {
  await page.goto("/lesen/MRK?chapter=4&from=35&to=41&verse=38");
  await anchor(page,38); await page.reload(); await atVerse(page,38);
  await page.goto("/lesen/MRK?chapter=4&from=35&to=41&verse=40"); await anchor(page,40);await atVerse(page,40);
  await page.goto("/lesen/MRK?chapter=5");
  await expect.poll(async()=> (await localData(page))?.reading.chapter).toBe(5);
  expect((await localData(page)).readingPosition).toBeNull();
  await expect(page.getByRole("button",{name:"Leseeinstellungen",exact:true})).toBeInViewport();
  expect((await localData(page)).readChapters).toEqual([]);
});
test("eine installierte private V4-Speicherung migriert beim Lesen ohne Datenverlust", async ({page}) => {
  await page.goto("/einstellungen");
  await page.getByRole("textbox",{name:"Dein Vorname (freiwillig)"}).fill("Ada");
  await page.getByRole("button",{name:"Namen speichern",exact:true}).click();
  await expect.poll(async()=> (await localData(page))?.name).toBe("Ada");
  const old=await rawData(page);delete old.data.readingPosition;old.data.version=4;old.data.reading={book:"JHN",chapter:6};
  await page.evaluate(value=>new Promise<void>((resolve,reject)=>{
    const r=indexedDB.open("oliva-local-v1",1);r.onsuccess=()=>{const db=r.result,tx=db.transaction("state","readwrite");tx.objectStore("state").put(value,"main");tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>reject(tx.error);};
  }),old);
  await page.goto("/lesen/JHN?chapter=6&verse=35");await anchor(page,35);
  expect((await localData(page)).version).toBe(5);expect((await localData(page)).name).toBe("Ada");
});
