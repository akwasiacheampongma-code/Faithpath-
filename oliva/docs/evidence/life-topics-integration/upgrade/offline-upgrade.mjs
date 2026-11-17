/** Actual 0.14.0 to 0.15.0 worker upgrade; persistent local Chromium, no device/simulator/hosted QA. */
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
if(!baselineArg||!candidateArg||!expectedVersion||!expectedCore) throw new Error("Required: <frozen-0.14.0-dist> <candidate-dist> <actual-version> <actual-core>; assign/build/review actual release first");
const baseline=path.resolve(baselineArg), current=path.resolve(candidateArg);
const hash=value=>createHash("sha256").update(value).digest("hex");
const json=value=>JSON.stringify(value);

async function verifyRuntimeFreeze() {
 const manifest=JSON.parse(await readFile(path.join(project,"docs/evidence/life-topics-integration/runtime-inputs.json"),"utf8"));
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
const journalText="Mein unveränderter Journalentwurf aus OLIVA 0.14.0.", verseText="Meine alten Worte zu genau Johannes 6,35.", rangeText="Mein alter Bereichsentwurf zu Johannes 6,35–36.";
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



async function verifyPackagingFreeze() {
 const proof=JSON.parse(await readFile(path.join(project,"docs/evidence/life-topics-integration/packaging-inputs.json"),"utf8"));
 const aggregate=createHash("sha256");
 for(const item of proof.files){const bytes=await readFile(path.join(project,item.path));if(bytes.length!==item.bytes||hash(bytes)!==item.sha256)throw new Error("Packaging input changed: "+item.path);aggregate.update(item.path);aggregate.update(Buffer.from([0]));aggregate.update(bytes);aggregate.update(Buffer.from([0]));}
 if(aggregate.digest("hex")!==proof.sha256)throw new Error("Packaging digest changed");
 return {sha256:proof.sha256,files:proof.files.length,allFileHashesMatch:true};
}
const packagingInputsBefore=await verifyPackagingFreeze();
const runtimeInputsBefore=await verifyRuntimeFreeze(), oldBuild=await buildMetadata(baseline), targetBuild=await buildMetadata(current);
expect(oldBuild.version).toBe("0.14.0");expect(oldBuild.id).toBe("oliva-2077ca680180fb6b");
expect(targetBuild.version).toBe(expectedVersion);expect(targetBuild.id).toBe(expectedCore);expect(oldBuild.id).not.toBe(targetBuild.id);
const output=process.env.OLIVA_EVIDENCE_DIR??path.join(project,"docs/evidence/life-topics-integration/upgrade",targetBuild.id);
if(existsSync(path.join(output,"offline-upgrade.json")))throw new Error("Preserve existing evidence and choose a new output path");
const result={passed:false,baselineVersion:oldBuild.version,baselineBuild:oldBuild.id,targetVersion:targetBuild.version,targetBuild:targetBuild.id,baselineHtmlSha256:oldBuild.html_sha256,baselineWorkerSha256:oldBuild.worker_sha256,targetHtmlSha256:targetBuild.html_sha256,targetWorkerSha256:targetBuild.worker_sha256,syntheticData:true,syntheticClock:fixedNow,physicalDeviceTest:false,simulatorTest:false,hostedQa:false,runtimeInputsBefore,phases:[]};
const button=name=>page.getByRole("button",{name,exact:true}).filter({visible:true});
const visible=id=>page.getByTestId(id).filter({visible:true});
const verse=n=>page.getByRole("button",{name:new RegExp(`^Vers ${n}:`)}).filter({visible:true});
function phase(name){result.phase=name;result.phases.push({name,startedAt:new Date().toISOString()});console.log("Topic upgrade phase: "+name);}
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

try {
 await mkdir(output,{recursive:true});
 const catalog=JSON.parse(await readFile(path.join(project,"src/data/story-index.json"),"utf8")).units;
 const questions=JSON.parse(await readFile(path.join(project,"src/data/story-questions.json"),"utf8")).questions;
 const topics=JSON.parse(await readFile(path.join(project,"src/data/life-topics.json"),"utf8")).topics;
 const stages=JSON.parse(await readFile(path.join(project,"src/features/garden/a51/stage-data.json"),"utf8")).stages;
 const nt=JSON.parse(await readFile(path.join(project,"src/data/nt-catalog.json"),"utf8")).chapters;
 const ntq=nt.find(c=>c.book==="MAT"&&c.chapter===1).questions[0],ntChoice=(ntq.correctIndex+1)%4,ntKey=ntq.id+":"+ntq.hash;
 const unit=catalog.find(u=>u.id==="NS-0241"),q=questions[unit.questions[0].id],choice=(q.correctIndex+1)%4;
 const jude=catalog.find(u=>u.id==="NS-0420"),oldThought="Mein bereits vorhandener Judas-Entwurf mit zwei getrennten Stellen.";
 const work=topics.find(t=>t.sourceId==="arbeit");
 expect(topics).toHaveLength(18);expect(topics.flatMap(t=>t.steps)).toHaveLength(45);
 temp=await mkdtemp(path.join(tmpdir(),"oliva-topics-upgrade-"));const live=path.join(temp,"live");await symlink(baseline,live);
 const port=await new Promise((resolve,reject)=>{const probe=net.createServer();probe.on("error",reject);probe.listen(0,"127.0.0.1",()=>{const address=probe.address();probe.close(()=>resolve(address.port));});});
 server=spawn(process.execPath,[path.join(project,"scripts/serve.mjs"),live],{cwd:project,env:{...process.env,PORT:String(port)},stdio:"ignore"});const base=`http://127.0.0.1:${port}`;
 await expect.poll(async()=>{try{return(await fetch(base)).ok;}catch{return false;}}).toBe(true);
 context=await chromium.launchPersistentContext(path.join(temp,"profile"),{executablePath:process.env.CHROMIUM_PATH??"/usr/bin/chromium",args:["--no-sandbox","--disable-dev-shm-usage"],viewport:{width:390,height:844},reducedMotion:"reduce",acceptDownloads:true});
 page=context.pages()[0]??await context.newPage();page.setDefaultTimeout(30000);await page.clock.setFixedTime(new Date(fixedNow));result.origin=base;result.browserVersion=context.browser()?.version();
 phase("seed-only-through-shipped-014-ui");
 await page.goto(base+"/einstellungen");await expect(page.getByText("OLIVA · lokale Entwicklungsausgabe 0.14.0",{exact:true})).toBeVisible();
 await page.getByRole("textbox",{name:"Dein Vorname (freiwillig)"}).fill("Ada");await button("Namen speichern").click();
 await page.goto(base+"/importieren");const chooser=page.waitForEvent("filechooser");await button("FaithPath-Datei auswählen").click();await(await chooser).setFiles({name:"synthetic-v5.json",mimeType:"application/json",buffer:Buffer.from(source)});await button("Jetzt sichern und Import übernehmen").click();await expect(page.getByText(/Import abgeschlossen/)).toBeVisible();
 await page.goto(base+"/verstehen/MAT?chapter=1");await expect(visible("nt-question-heading")).toHaveText(ntq.prompt);await page.getByRole("radio",{name:ntq.options[ntChoice],exact:true}).filter({visible:true}).check();await button("Antwort prüfen").click();await expect(button("Antwort ändern")).toBeVisible();
 await page.goto(base+"/geschichte/"+unit.id+"?stage=verstehen");await expect(visible("story-question-heading")).toHaveText(q.prompt);await page.getByRole("radio",{name:q.options[choice],exact:true}).filter({visible:true}).check();await button("Antwort ansehen").click();await expect(button("Antwort ändern")).toBeVisible();
 await page.goto(base+"/geschichte/NS-0073?stage=gedanken");await page.getByRole("textbox",{name:"Dein eigener Gedanke · freiwillig",exact:true}).fill("Mein bewahrter Psalmgedanke aus der bestehenden App.");await button("Gedanken speichern").click();await expect.poll(async()=>(await raw())?.data?.notes.some(n=>n.text==="Mein bewahrter Psalmgedanke aus der bestehenden App.")).toBe(true);
 await page.goto(base+"/geschichte/NS-0420?stage=gedanken");await page.getByRole("textbox",{name:"Dein eigener Gedanke · freiwillig",exact:true}).fill(oldThought);await expect.poll(async()=>(await raw())?.data?.drafts.some(d=>d.values.source?.type==="story")).toBe(true);
 await page.goto(base+"/sammlung");await button("Einen Gedanken festhalten").click();await page.getByRole("textbox",{name:"Deine Worte",exact:true}).fill(journalText);await expect(page.getByText("Entwurf auf diesem Gerät gesichert.",{exact:true})).toBeVisible();
 await page.goto(base+"/lesen/JHN?chapter=6&from=35&to=37");await expect(visible("reader-flow")).toBeVisible();await verse(35).click();
 const bar=()=>page.getByRole("toolbar",{name:"Versauswahl",exact:true}),dialog=()=>page.getByRole("dialog").filter({visible:true});
 await bar().getByRole("button",{name:"Notiz",exact:true}).click();await dialog().getByRole("textbox",{name:"Notiz zu Vers 35",exact:true}).fill(verseText);await expect.poll(async()=>(await raw())?.data?.drafts.find(d=>d.key==="capture:verse:JHN:6:35")?.values.text).toBe(verseText);await dialog().getByRole("button",{name:"Schließen",exact:true}).click();
 await verse(36).click();await bar().getByRole("button",{name:"Notiz",exact:true}).click();await dialog().getByRole("textbox",{name:"Deine Notiz zu dieser Auswahl",exact:true}).fill(rangeText);await expect.poll(async()=>(await raw())?.data?.drafts.find(d=>d.key==="capture:passage:JHN:6:35:36")?.values.text).toBe(rangeText);await dialog().getByRole("button",{name:"Schließen",exact:true}).click();
 await page.goto(base+"/einstellungen");await expect(page.getByText("Für den Offline-Neustart bereit.",{exact:true})).toBeVisible();await expect.poll(async()=>(await worker()).controller?.id).toBe(oldBuild.id);
 const beforeRecords=await checkpoint("beforeRecords"),before=main(beforeRecords);
 expect(before.data.version).toBe(10);expect(beforeRecords.records).toHaveLength(4);expect(before.data.drafts).toHaveLength(4);expect(before.data.ntStudy.answers[ntKey].question).toEqual(ntq);expect(before.data.storyStudy.answers[q.id+":"+q.hash].question).toEqual(q);result.beforeWorker=await worker();
 phase("activate-real-worker-without-automatic-data-write");
 await symlink(current,path.join(temp,"next"));await rename(path.join(temp,"next"),live);await page.goto(base+"/einstellungen");await expect(page.getByText(`OLIVA · lokale Entwicklungsausgabe ${expectedVersion}`,{exact:true})).toBeVisible();await expect(page.getByRole("textbox",{name:"Dein Vorname (freiwillig)"})).toHaveValue("Ada");await expect(page.getByText("Für den Offline-Neustart bereit.",{exact:true})).toBeVisible();await expect.poll(async()=>(await worker()).controller?.id).toBe(targetBuild.id);result.afterWorker=await worker();expect(result.afterWorker.active.id).toBe(targetBuild.id);expect(result.afterWorker.controller.version).toBe(expectedVersion);await unchanged(beforeRecords,"V10 hydration may add V11 in RAM only");result.realWorkerActivation=true;result.sameOriginPersistentProfile=true;
 phase("first-offline-topic-visits-leave-all-v10-records-exact");
 await context.setOffline(true);await page.goto(base+"/themen");await expect(page.getByText("18 Themen",{exact:true})).toBeVisible();
 await page.goto(base+"/weg/"+work.id);await expect(button("Abschnitt lesen")).toBeVisible();await page.reload();await expect(button("Abschnitt lesen")).toBeVisible();
 await page.goto(base+"/geschichte/"+unit.id+"?stage=verstehen");await expect(page.getByRole("radio",{name:q.options[choice],exact:true}).filter({visible:true})).toBeChecked();
 await unchanged(beforeRecords,"Offline discovery, old story answers and restart keep all V10 bytes");result.allFourRawV10RecordsExactBeforeNewActions=true;
 phase("first-explicit-topic-opening-writes-v11-without-touching-old-personal-content");
 await page.goto(base+"/weg/"+work.id);await button("Abschnitt lesen").click();await expect(visible("reader-flow")).toBeVisible();
 await expect.poll(async()=>(await raw())?.data?.reading.book).toBe("COL");
 const openedRecords=await checkpoint("afterTopicOpeningRecords"),opened=main(openedRecords);
 expect(opened.data.version).toBe(11);expect(opened.data.activePath).toBe(work.id);expect(opened.data.readSteps).toEqual(before.data.readSteps);expect(opened.data.completedSteps).toEqual(before.data.completedSteps);
 contentExact(opened.data,before.data,["version","revision","activePath","onboarded","reading","readingPosition"]);unchangedNonMain(openedRecords,beforeRecords);result.firstExplicitTopicOpeningOnlyMigratesVersionAndNavigation=true;
 await button("Abschnitt als gelesen bestätigen").click();await button("Weiter zum Verstehen").click();
 await expect(page.getByText(work.steps[0].explanation,{exact:true})).toBeVisible();
 await expect(page.getByText(/Diese Worte stehen in einer antiken Haustafel/)).toBeVisible();
 const newText="Mein neuer Arbeitsgedanke bewahrt Originalkontext und eigene Einordnung.";
 await page.getByRole("textbox",{name:"Deine Reflexion (freiwillig)",exact:true}).fill(newText);await expect.poll(async()=>(await raw())?.data?.drafts.length).toBe(5);
 await page.goto(base+"/sammlung?tab=Entw%C3%BCrfe");await button("Entwurf fortsetzen: Reflexion: Arbeit & Berufung · Kolosser 3,22–24").click();
 await expect(page.getByRole("textbox",{name:"Deine Reflexion (freiwillig)",exact:true})).toHaveValue(newText);await page.reload();await expect(page.getByRole("textbox",{name:"Deine Reflexion (freiwillig)",exact:true})).toHaveValue(newText);
 await button("Reflexion speichern & Schritt abschließen").click();await expect.poll(async()=>(await raw())?.data?.notes.length).toBe(before.data.notes.length+1);
 const topicRecords=await checkpoint("afterTopicReflectionRecords"),drafted=main(topicRecords),note=drafted.data.notes.find(n=>n.text===newText);
 expect(note.captureSource.snapshot.question).toBe(work.steps[0].question);expect(note.captureSource.snapshot.explanation).toContain(work.steps[0].explanation);expect(note.captureSource.snapshot.explanation).toContain("Ergänzender OLIVA-Hinweis:");
 expect(drafted.data.readSteps).toEqual([...before.data.readSteps,work.id+":0"]);expect(drafted.data.completedSteps).toEqual([...before.data.completedSteps,work.id+":0"]);
 expect(drafted.data.drafts).toEqual(before.data.drafts);expect(drafted.data.notes.filter(n=>n.id!==note.id)).toEqual(before.data.notes);
 contentExact(drafted.data,before.data,["version","revision","activePath","onboarded","reading","readingPosition","readSteps","completedSteps","notes","growthStage"]);unchangedNonMain(topicRecords,beforeRecords);result.newTopicReflectionKeepsAllOldDomainsAndDrafts=true;
 phase("offline-old-story-draft-nt-answer-and-all-seven-a51-stages");
 await page.goto(base+"/sammlung?tab=Entw%C3%BCrfe");await button("Entwurf fortsetzen: Reflexion: "+jude.title).click();await expect(page.getByRole("textbox",{name:"Dein eigener Gedanke · freiwillig",exact:true})).toHaveValue(oldThought);
 expect(drafted.data.drafts.find(d=>d.values.source?.type==="story").values.source.references).toEqual(jude.references);result.oldStoryDraftKeepsBothOriginalRanges=true;
 await page.goto(base+"/verstehen/MAT?chapter=1");await expect(visible("nt-question-heading")).toHaveText(ntq.prompt);await expect(page.getByRole("radio",{name:ntq.options[ntChoice],exact:true}).filter({visible:true})).toBeChecked();
 await page.goto(base+"/garten");for(const stage of stages){await button(`Stadium ${stage.index+1} ansehen: ${stage.name}`).click();await readyTree(stage.index);}await unchanged(topicRecords,"Old drafts, A51 preview and NT answers do not write");result.offlineA51Stages=7;result.oldNtAnswerUnchanged=true;
 phase("actual-v11-backup-download-and-restore-preview");
 await page.goto(base+"/einstellungen");const downloading=page.waitForEvent("download");await button("Sicherung exportieren").click();const download=await downloading,text=await readFile(await download.path(),"utf8"),exported=JSON.parse(text);
 const expanded={...drafted.data,imports:drafted.data.imports.map(meta=>({...meta,sourceText:record(topicRecords,"archive:"+meta.sourceHash)}))};expect(exported).toEqual(expanded);expect(exported.version).toBe(11);await unchanged(topicRecords,"Backup export is readonly");
 await button("Sicherung wiederherstellen").click();const choosing=page.waitForEvent("filechooser");await button("OLIVA-Sicherungsdatei auswählen").click();await(await choosing).setFiles({name:"synthetic-oliva-v11-backup.json",mimeType:"application/json",buffer:Buffer.from(text)});await expect(page.getByText("Sicherung geprüft. Bitte prüfe die Übersicht vor der Wiederherstellung.",{exact:true})).toBeVisible();await expect(button("Daten durch diese Sicherung ersetzen")).toBeVisible();await unchanged(topicRecords,"V11 restore preview never applies the backup");result.actualV11DownloadAndRestorePreview=true;result.restoreWasNotApplied=true;result.exportSha256=hash(text);await page.screenshot({path:path.join(output,"offline-v11-restore-preview.png")});
 result.packagingInputsBefore=packagingInputsBefore;result.packagingInputsAfter=await verifyPackagingFreeze();expect(result.packagingInputsAfter).toEqual(packagingInputsBefore);result.runtimeInputsAfter=await verifyRuntimeFreeze();expect(result.runtimeInputsAfter).toEqual(runtimeInputsBefore);
 const oldAfter=await buildMetadata(baseline),targetAfter=await buildMetadata(current);expect(oldAfter.html_sha256).toBe(oldBuild.html_sha256);expect(oldAfter.worker_sha256).toBe(oldBuild.worker_sha256);expect(targetAfter.html_sha256).toBe(targetBuild.html_sha256);expect(targetAfter.worker_sha256).toBe(targetBuild.worker_sha256);result.builtHtmlAndWorkersUnchanged=true;result.sourceUnchangedDuringUpgrade=true;result.passed=true;phase("complete");
} catch(error) {
 result.error=String(error);result.errorStack=error?.stack;process.exitCode=1;
 if(page){try{result.failureRecords=summaries(await snapshot());}catch{}try{result.workerDiagnostic=await worker();}catch{}try{await page.screenshot({path:path.join(output,"failure.png"),fullPage:true});}catch{}}
} finally {
 await mkdir(output,{recursive:true});await writeFile(path.join(output,"offline-upgrade.json"),JSON.stringify({...result,checkedAt:new Date().toISOString()},null,2)+"\n");
 try{await context?.close();}finally{server?.kill();if(temp)await rm(temp,{recursive:true,force:true});}
}
console.log(JSON.stringify(result,null,2));


