import fs from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {KEYS} from '../src/store.js';
import {coreFixture} from './core-depth-fixture.mjs';
const base=process.env.QA_URL||'http://127.0.0.1:4332',out=process.env.QA_OUT||'qa-output/nachlese-mc/browser';
fs.mkdirSync(out,{recursive:true});
const corpus=JSON.parse(fs.readFileSync('data/nachlese-questions.json'));
const original=corpus.questions[0];
// Isolated UI fixtures exercise the optional schema independently of editorial data.
corpus.questions[0].a=['Nur den Himmel',original.answer,'Nur die Erde','Nur das Meer'];corpus.questions[0].c=1;
corpus.questions[1].a=['Es werde Wasser!', 'Es werde Land!',original.answer,'Es werde Licht!'];
corpus.questions[1].a[2]='Es werden Sterne!';corpus.questions[1].c=3;
corpus.questions[1].a[3]=corpus.questions[1].answer;
const fallback=corpus.questions.find(q=>q.id==='N-0388');delete fallback.a;delete fallback.c;
const browser=await chromium.launch({executablePath:process.env.FAITHPATH_CHROMIUM||'/usr/bin/chromium',args:['--no-sandbox']});
const results=[],errors=[];
async function check(name,fn){try{await fn();results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',error:e.stack});}}
try{
 for(const [width,height,theme] of [[390,844,'light'],[320,568,'night']]){
  const seed=coreFixture();seed.settings.theme=theme;seed.quiz={'10000':{done:'2026-09-01',keep:'chapter'},'1':{done:'2026-09-01',keep:'story'}};
  const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,serviceWorkers:'block',acceptDownloads:true});
  await context.addInitScript(({seed,KEYS})=>{if(!localStorage.getItem(KEYS.main)){localStorage.setItem(KEYS.main,JSON.stringify(seed));localStorage.setItem(KEYS.onboard,'done');}},{seed,KEYS});
  const page=await context.newPage();page.setDefaultTimeout(12000);page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/nachlese-questions.json',r=>r.fulfill({contentType:'application/json',body:JSON.stringify(corpus)}));
  const route=async hash=>{await page.goto(base+'/#'+hash);await page.locator('#main h1').waitFor();};
  await check(`Nachlese correct/wrong choice, exact answer, safe feedback and progress ${width}`,async()=>{
   await route('question/N-0001');assert.equal(await page.locator('.answers button').count(),4);
   const raw=await page.evaluate(k=>localStorage.getItem(k),KEYS.main);
   assert.equal(await page.locator('[data-answer="1"] span').last().innerText(),original.answer);
   await page.locator('[data-answer="0"]').tap();assert.equal(await page.locator('.answer.selected-wrong').count(),1);assert.equal(await page.locator('.answer.correct').count(),1);
   assert.equal(await page.locator('.explanation p').innerText(),original.answer);assert.equal(await page.locator('.answers button:disabled').count(),4);
   assert.equal(await page.evaluate(k=>localStorage.getItem(k),KEYS.main),raw);
   await page.reload();await page.locator('.answers button').first().waitFor();await page.locator('[data-answer="1"]').tap();assert.equal(await page.locator('.answer.selected-wrong').count(),0);
   assert(await page.locator('.explanation').evaluate(el=>document.activeElement===el));assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   await page.screenshot({path:`${out}/nachlese-choice-${width}.png`});
  });
  await check(`Existing story flow, fallback and FaithPath choice preserved ${width}`,async()=>{
   await route('question/N-0001');await page.getByRole('link',{name:'Nächste Frage',exact:true}).click();await page.waitForURL(/N-0002/);assert.equal(await page.locator('.answers button').count(),4);
   await route('question/N-0388');assert.equal(await page.locator('.answers button').count(),0);await page.locator('.source-answer summary').click();assert.equal(await page.locator('[data-n-answer]').innerText(),fallback.answer);
   await route('question/FP-0001');assert.equal(await page.locator('.answers button').count(),4);
   await route('merged-story/NS-0001');assert((await page.locator('.reflection-invite h2').innerText()).includes('Wo behandelst du die Welt'));
  });
  await check(`Export/import keeps existing chapter/story completions ${width}`,async()=>{
   await route('more?section=data');const download=page.waitForEvent('download');await page.getByRole('button',{name:'Backup exportieren',exact:true}).click();const file=`${out}/synthetic-backup-${width}.json`;await(await download).saveAs(file);
   const exported=JSON.parse(fs.readFileSync(file));assert.deepEqual(exported.data.quiz,seed.quiz);
   await page.locator('#import-file').setInputFiles(file);await page.getByRole('button',{name:'Backup wiederherstellen',exact:true}).click();await page.getByRole('heading',{name:'Daten & Backup',exact:true}).waitFor();
   assert.deepEqual(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).quiz,KEYS.main),seed.quiz);
  });
  await context.close();
 }
}finally{await browser.close();fs.writeFileSync(out+'/results.json',JSON.stringify({base,results,errors,syntheticChoiceFixtures:true},null,2));}
console.log(JSON.stringify({results,errors}));if(results.some(r=>r.status==='FAIL')||errors.length)process.exitCode=1;
