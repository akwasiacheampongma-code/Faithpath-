/** Actual 0.13.1 to 0.14.0 worker upgrade; persistent local Chromium, no device/simulator/hosted QA. */
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
const [baselineArg,candidateArg,expectedVersion,expectedCore,expectedRuntimeDigest]=process.argv.slice(2);
if(!baselineArg||!candidateArg||!expectedVersion||!expectedCore) throw new Error("Required: <frozen-0.13.0-dist> <candidate-dist> <actual-version> <actual-core>; assign/build/review actual release first");
const baseline=path.resolve(baselineArg), current=path.resolve(candidateArg);
const hash=value=>createHash("sha256").update(value).digest("hex");
const json=value=>JSON.stringify(value);

async function verifyRuntimeFreeze() {
 const manifest=JSON.parse(await readFile(path.join(project,"docs/evidence/stories-integration/runtime-inputs.json"),"utf8"));
 if(!expectedRuntimeDigest||manifest.runtimeSourceDigest.sha256!==expectedRuntimeDigest)throw new Error("Wrong candidate runtime manifest");
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

const fixedNow="2027-01-01T12:00:00.000Z", source=JSON.stringify(faithpathFixture(),null,2)+"\n";
const journalText="Mein unveränderter Journalentwurf aus OLIVA 0.13.1.", verseText="Meine alten Worte zu genau Johannes 6,35.", rangeText="Mein alter Bereichsentwurf zu Johannes 6,35–36.";
const partialRef={book:"JHN",chapter:6,from:35,to:37};
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



const runtimeInputsBefore=await verifyRuntimeFreeze(), oldBuild=await buildMetadata(baseline), targetBuild=await buildMetadata(current);
expect(oldBuild.version).toBe("0.13.1");expect(oldBuild.id).toBe("oliva-1f49306347c4f496");
expect(targetBuild.version).toBe(expectedVersion);expect(targetBuild.id).toBe(expectedCore);expect(oldBuild.id).not.toBe(targetBuild.id);
const output=process.env.OLIVA_EVIDENCE_DIR??path.join(project,"docs/evidence/stories-integration/upgrade",targetBuild.id);
if(existsSync(path.join(output,"offline-upgrade.json")))throw new Error("Preserve existing evidence and choose a new output path");
const result={passed:false,baselineVersion:oldBuild.version,baselineBuild:oldBuild.id,targetVersion:targetBuild.version,targetBuild:targetBuild.id,baselineHtmlSha256:oldBuild.html_sha256,baselineWorkerSha256:oldBuild.worker_sha256,targetHtmlSha256:targetBuild.html_sha256,targetWorkerSha256:targetBuild.worker_sha256,syntheticData:true,syntheticClock:fixedNow,physicalDeviceTest:false,simulatorTest:false,hostedQa:false,runtimeInputsBefore,phases:[]};
const button=name=>page.getByRole("button",{name,exact:true}).filter({visible:true});
const visible=id=>page.getByTestId(id).filter({visible:true});
const verse=n=>page.getByRole("button",{name:new RegExp(`^Vers ${n}:`)}).filter({visible:true});
function phase(name){result.phase=name;result.phases.push({name,startedAt:new Date().toISOString()});console.log("Story upgrade phase: "+name);}
const nonMain=state=>state.records.filter(x=>!(x.store==="state"&&x.key==="main"));
function unchangedNonMain(actual,before){expect(json(nonMain(actual))).toBe(json(nonMain(before)));}
function without(data,keys){return Object.fromEntries(Object.entries(data).filter(([key])=>!keys.includes(key)));}
function contentExact(data,before,allowed){expect(without(data,allowed)).toStrictEqual(without(before,allowed));}
async function checkpoint(name){const state=await snapshot();result[name]=summaries(state);return state;}
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
 const catalog=JSON.parse(await readFile(path.join(project,"src/data/story-index.json"),"utf8")).units;
 const questions=JSON.parse(await readFile(path.join(project,"src/data/story-questions.json"),"utf8")).questions;
 expect(catalog).toHaveLength(436);expect(Object.keys(questions)).toHaveLength(2479);
 const stages=JSON.parse(await readFile(path.join(project,"src/features/garden/a51/stage-data.json"),"utf8")).stages;
 const nt=JSON.parse(await readFile(path.join(project,"src/data/nt-catalog.json"),"utf8")).chapters;
 const ntq=nt.find(c=>c.book==="MAT"&&c.chapter===1).questions[0],ntChoice=(ntq.correctIndex+1)%4,ntKey=ntq.id+":"+ntq.hash;
 temp=await mkdtemp(path.join(tmpdir(),"oliva-stories-upgrade-"));const live=path.join(temp,"live");await symlink(baseline,live);
 const port=await new Promise((resolve,reject)=>{const probe=net.createServer();probe.on("error",reject);probe.listen(0,"127.0.0.1",()=>{const address=probe.address();probe.close(()=>resolve(address.port));});});
 server=spawn(process.execPath,[path.join(project,"scripts/serve.mjs"),live],{cwd:project,env:{...process.env,PORT:String(port)},stdio:"ignore"});const base=`http://127.0.0.1:${port}`;
 await expect.poll(async()=>{try{return(await fetch(base)).ok;}catch{return false;}}).toBe(true);
 context=await chromium.launchPersistentContext(path.join(temp,"profile"),{executablePath:process.env.CHROMIUM_PATH??"/usr/bin/chromium",args:["--no-sandbox","--disable-dev-shm-usage"],viewport:{width:390,height:844},reducedMotion:"reduce",acceptDownloads:true});
 page=context.pages()[0]??await context.newPage();page.setDefaultTimeout(30000);await page.clock.setFixedTime(new Date(fixedNow));result.origin=base;result.browserVersion=context.browser()?.version();
 phase("seed-only-through-shipped-0131-ui");
 await page.goto(base+"/einstellungen");await expect(page.getByText("OLIVA · lokale Entwicklungsausgabe 0.13.1",{exact:true})).toBeVisible();
 await page.getByRole("textbox",{name:"Dein Vorname (freiwillig)"}).fill("Ada");await button("Namen speichern").click();
 await page.goto(base+"/importieren");const chooser=page.waitForEvent("filechooser");await button("FaithPath-Datei auswählen").click();await(await chooser).setFiles({name:"synthetic-v5.json",mimeType:"application/json",buffer:Buffer.from(source)});await button("Jetzt sichern und Import übernehmen").click();await expect(page.getByText(/Import abgeschlossen/)).toBeVisible();
 await page.goto(base+"/verstehen/MAT?chapter=1");await expect(visible("nt-question-heading")).toHaveText(ntq.prompt);await page.getByRole("radio",{name:ntq.options[ntChoice],exact:true}).filter({visible:true}).check();await button("Antwort prüfen").click();await expect(button("Antwort ändern")).toBeVisible();
 await page.goto(base+"/sammlung");await button("Einen Gedanken festhalten").click();await page.getByRole("textbox",{name:"Deine Worte",exact:true}).fill(journalText);await expect(page.getByText("Entwurf auf diesem Gerät gesichert.",{exact:true})).toBeVisible();
 await page.goto(base+"/lesen/JHN?chapter=6&from=35&to=37");await expect(visible("reader-flow")).toBeVisible();await verse(35).click();
 const bar=()=>page.getByRole("toolbar",{name:"Versauswahl",exact:true}),dialog=()=>page.getByRole("dialog").filter({visible:true});
 await bar().getByRole("button",{name:"Notiz",exact:true}).click();await dialog().getByRole("textbox",{name:"Notiz zu Vers 35",exact:true}).fill(verseText);await expect.poll(async()=>(await raw())?.data?.drafts.find(d=>d.key==="capture:verse:JHN:6:35")?.values.text).toBe(verseText);await dialog().getByRole("button",{name:"Schließen",exact:true}).click();
 await verse(36).click();await bar().getByRole("button",{name:"Notiz",exact:true}).click();await dialog().getByRole("textbox",{name:"Deine Notiz zu dieser Auswahl",exact:true}).fill(rangeText);await expect.poll(async()=>(await raw())?.data?.drafts.find(d=>d.key==="capture:passage:JHN:6:35:36")?.values.text).toBe(rangeText);await dialog().getByRole("button",{name:"Schließen",exact:true}).click();
 await page.goto(base+"/einstellungen");await expect(page.getByText("Für den Offline-Neustart bereit.",{exact:true})).toBeVisible();await expect.poll(async()=>(await worker()).controller?.id).toBe(oldBuild.id);
 const beforeRecords=await checkpoint("beforeRecords"),before=main(beforeRecords);expect(before.data.version).toBe(9);expect(before.data.storyStudy).toBeUndefined();expect(beforeRecords.records).toHaveLength(4);expect(before.data.drafts).toHaveLength(3);expect(before.data.ntStudy.answers[ntKey].question).toEqual(ntq);result.beforeWorker=await worker();
 phase("activate-real-worker-without-automatic-data-write");
 await symlink(current,path.join(temp,"next"));await rename(path.join(temp,"next"),live);await page.goto(base+"/einstellungen");await expect(page.getByText(`OLIVA · lokale Entwicklungsausgabe ${expectedVersion}`,{exact:true})).toBeVisible();await expect(page.getByRole("textbox",{name:"Dein Vorname (freiwillig)"})).toHaveValue("Ada");await expect(page.getByText("Für den Offline-Neustart bereit.",{exact:true})).toBeVisible();await expect.poll(async()=>(await worker()).controller?.id).toBe(targetBuild.id);result.afterWorker=await worker();expect(result.afterWorker.active.id).toBe(targetBuild.id);expect(result.afterWorker.controller.version).toBe(expectedVersion);await unchanged(beforeRecords,"V9 hydration may add V10 in RAM only");result.realWorkerActivation=true;result.sameOriginPersistentProfile=true;
 phase("first-offline-library-and-question-visits-leave-all-v9-records-exact");
 await context.setOffline(true);await page.goto(base+"/geschichten");await expect(page.getByText("436 Abschnitte",{exact:true})).toBeVisible();
 const unit=catalog.find(u=>u.id==="NS-0435"),q=questions[unit.questions[0].id],choice=(q.correctIndex+1)%4;
 await page.goto(base+"/geschichte/"+unit.id+"?stage=verstehen");await expect(visible("story-question-heading")).toHaveText(q.prompt);await page.reload();await expect(visible("story-question-heading")).toHaveText(q.prompt);await unchanged(beforeRecords,"First offline catalog and lazy question loading/restart must leave raw V9 untouched");result.allFourRawV9RecordsExactBeforeNewActions=true;
 phase("first-explicit-answer-writes-v10-without-touching-any-existing-domain");
 await page.getByRole("radio",{name:q.options[choice],exact:true}).filter({visible:true}).check();await unchanged(beforeRecords,"Unconfirmed radio selection is transient");await button("Antwort ansehen").click();await expect(button("Antwort ändern")).toBeVisible();
 const answerRecords=await checkpoint("afterAnswerRecords"),answered=main(answerRecords);expect(answered.storageVersion).toBe(1);expect(answered.data.version).toBe(10);expect(answered.data.storyStudy.answers[q.id+":"+q.hash].question).toEqual(q);expect(answered.data.storyStudy.answers[q.id+":"+q.hash].choice).toBe(choice);contentExact(answered.data,before.data,["version","revision","storyStudy"]);unchangedNonMain(answerRecords,beforeRecords);result.firstExplicitWriteMigratedOnlyVersionRevisionStoryStudy=true;
 await page.reload();await expect(page.getByRole("radio",{name:q.options[choice],exact:true}).filter({visible:true})).toBeChecked();await unchanged(answerRecords,"Restart of saved V10 answer is read only");
 phase("new-two-range-reflection-draft-and-old-drafts-remain-independent");
 const jude=catalog.find(u=>u.id==="NS-0420"),thought="Mein freiwilliger Gedanke zu den beiden getrennten Judas-Abschnitten.";
 await page.goto(base+"/geschichte/NS-0420?stage=gedanken");await page.getByRole("textbox",{name:"Dein eigener Gedanke · freiwillig",exact:true}).fill(thought);await expect.poll(async()=>(await raw())?.data?.drafts.length).toBe(4);
 const draftRecords=await checkpoint("afterStoryDraftRecords"),drafted=main(draftRecords),newDraft=drafted.data.drafts.find(d=>d.type==="capture"&&d.values.source.type==="story");expect(newDraft.values.source.references).toEqual(jude.references);expect(newDraft.values.text).toBe(thought);for(const old of before.data.drafts)expect(drafted.data.drafts.find(d=>d.id===old.id)).toEqual(old);contentExact(drafted.data,answered.data,["revision","drafts"]);unchangedNonMain(draftRecords,beforeRecords);
 await page.goto(base+"/sammlung?tab=Entw%C3%BCrfe");await button("Entwurf fortsetzen: Reflexion: "+jude.title).click();await expect(page.getByRole("textbox",{name:"Dein eigener Gedanke · freiwillig",exact:true})).toHaveValue(thought);await unchanged(draftRecords,"Resuming exact story draft cannot write it");result.storyDraftResumedWithBothOriginalRanges=true;
 phase("offline-old-nt-and-all-seven-a51-stages");
 await page.goto(base+"/verstehen/MAT?chapter=1");await expect(visible("nt-question-heading")).toHaveText(ntq.prompt);await expect(page.getByRole("radio",{name:ntq.options[ntChoice],exact:true}).filter({visible:true})).toBeChecked();await page.goto(base+"/garten");for(const stage of stages){await button(`Stadium ${stage.index+1} ansehen: ${stage.name}`).click();await readyTree(stage.index);}await unchanged(draftRecords,"A51 preview and existing NT answers do not write");result.offlineA51Stages=7;result.oldNtAnswerUnchanged=true;
 phase("actual-v10-backup-download-and-restore-preview");
 await page.goto(base+"/einstellungen");const downloading=page.waitForEvent("download");await button("Sicherung exportieren").click();const download=await downloading,text=await readFile(await download.path(),"utf8"),exported=JSON.parse(text);const expanded={...drafted.data,imports:drafted.data.imports.map(meta=>({...meta,sourceText:record(draftRecords,"archive:"+meta.sourceHash)}))};expect(exported).toEqual(expanded);expect(exported.version).toBe(10);await unchanged(draftRecords,"Backup export is readonly");await button("Sicherung wiederherstellen").click();const choosing=page.waitForEvent("filechooser");await button("OLIVA-Sicherungsdatei auswählen").click();await(await choosing).setFiles({name:"synthetic-oliva-v10-backup.json",mimeType:"application/json",buffer:Buffer.from(text)});await expect(page.getByText("Sicherung geprüft. Bitte prüfe die Übersicht vor der Wiederherstellung.",{exact:true})).toBeVisible();await expect(button("Daten durch diese Sicherung ersetzen")).toBeVisible();await unchanged(draftRecords,"V10 restore preview never applies the backup");result.actualV10DownloadAndRestorePreview=true;result.restoreWasNotApplied=true;result.exportSha256=hash(text);await page.screenshot({path:path.join(output,"offline-v10-restore-preview.png")});
 const finalRecords=await checkpoint("finalRecords");unchangedNonMain(finalRecords,beforeRecords);contentExact(main(finalRecords).data,before.data,["version","revision","storyStudy","drafts"]);result.allOriginalDomainsAndNonMainRecordsPreserved=true;
 result.runtimeInputsAfter=await verifyRuntimeFreeze();expect(result.runtimeInputsAfter).toEqual(runtimeInputsBefore);const oldAfter=await buildMetadata(baseline),targetAfter=await buildMetadata(current);expect(oldAfter.html_sha256).toBe(oldBuild.html_sha256);expect(oldAfter.worker_sha256).toBe(oldBuild.worker_sha256);expect(targetAfter.html_sha256).toBe(targetBuild.html_sha256);expect(targetAfter.worker_sha256).toBe(targetBuild.worker_sha256);result.builtHtmlAndWorkersUnchanged=true;result.sourceUnchangedDuringUpgrade=true;result.passed=true;phase("complete");
}catch(error){result.error=String(error);result.errorStack=error?.stack;process.exitCode=1;if(page){try{result.failureRecords=summaries(await snapshot());}catch{}try{result.workerDiagnostic=await worker();}catch{}try{await page.screenshot({path:path.join(output,"failure.png"),fullPage:true});}catch{}}}
finally{await mkdir(output,{recursive:true});await writeFile(path.join(output,"offline-upgrade.json"),JSON.stringify({...result,checkedAt:new Date().toISOString()},null,2)+"\n");try{await context?.close();}finally{server?.kill();if(temp)await rm(temp,{recursive:true,force:true});}}
console.log(JSON.stringify(result,null,2));
