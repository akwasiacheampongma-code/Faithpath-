# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: a51-tree.spec.ts >> Bildladefehler ohne Service-Worker >> ein Bildfehler bewahrt den geladenen Baum und ein erneuter Versuch lädt das gewünschte Stadium
- Location: tests/e2e/a51-tree.spec.ts:237:3

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByRole('alert')
Expected substring: "Dieses Stadium konnte nicht geladen werden"
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toContainText" getByRole('alert') with timeout 15000ms
  - waiting for getByRole('alert')

```

```yaml
- banner:
  - img
  - text: OLIVA
  - button "Dunklen Modus aktivieren":
    - img
  - button "Du · Profil und Einstellungen": Du
- main:
  - img
  - text: Dein persönlicher Garten
  - heading "Wachsen braucht Zeit." [level=1]
  - text: Dein Olivenbaum erinnert an gelesene Worte, neue Erkenntnisse und freiwillig festgehaltene Erfahrungen. Er misst weder deinen Glauben noch Gottes Liebe. VORSCHAU · KEIN EIGENER FORTSCHRITT
  - img "Samen – Bild deiner persönlichen Lerngeschichte. Keine Glaubensbewertung."
  - text: Wachsender Olivenbaum Wiederholte Begegnungen mit den Texten bilden Beständigkeit ab.
  - button "Zurück zu deinem Baum":
    - text: Zurück zu deinem Baum
    - img
  - 'button "Stadium 1 ansehen: Samen"'
  - 'button "Stadium 2 ansehen: Keimling"'
  - 'button "Stadium 3 ansehen: Junger Olivenbaum"'
  - 'button "Stadium 4 ansehen: Wachsender Olivenbaum" [pressed]'
  - 'button "Stadium 5 ansehen: Starker Olivenbaum"'
  - 'button "Stadium 6 ansehen: Erste Früchte"'
  - 'button "Stadium 7 ansehen: Fruchttragender Olivenbaum"'
  - text: Du kannst die sieben Bilder ansehen, ohne deinen Fortschritt zu verändern.
  - button "Alle sieben Lebensbilder ansehen":
    - text: Alle sieben Lebensbilder ansehen
    - img
  - text: Was die Bilder bedeuten Samen Ein Anfang ist schon wertvoll. Wurzeln Ein Fundament zum Weiterdenken. Stamm Beständigkeit in deinem Tempo. Zweige Neue Zusammenhänge entdecken. Blätter Mit den Texten vertrauter werden. Früchte Freiwillig gelebte Werte.
  - img
  - text: Du musst nichts verdienen. Dein Baum verliert in einer Pause keine Blätter. Es gibt keine Rangliste und keine verlorene Serie. Gottes Liebe ist kein Aktivitätsbonus.
  - img
  - text: Deine Aufzeichnungen Deine Geschichte im Baum. Deine eigenen Worte, Schritte und Rückblicke gehören zu deiner Geschichte. Die Zweige öffnen vorhandene persönliche Vorhaben. Auch ruhende Vorhaben behalten ihren Platz. Hier ist Raum für deine Geschichte. Wenn du eigene Worte, Schritte oder Rückblicke festhältst, kannst du sie hier wiederfinden. Du brauchst nichts nachzuholen. Was möchtest du im Alltag ausprobieren? Deine persönlichen Vorhaben verbinden kleine, selbst gewählte Schritte mit freiwilligen Rückblicken. Sie dürfen sich verändern und auch eine Pause machen.
  - button "Deine persönlichen Vorhaben":
    - text: Deine persönlichen Vorhaben
    - img
  - text: Ein kleiner Moment im Alltag Hast du etwas bewusst ausprobiert – zugehört, geholfen oder Frieden gesucht? Wenn du möchtest, halte deine Erfahrung fest. Die App entscheidet nicht, ob sie „gut genug“ war. Eine freiwillig gelebte Erfahrung
  - textbox "Eine freiwillig gelebte Erfahrung":
    - /placeholder: Was hast du erlebt?
  - text: Deine Worte werden beim Schreiben als Entwurf lokal gesichert. Erst „Erfahrung festhalten“ legt einen Eintrag in deiner Sammlung an.
  - button "Einen neuen Gedanken entdecken":
    - text: Einen neuen Gedanken entdecken
    - img
- navigation "Hauptnavigation":
  - button "Heute":
    - img
    - text: Heute
  - button "Bibel":
    - img
    - text: Bibel
  - button "Wege":
    - img
    - text: Wege
  - button "Mein Garten":
    - img
    - text: Mein Garten
  - button "Sammlung":
    - img
    - text: Sammlung
