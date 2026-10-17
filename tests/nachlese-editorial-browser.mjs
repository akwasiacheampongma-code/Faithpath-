// UIUX5: same functional assertions; restore now has two explicit confirmation stages.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {KEYS} from '../src/store.js';
import {BUILD} from '../src/version.js';
import {coreFixture} from './core-depth-fixture.mjs';
const read=file=>JSON.parse(fs.readFileSync(file));
const base=process.env.QA_URL||'http://127.0.0.1:4343',out='qa-output/nachlese-editorial/browser';fs.mkdirSync(out,{recursive:true});
const corpus=read('data/nachlese-questions.json'),byId=new Map(corpus.questions.map(q=>[q.id,q]));
const decisions=fs.readFileSync('reports/nachlese-editorial-56/review-decisions.jsonl','utf8').trim().split('\n').map(l=>JSON.parse(l));
const revised=decisions.filter(r=>r.group==='proposal56'||r.group==='segmentation').map(r=>byId.get(r.id));
const marked=decisions.filter(r=>r.group==='marked150').map(r=>byId.get(r.id));
const longest=revised.reduce((a,b)=>String(a.q+a.a+a.x).length>String(b.q+b.a+b.x).length?a:b);
const smallIds=new Set(['N-0388','N-1524','N-1798','N-1913','N-2218','N-2240','N-1535','N-1536',longest.id]);
const browser=await chromium.launch({executablePath:process.env.FAITHPATH_CHROMIUM||'/usr/bin/chromium',args:['--no-sandbox']});
const results=[],errors=[],tested=[];
const check=async(name,fn)=>{try{await fn();results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',error:e.stack});}};
try{
 for(const [width,height,theme]of [[390,844,'light'],[320,568,'night']]){
  const seed=coreFixture();seed.settings.theme=theme;seed.quiz={'1':{done:'2026-09-01',legacy:'story'},'10000':{done:'2026-09-01',legacy:'chapter'}};
  const c=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,reducedMotion:'reduce',acceptDownloads:true});
  await c.addInitScript(({seed,KEYS})=>{if(!localStorage.getItem(KEYS.main)){localStorage.setItem(KEYS.main,JSON.stringify(seed));localStorage.setItem(KEYS.onboard,'done');}},{seed,KEYS});
  const p=await c.newPage();p.setDefaultTimeout(15000);p.on('pageerror',e=>errors.push(e.message));
  const route=async hash=>{await p.goto(base+'/#'+hash);await p.locator('#main h1').waitFor();};
  await check(`Exact published 2314-question corpus and active worker ${width}`,async()=>{
   await route('more?section=settings');await p.locator('#offline-state').filter({hasText:'Beide Bibeln und die App sind für dieses Gerät offline bereit.'}).waitFor({timeout:90000});
   assert((await p.locator('.build-id').innerText()).includes(BUILD));
   assert.deepEqual(await p.evaluate(async BUILD=>(await fetch(`./releases/${BUILD}/data/nachlese-questions.json`)).json(),BUILD),corpus);
   assert(corpus.questions.every(q=>q.a?.length===4&&q.a[q.c]===q.answer));
  });
  for(const q of revised.filter(q=>width===390||smallIds.has(q.id)))await check(`${q.id}: actual editorial wording, four options and both answer paths ${width}`,async()=>{
   await route('merged-story/'+q.source_story_id);const link=p.locator(`[data-story-id] a[href="#question/${q.id}"]`);assert.equal(await link.locator('strong').innerText(),q.q);await link.click();
   await p.locator(`[data-question-id="${q.id}"]`).waitFor();assert.equal(await p.locator('#main h1').innerText(),q.q);
   assert.deepEqual(await p.locator('.answer > span:nth-child(2)').allTextContents(),q.a);
   const raw=await p.evaluate(k=>localStorage.getItem(k),KEYS.main);
   for(const option of await p.locator('.answer').all()){const b=await option.boundingBox();assert(b.height>=44&&b.x>=0&&b.x+b.width<=width+1);assert(await option.evaluate(el=>el.scrollWidth<=el.clientWidth+1));}
   assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   await p.locator(`[data-answer="${(q.c+1)%4}"]`).tap();assert.equal(await p.locator('.answer.correct').getAttribute('data-answer'),String(q.c));assert.equal(await p.locator('.answer.selected-wrong').count(),1);
   assert.equal(await p.locator('.explanation p').innerText(),q.x||q.answer);assert(await p.locator('.explanation').evaluate(el=>el===document.activeElement));
   assert.equal(await p.evaluate(k=>localStorage.getItem(k),KEYS.main),raw);
   await p.reload();await p.locator('.answer').first().waitFor();await p.locator(`[data-answer="${q.c}"]`).focus();await p.keyboard.press('Enter');
   assert.equal(await p.locator('.answer.selected-wrong').count(),0);assert.equal(await p.locator('.answer.correct').count(),1);assert.equal(await p.locator('.answer:disabled').count(),4);
   if(smallIds.has(q.id)){await p.evaluate(()=>window.scrollTo(0,0));await p.screenshot({path:`${out}/${q.id}-${width}.png`,fullPage:true});}
   tested.push({id:q.id,width,correct:true,incorrect:true});
  });
  await check(`Existing marked questions, reflections and quiz progress retained ${width}`,async()=>{
   for(const q of marked.filter((_,i)=>i%30===0)){
    await route('question/'+q.id);assert.deepEqual(await p.locator('.answer > span:nth-child(2)').allTextContents(),q.a);
   }
   const flow=read('data/faithpath-nachlese-story-flow.json');await route('merged-story/NS-0001');assert.equal(await p.locator('.reflection-invite h2').innerText(),flow.stories[0].reflection);
   await route('more?section=data');const download=p.waitForEvent('download');await p.getByRole('button',{name:'Backup exportieren',exact:true}).click();const file=`${out}/synthetic-backup-${width}.json`;await(await download).saveAs(file);
   const backup=read(file);assert.deepEqual(backup.data.quiz,seed.quiz);await p.locator('#import-file').setInputFiles(file);await p.locator('[data-action=review-import]').click();await p.getByRole('button',{name:'Backup wiederherstellen',exact:true}).click();
   await p.getByRole('heading',{name:'Gut aufgehoben.',exact:true}).waitFor();assert.deepEqual(await p.evaluate(k=>JSON.parse(localStorage.getItem(k)).quiz,KEYS.main),seed.quiz);
  });
  await c.close();
 }
}finally{await browser.close();fs.writeFileSync(out+'/results.json',JSON.stringify({base,build:BUILD,results,errors,tested,allPublishedCorpusCompared:true,syntheticPersonalDataOnly:true},null,2));}
console.log(JSON.stringify({results,errors,tested:tested.length}));if(results.some(r=>r.status==='FAIL')||errors.length)process.exitCode=1;
