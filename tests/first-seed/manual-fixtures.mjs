/** Create and restore genuine V5 exports for the physical gate, synthetic only.
 * Files are QA artifacts; never copied into the app build or a public profile. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {KEYS,empty} from '../../src/store.js';
import {treeLevel} from '../../src/domain.js';
import {phase3Fixture} from '../phase3-fixtures.mjs';

const base=process.env.QA_URL||'http://127.0.0.1:4610';
const out=process.env.QA_OUT||'qa-output/first-seed/final/manual-fixtures';
const target='reports/first-seed/Testdaten';
fs.mkdirSync(out,{recursive:true});fs.mkdirSync(target,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.FAITHPATH_CHROMIUM||'/usr/bin/chromium',args:['--no-sandbox']});
const names=['Samen','Keimling','Junger_Baum','Wachsender_Baum','Starker_Baum','Erste_Fruechte','Fruchttragender_Baum'];
const results=[],errors=[];
try{
 const context=await browser.newContext({viewport:{width:390,height:844},acceptDownloads:true,serviceWorkers:'block'});
 await context.addInitScript(KEYS=>localStorage.setItem(KEYS.onboard,'done'),KEYS);
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/#more?section=data');
 for(let stage=0;stage<7;stage++){
  const data=phase3Fixture('tree-'+stage,'light');assert.equal(treeLevel(data),stage);
  await page.evaluate(({KEYS,data})=>localStorage.setItem(KEYS.main,JSON.stringify(data)),{KEYS,data});
  await page.reload();await page.locator('[data-action=export]').waitFor();
  const file=target+`/TEST_Baumstufe_${stage+1}_${names[stage]}.json`;
  const download=page.waitForEvent('download');await page.locator('[data-action=export]').click();await(await download).saveAs(file);
  const exported=JSON.parse(fs.readFileSync(file));assert.deepEqual(exported.data,data);
  // Restore into a genuinely different, empty state: a no-op importer must fail.
  await page.evaluate(({KEYS,data})=>localStorage.setItem(KEYS.main,JSON.stringify(data)),{KEYS,data:empty()});
  await page.reload();assert.equal(await page.evaluate(KEYS=>JSON.parse(localStorage.getItem(KEYS.main)).paths.length,KEYS),0);
  await page.locator('#import-file').setInputFiles(file);
  await page.locator('[data-action=review-import]').click();
  await page.locator('[data-action=confirm-import]').click();
  await page.waitForFunction(()=>!document.querySelector('dialog').open);
  assert.deepEqual(await page.evaluate(KEYS=>JSON.parse(localStorage.getItem(KEYS.main)),KEYS),data);
  await page.goto(base+'/#tree');await page.locator(`.tree-branch-scene .olive-art[data-tree-stage="${stage}"]`).waitFor();
  results.push({stage,file,status:'PASS',genuineAppExportAndRestore:true,restoreIntoEmptyState:true});
  await page.goto(base+'/#more?section=data');
 }
 await context.close();assert.deepEqual(errors,[]);
}finally{
 await browser.close();fs.writeFileSync(out+'/results.json',JSON.stringify({base,results,errors,synthetic:true,physicalIOS:'OPEN'},null,2));
}
console.log(JSON.stringify({passed:results.length,errors}));
