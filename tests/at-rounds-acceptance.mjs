import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {empty,KEYS} from '../src/store.js';
import {AT_TEST_STORAGE_PREFIX as PREFIX} from '../src/at-rounds-feature.js';
import {testServer} from './helpers/at-rounds-browser-support.mjs';
const require=createRequire(import.meta.url),{chromium}=require('playwright');
const root=process.env.AT_ROUNDS_TEST_ROOT||'qa-output/at-rounds-test';
const control=process.env.AT_ROUNDS_CONTROL_ROOT||'qa-output/at-rounds-off';
const out=process.env.AT_ROUNDS_QA_OUT||'qa-output/at-rounds-acceptance';
fs.mkdirSync(path.join(out,'screenshots'),{recursive:true});
const server=await testServer(root),results=[],errors=[];
const seed=empty();seed.journal=[{id:'qa-j',text:'Synthetischer Gedanke.',date:'2026-11-09T10:00:00Z'}];
seed.quiz={'10000':{done:'2026-11-01T00:00:00Z'}};
let browser;
async function pageFor(width=390,height=844,options={}){
  const context=await browser.newContext({viewport:{width,height},serviceWorkers:'block',...options});
  await context.addInitScript(({seed,KEYS})=>{if(!sessionStorage.getItem('qa.seeded')){localStorage.setItem(KEYS.main,JSON.stringify(seed));localStorage.setItem(KEYS.onboard,'done');sessionStorage.setItem('qa.seeded','1');}},{seed,KEYS});
  const page=await context.newPage();page.setDefaultTimeout(12000);page.on('pageerror',e=>errors.push(e.message));
  return {page,context};
}
async function visit(p,route){await p.goto(server.url+'#'+route);await p.locator('main h1').waitFor();}
async function qid(p,id){await p.waitForFunction(id=>document.querySelector('.quiz-title')?.dataset.questionId===id,id);}
async function answer(p,i=0){await p.locator('.answers .answer').nth(i).click();await p.locator('.explanation').waitFor();}
async function next(p){await p.getByRole('button',{name:'Nächste Frage',exact:true}).click();}
async function saved(p){return p.evaluate(k=>JSON.parse(sessionStorage.getItem(k)),PREFIX+KEYS.main);}
async function finish(p){for(let i=0;i<5;i++){await answer(p);await p.getByRole('button',{name:i===4?'Runde abschließen':'Nächste Frage',exact:true}).click();}await p.locator('[data-at-round-complete]').waitFor();}
async function run(name,fn){try{const detail=await fn();results.push({check:name,status:'PASS',...detail});}catch(e){results.push({check:name,status:'FAIL',error:e.stack});throw e;}}
try{
  browser=await chromium.launch({executablePath:process.env.FAITHPATH_CHROMIUM||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage'],headless:true});
  await run('B gate, answer/cursor reload, back-forward and exact reader return',async()=>{
    const {page:p,context}=await pageFor();
    const origin='read/1KI/8/l1912?from=12&to=15&return=chapters%2F1KI';
    const query=new URLSearchParams({round:'B',return:origin});
    await visit(p,'chapter-quizzes/1KI/8?'+query);await qid(p,'1270-Q5');
    assert.equal(new URLSearchParams(new URL(p.url()).hash.split('?')[1]).get('round'),'A');
    await answer(p,2);await p.reload();await qid(p,'1270-Q5');
    assert.equal(await p.locator('.answer.correct').count(),1);
    await next(p);await qid(p,'1271-Q5');await p.reload();await qid(p,'1271-Q5');
    await p.getByRole('link',{name:'Zurück zum Kapitel',exact:true}).click();await p.locator('#verses').waitFor();
    assert.equal(new URL(p.url()).hash.slice(1),origin);
    await p.goBack();await qid(p,'1271-Q5');await p.goForward();await p.locator('#verses').waitFor();
    await p.locator('[data-at-rounds-entry] a').click();await qid(p,'1271-Q5');
    assert.equal((await saved(p)).quiz['1KI:8:A'].index,1);
    await context.close();
  });
  await run('confirmed round-only reset, retained B answers, no automatic B start',async()=>{
    const {page:p,context}=await pageFor();await visit(p,'chapter-quizzes/1KI/8');await qid(p,'1270-Q5');await finish(p);
    await p.getByRole('link',{name:'Freiwillige zweite Runde'}).click();await qid(p,'1270-Q3');await answer(p,1);
    const before=(await saved(p)).quiz['1KI:8:B'];
    await visit(p,'chapter-quizzes/1KI/8?round=A');await p.locator('[data-at-round-complete]').waitFor();
    await p.getByRole('button',{name:'Runde neu starten'}).click();
    assert((await saved(p)).quiz['1KI:8:A'].done,'Reset requires confirmation');
    await p.getByRole('button',{name:'Nur diese Runde zurücksetzen'}).click();await qid(p,'1270-Q5');
    assert.deepEqual((await saved(p)).quiz['1KI:8:B'],before);
    await visit(p,'chapter-quizzes/1KI/8?round=B');await qid(p,'1270-Q5');
    await finish(p);assert.equal(await p.locator('.quiz-title').count(),0);
    await p.getByRole('link',{name:'Freiwillige zweite Runde'}).click();await qid(p,'1270-Q3');
    assert.equal(await p.locator('.answer.selected-wrong').count(),1);
    await context.close();
  });
  await run('already-running canonical quiz survives a fixture excursion',async()=>{
    const {page:p,context}=await pageFor();await visit(p,'quiz/10070');await p.locator('.quiz-title').waitFor();
    await answer(p);await next(p);const id=await p.locator('.quiz-title').getAttribute('data-question-id');
    await visit(p,'chapter-quizzes/2KI/15');await qid(p,'1351-Q1');
    await visit(p,'quiz/10070');await qid(p,id);
    assert.deepEqual(await p.evaluate(k=>JSON.parse(localStorage.getItem(k)).quiz,KEYS.main),seed.quiz);
    await context.close();
  });
  await run('session quota failure never confirms an unsaved answer or changes personal data',async()=>{
    const {page:p,context}=await pageFor();await visit(p,'chapter-quizzes/1KI/8');await qid(p,'1270-Q5');
    await p.evaluate(prefix=>{const set=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(this===sessionStorage&&k.startsWith(prefix))throw new DOMException('quota','QuotaExceededError');return set.call(this,k,v);};},PREFIX);
    await p.locator('.answer').first().click();await p.locator('#toast').filter({hasText:'Nicht gespeichert'}).waitFor();
    assert.equal(await p.locator('.explanation').count(),0);assert.equal(await saved(p),null);
    assert.deepEqual(await p.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEYS.main),seed);
    await p.screenshot({path:path.join(out,'screenshots','storage-failure.png')});await context.close();
  });
  await run('corrupt fixture progress stays intact until a confirmed round reset',async()=>{
    const {page:p,context}=await pageFor();await visit(p,'chapter-quizzes/1KI/8');await qid(p,'1270-Q5');await answer(p);
    await p.evaluate(key=>{const data=JSON.parse(sessionStorage.getItem(key));data.quiz['1KI:8:A'].fixtureSha='old-revision';sessionStorage.setItem(key,JSON.stringify(data));},PREFIX+KEYS.main);
    await p.reload();await p.getByRole('heading',{name:'Diese Testrunde wurde nicht verändert.'}).waitFor();
    assert.equal((await saved(p)).quiz['1KI:8:A'].fixtureSha,'old-revision');
    await p.getByRole('button',{name:'Runde neu starten'}).click();await p.getByRole('button',{name:'Nur diese Runde zurücksetzen'}).click();await qid(p,'1270-Q5');
    await context.close();
  });
  await run('missing fixture / blocked session storage leave canonical app usable',async()=>{
    for(const failure of ['missing','storage']){
      const {page:p,context}=await pageFor();
      if(failure==='missing')await p.route('**/at-rounds.test-only.json',r=>r.fulfill({status:404,body:'missing'}));
      else await p.addInitScript(prefix=>{const get=Storage.prototype.getItem;Storage.prototype.getItem=function(k){if(this===sessionStorage&&k.startsWith(prefix))throw new DOMException('blocked','SecurityError');return get.call(this,k);};},PREFIX);
      await visit(p,'chapter-quizzes/1KI/8');await p.getByRole('heading',{name:'Die Testrunden konnten nicht geöffnet werden.'}).waitFor();
      await visit(p,'quiz/10070');await p.locator('.quiz-title').waitFor();
      await context.close();
    }
  });
  await run('invalid or editorial-draft routes cannot expose extra questions',async()=>{
    const {page:p,context}=await pageFor();
    for(const route of ['chapter-quizzes/NUM/17?round=A','chapter-quizzes/1KI/9','chapter-quizzes/1KI/8?round=C','chapter-quizzes/1KI/8/extra']){
      await visit(p,route);assert.equal(await p.locator('.answers').count(),0);assert(!await p.locator('main').innerText().then(t=>t.includes('NUM17-ED')));
    }await context.close();
  });
  await run('responsive, 200% text, keyboard and axe on fixture screens',async()=>{
    const checks=[];
    for(const [width,height]of [[320,568],[390,844],[1280,900]]){
      for(const scale of [100,200]){
        const {page:p,context}=await pageFor(width,height,{serviceWorkers:'allow'});
        await visit(p,'chapter-quizzes/2KI/15');await qid(p,'1351-Q1');
        await p.evaluate(()=>navigator.serviceWorker.ready);
        await p.addStyleTag({content:`html{font-size:${scale}% !important}`});
        assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`Overflow ${width}/${scale}`);
        await p.locator('.answer').first().focus();await p.keyboard.press('Enter');await p.locator('.explanation').waitFor();
        await p.getByRole('button',{name:'Nächste Frage'}).focus();await p.keyboard.press('Enter');await qid(p,'1352-Q1');
        await p.locator('.quiz-title').focus();
        await p.screenshot({path:path.join(out,'screenshots',`question-${width}-${scale}.png`),fullPage:true});
        await p.addScriptTag({path:require.resolve('axe-core/axe.min.js')});
        const axe=await p.evaluate(async()=>{const a=await axe.run(document.querySelector('main'),{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}});return{violations:a.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.length})),incomplete:a.incomplete.map(v=>({id:v.id,nodes:v.nodes.length}))};});
        fs.writeFileSync(path.join(out,`axe-${width}-${scale}.json`),JSON.stringify(axe,null,2));
        assert.deepEqual(axe.violations,[]);checks.push({width,height,text_percent:scale,axe});await context.close();
      }
    }return{viewports:checks,themes:'Only the one palette present on f02106e; four-theme implementation absent',physical_iphone:'OPEN'};
  });
  await run('default build never loads or exposes fixture data; canonical reader/quiz remain usable',async()=>{
    server.setRoot(control);const {page:p,context}=await pageFor();const fixtureRequests=[];
    p.on('request',r=>{if(r.url().includes('at-rounds.test-only.json'))fixtureRequests.push(r.url());});
    await visit(p,'read/1KI/8/l1912');await p.locator('#verses').waitFor();assert.equal(await p.locator('[data-at-rounds-entry]').count(),0);
    await visit(p,'chapter-quizzes');assert.equal(await p.locator('[data-chapter-book="1KI"]').count(),0);
    await visit(p,'chapter-quizzes/1KI/8?round=A');assert.equal(await p.locator('.answers').count(),0);
    await visit(p,'quiz/10070');await p.locator('.quiz-title').waitFor();await answer(p);
    assert.deepEqual(fixtureRequests,[]);await context.close();server.setRoot(root);
  });
}finally{
  await browser?.close();await server.close();
  fs.writeFileSync(path.join(out,'acceptance-results.json'),JSON.stringify({browser:'Chromium/Linux',results,page_errors:errors,human_approved:false,production_import_allowed:false,deploy_production:false},null,2));
}
assert.deepEqual(errors,[]);console.log(JSON.stringify(results));
