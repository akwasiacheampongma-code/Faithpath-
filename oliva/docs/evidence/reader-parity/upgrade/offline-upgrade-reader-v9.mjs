/** Prepared Reader V9 PWA upgrade, no release number invented.
 * Usage: node /tmp/oliva-reader-parity-upgrade.mjs <frozen-0.12.1-dist> <candidate-dist> <actual-version> <actual-core>
 * Seeds state only through the frozen predecessor UI; IndexedDB observations are read-only.
 * Local persistent Chromium and actual worker update, not native or hosted QA.
 */
import { spawn } from "node:child_process";
import { mkdtemp, symlink, rename, rm, writeFile, mkdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";
import path from "node:path";
import net from "node:net";
const project=path.resolve(process.env.OLIVA_PROJECT_ROOT??"/workspace/faithpath-next");
const {chromium,expect:baseExpect}=await import(pathToFileURL(path.join(project,"node_modules/@playwright/test/index.mjs")).href);
const {faithpathFixture}=await import(pathToFileURL(path.join(project,"tests/fixtures/faithpath-v5.ts")).href);
const expect=baseExpect.configure({timeout:30000});
const [baselineArg,candidateArg,expectedVersion,expectedCore]=process.argv.slice(2);
if(!baselineArg||!candidateArg||!expectedVersion||!expectedCore) throw new Error("Required: <frozen-0.12.1-dist> <candidate-dist> <actual-version> <actual-core>; assign/build/review actual release first");
const baseline=path.resolve(baselineArg), current=path.resolve(candidateArg);
const hash=value=>createHash("sha256").update(value).digest("hex");
const json=value=>JSON.stringify(value);
const expectedRuntimeDigest="0b097eb24fc4fded654aef9f1a68ffb76301ed48e3d941ca146046efe3e15611";
async function verifyRuntimeFreeze() {
 const manifest=JSON.parse(await readFile(path.join(project,"docs/evidence/reader-parity/runtime-inputs.json"),"utf8"));
 if(manifest.files.length!==327||manifest.runtimeSourceDigest.sha256!==expectedRuntimeDigest)throw new Error("Wrong candidate runtime manifest");
 const aggregate=createHash("sha256");
 for(const item of manifest.files){
  const file=path.resolve(project,item.path);
  if(!file.startsWith(project+path.sep))throw new Error("Runtime path escapes project");
  const bytes=await readFile(file);
  if(bytes.length!==item.bytes||hash(bytes)!==item.sha256)throw new Error("Frozen runtime input changed: "+item.path);
  aggregate.update(item.path);aggregate.update(Buffer.from([0]));aggregate.update(bytes);aggregate.update(Buffer.from([0]));
 }
 const digest=aggregate.digest("hex");if(digest!==expectedRuntimeDigest)throw new Error("Aggregate runtime digest mismatch");
 const pkg=JSON.parse(await readFile(path.join(project,"package.json"),"utf8"));
 const app=JSON.parse(await readFile(path.join(project,"app.json"),"utf8"));
 if(pkg.version!==expectedVersion||app.expo.version!==expectedVersion)throw new Error("Candidate source version does not match built target");
 return {fileCount:manifest.files.length,sha256:digest,allFileHashesMatch:true};
}
const fixedNow="2027-01-01T12:00:00.000Z";
const source=JSON.stringify(faithpathFixture(),null,2)+"\n";
const journalText="Mein alter Journalentwurf aus OLIVA 0.12.1.\n  Diese Worte bleiben unverändert.  ";
const verseText="Mein alter Einzelversentwurf zu Johannes 6,35.\n  Keine Bereichsnotiz soll ihn ersetzen.  ";
const rangeText="Mein neuer Bereichsentwurf zu Johannes 6,35–36.\n  Genau diese beiden Verse gehören zusammen.";
const secondRangeText="Mein unabhängiger Entwurf zu Johannes 6,35–37.\n  Sein anderes Ende bleibt erhalten.  ";
const partialRef={book:"JHN",chapter:6,from:35,to:37};
const singleKey="capture:verse:JHN:6:35", firstRangeKey="capture:passage:JHN:6:35:36", secondRangeKey="capture:passage:JHN:6:35:37";
let temp,server,context,page;
async function buildMetadata(root) {
  const html = await readFile(path.join(root, "index.html"), "utf8");
  const sw = await readFile(path.join(root, "sw.js"), "utf8");
  const id = html.match(/<meta name="oliva-build" content="([^"]+)">/)?.[1];
  const version = sw.match(/,VERSION=("[^"\n]+");/)?.[1];
  if (!id || !version || !sw.startsWith(`const ID=${JSON.stringify(id)},URLS=`))
    throw new Error(`Unrecognized immutable PWA build metadata: ${root}`);
  return {
    root,
    id,
    version: JSON.parse(version),
    html,
    html_sha256: hash(html),
    worker_sha256: hash(sw),
  };
}


const runtimeInputsBefore=await verifyRuntimeFreeze();
const oldBuild=await buildMetadata(baseline),targetBuild=await buildMetadata(current);
if(oldBuild.version!=="0.12.1"||oldBuild.id!=="oliva-75717978bae05979") throw new Error("Frozen actually released 0.12.1 core required");
if(targetBuild.version!==expectedVersion||targetBuild.id!==expectedCore||targetBuild.version===oldBuild.version||targetBuild.id===oldBuild.id) throw new Error("Candidate must match explicit actual release version/core and differ from predecessor");
const output=process.env.OLIVA_EVIDENCE_DIR??path.join(project,"docs/evidence/reader-parity/upgrade",targetBuild.id);
if(existsSync(path.join(output,"offline-upgrade.json"))) throw new Error("Existing evidence preserved; select a new OLIVA_EVIDENCE_DIR for a new attempt");
const result={baselineVersion:oldBuild.version,baselineBuild:oldBuild.id,targetVersion:targetBuild.version,targetBuild:targetBuild.id,baselineHtmlSha256:oldBuild.html_sha256,baselineWorkerSha256:oldBuild.worker_sha256,targetHtmlSha256:targetBuild.html_sha256,targetWorkerSha256:targetBuild.worker_sha256,syntheticData:true,syntheticClock:fixedNow,passed:false,physicalDeviceTest:false,simulatorTest:false,hostedQa:false,scope:"Local automated Chromium persistent profile and actual same-origin worker update",comparison:"Exact JSON serialization of all raw IndexedDB values, not physical database-file bytes",phase:"preflight",phases:[],runtimeInputsBefore};
function phase(name){result.phase=name;result.phases.push({name,startedAt:new Date().toISOString()});console.log("Reader upgrade phase: "+name);}
const button=name=>page.getByRole("button",{name,exact:true}).filter({visible:true});
const visible=id=>page.getByTestId(id).filter({visible:true});
const verse=n=>page.getByRole("button",{name:new RegExp(`^Vers ${n}:`)}).filter({visible:true});
const tools=()=>page.getByRole("dialog",{name:"Auswahl verwenden",exact:true}).filter({visible:true});
const noteField=()=>tools().getByRole("textbox",{name:"Deine Notiz zu dieser Auswahl",exact:true});
const nonMain=state=>state.records.filter(item=>!(item.store==="state"&&item.key==="main"));
function without(data,keys){return Object.fromEntries(Object.entries(data).filter(([key])=>!keys.includes(key)));}
function oldDraftsExact(data,before){for(const old of before.drafts)expect(data.drafts.find(d=>d.id===old.id)).toEqual(old);}
function unchangedNonMain(state,before){expect(json(nonMain(state))).toBe(json(nonMain(before)));}
// Explicit writes pass current logical objects through canonical Zod schemas.
// Object insertion order is not content; retain exact keys, values and array order.
// Raw V8 and non-main record serialization checks remain separate and exact.
function sourceContentExact(data,before,allowed){expect(without(data,allowed)).toStrictEqual(without(before,allowed));}
function progress(data){return{readChapters:data.readChapters,readPassages:data.readPassages,readSteps:data.readSteps,completedSteps:data.completedSteps,growthStage:data.growthStage,retainedReviewGrowth:data.retainedReviewGrowth,ntStudy:data.ntStudy};}
async function anchor(n,ref=partialRef){await expect.poll(async()=>(await raw())?.data?.readingPosition).toEqual({ref,verse:n,mode:"read"});}
async function anchorVisible(n){await expect.poll(()=>verse(n).evaluate(node=>{const bounds=node.closest('[role="main"]')?.getBoundingClientRect(),fragment=Array.from(node.getClientRects()).find(r=>r.width>0&&r.height>0);return !!bounds&&!!fragment&&fragment.top>=bounds.top&&fragment.top<bounds.top+160&&fragment.right>bounds.left&&fragment.left<bounds.right;})).toBe(true);}
async function exactWholeChapter(canonical){await expect(visible("reader-flow")).toHaveAttribute("data-renderer","web-inline");expect(await visible("reader-flow").locator("[data-verse]").evaluateAll(nodes=>nodes.map(node=>({n:Number(node.getAttribute("data-verse")),text:node.textContent})))).toEqual(canonical.map(v=>({n:v.n,text:`${v.n} ${v.text}`})));for(const n of[35,36,37])await expect(verse(n)).toHaveAccessibleName(/ · im Fokus$/);for(const n of[1,34,38,60,71])await expect(verse(n)).not.toHaveAccessibleName(/ · im Fokus$/);await expect(button("Kapitel als gelesen bestätigen")).toHaveCount(0);await expect(button("Abschnitt als gelesen bestätigen")).toBeEnabled();}
async function select(numbers){for(const n of numbers)await verse(n).click();}
async function openTools(){await button("Auswahl verwenden").click();await expect(tools()).toBeVisible();}
async function closeTools(){await tools().getByRole("button",{name:"Auswahlwerkzeuge schließen",exact:true}).click();await expect(tools()).toHaveCount(0);}
async function checkpoint(name){const state=await snapshot();result[name]=summaries(state);return state;}
// Read every object store independently of the application's decoder. These
// observations never write, restore, import, or migrate an IndexedDB record.
async function snapshot() {
  return page.evaluate(
    () =>
      new Promise((resolve, reject) => {
        const open = indexedDB.open("oliva-local-v1", 1);
        open.onupgradeneeded = () => open.transaction?.abort();
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const db = open.result,
            names = Array.from(db.objectStoreNames).sort();
          const tx = db.transaction(names, "readonly"),
            stores = {};
          for (const name of names) {
            const store = tx.objectStore(name),
              keys = store.getAllKeys(),
              values = store.getAll();
            stores[name] = { keys, values };
          }
          tx.onerror = () => {
            db.close();
            reject(tx.error);
          };
          tx.onabort = () => {
            db.close();
            reject(tx.error);
          };
          tx.oncomplete = () => {
            const records = names.flatMap((name) =>
              stores[name].keys.result.map((key, index) => ({
                store: name,
                key,
                value: stores[name].values.result[index],
              })),
            );
            const version = db.version;
            db.close();
            resolve({
              database: "oliva-local-v1",
              version,
              stores: names,
              records,
            });
          };
        };
      }),
  );
}
const record = (state, key) =>
  state.records.find((item) => item.store === "state" && item.key === key)
    ?.value;
