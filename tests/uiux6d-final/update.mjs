/** Actual TREEGUIDE2 -> TREEFINAL worker update, isolated loopback HTTPS only. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawn,execFileSync} from 'node:child_process';
import {chromium} from 'playwright';
import {KEYS} from '../../src/store.js';
import {developmentCount,treeLevel} from '../../src/domain.js';
import {TREE_STAGE_MEANINGS} from '../../src/tree-stage-guide.js';
import {phase3Fixture} from '../phase3-fixtures.mjs';

const previous=process.env.FAITHPATH_PREVIOUS_ROOT||'qa-output/uiux6d/candidate';
const candidate=process.env.FAITHPATH_CANDIDATE_ROOT||'qa-output/uiux6d-final/candidate';
const out=process.env.QA_OUT||'qa-output/uiux6d-final/update';
const old=JSON.parse(fs.readFileSync(previous+'/release-integrity.json'));
const next=JSON.parse(fs.readFileSync(candidate+'/release-integrity.json'));
assert.equal(old.build,'FP4-20261018-G-STABLE1-UIUX6D-TREEGUIDE2');
assert.equal(old.build_hash,'150c015ebb36ea50b1e4c3379eca583f3cf5e73ca963de56ea6f0910aebf5598');
assert.equal(next.content_hash,old.content_hash);
fs.mkdirSync(out,{recursive:true});
const origin=fs.mkdtempSync(path.resolve(out,'origin-')),tls=path.resolve(out,'tls');fs.mkdirSync(tls,{recursive:true});
const key=tls+'/local.key.pem',cert=tls+'/local.cert.pem';
execFileSync('openssl',['req','-x509','-newkey','rsa:2048','-nodes','-keyout',key,'-out',cert,'-days','1','-subj','/CN=localhost','-addext','subjectAltName=IP:127.0.0.1'],{stdio:'ignore'});
function installFiles(root){
 fs.cpSync(root,origin,{recursive:true,filter:file=>path.relative(root,file)!=='sw.js'});
 fs.copyFileSync(root+'/sw.js',origin+'/sw.next');fs.renameSync(origin+'/sw.next',origin+'/sw.js');
}
installFiles(previous);
const server=spawn(process.execPath,['tests/uiux6b/serve-https.mjs',origin,key,cert],{stdio:['ignore','pipe','inherit']});
let browser;const results=[],errors=[];
try {
 await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject);server.once('exit',code=>reject(new Error('HTTPS QA server exited '+code)))});
 // Chromium's worker certificate check does not inherit the page context's
 // ignoreHTTPSErrors. Trust this self-signed loopback QA certificate here only.
 browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--ignore-certificate-errors']});
 const context=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:390,height:844}}),page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.message));
 const data=phase3Fixture('tree-6','night');data.paths[0].archived=true;
 const draft=JSON.stringify({type:'entry',args:{id:'thought-new'},values:{text:'Mein synthetischer offener Entwurf',kind:'Gedanken',pathId:'personal-path'},saved:'2026-10-18'});
 const safety=JSON.stringify({raw:JSON.stringify(data),guidedPlansRaw:'{}',saved:'2026-10-17'});
 await context.addInitScript(({KEYS,data,draft,safety})=>{
  if(!localStorage.getItem('tree-update-seeded')){localStorage.setItem(KEYS.main,JSON.stringify(data));localStorage.setItem(KEYS.draft,draft);localStorage.setItem(KEYS.restore,safety);localStorage.setItem(KEYS.onboard,'done');localStorage.setItem('tree-update-seeded','yes')}
 },{KEYS,data,draft,safety});
 const snapshot=()=>page.evaluate(KEYS=>Object.fromEntries(Object.entries(KEYS).map(([name,key])=>[name,localStorage.getItem(key)])),KEYS);
 async function ready(build){
  await page.locator('.build-id').filter({hasText:build}).waitFor({timeout:90000});
  await page.locator('#offline-state').filter({hasText:'Beide Bibeln und die App sind für dieses Gerät offline bereit.'}).waitFor({timeout:90000});
 }
 await page.goto('https://127.0.0.1:4459/#more?section=settings');await ready(old.build);const before=await snapshot();
 await page.goto('https://127.0.0.1:4459/#tree');assert.equal(await page.locator('.tree-stage-guide').count(),1);assert.equal(await page.locator('.tree-branch-scene img').getAttribute('src'),'trees/tree-stage-7.webp');
 results.push('Exact TREEGUIDE2 installed with archived path, ten milestones, original journal/review, draft and existing import safety copy');
 installFiles(candidate);await page.goto('https://127.0.0.1:4459/#more?section=settings');await page.reload();
 await page.getByRole('button',{name:'Jetzt aktualisieren',exact:true}).waitFor({timeout:90000});assert.deepEqual(await snapshot(),before);
 await page.getByRole('button',{name:'Jetzt aktualisieren',exact:true}).click();await ready(next.build);assert.deepEqual(await snapshot(),before);
 results.push('Explicit worker activation preserves every main/draft/safety/onboarding/migration/guided-plan storage byte');
 await context.setOffline(true);await page.goto('https://127.0.0.1:4459/#tree');await page.reload();
 assert.equal(await page.locator('.tree-stage-current-meaning').innerText(),TREE_STAGE_MEANINGS[6].meaning);
 const fixed=await page.locator('.tree-stage-current-meaning').evaluate(el=>({size:parseFloat(getComputedStyle(el).fontSize),bottom:getComputedStyle(el).marginBottom}));assert.equal(fixed.size,15.2);assert.equal(fixed.bottom,'10px');assert((await page.locator('#main h1').textContent()).includes('Frucht\u00adtragender'));assert.equal(await page.locator('#main h1').evaluate(el=>getComputedStyle(el).hyphens),'manual');
 await page.locator('.tree-stage-details > summary').click();assert.equal(await page.locator('.tree-stage-card').count(),7);assert.equal(await page.locator('.tree-stage-card[aria-current=step] strong').innerText(),'Fruchttragender Olivenbaum');
 await page.locator('.tree-stage-why > summary').click();assert.match(await page.locator('.tree-stage-why').innerText(),/Gottes Güte/);assert.match(await page.locator('.tree-stage-why').innerText(),/Frucht des Geistes/);
 await page.locator('.tree-branch-scene img').evaluate(img=>img.decode());assert.deepEqual(await snapshot(),before);await page.screenshot({path:out+'/updated-tree-offline.png'});
 results.push('Fixed styles/title, all seven meanings, biblical context, original image and archived path render offline after real update without state writes');
 const asset='./releases/'+next.build+'/src/tree-stage-guide.js';assert.equal(await page.evaluate(async url=>(await fetch(url)).status,asset),200);
 assert(await page.evaluate(()=>document.fonts.check('16px DM')&&document.fonts.check('20px Newsreader')));
 results.push('New versioned guide module and local fonts are served by the active worker while offline');
 for(const tr of ['otb','l1912']){
  await page.goto('https://127.0.0.1:4459/#read/PSA/52/'+tr);await page.locator('.verse[data-v="8"]').waitFor();assert.match(await page.locator('.verse[data-v="8"]').innerText(),/Ölbaum/);
 }
 const after=await snapshot(),parsed=JSON.parse(after.main),oldData=JSON.parse(before.main);
 assert.equal(developmentCount(parsed),10);assert.equal(treeLevel(parsed),6);
 for(const key of Object.keys(oldData).filter(k=>!['reading','events'].includes(k)))assert.deepEqual(parsed[key],oldData[key]);
 for(const [key,value]of Object.entries(before))if(key!=='main')assert.equal(after[key],value);
 results.push('Both unchanged local Psalm52 texts read offline; intentional reading history changes neither tree count nor personal/draft/backup records');
 assert.deepEqual(errors,[]);
}catch(error){errors.push(error.stack)}finally{await browser?.close();server.kill()}
fs.writeFileSync(out+'/results.json',JSON.stringify({previousBuild:old.build,previousHash:old.build_hash,candidateBuild:next.build,candidateHash:next.build_hash,transport:'isolated loopback HTTPS only; ephemeral Chromium accepts the self-signed test certificate; no shared profile',results,errors,physicalIOS:'OFFEN',noDeploy:true},null,2));
console.log(JSON.stringify({checks:results.length,errors}));process.exitCode=errors.length?1:0;
