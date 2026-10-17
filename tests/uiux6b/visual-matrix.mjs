/** Uninstrumented production-CSP route/viewport audit. Synthetic data only. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {KEYS} from '../../src/store.js';
import {phase3Fixture} from '../phase3-fixtures.mjs';
const base=process.env.QA_URL||'http://127.0.0.1:4506',out=process.env.QA_OUT||'qa-output/uiux6b/visual';fs.mkdirSync(out,{recursive:true});
const routes={today:'today',bible:'bible',reader:'read/JHN/15/otb',paths:'paths',path:'path/personal-path',tree:'tree',journal:'journal',entry:'entry/thought-new',reviews:'reviews',review:'review/review-old',history:'history',journey:'bible-journey',discover:'discover',story:'merged-story/NS-0297',question:'question/N-1595',quiz:'quiz/10082',collection:'chapter-quizzes',topic:'topic/angst',guided:'plan/sorge7',more:'more',settings:'more?section=settings',backup:'more?section=data',marks:'marks',licenses:'licenses',status:'content-status',error:'unbekannt'};
const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']}),results=[],errors=[],contrasts=[];
const themes=['light','atmospheric','paper','night'];
for(const theme of themes){
 const c=await b.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}),data=phase3Fixture('development',theme);data.reading={book:'JHN',chapter:15,translation:'otb'};
 await c.addInitScript(({KEYS,data})=>{if(!localStorage.getItem(KEYS.main))localStorage.setItem(KEYS.main,JSON.stringify(data));localStorage.setItem(KEYS.onboard,'done')},{KEYS,data});const p=await c.newPage();p.setDefaultTimeout(15000);
 p.on('pageerror',e=>errors.push({theme,error:e.message}));p.on('console',m=>{if(m.type()==='error')errors.push({theme,error:m.text()})});p.on('response',r=>{if(r.status()>=400)errors.push({theme,url:r.url(),status:r.status()})});
 async function capture(screen,route,width=390,height=844,font=100){
  try{
   await p.setViewportSize({width,height});await p.goto(base+'/#'+route);await p.locator('#main h1').waitFor();if(route.startsWith('read/'))await p.locator('.verse').last().waitFor();await p.evaluate(font=>{document.documentElement.style.fontSize=font+'%'},font);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(80);
   assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'horizontal overflow');
   assert(await p.locator('#main img').evaluateAll(es=>es.every(e=>e.complete&&e.naturalWidth>0)),'missing image');
   assert(await p.evaluate(()=>[...document.querySelectorAll('link[rel=stylesheet]')].every(e=>e.sheet)),'missing stylesheet');
   const name=`${screen}-${theme}-${width}-${font}`;await p.screenshot({path:out+'/'+name+'.png'});
   if(width===390&&font===100)await p.screenshot({path:out+'/'+name+'-full.png',fullPage:true});
   results.push({screen,route,theme,width,height,font,status:'PASS'});
  }catch(e){results.push({screen,route,theme,width,height,font,status:'FAIL',error:e.stack})}
 }
 for(const[screen,route]of Object.entries(routes))await capture(screen,route);
 for(const [w,h]of[[320,568],[430,932],[1440,900]])for(const name of ['today','reader','journal','path','journey','discover','quiz','backup'])await capture(name,routes[name],w,h);
 for(const name of ['today','reader','journal','path','journey','discover','quiz','backup'])await capture(name,routes[name],320,568,200);
 await capture('editor','journal');await p.locator('[data-action=new-entry]').click();await p.locator('textarea[name=text]').fill('Mein persönlicher Gedanke.\n'.repeat(300));await p.screenshot({path:out+`/editor-long-${theme}.png`});assert.equal(await p.locator('textarea[name=text]').inputValue(),'Mein persönlicher Gedanke.\n'.repeat(300));await p.keyboard.press('Escape');
 await c.close();
}
await b.close();fs.writeFileSync(out+'/results.json',JSON.stringify({results,errors,physicalDeviceGate:'OFFEN; Chromium only'},null,2));console.log(JSON.stringify({cases:results.length,failures:results.filter(x=>x.status==='FAIL'),errors},null,2));process.exitCode=results.some(x=>x.status==='FAIL')||errors.length?1:0;
