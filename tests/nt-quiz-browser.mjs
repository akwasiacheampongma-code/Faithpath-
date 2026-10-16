// Real touch acceptance against the built app, using the approved normalized source.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {chromium} from 'playwright';
import {KEYS} from '../src/store.js';
import {BUILD} from '../src/version.js';
import {coreFixture} from './core-depth-fixture.mjs';

const base=process.env.FAITHPATH_QA_URL||'http://127.0.0.1:4251';
const out='qa-output/nt-quiz-final';fs.mkdirSync(out,{recursive:true});
const master=JSON.parse(fs.readFileSync('reports/nt-quiz-final/master.json')).rows;
const units=JSON.parse(fs.readFileSync('data/stories.json')).filter(u=>u.kind==='chapter-quiz');
const byId=new Map(master.map(r=>[r.FP_ID,r]));
const mandatory=['FP-0261','FP-0401','FP-1071','FP-1124','FP-1171','FP-1281','FP-1451','FP-1560'];
const sampleBooks=['MAT','MRK','JHN','ROM','1CO','GAL','EPH','1TH','HEB','JAS','1JN','REV'];
const longRows=['question','explanation',...Array.from({length:4},(_,i)=>'option_'+i)].map(key=>master.reduce((a,b)=>a[key].length>b[key].length?a:b));
const sampleIds=new Set([...mandatory,...sampleBooks.map(book=>master.find(r=>r.book_key===book).FP_ID),...longRows.map(r=>r.FP_ID)]);
const samples=units.filter(u=>u.questions.some(q=>sampleIds.has(q.faithpath_id)));
const results=[],consoleErrors=[],pageErrors=[],rejections=[],badResponses=[],testedIds=[];
const axe=fs.readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'),'utf8');
const browser=await chromium.launch({executablePath:process.env.FAITHPATH_CHROMIUM||'/usr/bin/chromium',args:['--no-sandbox']});
async function check(name,fn){try{await fn();results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',error:e.stack});}}
async function context(width=390,height=844,font=100){
  const c=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
  await c.addInitScript(({KEYS,seed,font})=>{
    if(!localStorage.getItem(KEYS.main)){localStorage.setItem(KEYS.main,JSON.stringify(seed));localStorage.setItem(KEYS.onboard,'done');}
    document.addEventListener('DOMContentLoaded',()=>document.documentElement.style.fontSize=font+'%');
    window.addEventListener('unhandledrejection',event=>console.error('UNHANDLED_REJECTION:'+String(event.reason)));
  },{KEYS,seed:coreFixture(),font});
  const p=await c.newPage();p.setDefaultTimeout(15000);
  p.on('console',m=>{if(m.type()==='error'){consoleErrors.push(m.text());if(m.text().startsWith('UNHANDLED_REJECTION:'))rejections.push(m.text());}});
  p.on('pageerror',e=>pageErrors.push(e.message));p.on('response',r=>{if(r.status()>=400)badResponses.push({url:r.url(),status:r.status()});});
  return {c,p};
}
async function route(p,r){await p.goto(base+'/#'+r,{waitUntil:'networkidle'});await p.locator('#main h1').waitFor();}
const state=p=>p.evaluate(KEYS=>JSON.parse(localStorage.getItem(KEYS.main)),KEYS);
async function bounds(p){
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'horizontal page overflow');
  for(const option of await p.locator('.answer').all()){
    const b=await option.boundingBox();assert(b.height>=44,'touch height');
    assert(b.x>=0&&b.x+b.width<=await p.evaluate(()=>innerWidth),'answer outside container');
    assert(await option.evaluate(el=>el.scrollWidth<=el.clientWidth),'answer text overflow');
  }
}
async function play(p,unit,collect=true){
  for(let i=0;i<5;i++){
    const q=unit.questions[i],r=byId.get(q.faithpath_id);
    assert.equal(await p.locator('.quiz-title').getAttribute('data-question-id'),r.FP_ID);
    assert.equal(await p.locator('.quiz-title').innerText(),r.question);
    assert((await p.locator('.quiz-head').innerText()).includes(`Frage ${i+1} von 5`));
    assert.equal(await p.locator('.answer').count(),4);
    assert.deepEqual(await p.locator('.answer > span:nth-child(2)').allTextContents(),[r.option_0,r.option_1,r.option_2,r.option_3]);
    await bounds(p);
    const chosen=i===0?(r.correct_index+1)%4:r.correct_index;
    await p.locator(`.answer[data-answer="${chosen}"]`).tap();
    assert.equal(await p.locator('.answer.correct').getAttribute('data-answer'),String(r.correct_index));
    assert.equal(await p.locator('.answer.selected-wrong').count(),i===0?1:0);
    assert.equal(await p.locator('.answer:disabled').count(),4);
    assert.equal(await p.locator('.explanation p').innerText(),r.explanation);
    assert.equal(await p.locator('.explanation .meta').innerText(),r.reference);
    assert.equal(await p.locator('.explanation strong').innerText(),i===0?'Schau noch einmal auf den Zusammenhang.':'Ja, das steht im Text.');
    await bounds(p);if(collect)testedIds.push(r.FP_ID);
    if(mandatory.includes(r.FP_ID)||longRows.some(row=>row.FP_ID===r.FP_ID))await p.screenshot({path:path.join(out,r.FP_ID+'.png'),fullPage:true});
    await p.locator('[data-action="next-question"]').tap();
  }
  await p.locator('.chapter-quiz-complete').waitFor();
  assert((await state(p)).quiz[unit.id].done,'canonical numeric ID progress');
}
try{
  const {c,p}=await context();
  await check('active Service Worker serves the final build',async()=>{
    await route(p,'more?section=settings');
    await p.locator('#offline-state').filter({hasText:'Beide Bibeln und die App sind für dieses Gerät offline bereit.'}).waitFor({timeout:90000});
    assert(await p.evaluate(()=>!!navigator.serviceWorker.controller));
    assert.equal(await p.evaluate(async()=>{
      const registration=await navigator.serviceWorker.getRegistration();
      return new Promise(resolve=>{const channel=new MessageChannel();channel.port1.onmessage=e=>resolve(e.data.build);registration.active.postMessage({type:'STATUS'},[channel.port2]);});
    }),BUILD);
  });
  for(const unit of samples)await check(`real touch: ${unit.book} ${unit.chapter+1}, five exact source questions`,async()=>{
    const before=await state(p);await route(p,'chapter-quizzes');
    await p.locator(`[data-chapter-book="${unit.book}"]`).tap();
    await p.locator(`[data-chapter-unit="${unit.id}"]`).tap();
    await p.locator('.quiz-title').waitFor();await play(p,unit);
    const after=await state(p);for(const field of ['paths','journal','reflections','highlights','reviews','guidedPlans','settings'])assert.deepEqual(after[field],before[field],field);
    await route(p,'chapter-quizzes/'+unit.book);assert((await p.locator(`[data-chapter-unit="${unit.id}"]`).innerText()).includes('angesehen'));
    await p.reload({waitUntil:'networkidle'});assert((await p.locator(`[data-chapter-unit="${unit.id}"]`).innerText()).includes('angesehen'));
    await p.locator(`[data-chapter-unit="${unit.id}"]`).tap();assert.equal(await p.locator('.quiz-title').getAttribute('data-question-id'),unit.questions[0].faithpath_id);
  });
  await check('all eight mandatory IDs were rendered, answered, and verified',async()=>{
    for(const id of mandatory)assert(testedIds.includes(id),id);
    const precise=byId.get('FP-1124');assert.equal(precise.reference,'Epheser 5,21');
  });
  await check('offline reload still uses exact final source, including Revelation boundary',async()=>{
    await c.setOffline(true);await route(p,'quiz/'+units.at(-1).id);await p.reload({waitUntil:'networkidle'});await play(p,units.at(-1),false);await c.setOffline(false);
  });
  await c.close();
  for(const [w,h,font] of [[320,568,100],[390,844,200],[430,932,100]]){
    const {c,p}=await context(w,h,font);
    await check(`long content, touch and reduced motion ${w}x${h} @${font}%`,async()=>{
      for(const unit of units.filter(u=>u.questions.some(q=>longRows.some(r=>r.FP_ID===q.faithpath_id)))){
        await route(p,'quiz/'+unit.id);await play(p,unit,false);
      }
      await route(p,'quiz/'+units[0].id);await p.locator('.answer').first().focus();await p.keyboard.press('Enter');
      assert(await p.locator('.explanation').evaluate(el=>el===document.activeElement));await p.keyboard.press('Tab');
      assert(await p.locator('[data-action="next-question"]').evaluate(el=>el===document.activeElement));
      assert(await p.evaluate(()=>matchMedia('(prefers-reduced-motion:reduce)').matches));
      await p.evaluate(axe);const result=await p.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}));
      assert.deepEqual(result.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})),[]);
    });await c.close();
  }
}finally{
  await browser.close();
  fs.writeFileSync(out+'/results.json',JSON.stringify({build:BUILD,base,results,testedIds:[...new Set(testedIds)],mandatory,sampleBooks,longContentIds:longRows.map(r=>r.FP_ID),consoleErrors,pageErrors,rejections,badResponses},null,2));
}
console.log(JSON.stringify({results,consoleErrors,pageErrors,rejections,badResponses}));
if(results.some(r=>r.status==='FAIL')||consoleErrors.length||pageErrors.length||rejections.length||badResponses.length)process.exitCode=1;
