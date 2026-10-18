/** Real computed styles and line fragments. Never connects to a live origin. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {KEYS} from '../../src/store.js';
import {stageNames} from '../../src/content.js';
import {TREE_STAGE_MEANINGS} from '../../src/tree-stage-guide.js';
import {phase3Fixture} from '../phase3-fixtures.mjs';

const base=process.env.QA_URL||'http://127.0.0.1:4540';
assert(['127.0.0.1','localhost'].includes(new URL(base).hostname),'Local synthetic QA only');
const out=process.env.QA_OUT||'qa-output/uiux6d-final/red';fs.mkdirSync(out,{recursive:true});
const quick=process.env.QA_QUICK==='1',verify=process.env.QA_VERIFY!=='0';
const stages=process.env.QA_STAGES?process.env.QA_STAGES.split(',').map(Number):quick?[6]:[0,1,2,3,4,5,6];
const modes=quick?[[320,568,200],[390,844,100]]:[[320,568,100],[320,568,200],[390,844,100],[390,844,200]];
const themes=quick?['night']:['light','atmospheric','paper','night'];
const metadata=await(await fetch(base+'/release-integrity.json')).json();
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const results=[],errors=[];
try{
 for(const theme of themes)for(const[width,height,font]of modes){
  const context=await browser.newContext({viewport:{width,height},isMobile:true,reducedMotion:'reduce'});
  await context.addInitScript(({KEYS,font})=>{localStorage.setItem(KEYS.onboard,'done');document.addEventListener('DOMContentLoaded',()=>document.documentElement.style.fontSize=font+'%')},{KEYS,font});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/#today');await page.waitForFunction(()=>!!navigator.serviceWorker.controller,undefined,{timeout:90000});
  for(const stage of stages){
   const data=phase3Fixture('tree-'+stage,theme),name=`stage-${stage+1}-${theme}-${width}-${font}`;
   await page.evaluate(({KEYS,data})=>{localStorage.setItem(KEYS.main,JSON.stringify(data));localStorage.setItem(KEYS.draft,JSON.stringify({type:'entry',args:{id:'thought-new'},values:{text:'Synthetischer unveränderter Entwurf',kind:'Gedanken',pathId:'personal-path'},saved:'2026-10-18'}))},{KEYS,data});
   await page.goto(base+'/#tree');await page.reload();await page.locator('.tree-branch-scene img').evaluate(x=>x.decode());await page.evaluate(()=>document.fonts.ready);
   const snapshot=()=>page.evaluate(KEYS=>Object.fromEntries(Object.entries(KEYS).map(([k,v])=>[k,localStorage.getItem(v)])),KEYS),before=await snapshot();
   const measured=await page.evaluate(()=>{
    const style=selector=>{const e=document.querySelector(selector),s=getComputedStyle(e);return {fontSize:parseFloat(s.fontSize),lineHeight:parseFloat(s.lineHeight),marginBottom:parseFloat(s.marginBottom),parent:e.parentElement.tagName,color:s.color}};
    const h=document.querySelector('#main h1'),node=h.firstChild,lines=[];
    for(let i=0;i<node.length;i++){const r=new Range();r.setStart(node,i);r.setEnd(node,i+1);const rect=[...r.getClientRects()].filter(x=>x.width>.01).at(-1)||r.getBoundingClientRect();const top=rect.top;let line=lines.find(x=>Math.abs(x.top-top)<1);if(!line){line={top,text:''};lines.push(line)}line.text+=node.data[i]}
    return {current:style('.tree-stage-current-meaning'),personal:style('.tree-personal-meaning'),title:style('#main h1'),titleText:h.textContent,lines,rootSize:parseFloat(getComputedStyle(document.documentElement).fontSize),scrollWidth:document.documentElement.scrollWidth};
   });
   const failures=[];const check=(label,fn)=>{try{fn()}catch(e){failures.push({label,error:e.message})}};
   if(verify){
    const root=16*font/100;
    check('computed-current-meaning',()=>{assert.equal(measured.current.parent,'MAIN');assert(Math.abs(measured.current.fontSize-root*.95)<.05);assert(Math.abs(measured.current.lineHeight-root*.95*1.65)<.05);assert.equal(measured.current.marginBottom,10)});
    check('computed-personal-meaning',()=>{assert(Math.abs(measured.personal.lineHeight-measured.personal.fontSize*1.65)<.05);assert.equal(measured.personal.marginBottom,20)});
    check('title-spelling-and-breaks',()=>{assert.equal(measured.titleText.replaceAll('\u00ad',''),stageNames[stage]);assert.equal(measured.rootSize,root);assert(measured.title.fontSize>=(width===320?1.5:1.75)*root-.1,'Title must retain original scaling');for(const line of measured.lines){const text=line.text.trim();for(const fragment of text.split(/\s+/)){if(!fragment)continue;assert(stageNames[stage].split(' ').includes(fragment)||['Frucht\u00ad','tragender','Frucht\u00adtragender'].includes(fragment),'Invalid inside-word break: '+JSON.stringify(fragment))}}});
    check('no-horizontal-overflow',()=>assert(measured.scrollWidth<=width+1));
   }
   assert.equal(await page.locator('.tree-stage-current-meaning').innerText(),TREE_STAGE_MEANINGS[stage].meaning);
   await page.screenshot({path:`${out}/${name}-top.png`});await page.locator('.tree-stage-current-meaning').scrollIntoViewIfNeeded();await page.screenshot({path:`${out}/${name}-meaning.png`});
   for(const selector of ['.tree-stage-details','.tree-stage-why']){
    const details=page.locator(selector),summary=details.locator(':scope > summary');assert.equal(await details.evaluate(x=>x.open),false);await summary.focus();await page.keyboard.press('Enter');assert(await details.evaluate(x=>x.open));
    if(selector==='.tree-stage-details'){
     assert.deepEqual(await page.locator('.tree-stage-card strong').allTextContents(),stageNames);assert.equal(await page.locator('.tree-stage-card[aria-current=step] strong').innerText(),stageNames[stage]);
     await page.screenshot({path:`${out}/${name}-guide.png`,fullPage:true});
    }
    await summary.focus();await page.keyboard.press('Space');assert.equal(await details.evaluate(x=>x.open),false);
   }
   assert.deepEqual(await snapshot(),before,'Tree interaction changed stored personal bytes');
   results.push({name,stage,theme,width,height,font,measured,status:failures.length?'FAIL':verify?'PASS':'CAPTURED',failures});
   fs.writeFileSync(out+'/results.json',JSON.stringify({metadata,results,errors,physicalIOS:'OFFEN'},null,2));
  }
  await context.close();
 }
}finally{await browser.close()}
console.log(JSON.stringify({cases:results.length,failures:results.filter(r=>r.status==='FAIL').map(r=>({name:r.name,failures:r.failures})),errors}));process.exitCode=errors.length||results.some(r=>r.status==='FAIL')?1:0;
