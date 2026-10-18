/** Browser fault boundaries: use the actual app and its actual packaged modules. */
import fs from 'node:fs';import assert from 'node:assert/strict';import {chromium} from 'playwright';import {KEYS} from '../../src/store.js';
const base=process.env.QA_URL||'http://127.0.0.1:4575',out=process.env.QA_OUT||'qa-output/phase7/platform-browser';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({...(process.env.FAITHPATH_CHROMIUM?{executablePath:process.env.FAITHPATH_CHROMIUM}:{}),args:['--no-sandbox']}),results=[],errors=[];
async function check(name,fn){try{await fn();results.push({name,status:'PASS'})}catch(e){results.push({name,status:'FAIL',error:e.stack})}console.log(results.at(-1).status,name)}
async function context(init){const c=await browser.newContext({serviceWorkers:'block',viewport:{width:390,height:844}});await c.addInitScript(KEYS=>localStorage.setItem(KEYS.onboard,'done'),KEYS);if(init)await c.addInitScript(init);const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));return {c,p}}
try{
 await check('Malformed Bible response fails visibly and retries successfully without reloading the app',async()=>{
  const {c,p}=await context();try{let count=0;await p.route('**/data/bibles/otb/PSA.json',route=>{count++;return count===1?route.fulfill({contentType:'application/json',body:'{"chapters":null}'}):route.continue()});
   await p.goto(base+'/#read/PSA/52/otb');await p.getByRole('heading',{name:'Dieser Inhalt ist gerade nicht verfügbar.',exact:true}).waitFor();
   assert.match(await p.locator('#main').innerText(),/Bibeltext konnte nicht geladen werden/);
   await p.goto(base+'/#bible');await p.locator('.bible-page').waitFor();await p.goto(base+'/#read/PSA/52/otb');await p.locator('.verse[data-v="8"]').waitFor();assert.match(await p.locator('.verse[data-v="8"]').innerText(),/Ölbaum/);assert.equal(count,2);
  }finally{await c.close()}
 });
 await check('Denied optional worker registration/status leaves navigation usable without unhandled rejection',async()=>{
  const {c,p}=await context(()=>{if(navigator.serviceWorker){navigator.serviceWorker.register=async()=>{throw new DOMException('Synthetic denial','SecurityError')};navigator.serviceWorker.getRegistration=async()=>{throw new DOMException('Synthetic denial','SecurityError')}}});
  try{await p.goto(base+'/#bible');await p.locator('.bible-page').waitFor();await p.goto(base+'/#more?section=settings');await p.locator('[data-action=offline-check]').click();await p.locator('#offline-state').filter({hasText:'Noch nicht offline bereit'}).waitFor();await p.goto(base+'/#journal');await p.locator('.journal-page').waitFor()}finally{await c.close()}
 });
 assert.deepEqual(errors,[]);
}finally{await browser.close();fs.writeFileSync(out+'/results.json',JSON.stringify({results,errors,syntheticFaults:true,physicalIOS:'OFFEN'},null,2))}
if(errors.length||results.some(x=>x.status!=='PASS'))process.exitCode=1;
