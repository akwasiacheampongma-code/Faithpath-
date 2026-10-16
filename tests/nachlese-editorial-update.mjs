import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {chromium} from 'playwright';
import {empty,KEYS} from '../src/store.js';
import {BUILD} from '../src/version.js';

const previous=process.env.FAITHPATH_PREVIOUS_ROOT||'qa-output/nachlese-editorial/previous-build';
const candidate=process.env.FAITHPATH_CANDIDATE_ROOT||'qa-output/nachlese-editorial/build-a';
assert(fs.existsSync(previous+'/release-integrity.json'),'First build NMC1 baseline commit d332225 and keep its output directory');
const oldManifest=JSON.parse(fs.readFileSync(previous+'/release-integrity.json'));
assert.equal(oldManifest.build,'FP4-20261016-G-STABLE1-NMC1');
assert.equal(oldManifest.build_hash,'9dc4a8931b7ef1400fd0f6a8a950658e6e121b90797a5a732afe43536dc3bfde');
const out='qa-output/nachlese-editorial/update',origin=path.resolve(out,'origin'),results=[];
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
const server=spawn(process.execPath,['scripts/serve.mjs',origin],{stdio:['ignore','pipe','inherit'],env:{...process.env,PORT:'4344'}});
await once(server.stdout,'data');
const browser=await chromium.launch({executablePath:process.env.FAITHPATH_CHROMIUM||'/usr/bin/chromium',args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage();
page.setDefaultTimeout(20000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
const d=empty();d.version=3;d.settings={theme:'night',custom:'preserved'};
d.journal=[{id:'j',text:'Bestehende persönliche Geschichte',date:'2026-09-01',pathIds:['p']}];
d.paths=[{id:'p',title:'Geduld',started:'2026-09-01',steps:[{id:'s',text:'Zuhören',done:false}],links:[{id:'l',journalId:'j',kind:'reflection',date:'2026-09-01'}],milestones:[],reviews:[]}];
d.journal[0].sourceQuestionId='N-0388';d.journal[0].sourceStoryId='NS-0078';
d.highlights=[{id:'h',book:'JHN',chapter:3,from:1,to:1,translation:'otb',at:'2026-09-01'},{id:'segmented',book:'JHN',chapter:10,from:11,to:11,translation:'l1912',at:'2026-09-01'}];
const finalUnits=JSON.parse(fs.readFileSync('data/stories.json'));
const finalNachlese=JSON.parse(fs.readFileSync('data/nachlese-questions.json'));
const chapterUnits=finalUnits.filter(u=>u.kind==='chapter-quiz');
d.quiz=Object.fromEntries(chapterUnits.map(u=>[u.id,{done:'2026-09-01',legacy:'preserve-'+u.id}]));d.quiz[1]={done:'2026-09-01',legacy:'story'};d.events=[{id:'e',kind:'chapter-explored',at:'2026-09-01',ref:{book:'JHN',chapter:3}}];
const draft=JSON.stringify({type:'entry',args:{id:'j'},values:{text:'Ungespeichert aus STABLE1',kind:'Gedanken',pathId:'p'},saved:'2026-10-15'});
await context.addInitScript(({d,draft,KEYS})=>{if(!localStorage.getItem('update-seeded')){localStorage.setItem(KEYS.main,JSON.stringify(d));localStorage.setItem(KEYS.draft,draft);localStorage.setItem(KEYS.onboard,'done');localStorage.setItem('update-seeded','1');}},{d,draft,KEYS});
const snapshot=()=>page.evaluate(KEYS=>({main:localStorage.getItem(KEYS.main),draft:localStorage.getItem(KEYS.draft),migration:localStorage.getItem(KEYS.migration)}),KEYS);
async function ready(build){
  await page.locator('.build-id').filter({hasText:build}).waitFor({timeout:90000});
  await page.locator('#offline-state').filter({hasText:'Beide Bibeln und die App sind für dieses Gerät offline bereit.'}).waitFor({timeout:90000});
  assert((await page.locator('.build-id').innerText()).includes(build));
}

try{
  await page.goto('http://127.0.0.1:4344/#more?section=settings');await ready(oldManifest.build);
  const oldStories=await page.evaluate(async build=>(await fetch('./releases/'+build+'/data/stories.json')).json(),oldManifest.build);
  assert.deepEqual(oldStories,finalUnits);
  const oldNachlese=await page.evaluate(async build=>(await fetch('./releases/'+build+'/data/nachlese-questions.json')).json(),oldManifest.build);
  assert.deepEqual(oldNachlese,JSON.parse(fs.readFileSync('reports/nachlese-editorial-56/baseline-mc-questions.json')));
  await page.goto('http://127.0.0.1:4344/#question/N-0388');
  assert.equal(await page.locator('.source-answer summary').count(),1);assert.equal(await page.locator('.answers button').count(),0);
  const before=await snapshot();assert.equal(JSON.parse(before.main).version,5);assert(before.migration);assert.equal(before.draft,draft);
  assert.equal(Object.keys(JSON.parse(before.main).quiz).length,261);
  results.push('NMC1 installed with 260 existing chapter completion keys, story progress, V3 migration and pending draft');
  deploy(candidate);
  await page.goto('http://127.0.0.1:4344/#more?section=settings');
  // Changing only the hash is SPA navigation; it does not rerun registration.
  // A real document reload exercises the app's existing browser update check.
  const previousDocument=await page.evaluate(()=>performance.timeOrigin);
  await page.reload();assert((await page.evaluate(()=>performance.timeOrigin))>previousDocument);
  await page.getByRole('button',{name:'Jetzt aktualisieren',exact:true}).waitFor({timeout:90000});assert.deepEqual(await snapshot(),before);
  await page.getByRole('button',{name:'Jetzt aktualisieren',exact:true}).click();await ready(BUILD);assert.deepEqual(await snapshot(),before);
  assert.deepEqual(await page.evaluate(async build=>(await fetch('./releases/'+build+'/data/stories.json')).json(),BUILD),finalUnits);
  assert.deepEqual(await page.evaluate(async build=>(await fetch('./releases/'+build+'/data/nachlese-questions.json')).json(),BUILD),finalNachlese);
  results.push('NMC1 → editorial NMC2 candidate waits for explicit activation; all personal storage bytes, all 2314 Nachlese entries and all 1300 NT questions verified');
  await context.setOffline(true);await page.reload();await ready(BUILD);assert.deepEqual(await snapshot(),before);
  assert.deepEqual(await page.evaluate(async build=>(await fetch('./releases/'+build+'/data/stories.json')).json(),BUILD),finalUnits,'All final questions must match the master even without a network connection');
  assert.deepEqual(await page.evaluate(async build=>(await fetch('./releases/'+build+'/data/nachlese-questions.json')).json(),BUILD),finalNachlese);
  assert(finalNachlese.questions.every(q=>q.a?.length===4));
  const first=finalNachlese.questions.find(q=>q.id==='N-0388');
  await page.goto('http://127.0.0.1:4344/#question/'+first.id);
  assert.equal(await page.locator('.answers button').count(),4);await page.locator(`[data-answer="${first.c}"]`).click();
  assert.equal(await page.locator('.explanation p').innerText(),first.x||first.answer);assert.deepEqual(await snapshot(),before);
  results.push('All new MC data and a real correct answer work offline after an actual service-worker update');
  for(const [translation,verse,word]of [['otb',10,'Fülle'],['l1912',11,'Genüge']]){
    await page.goto(`http://127.0.0.1:4344/#read/JHN/10/${translation}?from=10&to=11`);
    const v=page.locator(`.verse[data-v="${verse}"]`);await v.waitFor();assert((await v.innerText()).includes(word));
    if(translation==='l1912')assert((await v.getAttribute('class')).includes('marked'));
  }
  const afterReading=await snapshot(),beforeData=JSON.parse(before.main),readData=JSON.parse(afterReading.main);
  assert.equal(afterReading.draft,before.draft);assert.equal(afterReading.migration,before.migration);
  // Opening the reader intentionally remembers the location and adds a reading event.
  for(const key of Object.keys(beforeData).filter(k=>!['reading','events'].includes(k)))assert.deepEqual(readData[key],beforeData[key]);
  for(const event of beforeData.events)assert.deepEqual(readData.events.find(e=>e.id===event.id),event);
  results.push('Both unchanged John10 Bible segmentations work offline and the old Luther verse11 highlight remains attached');
  await page.goto('http://127.0.0.1:4344/#today');await page.getByRole('button',{name:'Entwurf fortsetzen',exact:true}).click();assert.equal(await page.getByLabel('Dein Gedanke',{exact:true}).inputValue(),'Ungespeichert aus STABLE1');
  await page.locator('#editor-form button[type=submit]').click();await page.waitForFunction(k=>JSON.parse(localStorage.getItem(k)).journal[0].text==='Ungespeichert aus STABLE1',KEYS.main);
  const after=await snapshot();assert.equal(after.draft,null);assert.deepEqual(JSON.parse(after.main).highlights,JSON.parse(before.main).highlights);assert.deepEqual(JSON.parse(after.main).quiz,JSON.parse(before.main).quiz);
  results.push('Offline reload, resume and save preserve highlight/quiz data and consume only the owned draft');
  const last=chapterUnits.at(-1);await page.goto('http://127.0.0.1:4344/#quiz/'+last.id);await page.locator('.quiz-title').waitFor();await page.reload();
  for(const q of last.questions){await page.locator('.quiz-title').filter({hasText:q.q}).waitFor();assert.equal(await page.locator('.answers button').count(),4);await page.locator('.answer[data-answer="'+q.c+'"]').click();assert.equal(await page.locator('.explanation p').innerText(),q.x);await page.locator('[data-action=next-question]').click();}
  await page.locator('.chapter-quiz-complete').waitFor();
  const final=JSON.parse((await snapshot()).main);for(const [id,progress] of Object.entries(JSON.parse(before.main).quiz))assert.equal(final.quiz[id].legacy,progress.legacy);
  await page.goto('http://127.0.0.1:4344/#chapter-quizzes/MAT');await page.locator('[data-chapter-unit="10000"]').filter({hasText:'angesehen'}).waitFor();
  results.push('Final Revelation chapter works offline after reload; all prior chapter/story completion keys and metadata retained');
  assert.deepEqual(errors,[]);console.log('PASS',results.join('\nPASS '));
}finally{await context.close();await browser.close();server.kill();fs.writeFileSync(out+'/results.json',JSON.stringify({previousBuild:oldManifest.build,candidateBuild:BUILD,results,errors},null,2));}
