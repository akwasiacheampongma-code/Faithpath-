import { test, expect, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { localData, rawData } from "./persistence";
import { originalA51 } from "./a51-reference";
import type { A51Stage } from "../../src/features/garden/a51/types";
import type { TreeMetrics } from "../../src/features/garden/a51/engine/tree-scene";
type Host = HTMLElement & { olivaTree?: () => TreeMetrics };
const output = "docs/evidence/a51/screens";
const A51_STAGES: A51Stage[] = JSON.parse(readFileSync("src/features/garden/a51/stage-data.json","utf8")).stages;
async function metrics(page: Page) {
  return page.getByTestId("olive-tree").evaluate(el => (el as Host).olivaTree?.());
}
async function ready(page: Page, stage: number) {
  // The original-reference tab deliberately pauses the real app in background.
  // Return it to foreground before testing its visibility-gated image loader.
  await page.bringToFront();
  await page.getByTestId("olive-tree").scrollIntoViewIfNeeded();
  await expect.poll(async()=> {const m=await metrics(page);return m?.ready&&m.stage===stage;}).toBe(true);
}
test("alle sieben Originalbilder bleiben erhalten; Vorschauen schreiben keine persönlichen Daten", async ({page,context}) => {
  // Replay the actual Chromium batch recorded in IO-batch-diagnosis.json.
  // Both entries concern the same target; its final visibility must win.
  await page.addInitScript(() => {
    const OriginalObserver = IntersectionObserver;
    window.IntersectionObserver = class extends OriginalObserver {
      private callback: IntersectionObserverCallback;
      constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
        super(callback, options); this.callback = callback;
      }
      observe(target: Element) {
        super.observe(target);
        if (!target.matches('[data-testid="olive-tree"]')) return;
        (window as Window & { replayA51Batch?: (visible: boolean[]) => void }).replayA51Batch = flags => {
          const rect = target.getBoundingClientRect();
          this.callback(flags.map(visible => ({ target, time: performance.now(), isIntersecting: visible,
            intersectionRatio: visible ? 1 : 0, boundingClientRect: rect,
            intersectionRect: visible ? rect : new DOMRect(), rootBounds: new DOMRect(0,0,innerWidth,innerHeight),
          })), this);
        };
      }
    };
  });
  await mkdir(output,{recursive:true});
  await page.emulateMedia({reducedMotion:"reduce"});
  await page.goto("/einstellungen");
  await page.getByRole("textbox",{name:"Dein Vorname (freiwillig)"}).fill("Ada");
  await page.getByRole("button",{name:"Namen speichern",exact:true}).click();
  await expect.poll(async()=>(await localData(page))?.name).toBe("Ada");
  await page.goto("/garten");await ready(page,0);
  await page.evaluate(() => (window as Window & { replayA51Batch?: (visible: boolean[]) => void }).replayA51Batch?.([false,true]));
  await expect.poll(async() => (await metrics(page))?.visible).toBe(true);
  await page.evaluate(() => (window as Window & { replayA51Batch?: (visible: boolean[]) => void }).replayA51Batch?.([true,false]));
  await expect.poll(async() => (await metrics(page))?.visible).toBe(false);
  await page.evaluate(() => (window as Window & { replayA51Batch?: (visible: boolean[]) => void }).replayA51Batch?.([true]));
  await ready(page,0);
  const before=await rawData(page), original=await context.newPage();
  await original.emulateMedia({reducedMotion:"reduce"});
  for(const stage of A51_STAGES) {
    await originalA51(original,stage.index,300);
    await original.bringToFront();
    await expect.poll(()=>original.locator("#tree").evaluate(el=>(el as Host).olivaTree?.().ready)).toBe(true);
    await original.locator("#tree").screenshot({path:`${output}/before-a51-${stage.index+1}.png`});
    await page.getByRole("button",{name:`Stadium ${stage.index+1} ansehen: ${stage.name}`,exact:true}).click();
    await ready(page,stage.index);
    await expect(page.getByTestId("olive-tree").locator("img.tree-fallback")).toBeVisible();
    await expect(page.getByTestId("olive-tree").locator("canvas")).toBeHidden();
    await page.screenshot({path:`${output}/after-oliva-${stage.index+1}-light-390.png`});
    await page.getByTestId("olive-tree").screenshot({path:`${output}/after-tree-${stage.index+1}.png`});
    expect(await rawData(page)).toEqual(before);
  }
  await original.close();
  await page.getByRole("button",{name:"Alle sieben Lebensbilder ansehen",exact:true}).click();
  for(const stage of A51_STAGES) await expect(page.getByRole("button",{name:`Lebensbild ${stage.index+1}: ${stage.name}`,exact:true})).toBeVisible();
  expect(await rawData(page)).toEqual(before);
  await page.getByRole("button",{name:"Lebensbilder schließen",exact:true}).click();
  for(const width of [320,1440]) {
    await page.setViewportSize({width,height:width===320?568:1000});
    for(const stage of A51_STAGES) {
      await page.getByRole("button",{name:`Stadium ${stage.index+1} ansehen: ${stage.name}`,exact:true}).click();await ready(page,stage.index);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    }
  }
  await page.setViewportSize({width:390,height:844});
  await page.getByRole("button",{name:"Dunklen Modus aktivieren",exact:true}).click();
  await expect.poll(async()=>(await localData(page)).settings.theme).toBe("dark");
  const darkBefore=await rawData(page);
  for(const stage of A51_STAGES) {
    await page.getByRole("button",{name:`Stadium ${stage.index+1} ansehen: ${stage.name}`,exact:true}).click();await ready(page,stage.index);
    await page.screenshot({path:`${output}/after-oliva-${stage.index+1}-dark-390.png`});
  }
  expect(await rawData(page)).toEqual(darkBefore);
  await page.getByRole("button",{name:"Zurück zu deinem Baum",exact:true}).click();await ready(page,0);
  await expect(page.getByText("Für den Offline-Neustart bereit.",{exact:true})).toBeVisible();
  await context.setOffline(true);await page.reload();await ready(page,0);
  for(const stage of A51_STAGES) {await page.getByRole("button",{name:`Stadium ${stage.index+1} ansehen: ${stage.name}`,exact:true}).click();await ready(page,stage.index);}
  expect(await rawData(page)).toEqual(darkBefore);
  await context.setOffline(false);
  await page.goto("/");await ready(page,0);
  await page.screenshot({path:`${output}/hub-tree-mobile.png`});
  expect(await rawData(page)).toEqual(darkBefore);
  await page.setViewportSize({width:1440,height:1000});
  await page.goto("/");await ready(page,0);
  await page.screenshot({path:`${output}/hub-tree-desktop.png`});
});
test("Wind pausiert außerhalb des Bildschirms; reduzierte Bewegung und Grafikverlust behalten das Originalbild", async ({page}) => {
  const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
  await page.goto("/garten");
  await page.getByRole("button",{name:/^Stadium 7 ansehen:/}).click();await ready(page,6);
  await expect.poll(async()=>(await metrics(page))?.running).toBe(true);
  const frames=(await metrics(page))?.frames??0;
  await expect.poll(async()=>(await metrics(page))?.frames??0).toBeGreaterThan(frames+2);
  await page.getByRole("textbox",{name:"Eine freiwillig gelebte Erfahrung"}).scrollIntoViewIfNeeded();
  await expect.poll(async()=>(await metrics(page))?.running).toBe(false);
  await page.getByTestId("olive-tree").scrollIntoViewIfNeeded();
  await expect.poll(async()=>(await metrics(page))?.running).toBe(true);
  await page.emulateMedia({reducedMotion:"reduce"});
  await expect.poll(async()=>(await metrics(page))?.reduced).toBe(true);
  await expect(page.getByTestId("olive-tree").locator("img.tree-fallback")).toBeVisible();
  await page.emulateMedia({reducedMotion:"no-preference"});
  await expect.poll(async()=>(await metrics(page))?.running).toBe(true);
  await page.getByTestId("olive-tree").locator("canvas.tree-canvas").evaluate(el=>{
    const gl=(el as HTMLCanvasElement).getContext("webgl");gl?.getExtension("WEBGL_lose_context")?.loseContext();
  });
  await expect.poll(async()=>(await metrics(page))?.graphicsFailed).toBe(true);
  await expect(page.getByTestId("olive-tree").locator("img.tree-fallback")).toBeVisible();
  await expect.poll(async()=>(await metrics(page))?.running).toBe(false);
  expect(errors).toEqual([]);
});
test("gespeicherte reduzierte Bewegung liefert auch ohne WebGL ein vollständiges Baumbild", async ({page}) => {
  await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(this:HTMLCanvasElement,kind:string,...args:unknown[]) {if(kind==="webgl")return null;return Reflect.apply(original,this,[kind,...args]);} as typeof original;});
  await page.goto("/einstellungen");await page.getByRole("switch",{name:"Animationen reduzieren"}).click();
  await expect.poll(async()=>(await localData(page)).settings.reducedMotion).toBe(true);
  await page.goto("/garten");
  for(const stage of A51_STAGES) {
    await page.getByRole("button",{name:`Stadium ${stage.index+1} ansehen: ${stage.name}`,exact:true}).click();await ready(page,stage.index);
    await expect(page.getByTestId("olive-tree").locator("img.tree-fallback")).toBeVisible();
    expect((await metrics(page))?.running).toBe(false);
  }
});
test.describe("Bildladefehler ohne Service-Worker",()=>{
  test.use({serviceWorkers:"block"});
  test("ein Bildfehler bewahrt den geladenen Baum und ein erneuter Versuch lädt das gewünschte Stadium", async ({page})=>{
    await page.goto("/garten");await ready(page,0);
    await page.route("**/*stage-4*.webp",r=>r.abort());
    await page.getByRole("button",{name:/^Stadium 4 ansehen:/}).click();
    await expect(page.getByRole("alert")).toContainText("Dieses Stadium konnte nicht geladen werden");
    expect((await metrics(page))?.stage).toBe(0);
    await page.unroute("**/*stage-4*.webp");
    await page.getByRole("button",{name:"Baumbild erneut laden",exact:true}).click();await ready(page,3);
    await expect(page.getByRole("alert")).toHaveCount(0);
  });
});
test.describe("Hochauflösende ruhende Darstellung",()=>{
  test.use({deviceScaleFactor:3,reducedMotion:"reduce"});
  test("ein Retina-Display lädt die 1024er-Originalvariante bei begrenzter Animationsauflösung",async({page})=>{
    await page.goto("/garten");
    await page.getByRole("button",{name:/^Stadium 7 ansehen:/}).click();await ready(page,6);
    expect((await metrics(page))?.variant?.width).toBe(1024);
    expect((await metrics(page))?.running).toBe(false);
    const image=page.getByTestId("olive-tree").locator("img.tree-fallback");
    expect(await image.evaluate(el=>(el as HTMLImageElement).naturalWidth)).toBe(1024);
    await page.screenshot({path:`${output}/after-oliva-7-retina3.png`});
  });
});
