import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {chromium} from 'playwright';
import {empty,KEYS} from '../../src/store.js';
import {BUILD} from '../../src/version.js';

const previous=process.env.FAITHPATH_PREVIOUS_ROOT||'/workspace/scratch/uiux6b/baseline';
const candidate=process.env.FAITHPATH_CANDIDATE_ROOT||'qa-output/uiux6b/release-final';
assert(fs.existsSync(previous+'/release-integrity.json'),'Build the exact UIUX4+5 baseline 0ec8492 first');
const oldManifest=JSON.parse(fs.readFileSync(previous+'/release-integrity.json'));
assert.equal(oldManifest.build,'FP4-20261017-G-STABLE1-UIUX45-CANDIDATE');
assert.equal(oldManifest.build_hash,'bd6866522aec7b35854bc7c7871d8ce9afb2f1eb4013fd74496423f63753b882');
const out='qa-output/uiux6b/update-https',origin=path.resolve(out,'origin'),results=[];
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
const server=spawn(process.execPath,['tests/uiux6b/serve-https.mjs',origin,'/workspace/scratch/uiux6b/qa-key.pem','/workspace/scratch/uiux6b/qa-cert.pem'],{stdio:['ignore','pipe','inherit'],env:{...process.env,PORT:'4456'}});
await once(server.stdout,'data');
const browser=await chromium.launch({executablePath:process.env.FAITHPATH_CHROMIUM||'/usr/bin/chromium',args:['--no-sandbox','--ignore-certificate-errors']});
const context=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:390,height:844}}),page=await context.newPage();
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
  await page.goto('https://127.0.0.1:4459/#more?section=settings');await ready(oldManifest.build);
  const oldStories=await page.evaluate(async build=>(await fetch('./releases/'+build+'/data/stories.json')).json(),oldManifest.build);
  assert.deepEqual(oldStories,finalUnits);
  const oldNachlese=await page.evaluate(async build=>(await fetch('./releases/'+build+'/data/nachlese-questions.json')).json(),oldManifest.build);
  assert.deepEqual(oldNachlese,finalNachlese);
  await page.goto('https://127.0.0.1:4459/#question/N-0388');
  assert.equal(await page.locator('.source-answer summary').count(),0);assert.equal(await page.locator('.answers button').count(),4);
  const before=await snapshot();assert.equal(JSON.parse(before.main).version,5);assert(before.migration);assert.equal(before.draft,draft);
  assert.equal(Object.keys(JSON.parse(before.main).quiz).length,261);
  results.push('UIUX4+5 baseline installed with 260 existing chapter completion keys, story progress, V3 migration and pending draft');
  deploy(candidate);
  await page.goto('https://127.0.0.1:4459/#more?section=settings');
  // Changing only the hash is SPA navigation; it does not rerun registration.
  // A real document reload exercises the app's existing browser update check.
  const previousDocument=await page.evaluate(()=>performance.timeOrigin);
  await page.reload();assert((await page.evaluate(()=>performance.timeOrigin))>previousDocument);
  await page.getByRole('button',{name:'Jetzt aktualisieren',exact:true}).waitFor({timeout:90000});assert.deepEqual(await snapshot(),before);
  await page.getByRole('button',{name:'Jetzt aktualisieren',exact:true}).click();await ready(BUILD);assert.deepEqual(await snapshot(),before);
  assert.deepEqual(await page.evaluate(async build=>(await fetch('./releases/'+build+'/data/stories.json')).json(),BUILD),finalUnits);
  assert.deepEqual(await page.evaluate(async build=>(await fetch('./releases/'+build+'/data/nachlese-questions.json')).json(),BUILD),finalNachlese);
  results.push('UIUX45 → UIUX6B candidate waits for explicit activation; all personal storage bytes, all 2314 Nachlese entries and all 1300 NT questions verified');
  await page.screenshot({path:out+'/updated.png'});
  await context.setOffline(true);await page.reload();await ready(BUILD);assert.deepEqual(await snapshot(),before);
  assert.deepEqual(await page.evaluate(async build=>(await fetch('./releases/'+build+'/data/stories.json')).json(),BUILD),finalUnits,'All final questions must match the master even without a network connection');
  assert.deepEqual(await page.evaluate(async build=>(await fetch('./releases/'+build+'/data/nachlese-questions.json')).json(),BUILD),finalNachlese);
  assert(finalNachlese.questions.every(q=>q.a?.length===4));
  const first=finalNachlese.questions.find(q=>q.id==='N-0388');
  await page.goto('https://127.0.0.1:4459/#question/'+first.id);
  assert.equal(await page.locator('.answers button').count(),4);await page.locator(`[data-answer="${first.c}"]`).click();
  assert.equal(await page.locator('.explanation p').innerText(),first.x||first.answer);assert.deepEqual(await snapshot(),before);
  results.push('All unchanged MC data and a real correct answer work offline after an actual service-worker update');
  await page.goto('https://127.0.0.1:4459/#today');await page.locator('.today-phase1').waitFor();
  assert.equal(await page.locator('.today-path-action').getAttribute('href'),'#path/p');
  assert.equal(await page.locator('.draft-strip [data-action="resume"]').count(),1);
  const tree=page.locator('.today-tree img');await tree.evaluate(el=>el.decode());
  assert(await tree.evaluate(el=>el.naturalWidth>0&&getComputedStyle(el).objectFit==='contain'));
  const css=await page.evaluate(async build=>({status:(await fetch('./releases/'+build+'/src/today.css')).status,display:getComputedStyle(document.querySelector('.today-phase1 #main')).display}),BUILD);
  assert.deepEqual(css,{status:200,display:'grid'});assert.deepEqual(await snapshot(),before);
  await page.goto('https://127.0.0.1:4459/#path/p');await page.locator('.path-page').waitFor();assert.equal(await page.locator('.next-step .path-step input').count(),1);await page.goto('https://127.0.0.1:4459/#tree');await page.locator('.tree-page').waitFor();assert((await page.locator('.tree-page a[href="#path/p"]').count())>=1);const personalCSS=await page.evaluate(async build=>(await fetch('./releases/'+build+'/src/personal-journey.css')).status,BUILD);assert.equal(personalCSS,200);assert.deepEqual(await snapshot(),before);
  results.push('New Phase3 path, original step and early-stage tree access work offline with versioned CSS; modular Today view and versioned stylesheet work offline with the same path and draft after update');
  for(const [translation,verse,word]of [['otb',10,'Fülle'],['l1912',11,'Genüge']]){
    await page.goto(`https://127.0.0.1:4459/#read/JHN/10/${translation}?from=10&to=11`);
    const v=page.locator(`.verse[data-v="${verse}"]`);await v.waitFor();assert((await v.innerText()).includes(word));
    if(translation==='l1912')assert((await v.getAttribute('class')).includes('marked'));
  }
  const afterReading=await snapshot(),beforeData=JSON.parse(before.main),readData=JSON.parse(afterReading.main);
  assert.equal(afterReading.draft,before.draft);assert.equal(afterReading.migration,before.migration);
  // Opening the reader intentionally remembers the location and adds a reading event.
  for(const key of Object.keys(beforeData).filter(k=>!['reading','events'].includes(k)))assert.deepEqual(readData[key],beforeData[key]);
  for(const event of beforeData.events)assert.deepEqual(readData.events.find(e=>e.id===event.id),event);
  results.push('Both unchanged John10 Bible segmentations work offline and the old Luther verse11 highlight remains attached');
  await page.goto('https://127.0.0.1:4459/#today');await page.getByRole('button',{name:'Entwurf fortsetzen',exact:true}).click();assert.equal(await page.getByLabel('Dein Gedanke',{exact:true}).inputValue(),'Ungespeichert aus STABLE1');
  await page.locator('#editor-form button[type=submit]').click();await page.waitForFunction(k=>JSON.parse(localStorage.getItem(k)).journal[0].text==='Ungespeichert aus STABLE1',KEYS.main);
  const after=await snapshot();assert.equal(after.draft,null);assert.deepEqual(JSON.parse(after.main).highlights,JSON.parse(before.main).highlights);assert.deepEqual(JSON.parse(after.main).quiz,JSON.parse(before.main).quiz);
  results.push('Offline reload, resume and save preserve highlight/quiz data and consume only the owned draft');
  const last=chapterUnits.at(-1);await page.goto('https://127.0.0.1:4459/#quiz/'+last.id);await page.locator('.quiz-title').waitFor();await page.reload();
  for(const q of last.questions){await page.locator('.quiz-title').filter({hasText:q.q}).waitFor();assert.equal(await page.locator('.answers button').count(),4);await page.locator('.answer[data-answer="'+q.c+'"]').click();assert.equal(await page.locator('.explanation p').innerText(),q.x);await page.locator('[data-action=next-question]').click();}
  await page.locator('.chapter-quiz-complete').waitFor();
  const final=JSON.parse((await snapshot()).main);for(const [id,progress] of Object.entries(JSON.parse(before.main).quiz))assert.equal(final.quiz[id].legacy,progress.legacy);
  await page.goto('https://127.0.0.1:4459/#chapter-quizzes/MAT');await page.locator('[data-chapter-unit="10000"]').filter({hasText:'angesehen'}).waitFor();
  results.push('Final Revelation chapter works offline after reload; all prior chapter/story completion keys and metadata retained');
  await page.goto('https://127.0.0.1:4459/#question/N-0005');await page.locator('.story-reflection').waitFor();
  assert.equal(await page.locator('.story-reflection [data-action="reflect-story"]').count(),1);
  await page.goto('https://127.0.0.1:4459/#bible-journey');await page.locator('.sword-count').filter({hasText:'1 von 1.189'}).waitFor();
  await page.locator('[data-action="sword-info"]').click();await page.locator('dialog [data-journey-scripture]').filter({hasText:'und nehmet den Helm'}).waitFor();
  const phase2css=await page.evaluate(async build=>({status:(await fetch('./releases/'+build+'/src/reader-stories.css')).status,scene:getComputedStyle(document.querySelector('.journey-sword-scene')).display}),BUILD);
  assert.deepEqual(phase2css,{status:200,scene:'grid'});
  results.push('New optional story reflection, exact Ephesians quotation, central sword and versioned Phase2 stylesheet function offline after UIUX45→UIUX6B update');
  await page.goto('https://127.0.0.1:4459/#journal');await page.locator('#journal-search').waitFor();const phase45before=await snapshot();
  assert(await page.getByRole('button',{name:'Gedanken festhalten',exact:true}).isVisible());await page.locator('#journal-search').fill('Ungespeichert');assert.equal(await page.locator('[data-journal-id]').count(),1);
  await page.goto('https://127.0.0.1:4459/#more?section=data');await page.locator('.backup-page').waitFor();
  const choice=page.waitForEvent('filechooser');await page.locator('[data-action=check-backup]').click();await(await choice).setFiles({name:'offline-backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({app:'FaithPath',data:JSON.parse(phase45before.main)}))});await page.locator('.backup-dialog').waitFor();assert.equal(await page.locator('[data-action=confirm-import]').count(),0);assert.deepEqual(await snapshot(),phase45before);await page.getByRole('button',{name:'Prüfung schließen',exact:true}).click();
  assert.equal(await page.evaluate(async build=>(await fetch('./releases/'+build+'/src/journal-reviews-backup.css')).status,BUILD),200);
  results.push('UIUX5 journal search, private JSON inspection and versioned CSS function offline without changing any stored data');
  await page.goto('https://127.0.0.1:4459/#journal');await page.locator('[data-action=new-entry]').click();await page.locator('textarea[name=text]').fill('Ein neuer Phase5-Entwurf bleibt offline erhalten.');await page.waitForFunction(k=>localStorage.getItem(k)?.includes('Phase5-Entwurf'),KEYS.draft);await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('dialog').open);await page.evaluate(()=>navigator.locks.request('faithpath-journal-write',()=>{}));const draftBefore=await snapshot();await page.goto('https://127.0.0.1:4459/#reviews');await page.locator('.reminder-controls').waitFor();await page.reload();await page.locator('.reminder-controls').waitFor();assert.deepEqual(await snapshot(),draftBefore);
  results.push('UIUX5 reminder controls, offline reload and open journal draft survive after the real UIUX45→UIUX6B update');
  const offlineFonts=await page.evaluate(async build=>Promise.all(['Newsreader.ttf','DMSans.ttf','Newsreader-Italic.ttf'].map(async font=>{const response=await fetch('./releases/'+build+'/src/verbunden/assets/fonts/'+font);return {font,status:response.status,bytes:(await response.arrayBuffer()).byteLength}})),BUILD);assert(offlineFonts.every(f=>f.status===200&&f.bytes>10000));results.push('All three licensed local fonts served by the actual worker while offline');
  assert.deepEqual(errors,[]);console.log('PASS',results.join('\nPASS '));
}finally{await context.close();await browser.close();server.kill();fs.writeFileSync(out+'/results.json',JSON.stringify({previousBuild:oldManifest.build,candidateBuild:BUILD,transport:"isolated loopback HTTPS; self-signed certificate accepted by test Chromium only",physicalDeviceGate:"OFFEN",results,errors},null,2));}
