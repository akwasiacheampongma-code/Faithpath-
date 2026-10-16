// Hypothesis probe and permanent regression: entering a reader from a scrolled document.
import fs from 'node:fs';import assert from 'node:assert/strict';import {chromium} from 'playwright';import {KEYS,empty} from '../src/store.js';
const base=process.env.QA_URL||'http://127.0.0.1:4390',out=process.env.QA_OUT||'qa-output/uiux-phase3/short-navigation';fs.mkdirSync(out,{recursive:true});const results=[],errors=[];
const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
try{for(const [width,height]of (process.env.QA_DESKTOP==='1'?[[1440,1000]]:[[320,568],[390,844],[430,932],[768,1024],[1440,1000]]))for(const tr of ['otb','l1912'])for(const from of ['read/JHN/3/'+tr,'discover']){
 const c=await b.newContext({viewport:{width,height},isMobile:true,hasTouch:true,reducedMotion:'reduce'}),p=await c.newPage();const data=empty();await c.addInitScript(({KEYS,data})=>{if(!localStorage.getItem(KEYS.main))localStorage.setItem(KEYS.main,JSON.stringify(data));localStorage.setItem(KEYS.onboard,'done');},{KEYS,data});p.on('pageerror',e=>errors.push(e.message));
 let beforeY=0,measurement;
 try{
  await p.goto(base+'/#more?section=settings');await p.locator('#offline-state').filter({hasText:'Beide Bibeln und die App sind für dieses Gerät offline bereit.'}).waitFor({timeout:90000});
  await p.goto(base+'/#'+from);await p.locator('#main h1').waitFor();await p.evaluate(()=>scrollTo({top:1200,behavior:'instant'}));beforeY=await p.evaluate(()=>scrollY);assert(beforeY>300);
  // Hash navigation retains the old scroll position until the app's render handoff.
  await p.evaluate(tr=>location.hash='read/PSA/117/'+tr,tr);await p.locator('#reader-chapter').filter({visible:true}).waitFor();await p.locator('#reader-book').filter({visible:true}).waitFor();await p.waitForFunction(()=>document.querySelector('#reader-book')?.value==='PSA');await p.waitForTimeout(200);
  measurement=await p.evaluate(k=>({scrollY,end:document.querySelector('#chapter-end-sentinel').getBoundingClientRect().toJSON(),nav:document.querySelector('.primary-nav').getBoundingClientRect().toJSON(),top:document.querySelector('.topbar').getBoundingClientRect().toJSON(),confirmation:!document.querySelector('.short-chapter-confirm').hidden,events:JSON.parse(localStorage.getItem(k)).events.filter(e=>e.kind==='chapter-explored')}),KEYS.main);
  assert.equal(measurement.events.filter(e=>e.ref.book==='PSA').length,0,'Navigation alone must not explore Psalm 117');
  const fits=measurement.end.top>=measurement.top.bottom&&measurement.end.bottom<=measurement.nav.top;
  if(fits||width>=390)assert(measurement.confirmation,'An initially visible short chapter requires confirmation');
  const button=p.locator('[data-action="explore-chapter"]');if(measurement.confirmation)await button.click();else await p.locator('#chapter-end-sentinel').scrollIntoViewIfNeeded();await p.locator('.journey-acknowledgement').waitFor({state:'visible'});
  assert.equal(await p.evaluate(k=>JSON.parse(localStorage.getItem(k)).events.filter(e=>e.kind==='chapter-explored'&&e.ref.book==='PSA').length,KEYS.main),1);
  results.push({width,height,tr,from,beforeY,measurement,status:'PASS'});
 }catch(e){results.push({width,height,tr,from,beforeY,measurement,status:'FAIL',error:e.stack});}await c.close();
}}finally{await b.close();fs.writeFileSync(out+'/results.json',JSON.stringify({base,results,errors},null,2));}console.log(JSON.stringify({cases:results.length,failures:results.filter(x=>x.status==='FAIL')},null,2));if(errors.length||results.some(x=>x.status==='FAIL'))process.exitCode=1;
