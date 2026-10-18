/** Actual tree-module screenshots; isolated synthetic storage, never live data. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {KEYS} from '../../src/store.js';
import {phase3Fixture} from '../phase3-fixtures.mjs';

const base=process.env.QA_URL||'http://127.0.0.1:4530';
const out=process.env.QA_OUT||'qa-output/uiux6d/before';
const stages=(process.env.QA_STAGES||'0,6').split(',').map(Number);
const verify=process.env.QA_ASSERT==='1';
const themes=(process.env.QA_THEMES||'light,atmospheric,paper,night').split(',');
const modes=process.env.QA_QUICK==='1'?[[390,844,100]]:[[320,568,100],[320,568,200],[390,844,100],[390,844,200]];
fs.mkdirSync(out,{recursive:true});
const metadata=await (await fetch(base+'/release-integrity.json')).json();
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const results=[],errors=[];
try {
 for(const theme of themes)for(const[width,height,font]of modes){
  const context=await browser.newContext({viewport:{width,height},isMobile:true,reducedMotion:'reduce'});
  await context.addInitScript(({KEYS,font})=>{localStorage.setItem(KEYS.onboard,'done');document.addEventListener('DOMContentLoaded',()=>document.documentElement.style.fontSize=font+'%')},{KEYS,font});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/#today');
  await page.waitForFunction(()=>!!navigator.serviceWorker.controller,undefined,{timeout:90000});
  for(const stage of stages){
   const data=phase3Fixture('tree-'+stage,theme);
   await page.evaluate(({KEYS,data})=>{localStorage.setItem(KEYS.main,JSON.stringify(data));localStorage.removeItem(KEYS.draft)},{KEYS,data});
   await page.goto(base+'/#tree');await page.reload();
   await page.locator('.tree-branch-scene img').evaluate(image=>image.decode());await page.evaluate(()=>document.fonts.ready);
   const name=`stage-${stage+1}-${theme}-${width}-${font}`;
   const geometry=await page.evaluate(()=>({title:document.querySelector('#main h1').getBoundingClientRect().toJSON(),meaning:document.querySelector('.tree-stage-current-meaning').getBoundingClientRect().toJSON(),tree:document.querySelector('.tree-branch-scene').getBoundingClientRect().toJSON(),guide:document.querySelector('.tree-stage-guide').getBoundingClientRect().toJSON(),nav:document.querySelector('.primary-nav').getBoundingClientRect().toJSON(),scrollWidth:document.documentElement.scrollWidth,font:getComputedStyle(document.documentElement).fontSize,currentCardColor:getComputedStyle(document.querySelector('[aria-current=step]')).backgroundColor}));
   const row={name,stage,theme,width,height,font,build:metadata.build,hash:metadata.build_hash,geometry,status:verify?'PASS':'CAPTURED'};
   if(verify)try{
    assert(geometry.meaning.bottom<geometry.tree.top,'Current meaning must precede the tree image');
    assert(geometry.scrollWidth<=width+1,'Horizontal overflow');
    assert.equal(parseFloat(geometry.font),16*font/100);
    if(font===100)assert(geometry.meaning.bottom<=geometry.nav.top,'Current meaning must be readable in the first normal-size viewport');
    assert.equal(await page.locator('.tree-stage-card').count(),7);
    assert.equal(await page.locator('.tree-stage-card[aria-current=step]').count(),1);
   }catch(error){row.status='FAIL';row.error=error.message}
   await page.screenshot({path:`${out}/${name}-top.png`});
   await page.locator('.tree-stage-details > summary').click();
   await page.locator('.tree-stage-guide').scrollIntoViewIfNeeded();
   await page.screenshot({path:`${out}/${name}-guide.png`,fullPage:true});
   await page.locator('.tree-stage-details > summary').click();
   await page.locator('.tree-stage-why > summary').click();
   await page.locator('.tree-stage-why').scrollIntoViewIfNeeded();
   await page.screenshot({path:`${out}/${name}-context.png`});
   results.push(row);
   fs.writeFileSync(out+'/results.json',JSON.stringify({metadata,results,errors,physicalIOS:'OFFEN'},null,2));
  }
  await context.close();
 }
}finally{await browser.close()}
console.log(JSON.stringify({cases:results.length,failures:results.filter(r=>r.status==='FAIL'),errors}));
process.exitCode=errors.length||results.some(r=>r.status==='FAIL')?1:0;
