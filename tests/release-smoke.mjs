import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {BUILD} from '../src/version.js';
import {empty,KEYS} from '../src/store.js';
const {chromium}=createRequire(import.meta.url)('playwright');
const base='http://127.0.0.1:4174/', modulePath=`/releases/${BUILD}/src/runtime-model.js`;
const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
const context=await browser.newContext();
await context.addInitScript(k=>localStorage.setItem(k,'done'),KEYS.onboard);
const page=await context.newPage();page.setDefaultTimeout(15000);
const results=[], consoleErrors=[], network404=[],legacy=[], requests=[];
page.on('pageerror',e=>consoleErrors.push(e.message));
page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text())});
page.on('response',r=>{if(r.status()===404)network404.push(r.url())});
page.on('request',r=>{requests.push(r.url());if(r.url().includes('FP4-20260916-F'))legacy.push(r.url())});
const fp=JSON.parse(fs.readFileSync('data/stories.json')).flatMap(s=>s.questions);
const n=JSON.parse(fs.readFileSync('data/nachlese-questions.json')).questions;
const flow=JSON.parse(fs.readFileSync('data/faithpath-nachlese-story-flow.json'));
async function test(name,fn){try{await fn();results.push({name,status:'PASS'});console.log('PASS',name)}catch(e){results.push({name,status:'FAIL',error:e.stack});console.log('FAIL',name,e.message)}}
async function route(path){await page.goto(base+'#'+path);await page.locator('main h1').waitFor();}
async function runtime(){return page.evaluate(async modulePath=>{const {getRuntimeModel}=await import(modulePath);const m=getRuntimeModel();if(!m)throw new Error('Runtime model not loaded');return {fp:[...m.fp.values()].map(v=>v.question),n:[...m.n.values()],flow:m.flow,chapters:m.chapterCount}},modulePath)}
try{
 await test('01 App starts',async()=>{await page.goto(base);await page.getByRole('heading',{name:'Was bewegt dich gerade?',exact:true}).waitFor()});
 await test('02 Home and candidate pools',async()=>{const m=await runtime();assert.deepEqual(m.fp,fp);assert.deepEqual(m.n,n);assert.deepEqual(m.flow,flow);assert.equal(m.chapters,1300)});
 await test('03 All story links and source identities',async()=>{const m=await runtime();assert.equal(m.flow.stories.length,436);assert.equal(m.flow.mapping_links.length,260)});
 await test('04 Canonical story view',async()=>{await route('merged-story/NS-0274');await page.locator('[data-story-id="NS-0274"]').waitFor();assert.equal(await page.getByRole('heading',{name:'Dein Sohn lebt',exact:true}).count(),1)});
 await test('05 FaithPath MC exact four options',async()=>{await route('question/FP-0120');await page.locator('[data-question-id="FP-0120"]').waitFor();assert.equal(await page.locator('.answers button').count(),4);assert.deepEqual(await page.locator('.answers button').allTextContents(),fp[119].a)});
 await test('06 Correct answer and unchanged explanation',async()=>{await page.locator('[data-action="source-answer"][data-answer="0"]').click();await page.locator('.answer.correct').waitFor();assert.equal(await page.locator('.explanation p').textContent(),fp[119].x)});
 await test('07 Exact reflection',async()=>{assert.equal(await page.locator('.reflection-invite h2').textContent(),flow.stories.find(s=>s.story_id==='NS-0274').reflection)});
 await test('08 Nachlese question and original answer',async()=>{await route('question/N-1466');await page.locator('[data-question-id="N-1466"]').waitFor();await page.locator('summary').click();assert.equal(await page.locator('[data-n-answer]').textContent(),n[1465].answer);assert.equal(await page.locator('.answers').count(),0)});
 await test('09 Namespace distinction',async()=>{assert.match(await page.locator('[data-question-id]').textContent(),/N-1466 · Nachlese/);await route('question/FP-0151');assert.match(await page.locator('[data-question-id]').textContent(),/FP-0151 · FaithPath/)});
 await test('10 Chapter quiz remains separate',async()=>{await route('quiz/10000');await page.locator('.answers button').first().waitFor();assert.equal(await page.locator('.answers button').count(),4);assert.equal(await page.locator('[data-question-id]').getAttribute('data-question-id'),'FP-0261')});
 await test('11 Deep URL',async()=>{await page.goto(base+'app/deep/link#question/FP-0239');await page.locator('[data-question-id="FP-0239"]').waitFor()});
 await test('12 Deep reload',async()=>{await page.reload();await page.locator('[data-question-id="FP-0239"]').waitFor()});
 await test('13 Back and forward',async()=>{await page.evaluate(()=>location.hash='question/N-1761');await page.locator('[data-question-id="N-1761"]').waitFor();await page.goBack();await page.locator('[data-question-id="FP-0239"]').waitFor();await page.goForward();await page.locator('[data-question-id="N-1761"]').waitFor()});
 await test('14 OTB translation',async()=>{await route('read/JHN/10/otb');await page.locator('.verse').first().waitFor()});
 await test('15 Luther translation',async()=>{await route('read/JHN/10/l1912');await page.locator('.verse').first().waitFor()});
 for(const id of ['FP-0120','FP-0147','FP-0151','FP-0239'])await test('Special '+id,async()=>{
  await route('question/'+id);const q=fp.find(q=>q.faithpath_id===id);assert.equal(await page.locator('main h1').textContent(),q.q);assert.deepEqual(await page.locator('.answers button').allTextContents(),q.a);
  const m=await runtime();const l=m.flow.mapping_links.find(l=>l.FP_ID===id);if(id==='FP-0147'){assert.equal(l.Match_Status,'SINNGLEICH');assert.equal(l.N_ID,'N-1536');assert.equal(q.ref,'Johannes 10,11');assert.equal(m.n.find(q=>q.id==='N-1536').ref,'Johannes 10,12')}else{assert.equal(l.N_ID,null);assert.equal(l.Match_Status,'FAITHPATH_ONLY')}
 });
 await test('20 Service worker new build ready',async()=>{await page.waitForFunction(async build=>{const r=await navigator.serviceWorker.getRegistration();if(!r?.active)return false;return new Promise(resolve=>{const ch=new MessageChannel();ch.port1.onmessage=e=>resolve(e.data.ready&&e.data.build===build);setTimeout(()=>resolve(false),1500);r.active.postMessage({type:'STATUS'},[ch.port2])})},BUILD,{timeout:45000});await page.reload();await page.locator('[data-question-id="FP-0239"]').waitFor()});
 await test('21 Offline source question and reload',async()=>{await context.setOffline(true);await page.reload();await page.locator('[data-question-id="FP-0239"]').waitFor();await route('question/N-1761');await page.locator('[data-question-id="N-1761"]').waitFor();await page.reload();await page.locator('[data-question-id="N-1761"]').waitFor()});
 await test('22 Offline Bible in both translations',async()=>{for(const tr of ['otb','l1912']){await route('read/GEN/50/'+tr);await page.locator('.verse').first().waitFor();assert.equal(await page.locator('.verse').count(),26)}await context.setOffline(false)});
 await test('23 New session candidate',async()=>{const c=await browser.newContext();await c.addInitScript(k=>localStorage.setItem(k,'done'),KEYS.onboard);const p=await c.newPage();await p.goto(base+'#question/FP-0147');await p.locator('[data-question-id="FP-0147"]').waitFor();await c.close()});
 await test('24 Missing data controlled error preserves user data',async()=>{const c=await browser.newContext({serviceWorkers:'block'});const seed=empty();seed.journal.push({id:'synthetic-journal',text:'Synthetic retained text',date:'2026-10-01T00:00:00Z',type:'Journal'});await c.addInitScript(({seed,keys})=>{localStorage.setItem(keys.onboard,'done');localStorage.setItem(keys.main,JSON.stringify(seed))},{seed,keys:KEYS});const p=await c.newPage();await p.route('**/nachlese-questions.json',r=>r.fulfill({status:404,contentType:'application/json',body:'{}'}));await p.goto(base);await p.getByRole('heading',{name:'Die App konnte nicht starten.',exact:true}).waitFor();const stored=await p.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEYS.main);assert.equal(stored.journal[0].id,seed.journal[0].id);assert.equal(stored.journal[0].text,seed.journal[0].text);await c.close()});
 await test('25 No fatal console errors',()=>assert.deepEqual(consoleErrors,[]));
 await test('26 No production JSON 404',()=>assert.deepEqual(network404,[]));
 await test('27 No legacy runtime requests',()=>assert.deepEqual(legacy,[]));
}finally{await browser.close()}
const failed=results.filter(r=>r.status==='FAIL');
const pass=name=>results.find(r=>r.name===name)?.status==='PASS';
const report={status:failed.length?'FAIL':'PASS',build_id:BUILD,tests_total:results.length,tests_passed:results.length-failed.length,tests_failed:failed.length,console_errors:consoleErrors,network_404:network404,legacy_release_requests:legacy,
 faithpath_question_runtime_pass:pass('05 FaithPath MC exact four options')&&pass('06 Correct answer and unchanged explanation'),nachlese_runtime_pass:pass('08 Nachlese question and original answer'),chapter_quiz_runtime_pass:pass('10 Chapter quiz remains separate'),deep_link_pass:pass('11 Deep URL'),reload_pass:pass('12 Deep reload'),offline_pass:pass('21 Offline source question and reload')&&pass('22 Offline Bible in both translations'),special_cases_pass:results.filter(r=>r.name.startsWith('Special')).every(r=>r.status==='PASS'),results,requests:[...new Set(requests)],errors:failed};
fs.mkdirSync('data/audit',{recursive:true});fs.writeFileSync('data/audit/runtime-smoke-report.json',JSON.stringify(report,null,2));
if(failed.length)process.exitCode=1;
