// Actual pre-import release -> final master release, at one controlled origin.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync,spawn} from 'node:child_process';
import {once} from 'node:events';
import {chromium} from 'playwright';
import {KEYS} from '../src/store.js';
import {BUILD} from '../src/version.js';
import {coreFixture} from './core-depth-fixture.mjs';

const out=path.resolve('qa-output/nt-quiz-final'),source=path.join(out,'pre-import-source'),oldBuild=path.join(out,'pre-import-build'),origin=path.join(out,'update-origin');
const baseline='f02106e9a15877ec8acb92f444bf62fcbc51c36e';
const oldVersion='FP4-20261005-G-CHAPTER1';
for(const directory of [source,oldBuild,origin]){fs.rmSync(directory,{recursive:true,force:true});fs.mkdirSync(directory,{recursive:true});}
execFileSync('tar',['-x','-C',source],{input:execFileSync('git',['archive',baseline],{maxBuffer:200e6})});
execFileSync(process.execPath,['scripts/build.mjs'],{cwd:source,env:{...process.env,FAITHPATH_OUT:oldBuild},maxBuffer:1e6});
fs.cpSync(oldBuild,origin,{recursive:true});
const server=spawn(process.execPath,['scripts/serve.mjs',origin],{env:{...process.env,PORT:'4265'},stdio:['ignore','pipe','inherit']});
await once(server.stdout,'data');
const browser=await chromium.launch({executablePath:process.env.FAITHPATH_CHROMIUM||'/usr/bin/chromium',args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
const p=await context.newPage();p.setDefaultTimeout(20000);
const errors=[],consoleErrors=[],results=[];
p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text());});
const beforeUnits=JSON.parse(fs.readFileSync('reports/nt-quiz-final/pre-import-stories.json'));
const units=JSON.parse(fs.readFileSync('data/stories.json'));
const first=units.find(u=>u.questions.some(q=>q.faithpath_id==='FP-0261'));
const oldFirst=beforeUnits.find(u=>u.id===first.id);
const seed=coreFixture();seed.quiz={'10000':{done:'2026-09-01',legacy:'keep'},'1':{done:'2026-09-01'}};seed.settings={readerText:'large',localPreference:true};
const draft={type:'entry',args:{},values:{text:'Offener Entwurf bleibt beim NT-Import erhalten.'}};
async function swStatus(){return p.evaluate(async()=>{
  const r=await navigator.serviceWorker.getRegistration();if(!r?.active)return null;
  return new Promise(resolve=>{const ch=new MessageChannel();ch.port1.onmessage=e=>resolve(e.data);r.active.postMessage({type:'STATUS'},[ch.port2]);setTimeout(()=>resolve(null),1000);});
});}
async function route(hash){await p.goto('http://127.0.0.1:4265/#'+hash,{waitUntil:'networkidle'});await p.locator('#main h1').waitFor();}
try{
  await p.addInitScript(({KEYS,seed})=>{if(!localStorage.getItem(KEYS.main)){localStorage.setItem(KEYS.main,JSON.stringify(seed));localStorage.setItem(KEYS.onboard,'done');}},{KEYS,seed});
  await route('more?section=settings');await p.locator('#offline-state').filter({hasText:'Beide Bibeln und die App sind für dieses Gerät offline bereit.'}).waitFor({timeout:90000});
  assert.equal((await swStatus()).build,oldVersion);
  await route('quiz/'+first.id);assert.equal(await p.locator('.quiz-title').innerText(),oldFirst.questions[0].q);
  assert.notEqual(oldFirst.questions[0].q,first.questions[0].q);
  await p.evaluate(({KEYS,draft})=>localStorage.setItem(KEYS.draft,JSON.stringify(draft)),{KEYS,draft});
  const prior=await p.evaluate(KEYS=>localStorage.getItem(KEYS.main),KEYS);
  fs.rmSync(origin,{recursive:true,force:true});fs.cpSync('dist',origin,{recursive:true});
  await p.evaluate(async()=>{const registration=await navigator.serviceWorker.getRegistration();await registration.update();});
  await p.getByRole('button',{name:'Jetzt aktualisieren',exact:true}).waitFor({timeout:90000});
  assert.equal((await swStatus()).build,oldVersion);
  assert.equal(await p.locator('.quiz-title').innerText(),oldFirst.questions[0].q,'waiting release must not mix cached data');
  await Promise.all([p.waitForEvent('load'),p.getByRole('button',{name:'Jetzt aktualisieren',exact:true}).tap()]);
  await p.locator('.quiz-title').waitFor();assert.equal(await p.locator('.quiz-title').innerText(),first.questions[0].q);
  const status=await swStatus();assert.equal(status.build,BUILD);assert(status.ready);
  assert.equal(await p.evaluate(KEYS=>localStorage.getItem(KEYS.main),KEYS),prior,'personal state must be byte-identical');
  assert.deepEqual(await p.evaluate(KEYS=>JSON.parse(localStorage.getItem(KEYS.draft)),KEYS),draft);
  const cached=await p.evaluate(async BUILD=>{const response=await fetch('./releases/'+BUILD+'/data/stories.json');return response.json();},BUILD);
  assert.deepEqual(cached,units,'active cache must contain all exact final questions');
  await context.setOffline(true);
  const last=units.find(u=>u.questions.some(q=>q.faithpath_id==='FP-1560'));
  await route('quiz/'+last.id);await p.reload({waitUntil:'networkidle'});
  for(const q of last.questions){assert.equal(await p.locator('.quiz-title').innerText(),q.q);await p.locator(`.answer[data-answer="${q.c}"]`).tap();assert.equal(await p.locator('.explanation p').innerText(),q.x);await p.locator('[data-action="next-question"]').tap();}
  await p.locator('.chapter-quiz-complete').waitFor();
  await route('chapter-quizzes/MAT');assert((await p.locator('[data-chapter-unit="10000"]').innerText()).includes('angesehen'));
  results.push({name:'Actual CHAPTER1 → NTFINAL1: explicit activation, exact new offline data, personal state and draft preserved',status:'PASS'});
}catch(e){results.push({name:'Actual pre-import cache update',status:'FAIL',error:e.stack});}
finally{await browser.close();server.kill();fs.writeFileSync(path.join(out,'update-results.json'),JSON.stringify({baseline,oldBuild:oldVersion,newBuild:BUILD,results,errors,consoleErrors},null,2));}
console.log(JSON.stringify({results,errors,consoleErrors}));
if(errors.length||consoleErrors.length||results.some(r=>r.status==='FAIL'))process.exitCode=1;
