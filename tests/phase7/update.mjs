/** Real old -> failed install -> complete new worker on one isolated loopback origin. */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {KEYS} from '../../src/store.js';
import {phase3Fixture} from '../phase3-fixtures.mjs';
const previous=process.env.FAITHPATH_PREVIOUS_ROOT||'qa-output/uiux6d-final/candidate';
const candidate=process.env.FAITHPATH_CANDIDATE_ROOT||'qa-output/phase7/candidate';
const out=process.env.QA_OUT||'qa-output/phase7/update';fs.mkdirSync(out,{recursive:true});
const old=JSON.parse(fs.readFileSync(previous+'/release-integrity.json')),next=JSON.parse(fs.readFileSync(candidate+'/release-integrity.json'));
assert.equal(old.build,'FP4-20261018-G-STABLE1-UIUX6D-TREEFINAL');
assert.equal(old.build_hash,'5390ec0a00ba171bc0f997a5fd5c8ba11b7e58b508a3085c488c21d95add84aa');
assert.equal(next.content_hash,old.content_hash);
let root=previous,fail=false;
const types={'.js':'text/javascript','.html':'text/html','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.webp':'image/webp','.svg':'image/svg+xml','.png':'image/png','.ttf':'font/ttf'};
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost'),file=path.resolve(root,'.'+(url.pathname==='/'?'/index.html':url.pathname));
 if(!file.startsWith(path.resolve(root)+'/')||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end('missing test asset');return;}
 res.writeHead(200,{'content-type':types[path.extname(file)]||'text/plain','cache-control':'no-store'});
 let bytes=fs.readFileSync(file);
 if(fail&&url.pathname==='/sw.js')bytes=bytes.toString().replace(/const BUILD = "[^"]+";/,'const BUILD = "FP4-20261018-G-PHASE7-FAILED-INSTALL";').replace('const ASSETS = [','const ASSETS = ["./phase7-deliberately-missing.js",');
 res.end(bytes);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
const results=[],errors=[];let browser;
try{
 browser=await chromium.launch({...(process.env.FAITHPATH_CHROMIUM?{executablePath:process.env.FAITHPATH_CHROMIUM}:{}),args:['--no-sandbox']});
 const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 const data=phase3Fixture('tree-6','night');data.paths[0].archived=true;
 const draft=JSON.stringify({type:'entry',args:{id:'thought-new'},values:{text:'Synthetischer offener Phase7-Entwurf',kind:'Gedanken',pathId:'personal-path'},saved:'2026-10-18'});
 const safety=JSON.stringify({raw:JSON.stringify(data),guidedPlansRaw:'{}',saved:'2026-10-17'});
 await context.addInitScript(({KEYS,data,draft,safety})=>{if(!sessionStorage.getItem('phase7-seeded')){localStorage.setItem(KEYS.main,JSON.stringify(data));localStorage.setItem(KEYS.draft,draft);localStorage.setItem(KEYS.restore,safety);localStorage.setItem(KEYS.onboard,'done');sessionStorage.setItem('phase7-seeded','yes')}},{KEYS,data,draft,safety});
 const snapshot=()=>page.evaluate(KEYS=>Object.fromEntries(Object.entries(KEYS).map(([name,key])=>[name,localStorage.getItem(key)])),KEYS);
 async function ready(build){await page.goto(base+'/#more?section=settings');await page.locator('.build-id').filter({hasText:build}).waitFor({timeout:90000});await page.locator('#offline-state').filter({hasText:'Beide Bibeln und die App sind für dieses Gerät offline bereit.'}).waitFor({timeout:90000});}
 await ready(old.build);const before=await snapshot();
 await page.evaluate(async()=>{const cache=await caches.open('another-app:keep');await cache.put('/foreign-proof',new Response('keep'))});
 results.push('Exact immutable TREEFINAL installed, all seven storage contracts snapshotted, foreign cache created');
 root=candidate;fail=true;
 const rejected=await page.evaluate(async()=>{
  const reg=await navigator.serviceWorker.getRegistration();
  const result=new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('No failed worker install observed')),90000);reg.addEventListener('updatefound',()=>{const worker=reg.installing;worker.addEventListener('statechange',()=>{if(worker.state==='redundant'){clearTimeout(timer);resolve(true)}})},{once:true})});
  await reg.update();return result;
 });assert(rejected);
 await context.setOffline(true);await page.reload();await ready(old.build);assert.deepEqual(await snapshot(),before);
 assert(await page.evaluate(async()=>{const names=await caches.keys();return names.includes('another-app:keep')&&!names.some(n=>n.includes('FAILED-INSTALL'))}));
 results.push('Missing mandatory update asset rejects install, deletes partial cache and retains old complete offline app and every storage byte');
 await context.setOffline(false);fail=false;
 await page.evaluate(async()=>{const reg=await navigator.serviceWorker.getRegistration();await reg.update()});
 await page.getByRole('button',{name:'Jetzt aktualisieren',exact:true}).waitFor({timeout:90000});assert.deepEqual(await snapshot(),before);
 await page.getByRole('button',{name:'Jetzt aktualisieren',exact:true}).click();await ready(next.build);assert.deepEqual(await snapshot(),before);
 results.push('Successful new install waits for explicit activation; controller change reloads into exact new build without data changes');
 await context.setOffline(true);await page.goto(base+'/#tree');await page.reload();await page.locator('.tree-branch-scene img').evaluate(img=>img.decode());assert.deepEqual(await snapshot(),before);await page.screenshot({path:out+'/tree-after-update-offline.png'});
 for(const translation of ['otb','l1912']){await page.goto(base+'/#read/PSA/52/'+translation);await page.locator('.verse[data-v="8"]').waitFor();assert.match(await page.locator('.verse[data-v="8"]').innerText(),/Ölbaum/)}
 const after=await snapshot(),parsed=JSON.parse(after.main),original=JSON.parse(before.main);
 for(const key of Object.keys(original).filter(k=>!['reading','events'].includes(k)))assert.deepEqual(parsed[key],original[key]);
 for(const key of Object.keys(before).filter(k=>k!=='main'))assert.equal(after[key],before[key]);
 assert(await page.evaluate(async()=>!!await(await caches.open('another-app:keep')).match('/foreign-proof')));
 results.push('Both canonical Bible translations, tree image and new ESM modules work offline; only intentional reader history changes');
 await context.close();assert.deepEqual(errors,[]);
}catch(error){errors.push(error.stack)}finally{await browser?.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve))}
fs.writeFileSync(out+'/results.json',JSON.stringify({baseline:old,candidate:{build:next.build,commit:next.source_commit,hash:next.build_hash},results,errors,physicalIOS:'OFFEN',transport:'Actual Chromium service-worker install on a dedicated loopback secure-context origin; synthetic data only'},null,2));
console.log(JSON.stringify({checks:results.length,errors}));process.exitCode=errors.length?1:0;