- text: Offline-Paket noch nicht vollständig. Mit Verbindung erneut öffnen.
```

# Test source

```ts
  141 |   await page.getByRole("textbox",{name:"Dein Vorname (freiwillig)"}).fill("Ada");
  142 |   await page.getByRole("button",{name:"Namen speichern",exact:true}).click();
  143 |   await expect.poll(async()=>(await localData(page))?.name).toBe("Ada");
  144 |   await page.goto("/garten");await ready(page,0);
  145 |   await page.evaluate(() => (window as Window & { replayA51Batch?: (visible: boolean[]) => void }).replayA51Batch?.([false,true]));
  146 |   await expect.poll(async() => (await metrics(page))?.visible).toBe(true);
  147 |   await page.evaluate(() => (window as Window & { replayA51Batch?: (visible: boolean[]) => void }).replayA51Batch?.([true,false]));
  148 |   await expect.poll(async() => (await metrics(page))?.visible).toBe(false);
  149 |   await page.evaluate(() => (window as Window & { replayA51Batch?: (visible: boolean[]) => void }).replayA51Batch?.([true]));
  150 |   await ready(page,0);
  151 |   const before=await rawData(page), original=await context.newPage();
  152 |   await original.emulateMedia({reducedMotion:"reduce"});
  153 |   for(const stage of A51_STAGES) {
  154 |     await originalA51(original,stage.index,300);
  155 |     await original.bringToFront();
  156 |     await expect.poll(()=>original.locator("#tree").evaluate(el=>(el as Host).olivaTree?.().ready)).toBe(true);
  157 |     await original.locator("#tree").screenshot({path:`${output}/before-a51-${stage.index+1}.png`});
  158 |     await page.getByRole("button",{name:`Stadium ${stage.index+1} ansehen: ${stage.name}`,exact:true}).click();
  159 |     await ready(page,stage.index);
  160 |     await expect(page.getByTestId("olive-tree").locator("img.tree-fallback")).toBeVisible();
  161 |     await expect(page.getByTestId("olive-tree").locator("canvas")).toBeHidden();
  162 |     await page.screenshot({path:`${output}/after-oliva-${stage.index+1}-light-390.png`});
  163 |     await page.getByTestId("olive-tree").screenshot({path:`${output}/after-tree-${stage.index+1}.png`});
  164 |     expect(await rawData(page)).toEqual(before);
  165 |   }
  166 |   await original.close();
  167 |   await page.getByRole("button",{name:"Alle sieben Lebensbilder ansehen",exact:true}).click();
  168 |   for(const stage of A51_STAGES) await expect(page.getByRole("button",{name:`Lebensbild ${stage.index+1}: ${stage.name}`,exact:true})).toBeVisible();
  169 |   expect(await rawData(page)).toEqual(before);
  170 |   await page.getByRole("button",{name:"Lebensbilder schließen",exact:true}).click();
  171 |   for(const width of [320,1440]) {
  172 |     await page.setViewportSize({width,height:width===320?568:1000});
  173 |     for(const stage of A51_STAGES) {
  174 |       await page.getByRole("button",{name:`Stadium ${stage.index+1} ansehen: ${stage.name}`,exact:true}).click();await ready(page,stage.index);
  175 |       expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  176 |     }
  177 |   }
  178 |   await page.setViewportSize({width:390,height:844});
  179 |   await page.getByRole("button",{name:"Dunklen Modus aktivieren",exact:true}).click();
  180 |   await expect.poll(async()=>(await localData(page)).settings.theme).toBe("dark");
  181 |   const darkBefore=await rawData(page);
  182 |   for(const stage of A51_STAGES) {
  183 |     await page.getByRole("button",{name:`Stadium ${stage.index+1} ansehen: ${stage.name}`,exact:true}).click();await ready(page,stage.index);
  184 |     await page.screenshot({path:`${output}/after-oliva-${stage.index+1}-dark-390.png`});
  185 |   }
  186 |   expect(await rawData(page)).toEqual(darkBefore);
  187 |   await page.getByRole("button",{name:"Zurück zu deinem Baum",exact:true}).click();await ready(page,0);
  188 |   await expect(page.getByText("Für den Offline-Neustart bereit.",{exact:true})).toBeVisible();
  189 |   await context.setOffline(true);await page.reload();await ready(page,0);
  190 |   for(const stage of A51_STAGES) {await page.getByRole("button",{name:`Stadium ${stage.index+1} ansehen: ${stage.name}`,exact:true}).click();await ready(page,stage.index);}
  191 |   expect(await rawData(page)).toEqual(darkBefore);
  192 |   await context.setOffline(false);
  193 |   await page.goto("/");await ready(page,0);
  194 |   await page.screenshot({path:`${output}/hub-tree-mobile.png`});
  195 |   expect(await rawData(page)).toEqual(darkBefore);
  196 |   await page.setViewportSize({width:1440,height:1000});
  197 |   await page.goto("/");await ready(page,0);
  198 |   await page.screenshot({path:`${output}/hub-tree-desktop.png`});
  199 | });
  200 | test("Wind pausiert außerhalb des Bildschirms; reduzierte Bewegung und Grafikverlust behalten das Originalbild", async ({page}) => {
  201 |   const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
  202 |   await page.goto("/garten");
  203 |   await page.getByRole("button",{name:/^Stadium 7 ansehen:/}).click();await ready(page,6);
  204 |   await expect.poll(async()=>(await metrics(page))?.running).toBe(true);
  205 |   const frames=(await metrics(page))?.frames??0;
  206 |   await expect.poll(async()=>(await metrics(page))?.frames??0).toBeGreaterThan(frames+2);
  207 |   await page.getByRole("textbox",{name:"Eine freiwillig gelebte Erfahrung"}).scrollIntoViewIfNeeded();
  208 |   await expect.poll(async()=>(await metrics(page))?.running).toBe(false);
  209 |   await page.getByTestId("olive-tree").scrollIntoViewIfNeeded();
  210 |   await expect.poll(async()=>(await metrics(page))?.running).toBe(true);
  211 |   await page.emulateMedia({reducedMotion:"reduce"});
  212 |   await expect.poll(async()=>(await metrics(page))?.reduced).toBe(true);
  213 |   await expect(page.getByTestId("olive-tree").locator("img.tree-fallback")).toBeVisible();
  214 |   await page.emulateMedia({reducedMotion:"no-preference"});
  215 |   await expect.poll(async()=>(await metrics(page))?.running).toBe(true);
  216 |   await page.getByTestId("olive-tree").locator("canvas.tree-canvas").evaluate(el=>{
  217 |     const gl=(el as HTMLCanvasElement).getContext("webgl");gl?.getExtension("WEBGL_lose_context")?.loseContext();
  218 |   });
  219 |   await expect.poll(async()=>(await metrics(page))?.graphicsFailed).toBe(true);
  220 |   await expect(page.getByTestId("olive-tree").locator("img.tree-fallback")).toBeVisible();
  221 |   await expect.poll(async()=>(await metrics(page))?.running).toBe(false);
  222 |   expect(errors).toEqual([]);
  223 | });
  224 | test("gespeicherte reduzierte Bewegung liefert auch ohne WebGL ein vollständiges Baumbild", async ({page}) => {
  225 |   await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(this:HTMLCanvasElement,kind:string,...args:unknown[]) {if(kind==="webgl")return null;return Reflect.apply(original,this,[kind,...args]);} as typeof original;});
  226 |   await page.goto("/einstellungen");await page.getByRole("switch",{name:"Animationen reduzieren"}).click();
  227 |   await expect.poll(async()=>(await localData(page)).settings.reducedMotion).toBe(true);
  228 |   await page.goto("/garten");
  229 |   for(const stage of A51_STAGES) {
  230 |     await page.getByRole("button",{name:`Stadium ${stage.index+1} ansehen: ${stage.name}`,exact:true}).click();await ready(page,stage.index);
  231 |     await expect(page.getByTestId("olive-tree").locator("img.tree-fallback")).toBeVisible();
  232 |     expect((await metrics(page))?.running).toBe(false);
  233 |   }
  234 | });
  235 | test.describe("Bildladefehler ohne Service-Worker",()=>{
  236 |   test.use({serviceWorkers:"block"});
  237 |   test("ein Bildfehler bewahrt den geladenen Baum und ein erneuter Versuch lädt das gewünschte Stadium", async ({page})=>{
  238 |     await page.goto("/garten");await ready(page,0);
  239 |     await page.route("**/*stage-4*.webp",r=>r.abort());
  240 |     await page.getByRole("button",{name:/^Stadium 4 ansehen:/}).click();
> 241 |     await expect(page.getByRole("alert")).toContainText("Dieses Stadium konnte nicht geladen werden");
      |                                           ^ Error: expect(locator).toContainText(expected) failed
  242 |     expect((await metrics(page))?.stage).toBe(0);
  243 |     await page.unroute("**/*stage-4*.webp");
  244 |     await page.getByRole("button",{name:"Baumbild erneut laden",exact:true}).click();await ready(page,3);
  245 |     await expect(page.getByRole("alert")).toHaveCount(0);
  246 |   });
  247 | });
  248 | test.describe("Hochauflösende ruhende Darstellung",()=>{
  249 |   test.use({deviceScaleFactor:3,reducedMotion:"reduce"});
  250 |   test("ein Retina-Display lädt die 1024er-Originalvariante bei begrenzter Animationsauflösung",async({page})=>{
  251 |     await page.goto("/garten");
  252 |     await page.getByRole("button",{name:/^Stadium 7 ansehen:/}).click();await ready(page,6);
  253 |     expect((await metrics(page))?.variant?.width).toBe(1024);
  254 |     expect((await metrics(page))?.running).toBe(false);
  255 |     const image=page.getByTestId("olive-tree").locator("img.tree-fallback");
  256 |     expect(await image.evaluate(el=>(el as HTMLImageElement).naturalWidth)).toBe(1024);
  257 |     await page.screenshot({path:`${output}/after-oliva-7-retina3.png`});
  258 |   });
  259 | });
  260 | 
```