import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {empty,KEYS} from '../src/store.js';
import {coreFixture} from './core-depth-fixture.mjs';
import {createRequire} from 'node:module';
const axe=fs.readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'),'utf8');
const base=process.env.FAITHPATH_QA_URL||'http://127.0.0.1:4240';
const out=process.env.FAITHPATH_QA_OUT||'qa-output/final-product-fix/product';
const baseline=process.env.QA_BASELINE==='1';
fs.mkdirSync(out,{recursive:true});
const flow=JSON.parse(fs.readFileSync('data/faithpath-nachlese-story-flow.json'));
const units=JSON.parse(fs.readFileSync('data/stories.json'));
const seed=coreFixture();
seed.journal.unshift({id:'legacy-ref',type:'Bibel',subtype:'Gedanken',text:'Dieser ältere Gedanke gehört ausdrücklich zu dieser Stelle.',date:'2026-10-02T12:00:00.000Z',ref:{book:'JHN',chapter:3,from:1,to:1,translation:'otb'},pathIds:['core-path']});
seed.journal.push({id:'other-ref',type:'Bibel',text:'Eine andere Stelle.',date:'2026-09-20T12:00:00.000Z',ref:{book:'JHN',chapter:3,from:10,to:12,translation:'otb'},pathIds:[]});
seed.journal.push({id:'range-ref',type:'Bibel',text:'Eine zusammenhängende Stelle.',date:'2026-09-19T12:00:00.000Z',ref:{book:'ROM',chapter:12,from:12,to:14,label:'Römer 12,12–14'},pathIds:[]});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox',...(process.env.FAITHPATH_PROXY_SPKI?['--ignore-certificate-errors-spki-list='+process.env.FAITHPATH_PROXY_SPKI]:[])]});
const results=[],errors=[],consoleErrors=[],loads=[],shots=[],metrics={};
async function check(name,fn){try{await fn();results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',error:e.message});}}
async function context(data=seed,width=390,height=844,text=100,sw='block'){
 const c=await browser.newContext({viewport:{width,height},serviceWorkers:sw});
 await c.addInitScript(({data,KEYS,text})=>{if(!localStorage.getItem(KEYS.main)){localStorage.setItem(KEYS.main,JSON.stringify(data));localStorage.setItem(KEYS.onboard,'done');}document.addEventListener('DOMContentLoaded',()=>document.documentElement.style.fontSize=text+'%');},{data,KEYS,text});
 const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text());});p.on('response',r=>{if(r.status()>=400)loads.push({url:r.url(),status:r.status()});});return{c,p};
}
async function route(p,r){await p.goto(base+'/#'+r,{waitUntil:'networkidle'});await p.locator('#main h1').waitFor();const warning=p.locator('.toast.error.visible').filter({hasText:'Offline-Vorbereitung konnte nicht abgeschlossen'});if(await warning.count())await warning.getByRole('button',{name:'Meldung schließen',exact:true}).click();if(r.startsWith('read/'))await p.locator('.verse').first().waitFor();}
async function shot(p,name){const f=path.join(out,name+'.png');await p.screenshot({path:f,fullPage:false});shots.push(f);}
async function search(p,q){const details=p.locator('.journal-tools details').first();if(await details.getAttribute('open')===null)await details.locator('summary').click();await p.locator('#journal-search').fill(q);await p.waitForTimeout(80);}
try{
 const{c,p}=await context();
 await check('one canonical story collection visible, all 436 reachable and chapter quizzes separate',async()=>{
  await route(p,'discover');await p.locator('#story-kind').selectOption('geschichte');
  assert.equal(await p.locator('#story-results a[href^="#merged-story/"]').count(),436);
  assert.equal(await p.locator('#story-results a[href^="#story/"]').count(),0);
  assert.equal(await p.locator('.story-catalog').count(),0);
  await p.locator('#story-kind').selectOption('kapitel');assert.equal(await p.locator('#story-results a[href^="#story/"]').count(),260);
 });
 await check('legacy reference search, aliases, case, ranges and numeric boundaries',async()=>{
  await route(p,'journal');
  for(const q of['Johannes 3,1','Joh 3,1','JHN 3,1','JOHANNES 3,1']){await search(p,q);assert.equal(await p.locator('#journal-results a[href="#entry/legacy-ref"]').count(),1,q);assert.equal(await p.locator('#journal-results a[href="#entry/other-ref"]').count(),0,q);}
  for(const q of['Johannes','Johannes 3']){await search(p,q);assert.equal(await p.locator('#journal-results a[href="#entry/legacy-ref"]').count(),1,q);}
  await search(p,'Römer 12,12-14');assert.equal(await p.locator('#journal-results a[href="#entry/range-ref"]').count(),1);
  await search(p,'Johannes 4,1');assert.equal(await p.locator('.journal-page-entry').count(),0);
  await p.reload({waitUntil:'networkidle'});await search(p,'Johannes 3,1');assert.equal(await p.locator('#journal-results a[href="#entry/legacy-ref"]').count(),1);
 });
 await check('pure N, mixed retained FP, and FP-only questions use complete canonical count and source semantics',async()=>{
  for(const sid of['NS-0001','NS-0113','FP-STORY-0391']){
   const story=flow.stories.find(x=>x.story_id===sid);
   await route(p,'merged-story/'+sid);assert.equal(await p.locator('[data-story-id] a[href^="#question/"]').count(),story.flow_items.length);
   for(let i=0;i<story.flow_items.length;i++){
    const id=story.flow_items[i].primary_question_id;await route(p,'question/'+id);
    assert((await p.locator('#main').innerText()).includes(`Frage ${i+1} von ${story.flow_items.length}`));
    if(id.startsWith('N-')){assert.equal(await p.locator('.answers').count(),0);await p.getByText('Antwort ansehen',{exact:true}).click();assert((await p.locator('[data-n-answer]').innerText()).length>0);}
    else{const q=units.flatMap(x=>x.questions).find(q=>q.faithpath_id===id);assert.equal(await p.locator('[data-action="source-answer"]').count(),4);assert(await p.locator('.answer').first().evaluate(el=>parseFloat(getComputedStyle(el.lastElementChild).fontSize)>=parseFloat(getComputedStyle(el).fontSize)));await p.locator(`[data-action="source-answer"][data-answer="${q.c}"]`).focus();await p.keyboard.press('Enter');assert.equal(await p.locator('.answer.correct').count(),1);assert((await p.locator('.explanation').innerText()).includes(q.x));assert(await p.locator('.explanation').evaluate(el=>el===document.activeElement));}
    const next=i<story.flow_items.length-1?story.flow_items[i+1].primary_question_id:null;
    if(next)assert.equal(await p.locator(`a[href="#question/${next}"]`).count(),1);
   }
  }
 });
 await check('old story route enters exact canonical mapped flow; old chapter remains unchanged',async()=>{await route(p,'story/1');const mapped=flow.mapping_links.find(x=>x.FP_ID==='FP-0001').Story_ID;assert.equal(await p.locator(`[data-story-id="${mapped}"]`).count(),1);await route(p,'quiz/10000');assert.equal(await p.locator('.answers button').count(),4);});
 await check('incorrect FP answer reveals existing correct answer and explanation',async()=>{const q=units.flatMap(x=>x.questions).find(q=>q.faithpath_id==='FP-0029');await route(p,'question/FP-0029');await p.locator(`[data-action="source-answer"][data-answer="${(q.c+1)%4}"]`).click();assert.equal(await p.locator('.answer.selected-wrong').count(),1);assert.equal(await p.locator('.answer.correct').count(),1);assert((await p.locator('.answer.correct').innerText()).includes(q.a[q.c]));assert((await p.locator('.explanation').innerText()).includes(q.x));});
 await check('one current step, remaining open steps visible and subordinate',async()=>{await route(p,'path/core-path');assert.equal(await p.locator('.next-step .path-step').count(),1);assert.equal(await p.locator('.further-steps .path-step').count(),1);assert((await p.locator('.current-path-step').innerText()).includes(seed.paths[0].steps[0].text));assert((await p.locator('.further-steps').innerText()).includes(seed.paths[0].steps[1].text));});
 await check('history exposes exact Bible and path links without changing review pair',async()=>{await route(p,'history');assert(await p.locator('.timeline .story-connections a[href^="#read/JHN/3"]').count()>0);assert(await p.locator('.timeline .story-connections a[href="#path/core-path"]').count()>0);assert((await p.locator('.continuity-pair').first().innerText()).includes(seed.journal.find(j=>j.id==='thought-old').text));});
 await check('backup copy explains device locality, manual backup and replacement',async()=>{await route(p,'more?section=data');const text=await p.locator('#main').innerText();assert(text.includes('auf diesem Gerät'));assert(text.includes('keine automatische'));assert(text.includes('ersetzt'));});
 for(const[r,n]of[['journal','01-journal-390'],['read/JHN/3/otb','04-reader-390'],['path/core-path','06-path-steps'],['history','07-history'],['reviews','08-damals-heute'],['plans','10-guides'],['more?section=data','11-backup'],['merged-story/NS-0113','12-merged-story'],['question/N-0001','13-nachlese'],['question/FP-0029','14-mixed-question']]){await route(p,r);if(r==='journal'){await search(p,'');await p.locator('.journal-tools details[open] summary').first().click();}await shot(p,n);if(r==='journal')metrics.journalFirstEntry=(await p.locator('.journal-page-entry').first().boundingBox())?.y;if(r.startsWith('read/'))metrics.readerFirstVerse=(await p.locator('.verse').first().boundingBox())?.y;}
 await c.close();
 const fresh=await context(empty());
 await check('fresh beginner guide early, existing guide; returning personal priority preserved',async()=>{await route(fresh.p,'today');const a=fresh.p.locator('.beginner-entry a');assert.equal(await a.count(),1);await a.click();assert(fresh.p.url().includes('#guide/'));const ret=await context();await route(ret.p,'today');assert.equal(await ret.p.locator('.beginner-entry').count(),0);assert.equal(await ret.p.locator('.personal-path').count(),1);await ret.c.close();});
 if(!baseline)await check('beginner onboarding to existing beginner guide, Bible and first saved thought',async()=>{
  const newcomer=await context(empty());const p=newcomer.p;await route(p,'today');await p.evaluate(KEYS=>localStorage.removeItem(KEYS.onboard),KEYS);await p.reload({waitUntil:'networkidle'});
  await p.getByRole('button',{name:'Weiter',exact:true}).click();await p.getByRole('button',{name:'Weiter',exact:true}).click();await p.getByRole('button',{name:'Meinen Anfang finden',exact:true}).click();
  await p.locator('.beginner-entry a[href="#guide/start"]').click();await p.locator('a[href^="#read/"]').first().click();await p.locator('.verse').first().waitFor();await p.locator('.reader-reflection-entry button').click();
  await p.getByLabel('Dein Gedanke',{exact:true}).fill('Mein erster Gedanke: Ich darf mit meinen Fragen anfangen.');await p.getByRole('button',{name:'Gedanken speichern',exact:true}).click();
  assert(await p.evaluate(KEYS=>JSON.parse(localStorage.getItem(KEYS.main)).journal.some(j=>j.text==='Mein erster Gedanke: Ich darf mit meinen Fragen anfangen.'),KEYS));
  if(await p.getByRole('button',{name:'Für jetzt reicht der Gedanke',exact:true}).count())await p.getByRole('button',{name:'Für jetzt reicht der Gedanke',exact:true}).click();await newcomer.c.close();
 });
 await route(fresh.p,'today');await shot(fresh.p,'09-first-start');await route(fresh.p,'plans');await shot(fresh.p,'10-first-guides');await fresh.c.close();
 for(const[w,h,t]of[[320,568,100],[320,568,200],[390,844,200],[768,1024,100],[1440,1000,100]]){
  const{c,p}=await context(seed,w,h,t);
  await check(`responsive ${w} @${t}% and natural heading`,async()=>{
   for(const[r,n]of[['journal','journal'],['read/JHN/3/otb','reader'],['path/core-path','path'],['history','history'],['merged-story/NS-0113','story'],['question/N-0001','flow']]){await route(p,r);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),r);await shot(p,`${w}-${t}-${n}`);}
   if(w===320&&t===200){await route(p,'journal');const geometry=await p.locator('.heading-with-action').evaluate(el=>{const h=el.querySelector('h1'),a=el.querySelector('button'),r=document.createRange();r.setStart(h.firstChild,0);r.setEnd(h.firstChild,10);return{wordRects:[...r.getClientRects()].map(x=>({x:x.x,y:x.y,w:x.width})),h:h.getBoundingClientRect().toJSON(),a:a.getBoundingClientRect().toJSON()};});assert.equal(geometry.wordRects.length,1,'Festhalten must remain one natural word');}
  });await c.close();
 }
 if(!baseline){
  const heavy=structuredClone(seed);for(let i=0;i<100;i++)heavy.journal.push({id:'heavy-'+i,text:'Persönlicher Gedanke '+i,date:'2026-08-01T12:00:00Z',type:'Journal',subtype:'Gedanken',pathIds:[]});
  const writer=await context(heavy);await check('heavy writer finds legacy linked thought, review and backup among 105 entries',async()=>{const p=writer.p;await route(p,'journal');assert.equal(await p.locator('.journal-page-entry').count(),40);await search(p,'Johannes 3,1');await p.locator('a[href="#entry/legacy-ref"]').click();await p.locator('.entry-connections a[href="#path/core-path"]').click();await p.locator('.current-path-step').waitFor();assert.equal(await p.locator('.current-path-step').count(),1);await route(p,'history');await p.locator('.continuity-pair').first().getByRole('link',{name:'Rückblick öffnen',exact:true}).click();assert(p.url().includes('#review/'));await route(p,'more?section=data');assert((await p.locator('#main').innerText()).includes('keine automatische Gerätesynchronisation'));});await writer.c.close();
  for(const[w,h,t]of[[320,568,200],[390,844,100]]){const{c,p}=await context(seed,w,h,t);await check(`merged content axe and keyboard ${w} @${t}%`,async()=>{for(const r of['discover','merged-story/NS-0113','question/N-0001','question/FP-0056']){await route(p,r);await p.evaluate(axe);const a=await p.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}));assert.deepEqual(a.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})),[]);}await route(p,'question/N-0001');await p.locator('.source-answer summary').focus();await p.keyboard.press('Enter');assert.equal(await p.locator('.source-answer').getAttribute('open'),'');await p.keyboard.press('Tab');assert(await p.locator('.question-flow-nav a').first().evaluate(el=>el===document.activeElement));await p.keyboard.press('Enter');await p.waitForURL('**/#question/N-0002');await p.locator('[data-question-id="N-0002"]').waitFor({state:'attached'});assert(p.url().includes('#question/N-0002'));});await c.close();}
  const{c,p}=await context(seed,390,844,100,'allow');await check('offline reload search and canonical N/FP story flows and backup',async()=>{await route(p,'more?section=settings');await p.locator('#offline-state').filter({hasText:'Beide Bibeln und die App sind für dieses Gerät offline bereit.'}).waitFor({timeout:90000});await c.setOffline(true);await p.reload({waitUntil:'networkidle'});await route(p,'journal');await search(p,'Johannes 3,1');assert.equal(await p.locator('a[href="#entry/legacy-ref"]').count(),1);for(const r of['read/JHN/3/otb','merged-story/NS-0113','question/N-0001','question/FP-0056','reviews','more?section=data'])await route(p,r);});await c.close();
 }
}finally{await browser.close();fs.writeFileSync(out+'/results.json',JSON.stringify({base,baseline,results,metrics,shots,errors,consoleErrors,loads},null,2));}
console.log(JSON.stringify({results,metrics,errors,consoleErrors,loads}));
if(!baseline&&(results.some(x=>x.status==='FAIL')||errors.length||consoleErrors.length||loads.length))process.exitCode=1;
