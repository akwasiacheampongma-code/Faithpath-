import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {KEYS} from '../src/store.js';
import {AT_TEST_STORAGE_PREFIX as PREFIX} from '../src/at-rounds-feature.js';
import {testServer} from './helpers/at-rounds-browser-support.mjs';
const require=createRequire(import.meta.url),{chromium}=require('playwright');
const roots=[process.env.AT_SW_BASELINE||'qa-output/at-rounds-off',process.env.AT_SW_FIRST||'qa-output/at-rounds-test',process.env.AT_SW_SECOND||'qa-output/at-rounds-test2'];
const builds=roots.map(root=>JSON.parse(fs.readFileSync(path.join(root,'release-integrity.json'))).build);
const out=process.env.AT_ROUNDS_QA_OUT||'qa-output/at-rounds-update';fs.mkdirSync(out,{recursive:true});
const server=await testServer(roots[0]),results=[],errors=[];
let browser;
async function poll(fn){const until=Date.now()+60000;while(Date.now()<until){if(await fn())return;await new Promise(r=>setTimeout(r,100));}throw new Error('SW state timed out');}
async function status(p){return p.evaluate(async()=>{
  const reg=await navigator.serviceWorker.getRegistration();if(!reg?.active)return null;
  return new Promise(resolve=>{const port=new MessageChannel(),timer=setTimeout(()=>resolve(null),1000);port.port1.onmessage=e=>{clearTimeout(timer);resolve(e.data);};reg.active.postMessage({type:'STATUS'},[port.port2]);});
});}
try{
  browser=await chromium.launch({executablePath:process.env.FAITHPATH_CHROMIUM||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  const context=await browser.newContext({viewport:{width:390,height:844}}),p=await context.newPage();p.setDefaultTimeout(20000);p.on('pageerror',e=>errors.push(e.message));
  const legacy={version:4,translation:'l1912',paths:[{id:'old-path',title:'Synthetischer Altweg',steps:[{id:'old-step',text:'Zuhören',done:true}],milestones:[{text:'Ausdrücklich bestätigter Gedanke',date:'2026-11-01'}],reviews:[],links:[]}],journal:[{id:'old-j',text:'Historischer synthetischer Gedanke. '.repeat(1000),date:'2026-11-01'}],highlights:[],reflections:[],quiz:{'10000':{done:'2026-11-01'}},events:[],unknown:{preserve:true}};
  await p.addInitScript(({legacy,KEYS})=>{if(!sessionStorage.getItem('qa.sw.seeded')){localStorage.setItem(KEYS.main,JSON.stringify(legacy));localStorage.setItem(KEYS.onboard,'done');localStorage.setItem(KEYS.draft,JSON.stringify({type:'entry',values:{text:'Synthetischer ungespeicherter Entwurf'}}));sessionStorage.setItem('qa.sw.seeded','1');}},{legacy,KEYS});
  await p.goto(server.url+'#more');await p.locator('main h1').waitFor();
  await p.evaluate(()=>navigator.serviceWorker.ready);await poll(async()=>(await status(p))?.ready);
  const before=await p.evaluate(KEYS=>({main:localStorage.getItem(KEYS.main),draft:localStorage.getItem(KEYS.draft),migration:localStorage.getItem(KEYS.migration)}),KEYS);
  assert.equal(JSON.parse(before.main).version,5);assert.deepEqual(JSON.parse(before.migration).raw,JSON.stringify(legacy));
  results.push({check:'real V4-to-V5 migration and original recovery snapshot',status:'PASS'});
  async function upgrade(index){
    server.setRoot(roots[index]);
    await p.evaluate(async()=>{const reg=await navigator.serviceWorker.getRegistration();await reg.update();});
    await p.getByRole('button',{name:'Jetzt aktualisieren',exact:true}).waitFor({timeout:60000});
    await Promise.all([p.waitForEvent('load'),p.getByRole('button',{name:'Jetzt aktualisieren',exact:true}).click()]);
    await poll(async()=>(await status(p))?.build===builds[index]);await p.locator('main h1').waitFor();
    assert(await p.evaluate(build=>document.querySelector('script[type="module"]').src.includes('/'+build+'/'),builds[index]));
  }
  await upgrade(1);
  assert.deepEqual(await p.evaluate(KEYS=>({main:localStorage.getItem(KEYS.main),draft:localStorage.getItem(KEYS.draft),migration:localStorage.getItem(KEYS.migration)}),KEYS),before);
  results.push({check:'feature-off baseline to TEST1 on same origin, personal data/draft preserved',status:'PASS',from:builds[0],to:builds[1]});
  await p.goto(server.url+'#chapter-quizzes/1KI/8');await p.locator('.quiz-title').waitFor();await p.locator('.answer').first().click();await p.locator('.explanation').waitFor();
  await context.setOffline(true);await p.reload();await p.locator('.quiz-title').waitFor();assert.equal(await p.locator('.answer.correct').count(),1);
  await p.getByRole('button',{name:'Nächste Frage',exact:true}).click();
  assert.equal(await p.locator('.quiz-title').getAttribute('data-question-id'),'1271-Q5');
  await p.screenshot({path:path.join(out,'offline-resume.png')});
  results.push({check:'real SW offline reload, answer and cursor persist',status:'PASS'});
  await context.setOffline(false);
  const progress=await p.evaluate(key=>sessionStorage.getItem(key),PREFIX+KEYS.main);
  await upgrade(2);await p.locator('.quiz-title').waitFor();
  assert.equal(await p.locator('.quiz-title').getAttribute('data-question-id'),'1271-Q5');
  assert.equal(await p.evaluate(key=>sessionStorage.getItem(key),PREFIX+KEYS.main),progress);
  assert.deepEqual(await p.evaluate(KEYS=>({main:localStorage.getItem(KEYS.main),draft:localStorage.getItem(KEYS.draft),migration:localStorage.getItem(KEYS.migration)}),KEYS),before);
  await context.setOffline(true);await p.reload();await p.locator('.quiz-title').waitFor();
  results.push({check:'real TEST1-to-TEST2 update and subsequent offline reload preserve all test/personal state',status:'PASS',from:builds[1],to:builds[2]});
  await context.setOffline(false);
  for(const tr of ['otb','l1912']){
    await p.goto(server.url+`#read/2KI/15/${tr}`);await p.locator('#verses').waitFor();
    await context.setOffline(true);await p.reload();await p.locator('#verses').waitFor();assert.equal(await p.locator('.verse').count(),38);
    await context.setOffline(false);
  }
  results.push({check:'both offline Bible translations after update',status:'PASS'});
  await context.close();
}catch(e){results.push({check:'run',status:'FAIL',error:e.stack});throw e;}
finally{await browser?.close();await server.close();fs.writeFileSync(path.join(out,'offline-update-results.json'),JSON.stringify({browser:'Chromium/Linux',real_iphone:'OPEN',results,page_errors:errors},null,2));}
assert.deepEqual(errors,[]);console.log(JSON.stringify(results));
