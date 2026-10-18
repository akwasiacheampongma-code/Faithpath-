/** Native disclosures, accessibility and offline rendering with synthetic data. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {chromium} from 'playwright';
import {KEYS} from '../../src/store.js';
import {stageNames} from '../../src/content.js';
import {TREE_STAGE_MEANINGS} from '../../src/tree-stage-guide.js';
import {phase3Fixture} from '../phase3-fixtures.mjs';

const base=process.env.QA_URL||'http://127.0.0.1:4532';
const out=process.env.QA_OUT||'qa-output/uiux6d/acceptance';
fs.mkdirSync(out,{recursive:true});
const axe=fs.readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'),'utf8');
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const results=[],errors=[];
const modes=[[320,568,200],[390,844,100],[430,932,100],[1440,900,100]];
try {
 for(const theme of ['light','atmospheric','paper','night'])for(const[width,height,font]of modes){
  // Axe needs its diagnostic styles. The separate capture suite retains CSP.
  const context=await browser.newContext({bypassCSP:true,viewport:{width,height},isMobile:width<700,reducedMotion:'reduce'});
  const data=phase3Fixture('tree-6',theme),draft=JSON.stringify({type:'entry',args:{id:'thought-new'},values:{text:'Synthetischer ungespeicherter Gedanke',kind:'Gedanken',pathId:'personal-path'},saved:'2026-10-18'});
  await context.addInitScript(({KEYS,data,draft,font})=>{
   if(!sessionStorage.getItem('seed')){localStorage.setItem(KEYS.main,JSON.stringify(data));localStorage.setItem(KEYS.draft,draft);localStorage.setItem(KEYS.onboard,'done');sessionStorage.setItem('seed','yes')}
   document.addEventListener('DOMContentLoaded',()=>document.documentElement.style.fontSize=font+'%');
  },{KEYS,data,draft,font});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  const snapshot=()=>page.evaluate(KEYS=>Object.fromEntries(Object.entries(KEYS).map(([name,key])=>[name,localStorage.getItem(key)])),KEYS);
  const name=`${theme}-${width}-${font}`;
  try {
   await page.goto(base+'/#tree');await page.locator('.tree-branch-scene img').evaluate(img=>img.decode());await page.evaluate(()=>document.fonts.ready);
   const before=await snapshot();
   assert.equal(await page.locator('.tree-stage-current-meaning').innerText(),TREE_STAGE_MEANINGS[6].meaning);
   assert.equal(await page.locator('.tree-stage-details').evaluate(el=>el.open),false);
   assert.equal(await page.locator('.tree-stage-card').first().isVisible(),false);
   for(const selector of ['.tree-stage-details','.tree-stage-why']){
    const summary=page.locator(selector+' > summary');
    await summary.focus();await page.keyboard.press('Enter');assert(await page.locator(selector).evaluate(el=>el.open));
    const size=await summary.boundingBox();assert(size.height>=44&&size.width>=44);
    if(selector==='.tree-stage-details'){
     assert.equal(await page.locator('.tree-stage-card strong').allTextContents().then(x=>JSON.stringify(x)),JSON.stringify(stageNames));
     assert.equal(await page.locator('.tree-stage-card[aria-current=step] strong').innerText(),stageNames[6]);
     const semantics=await page.locator(selector).ariaSnapshot();assert(semantics.includes('listitem'));fs.writeFileSync(`${out}/${name}-accessibility.txt`,semantics);
     assert(await page.locator('.tree-stage-card p').evaluateAll(es=>es.every(el=>el.scrollWidth<=el.clientWidth+1&&el.scrollHeight<=el.clientHeight+1)));
     await page.screenshot({path:`${out}/${name}-keyboard.png`});
    }
    await page.keyboard.press('Space');assert.equal(await page.locator(selector).evaluate(el=>el.open),false);
    assert.equal(await summary.evaluate(el=>el===document.activeElement),true);
   }
   await page.locator('.tree-stage-details > summary').click();await page.locator('.tree-stage-why > summary').click();
   await page.evaluate(axe);
   const audit=await page.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}));
   fs.writeFileSync(`${out}/${name}-axe.json`,JSON.stringify(audit,null,2));
   assert.deepEqual(audit.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})),[]);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   assert.deepEqual(await snapshot(),before,'Explanations changed personal data or a draft');
   if(width===390){
    await page.goto(base+'/#more?section=settings');await page.locator('#offline-state').filter({hasText:'Beide Bibeln und die App sind für dieses Gerät offline bereit.'}).waitFor({timeout:90000});
    await context.setOffline(true);await page.goto(base+'/#tree');await page.reload();await page.locator('.tree-stage-current-meaning').waitFor();
    await page.locator('.tree-stage-details > summary').click();assert.equal(await page.locator('.tree-stage-card').count(),7);
    await page.locator('.tree-stage-why > summary').click();assert.match(await page.locator('.tree-stage-why').innerText(),/Frucht des Geistes/);
    await page.locator('.tree-branch-scene img').evaluate(img=>img.decode());assert.deepEqual(await snapshot(),before);
    await page.screenshot({path:`${out}/${name}-offline.png`});
   }
   results.push({name,theme,width,font,status:'PASS',offline:width===390});
  }catch(error){results.push({name,status:'FAIL',error:error.stack});await page.screenshot({path:`${out}/${name}-failure.png`})}
  await context.close();
 }
}finally{await browser.close()}
fs.writeFileSync(out+'/results.json',JSON.stringify({results,errors,method:'Chromium keyboard/axe; diagnostic CSP bypass here only. Physical VoiceOver and iOS remain open.',physicalIOS:'OFFEN'},null,2));
console.log(JSON.stringify({cases:results.length,failures:results.filter(x=>x.status==='FAIL'),errors}));
process.exitCode=errors.length||results.some(x=>x.status==='FAIL')?1:0;
