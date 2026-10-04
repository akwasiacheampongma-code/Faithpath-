// Integration check for the selected icon, its offline availability and retained QA links.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {BUILD} from '../src/version.js';
import {KEYS} from '../src/store.js';

const base=process.env.FAITHPATH_QA_URL||'http://127.0.0.1:4233';
const out=process.env.FAITHPATH_QA_OUT||'qa-output/app-icon-2/local';
fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox',...(process.env.FAITHPATH_PROXY_SPKI?['--ignore-certificate-errors-spki-list='+process.env.FAITHPATH_PROXY_SPKI]:[])]});
const context=await browser.newContext({viewport:{width:390,height:844},acceptDownloads:true});
const p=await context.newPage(),results=[],pageErrors=[],consoleErrors=[],loadErrors=[];
p.on('pageerror',e=>pageErrors.push(e.message));
p.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text());});
p.on('response',r=>{if(r.status()>=400)loadErrors.push({url:r.url(),status:r.status()});});
try{
  await p.addInitScript(KEYS=>localStorage.setItem(KEYS.onboard,'done'),KEYS);
  await p.goto(base+'/#today',{waitUntil:'networkidle'});
  await p.locator('.olive-hero').waitFor();
  await p.waitForFunction(async build=>{const r=await navigator.serviceWorker.ready;if(!navigator.serviceWorker.controller)return false;return new Promise(resolve=>{const ch=new MessageChannel();ch.port1.onmessage=e=>resolve(e.data?.ready&&e.data?.build===build);r.active.postMessage({type:'STATUS'},[ch.port2]);setTimeout(()=>resolve(false),700);});},BUILD,{timeout:90000});
  const manifest=await p.evaluate(async()=>await(await fetch(document.querySelector('link[rel="manifest"]').href)).json());
  assert.deepEqual(manifest.icons.map(i=>i.src),['icons/olive-v2-192.png','icons/olive-v2-512.png']);
  assert.equal(manifest.id,'./');assert.equal(manifest.start_url,'./#today');
  const brand=p.locator('.wordmark img');
  assert.equal(await brand.count(),1,'The chosen icon must also be visible beside FaithPath inside the app');
  await brand.waitFor({state:'visible'});
  const brandSource=await brand.evaluate(img=>({src:new URL(img.currentSrc).pathname,loaded:img.complete&&img.naturalWidth>0}));
  assert.equal(brandSource.src,'/'+manifest.icons[0].src);assert(brandSource.loaded);
  for(const width of [320,390]){
    await p.setViewportSize({width,height:width===320?568:844});
    for(const scale of [1,2]){
      await p.evaluate(scale=>document.documentElement.style.fontSize=(scale*100)+'%',scale);
      const boxes=await p.evaluate(()=>{const brand=document.querySelector('.wordmark').getBoundingClientRect(),menu=document.querySelector('#menu-toggle').getBoundingClientRect(),image=document.querySelector('.wordmark img').getBoundingClientRect();return{overflow:document.documentElement.scrollWidth>innerWidth,collision:brand.right>menu.left,imageWidth:image.width,imageHeight:image.height};});
      assert(!boxes.overflow);assert(!boxes.collision);assert(boxes.imageWidth>0&&boxes.imageHeight>0);
    }
  }
  await p.evaluate(()=>document.documentElement.style.fontSize='');
  await p.setViewportSize({width:390,height:844});
  results.push({name:'Chosen icon is visible in the app header without collisions at 320/390 px and 200% text',status:'PASS'});
  for(const [name,size] of [['olive-v2-32.png',32],['olive-v2-180.png',180],['olive-v2-192.png',192],['olive-v2-512.png',512]]){
    const meta=await p.evaluate(async name=>{const response=await fetch('/icons/'+name);const data=await response.arrayBuffer();const bitmap=await createImageBitmap(new Blob([data],{type:'image/png'}));return{ok:response.ok,type:response.headers.get('content-type'),width:bitmap.width,height:bitmap.height,hash:[...new Uint8Array(await crypto.subtle.digest('SHA-256',data))].map(x=>x.toString(16).padStart(2,'0')).join('')};},name);
    assert(meta.ok);assert(meta.type.includes('image/png'));assert.equal(meta.width,size);assert.equal(meta.height,size);
    assert.equal(meta.hash,crypto.createHash('sha256').update(fs.readFileSync('icons/'+name)).digest('hex'));
  }
  assert((await p.locator('link[rel="apple-touch-icon"]').getAttribute('href')).endsWith('olive-v2-180.png'));
  results.push({name:'Selected PWA, favicon and Apple icon decode at their declared sizes and match the deployed files',status:'PASS'});
  await p.screenshot({path:path.join(out,'today-390.png')});
  await p.locator('#menu-toggle').click();await p.locator('#main-menu').waitFor({state:'visible'});
  await p.keyboard.press('Escape');await p.locator('#main-menu').waitFor({state:'hidden'});
  for(const route of ['bible','journal','paths','more']){
    await p.evaluate(route=>location.hash=route,route);await p.locator('#main h1').waitFor();
    assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  }
  results.push({name:'Today, Bible, Journal, Path, More and menu/Escape remain usable',status:'PASS'});
  await context.setOffline(true);await p.reload();await p.locator('#main h1').waitFor();
  const offline=await p.evaluate(async()=>{const m=await(await fetch('/manifest.webmanifest')).json();const r=await fetch('/icons/olive-v2-512.png');const image=await createImageBitmap(await r.blob());return{src:m.icons[1].src,ok:r.ok,width:image.width};});
  assert.equal(offline.src,'icons/olive-v2-512.png');assert(offline.ok);assert.equal(offline.width,512);
  await context.setOffline(false);
  results.push({name:'Offline reload retains the new manifest and icon',status:'PASS'});
  for(const file of ['','premium-final-error-report.html','premium-final-change-report.html','screenshots.html']){
    const response=await p.goto(base+'/qa/premium/'+file,{waitUntil:'networkidle'});
    assert(response.ok());assert(!response.fromServiceWorker());await p.locator('h1').first().waitFor();
  }
  await p.goto(base+'/qa/premium/');
  const pending=p.waitForEvent('download');await p.locator('a[href="FaithPath-PREMIUM-QA.zip"]').click();
  const target=path.join(out,'FaithPath-PREMIUM-QA.zip');await(await pending).saveAs(target);
  const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  assert.equal(hash(target),hash('qa-output/premium-final/build/qa/premium/FaithPath-PREMIUM-QA.zip'));
  results.push({name:'Existing QA portal, reports, screenshots and real ZIP download remain accessible',status:'PASS'});
  console.log('PASS icon references, PNG sizes/hashes, offline, navigation and retained QA downloads');
}catch(error){results.push({name:'Icon integration',status:'FAIL',error:error.stack});console.log(error.stack);}
finally{await browser.close();fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({base,build:BUILD,results,pageErrors,consoleErrors,loadErrors},null,2));}
if(results.some(r=>r.status==='FAIL')||pageErrors.length||consoleErrors.length||loadErrors.length)process.exitCode=1;
