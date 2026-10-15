import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {chromium} from 'playwright';
import {empty,KEYS} from '../src/store.js';
import {BUILD} from '../src/version.js';

const previous=process.env.FAITHPATH_PREVIOUS_ROOT||'qa-output/production-reproduction-a';
const candidate=process.env.FAITHPATH_CANDIDATE_ROOT||'qa-output/stabilization';
assert(fs.existsSync(previous+'/release-integrity.json'),'First reproduce the backup commit, then keep its output directory');
const oldManifest=JSON.parse(fs.readFileSync(previous+'/release-integrity.json'));
assert.equal(oldManifest.build,'FP4-20261006-G-POLISH1');
const out='qa-output/stabilization-update',origin=path.resolve(out,'origin'),results=[];
fs.mkdirSync(out,{recursive:true});
// Publish the worker last and atomically; never expose a transient 404 during copying.
function deploy(dir){
  fs.mkdirSync(origin,{recursive:true});
  fs.cpSync(dir,origin,{recursive:true,filter:file=>path.relative(dir,file)!=='sw.js'});
  fs.copyFileSync(path.join(dir,'sw.js'),path.join(origin,'sw.next'));
  fs.renameSync(path.join(origin,'sw.next'),path.join(origin,'sw.js'));
}
fs.rmSync(origin,{recursive:true,force:true});
deploy(previous);
const server=spawn(process.execPath,['scripts/serve.mjs',origin],{stdio:['ignore','pipe','inherit'],env:{...process.env,PORT:'4288'}});
await once(server.stdout,'data');
const browser=await chromium.launch({executablePath:process.env.FAITHPATH_CHROMIUM||'/usr/bin/chromium',args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage();
page.setDefaultTimeout(20000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
const d=empty();d.version=3;d.settings={theme:'night',custom:'preserved'};
d.journal=[{id:'j',text:'Bestehende persönliche Geschichte',date:'2026-09-01',pathIds:['p']}];
d.paths=[{id:'p',title:'Geduld',started:'2026-09-01',steps:[{id:'s',text:'Zuhören',done:false}],links:[{id:'l',journalId:'j',kind:'reflection',date:'2026-09-01'}],milestones:[],reviews:[]}];
d.highlights=[{id:'h',book:'JHN',chapter:3,from:1,to:1,translation:'otb',at:'2026-09-01'}];
d.quiz={1000:{done:'2026-09-01'}};d.events=[{id:'e',kind:'chapter-explored',at:'2026-09-01',ref:{book:'JHN',chapter:3}}];
const draft=JSON.stringify({type:'entry',args:{id:'j'},values:{text:'Ungespeichert aus POLISH1',kind:'Gedanken',pathId:'p'},saved:'2026-10-15'});
await context.addInitScript(({d,draft,KEYS})=>{if(!localStorage.getItem('update-seeded')){localStorage.setItem(KEYS.main,JSON.stringify(d));localStorage.setItem(KEYS.draft,draft);localStorage.setItem(KEYS.onboard,'done');localStorage.setItem('update-seeded','1');}},{d,draft,KEYS});
const snapshot=()=>page.evaluate(KEYS=>({main:localStorage.getItem(KEYS.main),draft:localStorage.getItem(KEYS.draft),migration:localStorage.getItem(KEYS.migration)}),KEYS);
async function ready(build){
  await page.locator('.build-id').filter({hasText:build}).waitFor({timeout:90000});
  await page.locator('#offline-state').filter({hasText:'Beide Bibeln und die App sind für dieses Gerät offline bereit.'}).waitFor({timeout:90000});
  assert((await page.locator('.build-id').innerText()).includes(build));
}

try{
  await page.goto('http://127.0.0.1:4288/#more?section=settings');await ready(oldManifest.build);
  const before=await snapshot();assert.equal(JSON.parse(before.main).version,5);assert(before.migration);assert.equal(before.draft,draft);
  results.push('POLISH1 installed with actual V3 migration and original draft');
  deploy(candidate);
  await page.reload();
  await page.getByRole('button',{name:'Jetzt aktualisieren',exact:true}).waitFor({timeout:90000});assert.deepEqual(await snapshot(),before);
  await page.getByRole('button',{name:'Jetzt aktualisieren',exact:true}).click();await ready(BUILD);assert.deepEqual(await snapshot(),before);
  results.push('POLISH1 → STABLE1 waits for explicit activation and preserves main/draft/migration bytes');
  await context.setOffline(true);await page.reload();await ready(BUILD);assert.deepEqual(await snapshot(),before);
  await page.goto('http://127.0.0.1:4288/#today');await page.getByRole('button',{name:'Entwurf fortsetzen',exact:true}).click();assert.equal(await page.getByLabel('Dein Gedanke',{exact:true}).inputValue(),'Ungespeichert aus POLISH1');
  await page.locator('#editor-form button[type=submit]').click();await page.waitForFunction(k=>JSON.parse(localStorage.getItem(k)).journal[0].text==='Ungespeichert aus POLISH1',KEYS.main);
  const after=await snapshot();assert.equal(after.draft,null);assert.deepEqual(JSON.parse(after.main).highlights,JSON.parse(before.main).highlights);assert.deepEqual(JSON.parse(after.main).quiz,JSON.parse(before.main).quiz);
  results.push('Offline reload, resume and save preserve highlight/quiz data and consume only the owned draft');
  assert.deepEqual(errors,[]);console.log('PASS',results.join('\nPASS '));
}finally{await context.close();await browser.close();server.kill();fs.writeFileSync(out+'/results.json',JSON.stringify({previousBuild:oldManifest.build,candidateBuild:BUILD,results,errors},null,2));}
