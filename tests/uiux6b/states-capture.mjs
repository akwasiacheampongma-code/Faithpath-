/** Real secondary states and all original tree stages, only synthetic fixtures. */
import fs from 'node:fs';import assert from 'node:assert/strict';import{chromium}from'playwright';import{KEYS,empty}from'../../src/store.js';import{phase3Fixture}from'../phase3-fixtures.mjs';import{phase2Fixture}from'../phase2-fixtures.mjs';
const base=process.env.QA_URL||'http://127.0.0.1:4506',out=process.env.QA_OUT||'qa-output/uiux6b/final-states';fs.mkdirSync(out,{recursive:true});const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']}),results=[],errors=[];
for(const theme of ['light','atmospheric','paper','night']){
 const c=await b.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});await c.addInitScript(({KEYS,data})=>{if(!sessionStorage.getItem('seed')){localStorage.setItem(KEYS.main,JSON.stringify(data));sessionStorage.setItem('seed','1')}},{KEYS,data:{...empty(),settings:{theme}}});const p=await c.newPage();p.setDefaultTimeout(15000);p.on('pageerror',e=>errors.push(e.message));
 async function shot(name){await p.evaluate(()=>document.fonts.ready);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await p.screenshot({path:out+'/'+name+'-'+theme+'.png'});results.push({name,theme,status:'PASS'})}
 async function state(name,route){const data=phase3Fixture(name,theme);await p.evaluate(({KEYS,data})=>{localStorage.setItem(KEYS.main,JSON.stringify(data));localStorage.setItem(KEYS.onboard,'done');localStorage.removeItem(KEYS.draft)},{KEYS,data});await p.goto(base+'/#'+route);await p.reload();await p.locator('#main h1').waitFor();return data}
 try{
  await p.goto(base+'/#today');await p.locator('.onboarding-intro').waitFor();await shot('onboarding');await p.keyboard.press('Escape');
  await state('empty','journal');await shot('journal-empty');await state('empty','paths');await shot('paths-empty');
  await state('development','today');await p.locator('#menu-toggle').click();await shot('menu');await p.keyboard.press('Escape');
  await state('development','discover');await p.locator('#main input[type=search]').fill('KEIN-TREFFER-20261017');await p.locator('#discovery-count').filter({hasText:'0 Einheiten'}).waitFor();await shot('search-empty');
  await state('archived','paths');await p.getByRole('button',{name:'Archiv',exact:true}).click();await shot('paths-archived');
  await state('development','reviews');await p.locator('.reminder-controls').scrollIntoViewIfNeeded();await shot('reminders');
  await state('development','quiz/10082');await p.locator('.answer[data-answer="1"]').click();await p.locator('.explanation').waitFor();await shot('quiz-feedback');
  const data=await state('development','more?section=data');await p.locator('#import-file').setInputFiles({name:'synthetic.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({app:'FaithPath',data}))});await p.locator('.backup-dialog').waitFor();await shot('backup-preview');await p.locator('[data-action=review-import]').click();await p.locator('[data-action=confirm-import]').waitFor();await shot('backup-confirm');await p.keyboard.press('Escape');
  for(let stage=0;stage<7;stage++){await state('tree-'+stage,'tree');await p.locator('.tree-branch-scene img').evaluate(e=>e.decode());await shot('tree-stage-'+(stage+1))}
  for(const n of [0,1,100,1189]){await p.evaluate(({KEYS,data})=>localStorage.setItem(KEYS.main,JSON.stringify(data)),{KEYS,data:phase2Fixture(theme,n)});await p.goto(base+'/#bible-journey');await p.reload();await p.locator('.journey-sword').waitFor();assert.equal(await p.locator('.sword-count').innerText(),`${n} von 1.189 Kapiteln erkundet`);await shot('journey-'+n)}
 }catch(e){results.push({theme,status:'FAIL',error:e.stack});await p.screenshot({path:out+'/failure-'+theme+'.png'})}finally{await c.close()}
}
await b.close();fs.writeFileSync(out+'/results.json',JSON.stringify({results,errors},null,2));console.log(JSON.stringify({cases:results.length,failures:results.filter(x=>x.status==='FAIL'),errors}));process.exitCode=results.some(x=>x.status==='FAIL')||errors.length?1:0;
