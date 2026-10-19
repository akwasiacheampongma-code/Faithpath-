/** A no-op restore cannot pass: restore the genuine first-seed export into a
 * fresh browser profile, reload its Journal, then export the same records. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {KEYS} from '../../src/store.js';

const base=process.env.QA_URL||'http://127.0.0.1:4610';
const out=process.env.QA_OUT||'qa-output/first-seed/final/fresh-restore';
const input=process.env.QA_BACKUP||'qa-output/first-seed/final/flow/synthetic-backup.json';
fs.mkdirSync(out,{recursive:true});const expected=JSON.parse(fs.readFileSync(input));
const browser=await chromium.launch({executablePath:process.env.FAITHPATH_CHROMIUM||'/usr/bin/chromium',args:['--no-sandbox']});
const results=[],errors=[];
try{
 const context=await browser.newContext({viewport:{width:390,height:844},acceptDownloads:true,serviceWorkers:'block'});
 await context.addInitScript(KEYS=>localStorage.setItem(KEYS.onboard,'done'),KEYS);
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/#more?section=data');
 assert.equal(await page.evaluate(KEYS=>JSON.parse(localStorage.getItem(KEYS.main)||'null')?.paths.length||0,KEYS),0);
 await page.locator('#import-file').setInputFiles(input);
 await page.locator('[data-action=review-import]').click();await page.locator('[data-action=confirm-import]').click();
 await page.waitForFunction(()=>!document.querySelector('dialog').open);
 assert.deepEqual(await page.evaluate(KEYS=>JSON.parse(localStorage.getItem(KEYS.main)),KEYS),expected.data);
 await page.goto(base+'/#journal');await page.reload();await page.locator('.journal-page').waitFor();
 assert((await page.locator('#main').innerText()).includes(expected.data.journal[0].text));
 await page.goto(base+'/#more?section=data');const download=page.waitForEvent('download');
 await page.locator('[data-action=export]').click();const file=out+'/roundtrip.json';await(await download).saveAs(file);
 assert.deepEqual(JSON.parse(fs.readFileSync(file)).data,expected.data);
 results.push({name:'Restore genuine first-seed path/prayer/links into an empty independent profile, reload Journal, re-export exact IDs and data',status:'PASS'});
 await context.close();assert.deepEqual(errors,[]);
}finally{
 await browser.close();fs.writeFileSync(out+'/results.json',JSON.stringify({base,results,errors,synthetic:true,physicalIOS:'OPEN'},null,2));
}
console.log(JSON.stringify({passed:results.length,errors}));
