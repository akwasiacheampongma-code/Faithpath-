/** Actual owner-private0.18host PWA to Today-only candidate on0.18source basis; local persistent Chromium, no hosted/device/simulator acceptance. */
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
if(!baselineArg||!candidateArg||!expectedVersion||!expectedCore) throw new Error("Required: <frozen-0.18.0-private-dist> <candidate-dist> <actual-version> <actual-core>; assign/build/review actual release first");
const baseline=path.resolve(baselineArg), current=path.resolve(candidateArg);
const hash=value=>createHash("sha256").update(value).digest("hex");
const json=value=>JSON.stringify(value);

async function verifyRuntimeFreeze() {
 const manifest=JSON.parse(await readFile(path.join(project,"docs/evidence/today-focus/runtime-inputs.json"),"utf8"));
 if(!expectedRuntimeDigest||manifest.sha256!==expectedRuntimeDigest)throw new Error("Wrong candidate runtime manifest");
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

const fixture=faithpathFixture();
fixture.data.reviews.push({...fixture.data.paths[0].reviews[0],id:"older-unassigned",sourceKey:"journal:j2",text:"Mein erhaltener früherer Rückblick ohne Weg."});
const fixedNow="2027-01-01T12:00:00.000Z", source=JSON.stringify(fixture,null,2)+"\n";
const journalText="Mein unveränderter Journalentwurf aus OLIVA 0.17.0.", verseText="Meine alten Worte zu genau Johannes 6,35.", rangeText="Mein alter Bereichsentwurf zu Johannes 6,35–36.";
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
 const proof=JSON.parse(await readFile(path.join(project,"docs/evidence/today-focus/packaging-inputs.json"),"utf8"));
 const aggregate=createHash("sha256");
 for(const item of proof.files){const bytes=await readFile(path.join(project,item.path));if(bytes.length!==item.bytes||hash(bytes)!==item.sha256)throw new Error("Packaging input changed: "+item.path);aggregate.update(item.path);aggregate.update(Buffer.from([0]));aggregate.update(bytes);aggregate.update(Buffer.from([0]));}
 if(aggregate.digest("hex")!==proof.sha256)throw new Error("Packaging digest changed");
 return {sha256:proof.sha256,files:proof.files.length,allFileHashesMatch:true};
}
const packagingInputsBefore=await verifyPackagingFreeze();
const runtimeInputsBefore=await verifyRuntimeFreeze(), oldBuild=await buildMetadata(baseline), targetBuild=await buildMetadata(current);
expect(oldBuild.version).toBe("0.18.0");expect(oldBuild.id).toBe("oliva-5d647075614ace83");
expect(targetBuild.version).toBe(expectedVersion);expect(targetBuild.id).toBe(expectedCore);expect(oldBuild.id).not.toBe(targetBuild.id);
const output=process.env.OLIVA_EVIDENCE_DIR??path.join(project,"docs/evidence/today-focus/upgrade",targetBuild.id);
if(existsSync(path.join(output,"offline-upgrade.json")))throw new Error("Preserve existing evidence and choose a new output path");
const result={passed:false,baselineVersion:oldBuild.version,baselineBuild:oldBuild.id,targetVersion:targetBuild.version,targetBuild:targetBuild.id,baselineHtmlSha256:oldBuild.html_sha256,baselineWorkerSha256:oldBuild.worker_sha256,targetHtmlSha256:targetBuild.html_sha256,targetWorkerSha256:targetBuild.worker_sha256,syntheticData:true,syntheticClock:fixedNow,physicalDeviceTest:false,simulatorTest:false,hostedQa:false,runtimeInputsBefore,phases:[]};
const button=name=>page.getByRole("button",{name,exact:true}).filter({visible:true});
const visible=id=>page.getByTestId(id).filter({visible:true});
const verse=n=>page.getByRole("button",{name:new RegExp(`^Vers ${n}:`)}).filter({visible:true});
function phase(name){result.phase=name;result.phases.push({name,startedAt:new Date().toISOString()});console.log("Today-only update phase: "+name);}
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
 const stages=JSON.parse(await readFile(path.join(project,"src/features/garden/a51/stage-data.json"),"utf8")).stages;
 const nt=JSON.parse(await readFile(path.join(project,"src/data/nt-catalog.json"),"utf8")).chapters;
 const ntq=nt.find(c=>c.book==="MAT"&&c.chapter===1).questions[0],ntChoice=(ntq.correctIndex+1)%4,ntKey=ntq.id+":"+ntq.hash;
 const unit=catalog.find(u=>u.id==="NS-0241"),q=questions[unit.questions[0].id],choice=(q.correctIndex+1)%4;
 temp=await mkdtemp(path.join(tmpdir(),"oliva-personal-tree-upgrade-"));const live=path.join(temp,"live");await symlink(baseline,live);
 const port=await new Promise((resolve,reject)=>{const probe=net.createServer();probe.on("error",reject);probe.listen(0,"127.0.0.1",()=>{const address=probe.address();probe.close(()=>resolve(address.port));});});
 server=spawn(process.execPath,[path.join(project,"scripts/serve.mjs"),live],{cwd:project,env:{...process.env,PORT:String(port)},stdio:"ignore"});const base=`http://127.0.0.1:${port}`;
 await expect.poll(async()=>{try{return(await fetch(base)).ok;}catch{return false;}}).toBe(true);
 context=await chromium.launchPersistentContext(path.join(temp,"profile"),{executablePath:process.env.CHROMIUM_PATH??"/usr/bin/chromium",args:["--no-sandbox","--disable-dev-shm-usage"],viewport:{width:390,height:844},reducedMotion:"reduce",acceptDownloads:true});
 page=context.pages()[0]??await context.newPage();page.setDefaultTimeout(30000);await page.clock.setFixedTime(new Date(fixedNow));result.origin=base;result.browserVersion=context.browser()?.version();
 phase("seed-real-017-owner-private-host-only-through-its-shipped-ui");
 await page.goto(base+"/einstellungen");await expect(page.getByText("OLIVA · lokale Entwicklungsausgabe 0.18.0",{exact:true})).toBeVisible();
 await page.getByRole("textbox",{name:"Dein Vorname (freiwillig)"}).fill("Ada");await button("Namen speichern").click();
 await page.goto(base+"/importieren");const chooser=page.waitForEvent("filechooser");await button("FaithPath-Datei auswählen").click();await(await chooser).setFiles({name:"synthetic-v5.json",mimeType:"application/json",buffer:Buffer.from(source)});await button("Jetzt sichern und Import übernehmen").click();await expect(page.getByText(/Import abgeschlossen/)).toBeVisible();
 await page.goto(base+"/vorhaben?start=1");
 const goalTitle="Mit Ruhe zuhören",reviewText="Mein damaliger freiwilliger Rückblick.\nMit einer offenen Frage.";
 await page.getByRole("textbox",{name:"Name deines Vorhabens",exact:true}).fill(goalTitle);
 await page.getByRole("textbox",{name:"Was bewegt dich? (freiwillig)",exact:true}).fill("Mein ursprünglicher Anlass.");
 await page.getByRole("textbox",{name:"Dein erster kleiner Schritt (freiwillig)",exact:true}).fill("Eine offene Frage stellen.");
 await button("Vorhaben anlegen").click();await button("Freiwilligen Rückblick schreiben").click();
 await page.getByRole("textbox",{name:"Dein freiwilliger Rückblick",exact:true}).fill(reviewText);
 await page.getByRole("switch",{name:"Erfahrung im Alltag selbst bestätigen",exact:true}).click();await button("Rückblick festhalten").click();
 await expect.poll(async()=>(await raw())?.data?.goals.find(g=>g.title===goalTitle)?.reviews[0]?.text).toBe(reviewText);
 await page.goto(base+"/verstehen/MAT?chapter=1");await expect(visible("nt-question-heading")).toHaveText(ntq.prompt);await page.getByRole("radio",{name:ntq.options[ntChoice],exact:true}).filter({visible:true}).check();await button("Antwort prüfen").click();await expect(button("Antwort ändern")).toBeVisible();
 await page.goto(base+"/geschichte/"+unit.id+"?stage=verstehen");await expect(visible("story-question-heading")).toHaveText(q.prompt);await page.getByRole("radio",{name:q.options[choice],exact:true}).filter({visible:true}).check();await button("Antwort ansehen").click();await expect(button("Antwort ändern")).toBeVisible();
 await page.goto(base+"/geschichte/NS-0073?stage=gedanken");await page.getByRole("textbox",{name:"Dein eigener Gedanke · freiwillig",exact:true}).fill("Mein gespeicherter Psalmgedanke aus OLIVA 0.17.");await button("Gedanken speichern").click();
 await expect.poll(async()=>(await raw())?.data?.notes.some(n=>n.text==="Mein gespeicherter Psalmgedanke aus OLIVA 0.17.")).toBe(true);
 await page.goto(base+"/sammlung");await button("Einen Gedanken festhalten").click();await page.getByRole("textbox",{name:"Deine Worte",exact:true}).fill(journalText);await expect(page.getByText("Entwurf auf diesem Gerät gesichert.",{exact:true})).toBeVisible();
 await page.goto(base+"/lesen/JHN?chapter=6&from=35&to=37");await expect(visible("reader-flow")).toBeVisible();await verse(35).click();
 const bar=()=>page.getByRole("toolbar",{name:"Versauswahl",exact:true}),dialog=()=>page.getByRole("dialog").filter({visible:true});
 await bar().getByRole("button",{name:"Notiz",exact:true}).click();await dialog().getByRole("textbox",{name:"Notiz zu Vers 35",exact:true}).fill(verseText);await expect.poll(async()=>(await raw())?.data?.drafts.find(d=>d.key==="capture:verse:JHN:6:35")?.values.text).toBe(verseText);await dialog().getByRole("button",{name:"Schließen",exact:true}).click();
 await verse(36).click();await bar().getByRole("button",{name:"Notiz",exact:true}).click();await dialog().getByRole("textbox",{name:"Deine Notiz zu dieser Auswahl",exact:true}).fill(rangeText);await expect.poll(async()=>(await raw())?.data?.drafts.find(d=>d.key==="capture:passage:JHN:6:35:36")?.values.text).toBe(rangeText);await dialog().getByRole("button",{name:"Schließen",exact:true}).click();
 await page.goto(base+"/einstellungen");await expect(page.getByText("Für den Offline-Neustart bereit.",{exact:true})).toBeVisible();await expect.poll(async()=>(await worker()).controller?.id).toBe(oldBuild.id);
 const beforeRecords=await checkpoint("beforeRecords"),before=main(beforeRecords),goal=before.data.goals.find(g=>g.title===goalTitle);
 expect(before.data.version).toBe(11);expect(beforeRecords.records).toHaveLength(4);expect(goal.reviews[0].text).toBe(reviewText);expect(before.data.drafts).toHaveLength(3);result.beforeWorker=await worker();
 phase("activate-different-real-worker-build-without-schema-or-data-write");
 await symlink(current,path.join(temp,"next"));await rename(path.join(temp,"next"),live);await page.goto(base+"/einstellungen");
 await expect.poll(()=>page.locator('meta[name="oliva-build"]').getAttribute("content")).toBe(targetBuild.id);
 await expect(page.getByRole("textbox",{name:"Dein Vorname (freiwillig)"})).toHaveValue("Ada");await expect(page.getByText("Für den Offline-Neustart bereit.",{exact:true})).toBeVisible();await expect.poll(async()=>(await worker()).controller?.id).toBe(targetBuild.id);result.afterWorker=await worker();
 await unchanged(beforeRecords,"Changed Biblehub must not migrate or write V11");result.realWorkerActivation=true;result.sameOriginPersistentProfile=true;
 phase("single-static-sword-and-all66books-offline-without-any-data-write");
 await context.setOffline(true);await page.goto(base+"/bibel");
 const sword=()=>visible("spiritual-sword-image");
 const readySword=async()=>{await expect(sword()).toBeVisible();await expect.poll(()=>sword().evaluate(node=>{const img=node instanceof HTMLImageElement?node:node.querySelector("img");return !!img&&img.complete&&img.naturalWidth===512&&img.naturalHeight===768;})).toBe(true);};
 await readySword();await expect(page.getByRole("button",{name:/, \d+ Kapitel$/})).toHaveCount(66);
 await expect(visible("spiritual-word-card").getByRole("progressbar")).toHaveCount(0);
 await expect(page.locator('[data-testid^="book-sword"], [data-testid="sword-art"], [data-testid="sword-confirmation"]')).toHaveCount(0);
 await unchanged(beforeRecords,"The one spiritual symbol and all66book entries keep every raw record exact");
 await page.reload();await readySword();await unchanged(beforeRecords,"Offline Biblehub restart must not write data");
 await page.goto(base+"/sammlung");await expect(button("Buchschwerter")).toHaveCount(0);
 await unchanged(beforeRecords,"Collection removal does not delete personal data");
 await page.goto(base+"/buch/JHN");await expect(visible("book-overview")).toBeVisible();
 await unchanged(beforeRecords,"Old book URL now opens a peaceful readonly book overview");
 result.singleStaticSwordAvailableOffline=true;result.bookSwordGalleryRemoved=true;result.all66BooksAvailable=true;
 phase("first-offline-personal-tree-history-and-real-goal-return-are-readonly");
 await context.setOffline(true);await page.goto(base+"/garten");await expect(visible("personal-tree-journey")).toBeVisible();await readyTree(before.data.growthStage);
 const reviewRow=visible(`tree-moment-review:${goal.id}:${goal.reviews[0].id}`);
 await expect(reviewRow.getByText(reviewText,{exact:true})).toBeVisible();
 await button(goalTitle+": zugehöriges Vorhaben öffnen").first().click();await expect(page).toHaveURL(new RegExp("/vorhaben/"+goal.id));
 await expect(visible("review-"+goal.reviews[0].id)).toBeVisible();
 await page.goto(base+"/garten");await expect(visible("personal-tree-journey")).toBeVisible();await page.reload();await expect(visible("personal-tree-journey")).toBeVisible();
 await unchanged(beforeRecords,"Goal/history views and offline restart keep every raw record exact");result.personalGoalAndReviewRestoredExactly=true;
 phase("history-thought-opens-collection-for-reading-and-keeps-other-drafts");
 const note=before.data.notes.find(n=>n.text==="Mein gespeicherter Psalmgedanke aus OLIVA 0.17.");
 await visible("tree-moment-note:"+note.id).getByRole("button",{name:"Gedanken in der Sammlung öffnen",exact:true}).click();
 await expect(visible("collection-note-"+note.id)).toBeVisible();await expect(page.getByRole("textbox",{name:"Deine Worte",exact:true})).toHaveCount(0);
 await unchanged(beforeRecords,"Reading a historical thought must not open or change an editor");result.thoughtOpenedReadonlyWithUnrelatedDraftsExact=true;
 phase("offline-seven-a51-stages-and-existing-study-answers");
 await page.goto(base+"/garten");for(const stage of stages){await button(`Stadium ${stage.index+1} ansehen: ${stage.name}`).click();await readyTree(stage.index);}await button("Zurück zu deinem Baum").click();await readyTree(before.data.growthStage);
 await page.goto(base+"/verstehen/MAT?chapter=1");await expect(visible("nt-question-heading")).toHaveText(ntq.prompt);await expect(page.getByRole("radio",{name:ntq.options[ntChoice],exact:true}).filter({visible:true})).toBeChecked();
 await page.goto(base+"/geschichte/"+unit.id+"?stage=verstehen");await expect(page.getByRole("radio",{name:q.options[choice],exact:true}).filter({visible:true})).toBeChecked();
 await unchanged(beforeRecords,"All stage previews and saved study answers remain readonly");result.offlineA51Stages=7;result.oldStudyAnswersUnchanged=true;
 phase("preserved-offline-original-history-from-garden-and-exact-archive-coordinates-remains-readonly");
 await page.goto(base+"/garten");await button("Frühere FaithPath-Momente ansehen").click();
 await expect(visible("archive-readable-history")).toBeVisible();await button("In Ruhe zuhören").click();
 await expect(page.getByText("Damals hat mich diese Frage bewegt.",{exact:true})).toBeVisible();
 await expect(page.getByText("Ein kleiner Anfang.",{exact:true})).toBeVisible();
 await unchanged(beforeRecords,"Original path review/milestone projection must not restore native reviews or grow data");
 await button("Originalmeilenstein im Archiv ansehen").click();await expect(visible("archive-focused-json")).toBeVisible();
 expect(JSON.parse(await visible("archive-focused-json").innerText())).toEqual(fixture.data.paths[0].milestones[0]);
 await unchanged(beforeRecords,"Exact original milestone is readonly");result.originalReviewsAndMilestonesAccessibleReadonly=true;
 await page.goto(base+"/importarchiv/"+before.data.imports[0].id+"?view=history&historyTab=unassigned");
 await expect(page.getByText("Mein erhaltener früherer Rückblick ohne Weg.",{exact:true})).toBeVisible();
 await button("Originalrückblick im Archiv ansehen").click();await expect(visible("archive-focused-json")).toBeVisible();
 expect(JSON.parse(await visible("archive-focused-json").innerText())).toEqual(fixture.data.reviews[0]);
 await unchanged(beforeRecords,"An unassigned original review cannot acquire an invented native path or change drafts");
 result.unassignedReviewOriginalSourceExact=true;
 phase("actual-v11-backup-download-and-restore-preview-without-applying");
 await page.goto(base+"/einstellungen");const downloading=page.waitForEvent("download");await button("Sicherung exportieren").click();const download=await downloading,text=await readFile(await download.path(),"utf8"),exported=JSON.parse(text);
 const expanded={...before.data,imports:before.data.imports.map(meta=>({...meta,sourceText:record(beforeRecords,"archive:"+meta.sourceHash)}))};expect(exported).toEqual(expanded);await unchanged(beforeRecords,"Backup export remains readonly");
 await button("Sicherung wiederherstellen").click();const choosing=page.waitForEvent("filechooser");await button("OLIVA-Sicherungsdatei auswählen").click();await(await choosing).setFiles({name:"synthetic-oliva-v11-backup.json",mimeType:"application/json",buffer:Buffer.from(text)});await expect(page.getByText("Sicherung geprüft. Bitte prüfe die Übersicht vor der Wiederherstellung.",{exact:true})).toBeVisible();await expect(button("Daten durch diese Sicherung ersetzen")).toBeVisible();
 await unchanged(beforeRecords,"Restore preview must not apply the backup");result.actualV11DownloadAndRestorePreview=true;result.restoreWasNotApplied=true;result.exportSha256=hash(text);await page.screenshot({path:path.join(output,"unchanged-v11-restore-preview.png")});
 result.finalRecords=summaries(await snapshot());result.allFourRawV11RecordsExactThroughout=true;result.packagingInputsBefore=packagingInputsBefore;result.packagingInputsAfter=await verifyPackagingFreeze();expect(result.packagingInputsAfter).toEqual(packagingInputsBefore);result.runtimeInputsAfter=await verifyRuntimeFreeze();expect(result.runtimeInputsAfter).toEqual(runtimeInputsBefore);
 const oldAfter=await buildMetadata(baseline),targetAfter=await buildMetadata(current);expect(oldAfter.html_sha256).toBe(oldBuild.html_sha256);expect(oldAfter.worker_sha256).toBe(oldBuild.worker_sha256);expect(targetAfter.html_sha256).toBe(targetBuild.html_sha256);expect(targetAfter.worker_sha256).toBe(targetBuild.worker_sha256);result.builtHtmlAndWorkersUnchanged=true;result.sourceUnchangedDuringUpgrade=true;result.passed=true;phase("complete");
} catch(error) {
 result.error=String(error);result.errorStack=error?.stack;process.exitCode=1;
 if(page){try{result.failureRecords=summaries(await snapshot());}catch{}try{result.workerDiagnostic=await worker();}catch{}try{await page.screenshot({path:path.join(output,"failure.png"),fullPage:true});}catch{}}
} finally {
 await mkdir(output,{recursive:true});await writeFile(path.join(output,"offline-upgrade.json"),JSON.stringify({...result,checkedAt:new Date().toISOString()},null,2)+"\n");
 try{await context?.close();}finally{server?.kill();if(temp)await rm(temp,{recursive:true,force:true});}
}
console.log(JSON.stringify(result,null,2));
