import fs from 'node:fs';import assert from 'node:assert/strict';import {createRequire} from 'node:module';import {chromium} from 'playwright';import {KEYS} from '../src/store.js';import {treeLevel} from '../src/domain.js';import {phase3Fixture} from './phase3-fixtures.mjs';
const base=process.env.QA_URL||'http://127.0.0.1:4392',out=process.env.QA_OUT||'qa-output/uiux-phase3/detail';fs.mkdirSync(out,{recursive:true});const results=[],errors=[],axe=fs.readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'),'utf8'),b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const check=async(name,fn)=>{if(process.env.QA_CASE&&!name.includes(process.env.QA_CASE))return;try{await fn();results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',error:e.stack});}console.log(results.at(-1).status,name,results.at(-1).error||'')};
const state=p=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEYS.main);
try{for(const width of (process.env.QA_WIDTH?[Number(process.env.QA_WIDTH)]:[320,390]))for(const theme of (process.env.QA_THEME?[process.env.QA_THEME]:['light','atmospheric','paper','night'])){
 const c=await b.newContext({viewport:{width,height:width===320?568:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'}),p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));await c.addInitScript(({KEYS,data})=>{if(!localStorage.getItem(KEYS.main))localStorage.setItem(KEYS.main,JSON.stringify(data));localStorage.setItem(KEYS.onboard,'done');},{KEYS,data:phase3Fixture('active',theme)});
 const route=async r=>{await p.goto(base+'/#'+r);await p.locator('#main h1').waitFor();};
 await route('path/personal-path');
 await check(`Bibel context and original return / ${theme} / ${width}`,async()=>{
  const href=await p.locator('.path-continuity a').first().getAttribute('href');assert(href.includes('origin=path%2Fpersonal-path'),'Reader must retain the originating personal path');
  await p.locator('.path-continuity a').first().click();await p.locator('.verse').first().waitFor();assert((await p.locator('#reader-book').inputValue())==='JHN');await p.getByRole('link',{name:'Zurück',exact:true}).click();await p.locator('.path-page').waitFor();
 });
 await check(`Steps edit, choose, finish and reopen without growth / ${theme} / ${width}`,async()=>{
  await route('path/personal-path');const level=treeLevel(await state(p));await p.locator('.current-path-step [data-action="edit-step"]').click();await p.getByLabel('Dein Schritt',{exact:true}).fill('Bewusst ausreden lassen.');await p.locator('#editor-form button[type=submit]').click();await p.waitForFunction(k=>JSON.parse(localStorage.getItem(k)).paths[0].steps[0].text==='Bewusst ausreden lassen.',KEYS.main);
  await p.locator('[data-action="step"]').first().click();await p.getByLabel('Dein Schritt',{exact:true}).fill('Eine neue kleine Handlung.');await p.locator('#editor-form button[type=submit]').click();await p.waitForFunction(k=>JSON.parse(localStorage.getItem(k)).paths[0].steps.length===4,KEYS.main);
  await p.locator('[data-action="current-step"][data-id="later-0"]').click();await p.locator('.current-path-step input[data-id="later-0"]').click();await p.waitForFunction(k=>JSON.parse(localStorage.getItem(k)).paths[0].steps.find(s=>s.id==='later-0').done,KEYS.main);assert(await p.evaluate(()=>document.activeElement.closest('.next-step')!==null),'Step completion must hand keyboard focus to the next step');
  await p.locator('.past-steps summary').click();await p.locator('.past-steps [data-id="later-0"]').click();await p.waitForFunction(k=>!JSON.parse(localStorage.getItem(k)).paths[0].steps.find(s=>s.id==='later-0').done,KEYS.main);assert.equal(treeLevel(await state(p)),level);
 });
 await check(`All real thoughts and original reviews remain reachable with pagination / ${theme} / ${width}`,async()=>{
  const data=phase3Fixture('many-thoughts',theme);await p.evaluate(({KEYS,data})=>localStorage.setItem(KEYS.main,JSON.stringify(data)),{KEYS,data});await p.reload();await p.locator('.path-story').waitFor();const before=await state(p);assert.equal(await p.locator('.path-story .timeline li').count(),40);
  let pages=0;while(await p.locator('[data-action="more-history"]').count()){await p.locator('[data-action="more-history"]').click();assert(await p.evaluate(()=>document.activeElement.closest('.path-story')!==null));assert(++pages<5);}
  const links=await p.locator('.path-story a').evaluateAll(xs=>xs.map(x=>x.getAttribute('href')));for(const thought of data.journal)assert(links.includes('#entry/'+thought.id),thought.id);assert.equal(links.filter(x=>x==='#entry/thought-old').length,1);assert(links.includes('#review/review-old'));assert.deepEqual(await state(p),before);
 });
 await check(`Archive/restore, long prose and axe / ${theme} / ${width}`,async()=>{
  const data=phase3Fixture('long',theme);await p.evaluate(({KEYS,data})=>localStorage.setItem(KEYS.main,JSON.stringify(data)),{KEYS,data});await p.reload();await p.locator('.path-page').waitFor();
  await p.locator('.path-purpose summary').click();assert.equal((await p.locator('.path-purpose p').innerText()).trim(),data.paths[0].why.trim());assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await p.locator('.path-options summary').click();await p.locator('[data-action="archive-path"]').click();assert((await state(p)).paths[0].archived);await p.locator('.path-options summary').click();await p.locator('[data-action="archive-path"]').click();assert(!(await state(p)).paths[0].archived);
  await p.evaluate(axe);const r=await p.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}));assert.deepEqual(r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[]);
 });await c.close();
}}finally{await b.close();fs.writeFileSync(out+'/results.json',JSON.stringify({base,results,errors},null,2));}if(errors.length||results.some(x=>x.status==='FAIL'))process.exitCode=1;