const main = (state) => record(state, "main");
const summaries = (state) =>
  state.records.map(({ store, key, value }) => ({
    store,
    key,
    json_utf8_bytes: Buffer.byteLength(json(value)),
    json_sha256: hash(json(value)),
  }));
async function raw() {
  return main(await snapshot());
}
async function unchanged(expected, message) {
  const actual = await snapshot();
  expect(json(actual), message).toBe(json(expected));
  return actual;
}
async function worker() {
  return page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    async function inspect(target) {
      if (!target) return null;
      return new Promise((resolve) => {
        const channel = new MessageChannel(),
          timer = setTimeout(() => {
            channel.port1.close();
            resolve(null);
          }, 1500);
        channel.port1.onmessage = (event) => {
          clearTimeout(timer);
          channel.port1.close();
          resolve(event.data);
        };
        target.postMessage({ type: "OLIVA_BUILD" }, [channel.port2]);
      });
    }
    return {
      expected: document
        .querySelector('meta[name="oliva-build"]')
        ?.getAttribute("content"),
      controller: await inspect(navigator.serviceWorker.controller),
      active: await inspect(registration?.active),
      waiting: await inspect(registration?.waiting),
      caches: (await caches.keys()).filter((key) => key.startsWith("oliva-")),
    };
  });
}
async function readyTree(stage) {
  const tree = page.getByTestId("olive-tree");
  await tree.scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      tree.evaluate((node) => {
        const data = node.olivaTree?.();
        return data?.ready ? data.stage : null;
      }),
    )
    .toBe(stage);
  await expect(tree.locator("img.tree-fallback")).toBeVisible();
}

