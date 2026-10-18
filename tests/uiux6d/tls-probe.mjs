/** Diagnose service-worker trust on the synthetic loopback certificate only. */
import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
const root='qa-output/uiux6d/update';
const origin=fs.readdirSync(root).find(name=>name.startsWith('origin-'));
const server=spawn(process.execPath,['tests/uiux6b/serve-https.mjs',path.resolve(root,origin),path.resolve(root,'tls/local.key.pem'),path.resolve(root,'tls/local.cert.pem')],{stdio:['ignore','pipe','inherit']});
const results=[];
try {
 await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject)});
 for(const launchTrust of [false,true]){
  const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox',...(launchTrust?['--ignore-certificate-errors']:[])]});
  const context=await browser.newContext({ignoreHTTPSErrors:true}),page=await context.newPage(),failures=[],messages=[];
  page.on('requestfailed',r=>failures.push({url:r.url(),failure:r.failure()}));page.on('console',m=>{if(m.type()==='error')messages.push(m.text())});
  try {
   await page.goto('https://127.0.0.1:4459/#more?section=settings');
   await page.waitForFunction(()=>!!navigator.serviceWorker.controller||/nicht|fehl|Fehl|Fehler/.test(document.querySelector('#offline-state')?.textContent||''),undefined,{timeout:15000}).catch(()=>{});
   results.push({launchTrust,controller:await page.evaluate(()=>!!navigator.serviceWorker.controller),offlineState:await page.locator('#offline-state').innerText(),failures,messages});
  }finally{await browser.close()}
 }
}finally{server.kill()}
fs.writeFileSync('qa-output/uiux6d/tls-probe.json',JSON.stringify({results,scope:'Only isolated test Chromium/loopback self-signed QA certificate; no app/browser-user configuration changes'},null,2));console.log(JSON.stringify(results));
