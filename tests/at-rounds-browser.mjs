import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {empty,KEYS} from '../src/store.js';
import {testServer} from './helpers/at-rounds-browser-support.mjs';
const require=createRequire(import.meta.url),{chromium}=require('playwright');
const root=process.env.AT_ROUNDS_TEST_ROOT||'qa-output/at-rounds-test';
const out=process.env.AT_ROUNDS_QA_OUT||'qa-output/at-rounds-browser';
fs.mkdirSync(path.join(out,'screenshots'),{recursive:true});
const fixture=JSON.parse(fs.readFileSync('tests/fixtures/at-rounds.test-only.json'));
const server=await testServer(root),results=[],errors=[],visited=[];
let browser;
const seed=empty();
seed.paths=[{id:'qa-path',title:'Synthetischer Prüfweg',steps:[],milestones:[],reviews:[],links:[]}];
seed.journal=[{id:'qa-journal',text:'Nur synthetische Prüfdaten.',date:'2026-11-09T10:00:00Z'}];
seed.quiz={'10000':{done:'2026-10-01T00:00:00Z',historical:'keep'}};
async function newPage(viewport={width:390,height:844}) {
  const context=await browser.newContext({viewport,deviceScaleFactor:1});
  await context.addInitScript(({seed,keys})=>{
    if(!sessionStorage.getItem('qa.at.seeded')){
      localStorage.setItem(keys.main,JSON.stringify(seed));localStorage.setItem(keys.onboard,'done');
      sessionStorage.setItem('qa.at.seeded','1');
    }
  },{seed,keys:KEYS});
  const page=await context.newPage();page.setDefaultTimeout(12000);
  page.on('pageerror',error=>errors.push(error.message));
  return {context,page};
}
async function visit(page,route) {
  await page.goto(server.url+'#'+route);
  await page.locator('main h1').waitFor();
}
async function question(page,id) {
  await page.locator('.quiz-title').waitFor();
  assert.equal(await page.locator('.quiz-title').getAttribute('data-question-id'),id);
  assert.equal(await page.locator('.answers .answer').count(),4);
}
async function finishRound(page,book,round) {
  const spec=fixture.chapters[book].variants.find(v=>v.id===round);
  for(const [index,q] of spec.questions.entries()) {
    await question(page,q.id);visited.push(q.id);
    const choice=index%2===0?q.correctIndex:(q.correctIndex+1)%4;
    await page.locator('.answers .answer').nth(choice).click();
    await page.locator('.explanation').waitFor();
    assert((await page.locator('.answer.correct').innerText()).includes(q.options[q.correctIndex]));
    assert.equal(await page.locator('.answer.selected-wrong').count(),choice===q.correctIndex?0:1);
    await page.getByRole('button',{name:index===4?'Runde abschließen':'Nächste Frage',exact:true}).click();
  }
  await page.locator('[data-at-round-complete]').waitFor();
}
try {
  browser=await chromium.launch({executablePath:process.env.FAITHPATH_CHROMIUM||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  const {context,page}=await newPage();
  await visit(page,'read/1KI/8/l1912');await page.locator('#verses').waitFor();
  await page.screenshot({path:path.join(out,'screenshots','reader-top-before-or-after.png')});
  await page.locator('.chapter-nav').scrollIntoViewIfNeeded();
  await page.screenshot({path:path.join(out,'screenshots','reader-bottom-before-or-after.png')});
  assert.equal(await page.locator('[data-at-rounds-entry]').count(),1,'The real reader must expose the test chapter rounds');
  results.push({check:'reader-entry',status:'PASS'});
  await page.getByRole('link',{name:'Fragen starten',exact:true}).click();
  await question(page,'1270-Q5');
  await page.screenshot({path:path.join(out,'screenshots','1ki-A-question.png')});
  await page.reload();await question(page,'1270-Q5');
  await finishRound(page,'1KI','A');
  assert.equal(await page.locator('.quiz-title').count(),0,'Completion must not automatically start B');
  await page.screenshot({path:path.join(out,'screenshots','1ki-A-complete-B-offer.png')});
  await page.getByRole('link',{name:'Freiwillige zweite Runde',exact:true}).click();
  await finishRound(page,'1KI','B');
  results.push({check:'1KI8-two-real-app-rounds',status:'PASS'});
  await visit(page,'chapter-quizzes');
  await page.locator('[data-chapter-book="2KI"]').click();
  await page.locator('[data-at-round-chapter="15"]').click();
  await finishRound(page,'2KI','A');
  await page.getByRole('link',{name:'Freiwillige zweite Runde',exact:true}).click();
  await finishRound(page,'2KI','B');
  assert.equal(new Set(visited).size,20);
  assert.equal(visited.length,20);
  const main=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),KEYS.main);
  assert.deepEqual(main.quiz,seed.quiz);assert.deepEqual(main.paths,seed.paths);assert.deepEqual(main.journal,seed.journal);
  results.push({check:'2KI15-two-rounds-and-protected-personal-data',status:'PASS',visited_ids:visited});
  await context.close();
} catch(error) {
  results.push({check:'run',status:'FAIL',error:error.stack});throw error;
} finally {
  await browser?.close();await server.close();
  fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify({browser:'Chromium/Linux',physical_iphone:'OPEN',human_approved:false,production_import_allowed:false,deploy_production:false,results,page_errors:errors},null,2));
}
assert.deepEqual(errors,[]);console.log(JSON.stringify(results));
