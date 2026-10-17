// Axe audit contexts bypass CSP for its diagnostic styles; uninstrumented 6B route audit verifies the production CSP.
// Acceptance against the actual build data: no response interception or editorial fixtures.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {chromium} from 'playwright';
import {KEYS} from '../src/store.js';
import {BUILD} from '../src/version.js';
import {coreFixture} from './core-depth-fixture.mjs';
const base=process.env.QA_URL||'http://127.0.0.1:4333',out='qa-output/nachlese-mc/corpus-browser';
fs.mkdirSync(out,{recursive:true});
const read=file=>JSON.parse(fs.readFileSync(file));
const axe=fs.readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'),'utf8');
const data=read('data/nachlese-questions.json'),flow=read('data/faithpath-nachlese-story-flow.json');
const ready=data.questions.filter(q=>q.a),held=data.questions.filter(q=>!q.a);
const byId=new Map(data.questions.map(q=>[q.id,q]));
const samples=new Map();
for(const q of [ready[0],ready.at(-1),...['GEN','EXO','PSA','MAT','MRK','LUK','JHN','ACT','ROM','REV'].map(book=>ready.find(q=>q.references.some(r=>r.book===book))),...['q','answer','a'].map(key=>ready.reduce((a,b)=>String(a[key]).length>String(b[key]).length?a:b)),...flow.stories.flatMap(s=>s.flow_items).filter(i=>i.source_question_ids.length>1).slice(0,3).map(i=>byId.get(i.primary_question_id))])if(q?.a)samples.set(q.id,q);
const longest=ready.reduce((a,b)=>Math.max(...a.a.map(x=>x.length))>Math.max(...b.a.map(x=>x.length))?a:b);samples.set(longest.id,longest);
const browser=await chromium.launch({executablePath:process.env.FAITHPATH_CHROMIUM||'/usr/bin/chromium',args:['--no-sandbox']});
const results=[],errors=[],tested=[];
const check=async(name,fn)=>{try{await fn();results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',error:e.stack});}};
try{
 for(const [width,height,theme] of [[320,568,'night'],[390,844,'light']]){
  const seed=coreFixture();seed.settings.theme=theme;
  const c=await browser.newContext({bypassCSP:true,viewport:{width,height},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
  await c.addInitScript(({seed,KEYS})=>{if(!localStorage.getItem(KEYS.main)){localStorage.setItem(KEYS.main,JSON.stringify(seed));localStorage.setItem(KEYS.onboard,'done');}},{seed,KEYS});
  const p=await c.newPage();p.setDefaultTimeout(15000);p.on('pageerror',e=>errors.push(e.message));
  const route=async hash=>{await p.goto(base+'/#'+hash);await p.locator('#main h1').waitFor();};
  await check(`Served corpus and unchanged story mapping match source ${width}`,async()=>{
   await route('more?section=settings');
   await p.locator('#offline-state').filter({hasText:'Beide Bibeln und die App sind für dieses Gerät offline bereit.'}).waitFor({timeout:90000});
   await route('discover');
   const actual=await p.evaluate(async BUILD=>Promise.all(['nachlese-questions','faithpath-nachlese-story-flow'].map(async file=>(await fetch(`./releases/${BUILD}/data/${file}.json`)).json())),BUILD);
   assert.deepEqual(actual,[data,flow]);
   const before=await p.evaluate(k=>localStorage.getItem(k),KEYS.main);
   await route('merged-story/NS-0001');
   assert.equal(await p.locator('[data-story-id] a[href^="#question/"]').count(),flow.stories[0].flow_items.length);
   assert.equal(await p.locator('.reflection-invite h2').innerText(),flow.stories[0].reflection);
   assert.equal(await p.evaluate(k=>localStorage.getItem(k),KEYS.main),before);
  });
  for(const q of samples.values())await check(`Actual ${q.id}: four exact options, correct/wrong, layout ${width}`,async()=>{
   await route('question/'+q.id);
   const before=await p.evaluate(k=>localStorage.getItem(k),KEYS.main);
   assert.equal(await p.locator('#main h1').innerText(),q.q);
   assert.deepEqual(await p.locator('.answer > span:nth-child(2)').allTextContents(),q.a);
   for(const option of await p.locator('.answer').all()){
    const box=await option.boundingBox();assert(box.height>=44);assert(box.x>=0&&box.x+box.width<=width+1);
    assert(await option.evaluate(el=>el.scrollWidth<=el.clientWidth+1));
   }
   assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   await p.locator(`[data-answer="${(q.c+1)%4}"]`).tap();
   assert.equal(await p.locator('.answer.correct').getAttribute('data-answer'),String(q.c));
   assert.equal(await p.locator('.answer.selected-wrong').count(),1);
   assert.equal(await p.locator('.answer:disabled').count(),4);
   assert.equal(await p.locator('.explanation p').innerText(),q.x||q.answer);
   assert(await p.locator('.explanation').evaluate(el=>document.activeElement===el));
   assert.equal(await p.evaluate(k=>localStorage.getItem(k),KEYS.main),before);
   await p.reload();await p.locator('.answer').first().waitFor();
   if(q.id===ready[0].id){await p.locator(`[data-answer="${q.c}"]`).focus();await p.keyboard.press('Enter');}
   else await p.locator(`[data-answer="${q.c}"]`).tap();
   assert.equal(await p.locator('.answer.selected-wrong').count(),0);
   assert.equal(await p.locator('.answer.correct').count(),1);
   if(q.id===ready[0].id){
    // DevTools evaluation keeps the app's restrictive production CSP intact.
    await p.evaluate(axe);
    const violations=await p.evaluate(async()=>{const result=await axe.run(document.getElementById('main'));return result.violations.filter(v=>['serious','critical'].includes(v.impact)).map(v=>({id:v.id,impact:v.impact}));});
    assert.deepEqual(violations,[],'New source-question UI accessibility violations');
   }
   if(q.id===ready[0].id||q.id===ready.at(-1).id||q.id===longest.id){
    await p.evaluate(()=>window.scrollTo(0,0));await p.screenshot({path:`${out}/${q.id}-${width}.png`,fullPage:true});
   }
   tested.push({id:q.id,width,correct:true,incorrect:true});
  });
  await check(`Completion or held-source fallback matches the published corpus ${width}`,async()=>{
   if(!held.length){assert.equal(ready.length,2314);return;}
   for(const q of [held[0],held.at(-1)]){
    await route('question/'+q.id);assert.equal(await p.locator('.answer').count(),0);
    await p.locator('.source-answer summary').click();assert.equal(await p.locator('[data-n-answer]').innerText(),q.answer);
   }
  });
  await c.close();
 }
}finally{await browser.close();fs.writeFileSync(out+'/results.json',JSON.stringify({base,build:BUILD,results,errors,tested,allCorpusCompared:true,syntheticChoiceFixtures:false},null,2));}
console.log(JSON.stringify({results,errors,tested:tested.length}));if(results.some(r=>r.status==='FAIL')||errors.length)process.exitCode=1;
