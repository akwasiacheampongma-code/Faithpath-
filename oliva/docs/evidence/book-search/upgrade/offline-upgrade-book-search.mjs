/** Actual core PWA 0.12.0 -> 0.12.1 upgrade. All seed writes use the frozen UI.
 * Local persistent Chromium profile, own origin/port, real worker and offline cache.
 * No native/hosted/device claims. All IndexedDB inspection is read-only.
 */
import { chromium, expect as baseExpect } from "/workspace/oliva-book-search/node_modules/@playwright/test/index.mjs";
import { spawn } from "node:child_process";
import { mkdtemp, symlink, rename, rm, writeFile, mkdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import path from "node:path";
import net from "node:net";
import { faithpathFixture } from "/workspace/oliva-book-search/tests/fixtures/faithpath-v5.ts";
const project = "/workspace/oliva-book-search";
const expect = baseExpect.configure({timeout: 30000});
const baseline = "/workspace/oliva-v012-nt-study-control-dist";
const current = path.join(project,"dist");
const hash = value => createHash("sha256").update(value).digest("hex");
const json = value => JSON.stringify(value);
const fixedNow = "2027-01-01T12:00:00.000Z";
const source = JSON.stringify(faithpathFixture(),null,2)+"\n";
const draftText = "Mein offener Gedanke aus OLIVA 0.12.\n  Die Buchsuche verändert diese Worte nicht.  ";
let temp, server, context, page;
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

const oldBuild = await buildMetadata(baseline), targetBuild = await buildMetadata(current);
if(oldBuild.version !== "0.12.0" || oldBuild.id !== "oliva-80005b3c1d2e2eef") throw new Error("Frozen 0.12 predecessor required");
if(targetBuild.version !== "0.12.1" || targetBuild.id === oldBuild.id) throw new Error("Build actual final 0.12.1 before running");
const output = process.env.OLIVA_EVIDENCE_DIR ?? path.join(project,"docs/evidence/book-search/upgrade",targetBuild.id);
if(existsSync(path.join(output,"offline-upgrade.json"))) throw new Error("Existing evidence preserved; select new evidence folder");
const result = {
 baselineVersion: oldBuild.version, baselineBuild: oldBuild.id,
 targetVersion: targetBuild.version, targetBuild: targetBuild.id,
 baselineHtmlSha256: oldBuild.html_sha256, baselineWorkerSha256: oldBuild.worker_sha256,
 targetHtmlSha256: targetBuild.html_sha256, targetWorkerSha256: targetBuild.worker_sha256,
 syntheticData:true, syntheticClock:fixedNow, passed:false, physicalDeviceTest:false,
 simulatorTest:false, hostedQa:false, scope:"Local automated Chromium, one persistent profile and origin through actual worker update",
 comparison:"Exact JSON serialization of all raw IndexedDB store values, not physical database-file bytes",
 phases:[], phase:"preflight"
};
function phase(name){ result.phase=name; result.phases.push({name,startedAt:new Date().toISOString()}); console.log("Upgrade phase: "+name); }
const button = name => page.getByRole("button",{name,exact:true}).filter({visible:true});
const bookRows = () => page.getByRole("button",{name:/, \d+ Kapitel$/});
const scope = () => page.getByRole("combobox",{name:"Bibelbereich",exact:true});
const search = () => page.getByRole("textbox",{name:"Buch suchen",exact:true});
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

try {
 await mkdir(output,{recursive:true});
 const stages = JSON.parse(await readFile(path.join(project,"src/features/garden/a51/stage-data.json"),"utf8")).stages;
 expect(stages).toHaveLength(7);
 const bankText=await readFile(path.join(project,"src/data/nt-catalog.json"),"utf8");
 const bank=JSON.parse(bankText).chapters;
 expect(bank).toHaveLength(260);
 expect(bank.reduce((n,c)=>n+c.questions.length,0)).toBe(1300);
 const mat = bank.find(c=>c.book==="MAT"&&c.chapter===1), question=mat.questions[0], choice=(question.correctIndex+1)%4;
 temp=await mkdtemp(path.join(tmpdir(),"oliva-book-search-upgrade-"));
 const live=path.join(temp,"live"); await symlink(baseline,live);
 const port=await new Promise((resolve,reject)=>{const probe=net.createServer();probe.on("error",reject);probe.listen(0,"127.0.0.1",()=>{const address=probe.address();probe.close(()=>resolve(address.port));});});
 server=spawn(process.execPath,[path.join(project,"scripts/serve.mjs"),live],{cwd:project,env:{...process.env,PORT:String(port)},stdio:"ignore"});
 const base=`http://127.0.0.1:${port}`;
 await expect.poll(async()=>{try{return(await fetch(base)).ok;}catch{return false;}}).toBe(true);
 context=await chromium.launchPersistentContext(path.join(temp,"profile"),{executablePath:process.env.CHROMIUM_PATH??"/usr/bin/chromium",args:["--no-sandbox","--disable-dev-shm-usage"],viewport:{width:390,height:844},reducedMotion:"reduce"});
 page=context.pages()[0]??await context.newPage(); page.setDefaultTimeout(30000);
 await page.clock.setFixedTime(new Date(fixedNow));
 result.origin=base; result.browserVersion=context.browser()?.version()??"unreported";
 phase("baseline-ui-seed");
 await page.goto(base+"/einstellungen");
 await expect(page.getByText("OLIVA · lokale Entwicklungsausgabe 0.12.0",{exact:true})).toBeVisible();
 await page.getByRole("textbox",{name:"Dein Vorname (freiwillig)"}).fill("Ada");
 await button("Namen speichern").click();
 await expect.poll(async()=>(await raw())?.data?.name).toBe("Ada");
 await page.goto(base+"/importieren");
 const chooser=page.waitForEvent("filechooser"); await button("FaithPath-Datei auswählen").click();
 await(await chooser).setFiles({name:"synthetic-v5.json",mimeType:"application/json",buffer:Buffer.from(source)});
 await button("Jetzt sichern und Import übernehmen").click();
 await expect(page.getByText(/Import abgeschlossen/)).toBeVisible();
 await page.goto(base+"/lesen/GEN?chapter=1");
 await page.getByRole("button",{name:/^Vers 1:/}).click();
 await button("Merken").click();
 await expect.poll(async()=>(await raw())?.data?.bookmarks).toContain("GEN:1:1");
 await page.goto(base+"/verstehen/MAT?chapter=1");
 await expect(page.getByTestId("nt-question-heading").filter({visible:true})).toHaveText(question.prompt);
 await page.getByRole("radio",{name:question.options[choice],exact:true}).filter({visible:true}).check();
 await button("Antwort prüfen").click();
 await expect(button("Antwort ändern")).toBeVisible();
 const answerKey=`${question.id}:${question.hash}`;
 await expect.poll(async()=>(await raw())?.data?.ntStudy?.answers?.[answerKey]?.choice).toBe(choice);
 await page.goto(base+"/sammlung");
 await button("Einen Gedanken festhalten").click();
 await page.getByRole("textbox",{name:"Deine Worte",exact:true}).fill(draftText);
 await expect(page.getByText("Entwurf auf diesem Gerät gesichert.",{exact:true})).toBeVisible();
 await expect.poll(async()=>(await raw())?.data?.drafts.find(d=>d.type==="journal")?.values.text).toBe(draftText);
 await page.goto(base+"/einstellungen");
 await expect(page.getByText("Für den Offline-Neustart bereit.",{exact:true})).toBeVisible();
 await expect.poll(async()=>(await worker()).controller?.id).toBe(oldBuild.id);
 const beforeRecords=await snapshot(), before=main(beforeRecords);
 expect(before.storageVersion).toBe(1); expect(before.data.version).toBe(8);
 expect(before.data.name).toBe("Ada"); expect(before.data.bookmarks).toContain("GEN:1:1");
 expect(before.data.ntStudy.answers[answerKey].question).toEqual(question);
 const receipt=before.data.imports[0], archiveKey="archive:"+receipt.sourceHash;
 expect(record(beforeRecords,archiveKey)).toBe(source);
 expect(record(beforeRecords,"before-faithpath-import")).toBeTruthy();
 expect(record(beforeRecords,"recovery-index")).toBeTruthy();
 expect(beforeRecords.records).toHaveLength(4);
 result.beforeRecords=summaries(beforeRecords); result.archiveSha256=hash(source);
 result.baselineNtAnswer={id:question.id,hash:question.hash,choice};
 result.baselineWorker=await worker();
 phase("actual-worker-update-and-read-only-hydration");
 await symlink(current,path.join(temp,"next")); await rename(path.join(temp,"next"),live);
 await page.goto(base+"/einstellungen");
 await expect(page.getByText("OLIVA · lokale Entwicklungsausgabe 0.12.1",{exact:true})).toBeVisible();
 await expect(page.getByRole("textbox",{name:"Dein Vorname (freiwillig)"})).toHaveValue("Ada");
 await expect(page.getByText("Für den Offline-Neustart bereit.",{exact:true})).toBeVisible();
 await expect.poll(async()=>(await worker()).controller?.id).toBe(targetBuild.id);
 const nextWorker=await worker(); expect(nextWorker.active.id).toBe(targetBuild.id);
 expect(nextWorker.controller.version).toBe("0.12.1");
 expect(nextWorker.caches).toContain(oldBuild.id); expect(nextWorker.caches).toContain(targetBuild.id);
 await unchanged(beforeRecords,"Actual PWA upgrade must not change any raw V8 record");
 result.afterWorker=nextWorker; result.realWorkerUpdate=true; result.sameOriginPersistentProfile=true;
 phase("book-search-default-and-whitespace");
 await page.goto(base+"/bibel"); await expect(scope()).toHaveValue("Alle"); await expect(bookRows()).toHaveCount(66);
 await expect(scope().locator("option")).toHaveText(["Gesamte Bibel","Neues Testament (NT)","Altes Testament (AT)"]);
 for(const q of ["Markus "," M a r k u s ","\u00a0Mar\u2009kus\u202f"]){await search().fill(q);await expect(bookRows()).toHaveCount(1);await expect(button("Markus, 16 Kapitel")).toBeVisible();}
 for(const q of ["1 Mose"," 1 . M o s e ","１．Ｍｏｓｅ"]){await search().fill(q);await expect(bookRows()).toHaveCount(1);await expect(button("1. Mose, 50 Kapitel")).toBeVisible();}
 await search().fill(" \u00a0\u2009"); await expect(bookRows()).toHaveCount(66);
 await scope().selectOption("NT");await expect(bookRows()).toHaveCount(27);
 await scope().selectOption("AT");await expect(bookRows()).toHaveCount(39);
 await scope().selectOption("Alle");await expect(bookRows()).toHaveCount(66);
 await unchanged(beforeRecords,"Book filters and tolerant queries must never write personal records");
 await page.screenshot({path:path.join(output,"book-search-after-update.png")});
 phase("offline-reload-and-existing-nt-answer");
 await context.setOffline(true); await page.reload();
 await expect(scope()).toHaveValue("Alle");await expect(bookRows()).toHaveCount(66);
 await search().fill(" 1 . M o s e ");await expect(button("1. Mose, 50 Kapitel")).toBeVisible();await expect(bookRows()).toHaveCount(1);
 await search().fill("Markus ");await scope().selectOption("NT");await expect(button("Markus, 16 Kapitel")).toBeVisible();await expect(bookRows()).toHaveCount(1);
 await unchanged(beforeRecords,"Offline reload and search preserve the raw data");
 await page.screenshot({path:path.join(output,"book-search-offline.png")});
 await page.goto(base+"/verstehen");
 const ntRows=page.getByRole("button",{name:/: Kapitel auswählen$/});
 await expect(ntRows).toHaveCount(27);
 await page.getByRole("textbox",{name:"NT-Buch suchen",exact:true}).fill(" 1 . K o r i n t h e r ");
 await expect(ntRows).toHaveCount(1);await expect(button("1. Korinther: Kapitel auswählen")).toBeVisible();
 await page.goto(base+"/verstehen/MAT?chapter=1");
 await expect(page.getByTestId("nt-question-heading").filter({visible:true})).toHaveText(question.prompt);
 await expect(page.getByRole("radio",{name:question.options[choice],exact:true}).filter({visible:true})).toBeChecked();
 await expect(button("Antwort ändern")).toBeVisible();
 await page.reload();await expect(button("Antwort ändern")).toBeVisible();
 await unchanged(beforeRecords,"Offline NT answer restoration and catalog search must not rewrite data");
 phase("offline-old-draft-and-seven-a51-stages");
 await page.goto(base+"/sammlung");await button("Entwurf fortsetzen").click();
 await expect(page.getByRole("textbox",{name:"Deine Worte",exact:true})).toHaveValue(draftText);
 await unchanged(beforeRecords,"Resuming the existing draft without editing preserves data");
 await page.goto(base+"/garten");
 for(const stage of stages){await button(`Stadium ${stage.index+1} ansehen: ${stage.name}`).click();await readyTree(stage.index);await unchanged(beforeRecords,`Stage ${stage.index+1} preview preserves data`);}
 await page.screenshot({path:path.join(output,"offline-seven-a51-stages.png")});
 const finalRecords=await unchanged(beforeRecords,"Final offline raw snapshot must equal all four predecessor records");
 expect(record(finalRecords,archiveKey)).toBe(source);
 result.afterRecords=summaries(finalRecords);result.allFourRawRecordsExact=true;
 result.offlineReload=true;result.offlineNtAnswerPreserved=true;result.offlineDraftPreserved=true;
 result.offlineA51Stages=stages.length;result.catalogChapters=bank.length;result.catalogQuestions=1300;
 result.catalogQuestionIndividuallyExercisedInBrowser=1;
 result.noNewGrowthOrProgress=true;result.searchScopes={default:66,NT:27,AT:39};
 result.finalWorker=await worker();expect(result.finalWorker.controller.id).toBe(targetBuild.id);
 result.passed=true;phase("complete");
}catch(error){result.error=String(error);result.errorStack=error?.stack;process.exitCode=1;if(page){try{result.failureRecords=summaries(await snapshot());}catch{}try{result.workerDiagnostic=await worker();}catch{}try{await page.screenshot({path:path.join(output,"failure.png"),fullPage:true});}catch{}}}
finally{await mkdir(output,{recursive:true});await writeFile(path.join(output,"offline-upgrade.json"),JSON.stringify({...result,checkedAt:new Date().toISOString()},null,2)+"\n");try{await context?.close();}finally{server?.kill();if(temp)await rm(temp,{recursive:true,force:true});}}
console.log(JSON.stringify(result,null,2));
