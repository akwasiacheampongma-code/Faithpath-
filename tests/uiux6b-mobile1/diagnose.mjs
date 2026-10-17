/** Read-only layout diagnosis of the immutable pre-polish build. No private data. */
import fs from 'node:fs';
import {chromium} from 'playwright';
import {empty, KEYS} from '../../src/store.js';
const out='qa-output/uiux6b-mobile1/diagnosis';
fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const results=[];
for(const width of [320,390,430,1440]) for(const font of [100,125,150,200]){
 const context=await browser.newContext({viewport:{width,height:width===320?568:844},isMobile:width<700,deviceScaleFactor:1});
 await context.addInitScript(({data,KEYS})=>{localStorage.setItem(KEYS.main,JSON.stringify(data));localStorage.setItem(KEYS.onboard,'done')},{KEYS,data:{...empty(),settings:{theme:'night'}}});
 const page=await context.newPage();
 await page.goto('http://127.0.0.1:4510/#journal');await page.locator('.journal-write').waitFor();await page.evaluate(font=>document.documentElement.style.fontSize=font+'%',font);await page.evaluate(()=>document.fonts.ready);
 const measure=()=>page.evaluate(()=>{
  const pick=selector=>{const el=document.querySelector(selector),s=getComputedStyle(el),r=el.getBoundingClientRect();return {selector,x:r.x,y:r.y,width:r.width,height:r.height,font:s.fontSize,line:s.lineHeight,gap:s.gap,padding:s.padding,margin:s.margin,overflowWrap:s.overflowWrap,minWidth:s.minWidth,whiteSpace:s.whiteSpace,flex:s.flex,display:s.display}};
  const mark=document.querySelector('.wordmark'),t=[...mark.childNodes].find(n=>n.nodeType===3&&n.textContent.includes('FaithPath'));
  const range=document.createRange();range.selectNodeContents(t);const rects=[...range.getClientRects()].map(r=>({x:r.x,y:r.y,width:r.width,height:r.height}));
  return {viewport:innerWidth,client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,visual:visualViewport?.width,scale:visualViewport?.scale,autosizing:getComputedStyle(document.documentElement).webkitTextSizeAdjust,loaded:document.fonts.check('16px DM'),brandRects:rects,elements:['.topbar','.wordmark','.brand-dot','.top-right','.journal-page','.page-heading','.page-heading h1','.page-heading p','.journal-write','.journal-result-count','.journal-empty-note','.page-footer','.primary-nav'].map(pick)};
 });
 const original=await measure();
 await page.screenshot({path:`${out}/journal-before-night-${width}-${font}.png`});
 // Test one hypothesis at a time, reset after each measurement.
 await page.locator('.wordmark').evaluate(el=>el.style.whiteSpace='nowrap');const nowrap=await measure();await page.locator('.wordmark').evaluate(el=>el.style.whiteSpace='');
 await page.locator('.wordmark').evaluate(el=>el.style.minWidth='max-content');const minContent=await measure();
 results.push({width,font,original,nowrap,minContent});await context.close();
}
await browser.close();fs.writeFileSync(out+'/layout.json',JSON.stringify(results,null,2));
console.log(JSON.stringify(results.map(r=>({width:r.width,font:r.font,brandLines:r.original.brandRects.length,brandFont:r.original.elements[1].font,header:r.original.elements[0].height,title:r.original.elements[6].height,titleFont:r.original.elements[6].font,composeTop:r.original.elements[8].y,emptyTop:r.original.elements[10].y,nowrapLines:r.nowrap.brandRects.length,nowrapOverflow:r.nowrap.scroll>r.width})),null,2));
