import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {KEYS} from '../src/store.js';
import {chromium} from 'playwright';
const base=process.env.FAITHPATH_QA_URL||'http://127.0.0.1:4251';
const out=process.env.FAITHPATH_QA_OUT||'qa-output/chapter-questions-integration/local-downloads';
const root='qa-output/chapter-questions-integration/build/qa/chapter-questions';
fs.mkdirSync(out,{recursive:true});
const results=[],errors=[],consoleErrors=[],loads=[];
const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox',...(process.env.FAITHPATH_PROXY_SPKI?['--ignore-certificate-errors-spki-list='+process.env.FAITHPATH_PROXY_SPKI]:[])]});
const c=await b.newContext({acceptDownloads:true}),p=await c.newPage();
p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text());});p.on('response',r=>{if(r.status()>=400)loads.push(r.url());});
const get=url=>p.evaluate(async url=>{const r=await fetch(url),bytes=new Uint8Array(await r.arrayBuffer());return {status:r.status,type:r.headers.get('content-type'),magic:String.fromCharCode(...bytes.slice(0,4)),sha:[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(x=>x.toString(16).padStart(2,'0')).join('')};},url);
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
try {
 await p.addInitScript(KEYS=>localStorage.setItem(KEYS.onboard,'done'),KEYS);
 await p.goto(base+'/#more?section=settings');await p.locator('#offline-state').filter({hasText:'Beide Bibeln und die App sind für dieses Gerät offline bereit.'}).waitFor({timeout:90000});
 await p.goto(base+'/qa/chapter-questions/');await p.getByRole('heading',{name:'FaithPath Kapitel-Fragen QA'}).waitFor();
 for(const name of ['FaithPath-CHAPTER-QUESTIONS-QA.zip','chapter-questions-integration-error-report.pdf','chapter-questions-integration-change-report.pdf']) {
  const response=await get(base+'/qa/chapter-questions/'+name);assert.equal(response.status,200);const type=response.type;assert(type.includes(name.endsWith('.zip')?'zip':'pdf') || (base.startsWith('http://127.0.0.1:')&&type==='application/octet-stream'));assert.equal(response.magic.slice(0,name.endsWith('.zip')?2:4),name.endsWith('.zip')?'PK':'%PDF');assert.equal(response.sha,hash(path.join(root,name)));
  const download=p.waitForEvent('download');await p.getByRole('link',{name,exact:true}).click();const file=path.join(out,name);await(await download).saveAs(file);assert.equal(hash(file),hash(path.join(root,name)));results.push({name:'Prepared SW native download with correct type and SHA256: '+name,status:'PASS'});
 }
 for(const name of ['local-gate.json','live-gate.json','chapter-questions-integration-error-report.md','chapter-questions-integration-change-report.md','screenshots/01-reader-end-390.png']) {
  const r=await get(base+'/qa/chapter-questions/'+name);assert.equal(r.status,200);assert.equal(r.sha,hash(path.join(root,name)));results.push({name:'Direct public artifact: '+name,status:'PASS'});
 }
 await p.goto(base+'/#read/JHN/3/otb');await p.locator('.verse').first().waitFor();await c.setOffline(true);await p.reload();await p.locator('.reader-chapter-questions').waitFor();results.push({name:'Return from reports to prepared offline reader',status:'PASS'});
} catch(e){results.push({name:'QA portal downloads',status:'FAIL',error:e.stack});}
finally {await b.close();fs.writeFileSync(out+'/results.json',JSON.stringify({base,results,errors,consoleErrors,loads},null,2));}
assert(results.every(r=>r.status==='PASS')&&!errors.length&&!consoleErrors.length&&!loads.length);console.log('PASS public chapter QA artifacts');
