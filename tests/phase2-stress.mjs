// Text zoom, synthetic safe areas and a shortened viewport; no claim of real iOS keyboard QA.
import fs from 'node:fs';import assert from 'node:assert/strict';import {chromium} from 'playwright';import {KEYS} from '../src/store.js';import {phase2Fixture,sampleStory} from './phase2-fixtures.mjs';
const base=process.env.QA_URL||'http://127.0.0.1:4383',out='qa-output/uiux-phase2/stress',results=[],errors=[];fs.mkdirSync(out,{recursive:true});
const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const check=async(name,fn)=>{try{await fn();results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',error:e.stack});}console.log(results.at(-1).status,name);};
try{for(const width of [320,390])for(const theme of ['light','atmospheric','paper','night']){
 const c=await b.newContext({viewport:{width,height:width===320?568:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
 await c.addInitScript(({data,KEYS})=>{if(!localStorage.getItem(KEYS.main)){localStorage.setItem(KEYS.main,JSON.stringify(data));localStorage.setItem(KEYS.onboard,'done');}document.addEventListener('DOMContentLoaded',()=>{document.documentElement.style.fontSize='200%';document.documentElement.style.setProperty('--safe-top','44px');document.documentElement.style.setProperty('--safe-bottom','34px');});},{data:phase2Fixture(theme),KEYS});
 const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));
 for(const [name,route]of [['reader','read/JHN/3/otb'],['story','merged-story/'+sampleStory.story_id],['question','question/N-0005'],['sword','bible-journey']])await check(`${name} / ${theme} / ${width} / 200% + safe areas`,async()=>{
  await p.goto(base+'/#'+route);await p.locator('#main h1').waitFor();assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Horizontal overflow');
  if(name==='sword'){const s=p.locator('.journey-sword');assert((await s.boundingBox()).width<=width);await p.locator('[data-action="sword-info"]').click();const close=p.locator('dialog [data-action="close"]').first();await close.scrollIntoViewIfNeeded();await close.click();}
  if(name==='question'){await p.locator('.answer').last().click();await p.locator('.story-reflection').scrollIntoViewIfNeeded();assert(await p.locator('.story-reflection [data-action="reflect-story"]').isVisible());}
  await p.screenshot({path:`${out}/${name}-${theme}-${width}.png`});
 });
 await check(`Reflection editor in shortened viewport / ${theme} / ${width}`,async()=>{
  await p.goto(base+'/#merged-story/'+sampleStory.story_id);await p.locator('[data-action="reflect-story"]').click();await p.setViewportSize({width,height:420});
  const text=p.getByLabel('Dein Gedanke',{exact:true});await text.fill('Ein synthetischer Tastaturtest.');const submit=p.locator('#editor-form button[type=submit]');await submit.scrollIntoViewIfNeeded();assert(await submit.isVisible());await submit.click();await p.waitForFunction(k=>JSON.parse(localStorage.getItem(k)).journal.some(j=>j.text==='Ein synthetischer Tastaturtest.'),KEYS.main);
 });await c.close();
}}finally{await b.close();fs.writeFileSync(out+'/results.json',JSON.stringify({results,errors,realKeyboardGate:'OFFEN',syntheticDataOnly:true},null,2));}if(errors.length||results.some(r=>r.status==='FAIL'))process.exitCode=1;
