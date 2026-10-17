import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {KEYS} from '../../src/store.js';
import {phase5Fixture} from '../phase5-fixtures.mjs';
const base=process.env.QA_URL||'http://127.0.0.1:4450',out=process.env.QA_OUT||'qa-output/uiux6b/backup-red';
fs.mkdirSync(out,{recursive:true});
const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const c=await b.newContext();await c.addInitScript(({KEYS,data})=>{if(!sessionStorage.getItem('seed')){localStorage.setItem(KEYS.main,JSON.stringify(data));localStorage.setItem(KEYS.onboard,'done');sessionStorage.setItem('seed','yes');}},{KEYS,data:phase5Fixture('thirty')});
const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));let result;
try{
 await p.goto(base+'/#more?section=data');await p.locator('.backup-page').waitFor();
 const before=await p.evaluate(KEYS=>({main:localStorage.getItem(KEYS.main),draft:localStorage.getItem(KEYS.draft),restore:localStorage.getItem(KEYS.restore)}),KEYS);
 await p.evaluate(()=>{const original=File.prototype.text;File.prototype.text=async function(){const bytes=await original.call(this);return new Promise(resolve=>window.releaseFile=()=>resolve(bytes));};});
 await p.locator('#import-file').setInputFiles({name:'late.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({app:'FaithPath',data:phase5Fixture('empty')}))});
 await p.waitForFunction(()=>!!window.releaseFile);
 await p.evaluate(()=>location.hash='journal');await p.locator('.journal-page').waitFor();
 await p.evaluate(()=>location.hash='more?section=data');await p.locator('.backup-page').waitFor();
 await p.evaluate(()=>window.releaseFile());await p.waitForTimeout(200);
 assert.equal(await p.locator('#dialog').evaluate(e=>e.open),false,'Returning to the identical route must not revive a stale file preview');
 assert.deepEqual(await p.evaluate(KEYS=>({main:localStorage.getItem(KEYS.main),draft:localStorage.getItem(KEYS.draft),restore:localStorage.getItem(KEYS.restore)}),KEYS),before);
 assert.deepEqual(errors,[]);result={status:'PASS',base,checks:['No stale preview after navigating away and returning','Main, draft and restore bytes unchanged','No runtime error']};
}catch(e){result={status:'FAIL',base,error:e.stack,errors};await p.screenshot({path:out+'/failure.png'});}finally{await b.close();fs.writeFileSync(out+'/results.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));}
process.exitCode=result.status==='PASS'?0:1;
