/** Real, same-origin 0.4 -> 0.5 web-worker update using synthetic local data.
 * The old script remains the historical 0.3 -> 0.4 check. No hosted Site.
 */
import { chromium, expect as baseExpect } from "@playwright/test";
import { spawn } from "node:child_process";
import { mkdtemp, symlink, rename, rm, writeFile, mkdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import path from "node:path";
import net from "node:net";
import { faithpathFixture } from "../tests/fixtures/faithpath-v5.ts";
const expect = baseExpect.configure({ timeout: 30000 });
const baseline = path.resolve(process.argv[2] ?? "/workspace/oliva-v04-upgrade-dist");
const current = path.resolve(process.argv[3] ?? "dist");
const output = "docs/evidence/session-05";
const result = { baseline_version: "0.4.0", target_version: "0.5.0", synthetic_data: true, passed: false, physical_device_test: false };
const source = JSON.stringify(faithpathFixture(),null,2)+"\n";
const draftText = "Mein offener, unveränderter Gedanke aus OLIVA 0.4.";
const stages = JSON.parse(await readFile("src/features/garden/a51/stage-data.json","utf8")).stages;
const baselineHtml = await readFile(path.join(baseline,"index.html"),"utf8");
const originalAsset = [...baselineHtml.matchAll(/<script\b[^>]*src="([^"]+)"/g)]
  .map(match=>match[1])
  .find(asset=>asset.startsWith("/")&&!existsSync(path.join(current,asset.slice(1))));
if (!originalAsset) throw new Error("Baseline must contain an old script hash absent from the new build; otherwise old-cache fallback is not proved");
const originalAssetHash = createHash("sha256").update(await readFile(path.join(baseline,originalAsset.slice(1)))).digest("hex");
const temp = await mkdtemp(path.join(tmpdir(),"oliva-upgrade-v05-")), live = path.join(temp,"live");
await symlink(baseline,live);
const port = await new Promise(resolve => { const server=net.createServer();server.listen(0,"127.0.0.1",()=>{ const address=server.address();server.close(()=>resolve(address.port)); }); });
const server = spawn(process.execPath,["scripts/serve.mjs",live],{env:{...process.env,PORT:String(port)},stdio:"ignore"});
const base = `http://127.0.0.1:${port}`;
let browser, page, context;
async function entries() {
  return page.evaluate(()=>new Promise((resolve,reject)=>{
    const open=indexedDB.open("oliva-local-v1",1);
    open.onerror=()=>reject(open.error);
    open.onsuccess=()=>{
      const db=open.result,tx=db.transaction("state","readonly"),store=tx.objectStore("state");
      const keys=store.getAllKeys(),values=store.getAll();
      tx.onerror=()=>{db.close();reject(tx.error);};
      tx.oncomplete=()=>{db.close();resolve(Object.fromEntries(keys.result.map((key,index)=>[String(key),values.result[index]])));};
    };
  }));
}
async function raw() { return (await entries()).main; }
async function worker() {
  return page.evaluate(async()=>{
    const registration=await navigator.serviceWorker.getRegistration();
    const controller=navigator.serviceWorker.controller;
    async function inspect(target) {
      if (!target) return null;
      return new Promise(resolve=>{
        const channel=new MessageChannel(),timer=setTimeout(()=>{channel.port1.close();resolve(null);},1500);
        channel.port1.onmessage=event=>{clearTimeout(timer);channel.port1.close();resolve(event.data);};
        target.postMessage({type:"OLIVA_BUILD"},[channel.port2]);
      });
    }
    return {expected:document.querySelector('meta[name="oliva-build"]')?.getAttribute("content"),controller:await inspect(controller),active:await inspect(registration?.active),waiting:await inspect(registration?.waiting),caches:(await caches.keys()).filter(key=>key.startsWith("oliva-"))};
  });
}
async function readyTree(stage) {
  const tree=page.getByTestId("olive-tree");
  await tree.scrollIntoViewIfNeeded();
  await expect.poll(()=>tree.evaluate(node=>{const data=node.olivaTree?.();return data?.ready?data.stage:null;})).toBe(stage);
  await expect(tree.locator("img.tree-fallback")).toBeVisible();
}
try {
  await expect.poll(async()=>{try{return (await fetch(base)).ok;}catch{return false;}}).toBe(true);
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH??(existsSync("/usr/bin/chromium")?"/usr/bin/chromium":undefined),args:["--no-sandbox"]});
  context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:"reduce"});
  page=await context.newPage();page.setDefaultTimeout(30000);
  await page.goto(base+"/einstellungen");
  await expect(page.getByText("OLIVA · lokale Entwicklungsausgabe 0.4.0",{exact:true})).toBeVisible();
  await page.getByRole("textbox",{name:"Dein Vorname (freiwillig)"}).fill("Ada");
  await page.getByRole("button",{name:"Namen speichern",exact:true}).click();
  await expect.poll(async()=>(await raw())?.data?.name).toBe("Ada");
  await page.goto(base+"/importieren");
  const chooser=page.waitForEvent("filechooser");
  await page.getByRole("button",{name:"FaithPath-Datei auswählen",exact:true}).click();
  await (await chooser).setFiles({name:"synthetic-v5.json",mimeType:"application/json",buffer:Buffer.from(source)});
  await page.getByRole("button",{name:"Jetzt sichern und Import übernehmen",exact:true}).click();
  await expect(page.getByText(/Import abgeschlossen/)).toBeVisible();
  // A real completed chapter before the upgrade; the tree preview must not add one.
  await page.goto(base+"/lesen/GEN?chapter=1");
  await page.getByRole("button",{name:"Kapitel als gelesen bestätigen",exact:true}).click();
  await expect.poll(async()=>(await raw())?.data?.readChapters?.includes("GEN:1")).toBe(true);
  await page.goto(base+"/sammlung");
  await page.getByRole("button",{name:"Einen Gedanken festhalten",exact:true}).click();
  await page.getByRole("textbox",{name:"Deine Worte",exact:true}).fill(draftText);
  await expect(page.getByText("Entwurf auf diesem Gerät gesichert.",{exact:true})).toBeVisible();
  const beforeEntries=await entries(),before=beforeEntries.main;
  expect(before.storageVersion).toBe(1);expect(before.data.version).toBe(4);
  expect(before.data.notes.length).toBeGreaterThan(0);expect(before.data.goals.length).toBeGreaterThan(0);
  const archiveKey="archive:"+before.data.imports[0].sourceHash;
  expect(beforeEntries[archiveKey]).toBe(source);
  expect(before.data.imports[0].sourceText).toBeUndefined();
  await expect(page.getByText("Für den Offline-Neustart bereit.",{exact:true})).toBeVisible();
  await expect.poll(async()=>(await worker()).controller?.version).toBe("0.4.0");
  const oldWorker=await worker();
  expect(oldWorker.controller.id).toBe(oldWorker.expected);expect(oldWorker.caches).toContain(oldWorker.expected);
  Object.assign(result,{baseline_private_storage_version:before.storageVersion,baseline_data_version:before.data.version,baseline_build_id:oldWorker.expected,baseline_worker:oldWorker});

  // Atomic file-root switch on exactly the same origin and browser profile.
  await symlink(current,path.join(temp,"next"));const updateStartedAt=Date.now();
  await rename(path.join(temp,"next"),live);
  await page.goto(base+"/einstellungen");
  await expect(page.getByText("OLIVA · lokale Entwicklungsausgabe 0.5.0",{exact:true})).toBeVisible();
  await expect(page.getByRole("textbox",{name:"Dein Vorname (freiwillig)"})).toHaveValue("Ada");
  await expect(page.getByText("Für den Offline-Neustart bereit.",{exact:true})).toBeVisible();
  const newWorker=await worker();
  expect(newWorker.controller.version).toBe("0.5.0");
  expect(newWorker.controller.id).toBe(newWorker.expected);
  expect(newWorker.expected).not.toBe(oldWorker.expected);
  expect(newWorker.caches).toContain(oldWorker.expected);expect(newWorker.caches).toContain(newWorker.expected);
  // Hydration is lazy. Merely opening the upgraded app must not rewrite a record.
  expect(await entries()).toEqual(beforeEntries);
  Object.assign(result,{new_worker:newWorker,worker_activation_verified:true,lazy_migration_does_not_rewrite_data:true,old_cache_retained:true});

  // Explicitly save the SAME trimmed name to exercise the V4 -> V5 write
  // boundary. A trailing space enables the real UI's save action; the product
  // trims it back to Ada, so no profile value changes in the comparison.
  await page.getByRole("textbox",{name:"Dein Vorname (freiwillig)"}).fill("Ada ");
  await page.getByRole("button",{name:"Namen speichern",exact:true}).click();
  await expect.poll(async()=>(await raw())?.data?.version).toBe(5);
  const afterEntries=await entries(),after=afterEntries.main;
  expect(after.storageVersion).toBe(1);expect(after.data.readingPosition).toBeNull();
  const normalized=structuredClone(after);normalized.data.version=4;delete normalized.data.readingPosition;
  expect(normalized.data.revision).toBe(before.data.revision+1);
  normalized.data.revision=before.data.revision;
  expect(normalized).toEqual(before);
  const oldOther={...beforeEntries},newOther={...afterEntries};delete oldOther.main;delete newOther.main;
  expect(newOther).toEqual(oldOther);
  expect(afterEntries[archiveKey]).toBe(source);

  await context.setOffline(true);await page.reload();
  await expect(page.getByText("OLIVA · lokale Entwicklungsausgabe 0.5.0",{exact:true})).toBeVisible();
  await expect(page.getByRole("textbox",{name:"Dein Vorname (freiwillig)"})).toHaveValue("Ada");
  await page.goto(base+"/sammlung");
  await page.getByRole("button",{name:"Entwurf fortsetzen",exact:true}).click();
  await expect(page.getByRole("textbox",{name:"Deine Worte",exact:true})).toHaveValue(draftText);
  expect(await entries()).toEqual(afterEntries);
  await page.goto(base+"/garten");
  for(const stage of stages) {
    await page.getByRole("button",{name:`Stadium ${stage.index+1} ansehen: ${stage.name}`,exact:true}).click();
    await readyTree(stage.index);
    expect(await entries()).toEqual(afterEntries);
  }
  const oldCacheProof=await page.evaluate(async({asset,oldId,newId})=>({
    old:!!(await(await caches.open(oldId)).match(asset)),
    current:!!(await(await caches.open(newId)).match(asset)),
  }),{asset:originalAsset,oldId:oldWorker.expected,newId:newWorker.expected});
  expect(oldCacheProof.old).toBe(true);expect(oldCacheProof.current).toBe(false);
  const cachedOldHash=await page.evaluate(async asset=>{
    const response=await fetch(asset);if(!response.ok)throw new Error("Old cached asset unavailable");
    return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",await response.arrayBuffer()))).map(b=>b.toString(16).padStart(2,"0")).join("");
  },originalAsset);
  expect(cachedOldHash).toBe(originalAssetHash);
  await mkdir(output,{recursive:true});
  await page.screenshot({path:path.join(output,"offline-upgrade-a51-mobile.png")});
  Object.assign(result,{passed:true,profile_preserved:true,journal_draft_preserved:true,notes_preserved:true,goals_preserved:true,all_progress_fields_preserved:true,original_archive_blob_preserved:true,all_other_state_records_preserved:true,only_migration_fields_and_explicit_revision_changed:true,offline_reload_passed:true,offline_a51_stages_verified:stages.length,tree_previews_do_not_write_data:true,old_cached_asset_verified:true,old_asset_present_in_old_cache:true,old_asset_absent_from_new_cache:true,old_cached_asset_path:originalAsset,old_cached_asset_sha256:cachedOldHash,storage_format:after.storageVersion,data_version:after.data.version,current_build_id:newWorker.expected,update_and_offline_check_ms:Date.now()-updateStartedAt});
} catch(error) {
  result.error=String(error);
  if(page) {
    try{result.worker_diagnostic=await worker();}catch{}
    await mkdir(output,{recursive:true});
    try{await page.screenshot({path:path.join(output,"offline-upgrade-failure.png")});}catch{}
  }
  throw error;
} finally {
  await mkdir(output,{recursive:true});
  await writeFile(path.join(output,"offline-upgrade.json"),JSON.stringify({...result,checkedAt:new Date().toISOString()},null,2)+"\n");
  await browser?.close();server.kill();await rm(temp,{recursive:true,force:true});
}
console.log(JSON.stringify(result,null,2));