try{
 await mkdir(output,{recursive:true});
 const stages=JSON.parse(await readFile(path.join(project,"src/features/garden/a51/stage-data.json"),"utf8")).stages;expect(stages).toHaveLength(7);
 const bible=JSON.parse(await readFile(path.join(project,"src/data/bible.json"),"utf8")), canonical=bible.JHN["6"];expect(canonical).toHaveLength(71);
 const expectedCopy=["Johannes 6,35–36",...canonical.filter(v=>v.n>=35&&v.n<=36).map(v=>`${v.n} ${v.text}`),"Lutherbibel 1912"].join("\n");
 const bank=JSON.parse(await readFile(path.join(project,"src/data/nt-catalog.json"),"utf8")).chapters;
 expect(bank).toHaveLength(260);expect(bank.reduce((n,c)=>n+c.questions.length,0)).toBe(1300);
 const mat=bank.find(c=>c.book==="MAT"&&c.chapter===1),question=mat.questions[0],choice=(question.correctIndex+1)%4,answerKey=`${question.id}:${question.hash}`;
 temp=await mkdtemp(path.join(tmpdir(),"oliva-reader-parity-upgrade-"));const live=path.join(temp,"live");await symlink(baseline,live);
 const port=await new Promise((resolve,reject)=>{const probe=net.createServer();probe.on("error",reject);probe.listen(0,"127.0.0.1",()=>{const address=probe.address();probe.close(()=>resolve(address.port));});});
 server=spawn(process.execPath,[path.join(project,"scripts/serve.mjs"),live],{cwd:project,env:{...process.env,PORT:String(port)},stdio:"ignore"});const base=`http://127.0.0.1:${port}`;
 await expect.poll(async()=>{try{return(await fetch(base)).ok;}catch{return false;}}).toBe(true);
 context=await chromium.launchPersistentContext(path.join(temp,"profile"),{executablePath:process.env.CHROMIUM_PATH??"/usr/bin/chromium",args:["--no-sandbox","--disable-dev-shm-usage"],viewport:{width:390,height:844},reducedMotion:"reduce",acceptDownloads:true});
 await context.grantPermissions(["clipboard-read","clipboard-write"]);
 page=context.pages()[0]??await context.newPage();page.setDefaultTimeout(30000);await page.clock.setFixedTime(new Date(fixedNow));result.origin=base;result.browserVersion=context.browser()?.version()??"unreported";
 phase("baseline-ui-seed");
 await page.goto(base+"/einstellungen");await expect(page.getByText("OLIVA · lokale Entwicklungsausgabe 0.12.1",{exact:true})).toBeVisible();
 await page.getByRole("textbox",{name:"Dein Vorname (freiwillig)"}).fill("Ada");await button("Namen speichern").click();await expect.poll(async()=>(await raw())?.data?.name).toBe("Ada");
 await page.goto(base+"/importieren");const chooser=page.waitForEvent("filechooser");await button("FaithPath-Datei auswählen").click();await(await chooser).setFiles({name:"synthetic-v5.json",mimeType:"application/json",buffer:Buffer.from(source)});await button("Jetzt sichern und Import übernehmen").click();await expect(page.getByText(/Import abgeschlossen/)).toBeVisible();
 await page.goto(base+"/verstehen/MAT?chapter=1");await expect(visible("nt-question-heading")).toHaveText(question.prompt);await page.getByRole("radio",{name:question.options[choice],exact:true}).filter({visible:true}).check();await button("Antwort prüfen").click();await expect(button("Antwort ändern")).toBeVisible();await expect.poll(async()=>(await raw())?.data?.ntStudy?.answers?.[answerKey]?.choice).toBe(choice);
 await page.goto(base+"/sammlung");await button("Einen Gedanken festhalten").click();await page.getByRole("textbox",{name:"Deine Worte",exact:true}).fill(journalText);await expect(page.getByText("Entwurf auf diesem Gerät gesichert.",{exact:true})).toBeVisible();await expect.poll(async()=>(await raw())?.data?.drafts.find(d=>d.type==="journal")?.values.text).toBe(journalText);
 await page.goto(base+"/lesen/JHN?chapter=6&from=35&to=37&verse=35");await expect(visible("reader-flow")).toHaveAttribute("data-renderer","web-inline");const oldPanel=visible("verse-actions-35");await expect(oldPanel).toBeVisible();await oldPanel.getByRole("button",{name:"Merken",exact:true}).click();await expect.poll(async()=>(await raw())?.data?.bookmarks).toContain("JHN:6:35");await oldPanel.getByRole("textbox",{name:"Notiz zu Vers 35",exact:true}).fill(verseText);await expect.poll(async()=>(await raw())?.data?.drafts.find(d=>d.key===singleKey)?.values.text).toBe(verseText);await oldPanel.getByRole("button",{name:"Versaktionen schließen",exact:true}).click();await anchor(35);await page.goto(base+"/einstellungen");await expect(page.getByText("Für den Offline-Neustart bereit.",{exact:true})).toBeVisible();await expect.poll(async()=>(await worker()).controller?.id).toBe(oldBuild.id);
 const beforeRecords=await checkpoint("beforeRecords"),before=main(beforeRecords),beforeProgress=progress(before.data),receipt=before.data.imports[0],archiveKey="archive:"+receipt.sourceHash;
 expect(before.storageVersion).toBe(1);expect(before.data.version).toBe(8);expect(beforeRecords.records).toHaveLength(4);expect(before.data.reading).toEqual(partialRef);expect(before.data.readingPosition).toEqual({ref:partialRef,verse:35,mode:"read"});expect(record(beforeRecords,archiveKey)).toBe(source);expect(record(beforeRecords,"before-faithpath-import")).toBeTruthy();expect(record(beforeRecords,"recovery-index")).toBeTruthy();expect(before.data.drafts.find(d=>d.key===singleKey)?.values.text).toBe(verseText);expect(before.data.drafts.find(d=>d.type==="journal")?.values.text).toBe(journalText);expect(before.data.ntStudy.answers[answerKey].question).toEqual(question);result.beforeWorker=await worker();result.originalArchiveSha256=hash(source);
 phase("real-worker-update-and-v8-ram-hydration");
 await symlink(current,path.join(temp,"next"));await rename(path.join(temp,"next"),live);await page.goto(base+"/einstellungen");await expect(page.getByText(`OLIVA · lokale Entwicklungsausgabe ${expectedVersion}`,{exact:true})).toBeVisible();await expect(page.getByRole("textbox",{name:"Dein Vorname (freiwillig)"})).toHaveValue("Ada");await expect(page.getByText("Für den Offline-Neustart bereit.",{exact:true})).toBeVisible();await expect.poll(async()=>(await worker()).controller?.id).toBe(targetBuild.id);const afterWorker=await worker();expect(afterWorker.active.id).toBe(targetBuild.id);expect(afterWorker.controller.version).toBe(expectedVersion);expect(afterWorker.caches).toContain(oldBuild.id);expect(afterWorker.caches).toContain(targetBuild.id);await unchanged(beforeRecords,"V8 -> V9 RAM hydration must not rewrite any raw record");result.afterWorker=afterWorker;result.realWorkerActivation=true;result.sameOriginPersistentProfile=true;
 phase("offline-full-chapter-around-unchanged-partial-scope");
 await context.setOffline(true);await page.goto(base+"/lesen/JHN?chapter=6&from=35&to=37");await page.evaluate(()=>document.fonts.ready.then(()=>undefined));await exactWholeChapter(canonical);await anchorVisible(35);await anchor(35);await unchanged(beforeRecords,"Displaying all71verses around same logicalscope and storedanchor must preserve rawV8");await page.reload();await exactWholeChapter(canonical);await anchorVisible(35);await unchanged(beforeRecords,"Offline reboot before any explicit new write preserves every rawV8record");await page.screenshot({path:path.join(output,"offline-full-chapter-before-v9-write.png")});result.displayedCanonicalVerses=71;result.logicalFocus=partialRef;result.allFourRawV8RecordsExactBeforeNewActions=true;result.noAutomaticChapterCompletion=true;
 phase("gap-protection-and-exact-manual-copy-fallback");
 await button("Mehrere Verse auswählen").click();await select([35,37]);await openTools();await expect(tools().getByText("Bitte wähle zusammenhängende Verse aus.",{exact:true})).toBeVisible();await expect(tools().getByRole("button",{name:"Bibeltext kopieren",exact:true})).toHaveCount(0);await expect(noteField()).toHaveCount(0);await unchanged(beforeRecords,"Gap selection must not mutate data or migrateV8");await closeTools();await verse(37).click();await verse(36).click();await openTools();
 const sentinel="Readerupgrade copy rejection preserves clipboard";await page.evaluate(text=>navigator.clipboard.writeText(text),sentinel);await page.evaluate(()=>Object.defineProperty(navigator.clipboard,"writeText",{configurable:true,value:async()=>{throw new DOMException("Forced test rejection","NotAllowedError");}}));await tools().getByRole("button",{name:"Bibeltext kopieren",exact:true}).click();const fallback=tools().getByRole("textbox",{name:"Bibeltext zum manuellen Kopieren",exact:true});await expect(fallback).toHaveValue(expectedCopy);await expect(fallback).not.toBeEditable();await expect(fallback).toHaveJSProperty("readOnly",true);await expect(page.getByText("Bibeltext kopiert.",{exact:true}).filter({visible:true})).toHaveCount(0);expect(await page.evaluate(()=>navigator.clipboard.readText())).toBe(sentinel);await unchanged(beforeRecords,"Denied copy and readonlymanualfallback cannot migrateV8 or alter data");await page.screenshot({path:path.join(output,"offline-exact-copy-fallback.png")});await tools().getByRole("button",{name:"Kopierfeld schließen",exact:true}).click();await page.evaluate(()=>{delete navigator.clipboard.writeText;});result.copyFallbackExact=expectedCopy;result.gapDidNotFillOrWrite=true;
 phase("first-explicit-range-draft-writes-v9-only-intended-fields");
 await noteField().fill(rangeText);await expect.poll(async()=>(await raw())?.data?.drafts.find(d=>d.key===firstRangeKey)?.values.text).toBe(rangeText);const draftRecords=await checkpoint("afterFirstRangeDraftRecords"),draftMain=main(draftRecords),firstDraft=draftMain.data.drafts.find(d=>d.key===firstRangeKey);
 expect(draftMain.data.version).toBe(9);expect(draftMain.storageVersion).toBe(1);expect(draftMain.data.revision).toBeGreaterThan(before.data.revision);unchangedNonMain(draftRecords,beforeRecords);sourceContentExact(draftMain.data,before.data,["version","revision","readingPosition","drafts"]);oldDraftsExact(draftMain.data,before.data);expect(draftMain.data.drafts).toHaveLength(before.data.drafts.length+1);expect(firstDraft.values.source).toEqual({type:"passage",ref:{book:"JHN",chapter:6,from:35,to:36}});expect(firstDraft.values.text).toBe(rangeText);expect(progress(draftMain.data)).toEqual(beforeProgress);result.firstExplicitActionWroteV9=true;result.onlyVersionRevisionDraftsAndCanonicalAnchorPermittedToChange=true;
 await closeTools();await verse(37).click();await openTools();await expect(noteField()).toHaveValue("");await noteField().fill(secondRangeText);await expect.poll(async()=>(await raw())?.data?.drafts.find(d=>d.key===secondRangeKey)?.values.text).toBe(secondRangeText);const twoDraftRecords=await checkpoint("afterIndependentRangeDraftRecords"),twoDraftMain=main(twoDraftRecords),secondDraft=twoDraftMain.data.drafts.find(d=>d.key===secondRangeKey);expect(secondDraft.id).not.toBe(firstDraft.id);expect(twoDraftMain.data.drafts.find(d=>d.id===firstDraft.id)).toEqual(firstDraft);oldDraftsExact(twoDraftMain.data,before.data);expect(twoDraftMain.data.drafts).toHaveLength(before.data.drafts.length+2);sourceContentExact(twoDraftMain.data,before.data,["version","revision","readingPosition","drafts"]);unchangedNonMain(twoDraftRecords,beforeRecords);expect(progress(twoDraftMain.data)).toEqual(beforeProgress);await closeTools();
 phase("offline-range-draft-recovery-and-commit");
 await page.goto(base+"/sammlung?tab=Entw%C3%BCrfe");await button("Entwurf fortsetzen: Notiz zu Johannes 6,35–36").click();await expect(tools()).toBeVisible();await expect(noteField()).toHaveValue(rangeText);expect(new URL(page.url()).searchParams.get("from")).toBe("35");expect(new URL(page.url()).searchParams.get("to")).toBe("36");expect((await raw()).data.drafts.find(d=>d.id===secondDraft.id)).toEqual(secondDraft);await tools().getByRole("button",{name:"Notiz speichern",exact:true}).click();await expect.poll(async()=>(await raw())?.data?.notes.find(n=>n.text===rangeText.trim())).toMatchObject({kind:"note",ref:{book:"JHN",chapter:6,from:35,to:36},captureSource:{type:"passage",ref:{book:"JHN",chapter:6,from:35,to:36}}});
 const committedRecords=await checkpoint("afterRangeNoteRecords"),committed=main(committedRecords),savedNote=committed.data.notes.find(n=>n.text===rangeText.trim());expect(savedNote.origin).toBeUndefined();expect(committed.data.notes.filter(n=>n.id!==savedNote.id)).toEqual(before.data.notes);expect(committed.data.drafts.some(d=>d.id===firstDraft.id)).toBe(false);expect(committed.data.drafts.find(d=>d.id===secondDraft.id)).toEqual(secondDraft);oldDraftsExact(committed.data,before.data);sourceContentExact(committed.data,before.data,["version","revision","reading","readingPosition","drafts","notes"]);unchangedNonMain(committedRecords,beforeRecords);expect(progress(committed.data)).toEqual(beforeProgress);result.savedRangeNote=savedNote;result.independentSecondRangeDraft=secondDraft;result.oldSingleVerseAndJournalDraftsExact=true;result.ntAnswerAndReadGrowthFieldsExact=true;await page.screenshot({path:path.join(output,"offline-committed-range-note.png")});await closeTools();
 phase("outside-focus-anchor-and-real-offline-reboot");
 await page.goto(base+"/lesen/JHN?chapter=6&from=35&to=37&verse=60");await exactWholeChapter(canonical);await anchor(60);await anchorVisible(60);await expect.poll(()=>new URL(page.url()).searchParams.has("verse")).toBe(false);const outsideRecords=await checkpoint("outsideFocusAnchorRecords"),outside=main(outsideRecords);expect(outside.data.reading).toEqual(partialRef);sourceContentExact(outside.data,committed.data,["revision","reading","readingPosition"]);unchangedNonMain(outsideRecords,beforeRecords);expect(progress(outside.data)).toEqual(beforeProgress);await page.reload();await exactWholeChapter(canonical);await anchorVisible(60);await anchor(60);await page.setViewportSize({width:1440,height:1000});await anchorVisible(60);await anchor(60);await page.setViewportSize({width:320,height:844});await anchorVisible(60);await anchor(60);const afterReflow=await snapshot();sourceContentExact(main(afterReflow).data,outside.data,["revision","readingPosition"]);unchangedNonMain(afterReflow,beforeRecords);expect(progress(main(afterReflow).data)).toEqual(beforeProgress);await page.screenshot({path:path.join(output,"offline-context-anchor60-after-reflow.png")});await button("Zum Abschnittsanfang").click();await expect(verse(35)).toBeFocused();await anchor(35);expect((await raw()).data.reading).toEqual(partialRef);result.outsideFocusAnchorPreserved={verse:60,logicalRef:partialRef,widths:[390,1440,320],offlineReload:true};result.explicitSectionJumpFocusedVerse35=true;
 phase("offline-existing-nt-journal-and-seven-a51-stages");
 await page.goto(base+"/verstehen/MAT?chapter=1");await expect(visible("nt-question-heading")).toHaveText(question.prompt);await expect(page.getByRole("radio",{name:question.options[choice],exact:true}).filter({visible:true})).toBeChecked();await expect(button("Antwort ändern")).toBeVisible();await page.goto(base+"/sammlung");await button("Entwurf fortsetzen").click();await expect(page.getByRole("textbox",{name:"Deine Worte",exact:true})).toHaveValue(journalText);await page.goto(base+"/garten");for(const stage of stages){await button(`Stadium ${stage.index+1} ansehen: ${stage.name}`).click();await readyTree(stage.index);}await page.screenshot({path:path.join(output,"offline-seven-a51-stages.png")});const artRecords=await checkpoint("afterOfflineArtRecords"),artMain=main(artRecords);sourceContentExact(artMain.data,before.data,["version","revision","readingPosition","drafts","notes"]);oldDraftsExact(artMain.data,before.data);expect(artMain.data.drafts.find(d=>d.id===secondDraft.id)).toEqual(secondDraft);unchangedNonMain(artRecords,beforeRecords);expect(progress(artMain.data)).toEqual(beforeProgress);result.offlineA51Stages=7;result.offlineNtAnswerAndOldJournalRestored=true;
 phase("actual-v9-export-and-readonly-restore-preview");
 await page.goto(base+"/einstellungen");const downloadPromise=page.waitForEvent("download");await button("Sicherung exportieren").click();const download=await downloadPromise,exportText=await readFile(await download.path(),"utf8"),exported=JSON.parse(exportText);const expanded={...artMain.data,imports:artMain.data.imports.map(meta=>({...meta,sourceText:record(artRecords,"archive:"+meta.sourceHash)}))};expect(exported).toEqual(expanded);expect(exported.version).toBe(9);await unchanged(artRecords,"Backup export is readonly");await button("Sicherung wiederherstellen").click();const backupChooser=page.waitForEvent("filechooser");await button("OLIVA-Sicherungsdatei auswählen").click();await(await backupChooser).setFiles({name:"synthetic-oliva-v9-backup.json",mimeType:"application/json",buffer:Buffer.from(exportText)});await expect(page.getByText("Sicherung geprüft. Bitte prüfe die Übersicht vor der Wiederherstellung.",{exact:true})).toBeVisible();await expect(button("Daten durch diese Sicherung ersetzen")).toBeVisible();await unchanged(artRecords,"V9 backup validation preview cannot apply a restore");result.exportSha256=hash(exportText);result.actualV9DownloadAndRestorePreview=true;result.restoreWasNotApplied=true;await page.screenshot({path:path.join(output,"offline-v9-export-restore-preview.png")});
 const finalRecords=await checkpoint("finalRecords"),final=main(finalRecords);expect(record(finalRecords,archiveKey)).toBe(source);unchangedNonMain(finalRecords,beforeRecords);oldDraftsExact(final.data,before.data);expect(progress(final.data)).toEqual(beforeProgress);sourceContentExact(final.data,before.data,["version","revision","readingPosition","drafts","notes"]);result.allThreeNonMainRecordsExactThroughV9Actions=true;result.originalNotesAndSourcesPreserved=true;result.readAndGrowthAndNtFieldsExactThroughout=true;result.finalWorker=await worker();expect(result.finalWorker.controller.id).toBe(targetBuild.id);result.runtimeInputsAfter=await verifyRuntimeFreeze();expect(result.runtimeInputsAfter).toEqual(result.runtimeInputsBefore);const oldBuildAfter=await buildMetadata(baseline),targetBuildAfter=await buildMetadata(current);expect(oldBuildAfter.html_sha256).toBe(oldBuild.html_sha256);expect(oldBuildAfter.worker_sha256).toBe(oldBuild.worker_sha256);expect(targetBuildAfter.html_sha256).toBe(targetBuild.html_sha256);expect(targetBuildAfter.worker_sha256).toBe(targetBuild.worker_sha256);result.builtHtmlAndWorkersUnchanged=true;result.sourceUnchangedDuringUpgrade=true;result.passed=true;phase("complete");
}catch(error){result.error=String(error);result.errorStack=error?.stack;process.exitCode=1;if(page){try{result.failureRecords=summaries(await snapshot());}catch{}try{result.workerDiagnostic=await worker();}catch{}try{await page.screenshot({path:path.join(output,"failure.png"),fullPage:true});}catch{}}}
finally{await mkdir(output,{recursive:true});await writeFile(path.join(output,"offline-upgrade.json"),JSON.stringify({...result,checkedAt:new Date().toISOString()},null,2)+"\n");try{await context?.close();}finally{server?.kill();if(temp)await rm(temp,{recursive:true,force:true});}}
console.log(JSON.stringify(result,null,2));
