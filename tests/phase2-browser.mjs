import fs from 'node:fs';import assert from 'node:assert/strict';import {createRequire} from 'node:module';import {chromium} from 'playwright';
import {KEYS} from '../src/store.js';import {BUILD} from '../src/version.js';import {phase2Fixture,flow,books,sampleStory} from './phase2-fixtures.mjs';
const base=process.env.QA_URL||'http://127.0.0.1:4383',phase=process.env.PHASE||'C',out=process.env.QA_OUT||'qa-output/uiux-phase2/browser';fs.mkdirSync(out,{recursive:true});
const axe=fs.readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'),'utf8');
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']}),results=[],errors=[],accessibility=[];
async function check(name,fn){try{await fn();results.push({name,status:'PASS'});console.log('PASS',name)}catch(error){results.push({name,status:'FAIL',error:error.stack});console.log('FAIL',name,error.message)}}
const route=async(p,hash)=>{await p.goto(base+'/#'+hash);await p.locator('#main h1').waitFor();if(hash.startsWith('read/'))await p.locator('.verse').first().waitFor();};
const state=p=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEYS.main);
async function bounds(p){assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Horizontal overflow');}
async function audit(p,name){await p.evaluate(axe);const r=await p.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}));accessibility.push({name,violations:r.violations});assert.deepEqual(r.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})),[]);}
try{
 for(const width of [320,390])for(const theme of ['light','atmospheric','paper','night']){
 const c=await browser.newContext({viewport:{width,height:width===320?568:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
 await c.addInitScript(({KEYS,data})=>{if(!localStorage.getItem(KEYS.main)){localStorage.setItem(KEYS.main,JSON.stringify(data));localStorage.setItem(KEYS.onboard,'done');}},{KEYS,data:phase2Fixture(theme)});
 const p=await c.newPage();p.setDefaultTimeout(12000);p.on('pageerror',e=>errors.push(e.message));
 await check(`Reader navigation, voluntary offer, context and keyboard / ${width} / ${theme}`,async()=>{
  await route(p,'read/JHN/3/otb?origin=merged-story%2FNS-0001');const before=await state(p);
  assert.equal(await p.locator('.reader-chapter-questions h2').innerText(),'Was hast du verstanden?');
  assert.equal(await p.locator('.reader-chapter-questions a').count(),1);assert.equal(await p.locator('.verse').count(),36);
  assert.equal(before.events.filter(e=>e.kind==='chapter-explored').length,1,'Long chapter opening must not count as explored');
  const next=p.locator('.chapter-nav a').last();assert((await next.getAttribute('href')).includes('origin=merged-story%2FNS-0001'));await next.click();await p.locator('#reader-chapter').waitFor();assert.equal(await p.locator('#reader-chapter').inputValue(),'4');
  await p.locator('#translation').selectOption('l1912');await p.locator('.verse').first().waitFor();assert.equal(await p.locator('#translation').inputValue(),'l1912');
  await p.locator('#reader-book').selectOption('GEN');await p.locator('.verse').first().waitFor();assert.equal(await p.locator('.reader-chapter-questions').count(),0);
  await p.locator('#reader-chapter').selectOption('2');await p.locator('.verse').first().waitFor();assert.equal(await p.locator('#reader-chapter').inputValue(),'2');
  const v=p.locator('.verse').first();await v.focus();await p.keyboard.press('Enter');assert.equal(await v.getAttribute('aria-pressed'),'true');assert.equal(await p.locator('.selection-bar').count(),1);
  await p.locator('[data-action="clear-selection"]').click();assert.equal(await v.getAttribute('aria-pressed'),'false');await bounds(p);await audit(p,`Reader ${theme} ${width}`);
  const after=await state(p);for(const key of ['journal','reflections','paths','quiz','highlights'])assert.deepEqual(after[key],before[key]);
 });
 if(phase!=='A')await check(`Story sequence, feedback and voluntary reflection / ${width} / ${theme}`,async()=>{
  await route(p,'merged-story/'+sampleStory.story_id);const before=await state(p);
  assert.equal(await p.locator('[data-story-id] a').count(),sampleStory.flow_items.length);
  await p.locator('.actions a').last().click();
  for(let i=0;i<sampleStory.flow_items.length;i++){
   const id=sampleStory.flow_items[i].primary_question_id,q=JSON.parse(fs.readFileSync('data/nachlese-questions.json')).questions.find(q=>q.id===id);
   assert.equal(await p.locator('[data-question-id]').getAttribute('data-question-id'),id);assert.equal(await p.locator('.answers button').count(),4);
   assert.equal(await p.locator('#main h1').innerText(),q.q);
   await p.locator(`[data-answer="${i===0?(q.c+1)%4:q.c}"]`).click();assert.equal(await p.locator('.correct').count(),1);assert.equal(await p.locator('.explanation p').innerText(),q.x||q.answer);
   assert(await p.locator('.explanation').evaluate(el=>document.activeElement===el));
   if(i<sampleStory.flow_items.length-1){assert.equal(await p.locator('.story-reflection').count(),0);await p.getByRole('link',{name:'Nächste Frage',exact:true}).click();}
  }
  assert.equal(await p.locator('.story-reflection').count(),1);assert((await p.locator('.story-reflection').innerText()).includes(sampleStory.reflection));
  await p.locator('.story-reflection [data-action="reflect-story"]').click();await p.getByLabel('Dein Gedanke',{exact:true}).fill('Synthetische Reflexion aus Phase 2');
  await p.locator('#editor-form button[type=submit]').click();
  const after=await state(p);assert(after.journal.some(j=>j.text==='Synthetische Reflexion aus Phase 2'));assert.deepEqual(after.quiz,before.quiz);
  await route(p,'merged-story/'+sampleStory.story_id+'?reflection=1');assert(await p.locator('.reflection-invite').evaluate(el=>el===document.activeElement));await bounds(p);await audit(p,`Story ${theme} ${width}`);
 });
 if(phase==='C')await check(`One global sword, all states and exact Scripture / ${width} / ${theme}`,async()=>{
  for(const n of [0,1,5,300,1189]){
   await p.evaluate(({data,KEYS})=>localStorage.setItem(KEYS.main,JSON.stringify(data)),{data:phase2Fixture(theme,n),KEYS});await p.reload();await route(p,'bible-journey');
   const before=await state(p),sword=p.locator('svg.journey-sword');assert.equal(await sword.count(),1);assert((await sword.getAttribute('aria-label')).includes(`${n} von 1189`));
   assert.equal(await p.locator('.journey-facts dd').first().innerText(),String(n));assert.equal(await p.locator('.sword-count').innerText(),`${n} von 1.189 Kapiteln erkundet`);
   const box=await sword.boundingBox();assert(box.width>0&&box.width<=width);assert.equal(await sword.getAttribute('viewBox'),'0 0 260 292');await bounds(p);
   assert.deepEqual(await state(p),before);
  }
  await audit(p,`Sword ${theme} ${width}`);await p.locator('[data-action="sword-info"]').click();await p.locator('[data-journey-scripture]').last().filter({hasText:'und nehmet den Helm'}).waitFor();
  assert((await p.getByRole('dialog').innerText()).includes('nicht gegen Menschen'));await p.getByRole('dialog').getByRole('button',{name:'Schließen',exact:true}).click();
  await p.locator('.journey-scripture a').first().click();await p.locator('.verse').first().waitFor();assert.equal(await p.locator('#translation').inputValue(),'l1912');assert(p.url().includes('from=17'));assert.equal(await p.locator('.verse[data-v="17"]').innerText(),'17\nund nehmet den Helm des Heils und das Schwert des Geistes, welches ist das Wort Gottes.');
  await route(p,'bible-journey/GEN');assert.equal(await p.locator('svg.journey-sword').count(),0);assert.equal(await p.locator('.journey-chapters li').count(),50);
 });
 await c.close();
 }
}finally{await browser.close();fs.writeFileSync(out+'/results.json',JSON.stringify({build:BUILD,base,phase,results,errors,accessibility,deviceGate:'OFFEN',syntheticDataOnly:true},null,2));}
if(errors.length||results.some(r=>r.status==='FAIL'))process.exitCode=1;
