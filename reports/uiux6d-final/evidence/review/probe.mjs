import fs from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {KEYS} from '../../../src/store.js';
import {phase3Fixture} from '../../../tests/phase3-fixtures.mjs';
const out=new URL('./',import.meta.url),results=[];
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
try {
 for(const width of [320,390])for(const scale of [100,200])for(const fallback of [false,true]){
  const context=await browser.newContext({viewport:{width,height:width===320?568:844},isMobile:true,reducedMotion:'reduce',serviceWorkers:'block'});
  if(fallback)await context.route(/\.(woff2?|ttf)(\?|$)/,route=>route.abort());
  await context.addInitScript(({KEYS,data})=>{localStorage.setItem(KEYS.onboard,'done');localStorage.setItem(KEYS.main,JSON.stringify(data))},{KEYS,data:phase3Fixture('tree-6','light')});
  const page=await context.newPage();
  async function measure(port){
   await page.goto(`http://127.0.0.1:${port}/#tree`);await page.locator('#main h1').waitFor();
   await page.evaluate(scale=>document.documentElement.style.fontSize=scale+'%',scale);await page.evaluate(()=>document.fonts.ready);
   return page.evaluate(()=>{
    const heading=document.querySelector('#main h1'),lines=[];
    for(let i=0;i<heading.firstChild.length;i++){
     const range=document.createRange();range.setStart(heading.firstChild,i);range.setEnd(heading.firstChild,i+1);
     const rect=[...range.getClientRects()].filter(r=>r.width>0.01).at(-1)||range.getBoundingClientRect();
     let line=lines.find(x=>Math.abs(x.top-rect.top)<1);if(!line){line={top:rect.top,text:'',left:rect.left,right:rect.right};lines.push(line)}
     line.text+=heading.firstChild.data[i];line.left=Math.min(line.left,rect.left);line.right=Math.max(line.right,rect.right);
    }
    const style=selector=>{const node=document.querySelector(selector),cs=getComputedStyle(node);return {fontSize:cs.fontSize,lineHeight:cs.lineHeight,marginTop:cs.marginTop,marginBottom:cs.marginBottom,fontFamily:cs.fontFamily}};
    return {title:style('#main h1'),current:style('.tree-stage-current-meaning'),personal:style('.tree-personal-meaning'),lines,scrollWidth:document.documentElement.scrollWidth,selectorMatches:['.tree-page > #main > .tree-stage-current-meaning','.tree-page > #main > .tree-personal-meaning'].map(s=>document.querySelectorAll(s).length),fontLoaded:document.fonts.check('16px Newsreader'),titleText:heading.textContent};
   });
  }
  const before=await measure(4540),after=await measure(4542),storageBefore=await page.evaluate(()=>JSON.stringify(localStorage));
  assert.equal(after.title.fontSize,before.title.fontSize);
  assert.deepEqual(after.selectorMatches,[1,1]);assert.equal(after.scrollWidth,width);
  assert(Math.abs(parseFloat(after.current.fontSize)-16*scale/100*.95)<.01);
  assert(Math.abs(parseFloat(after.current.lineHeight)-16*scale/100*.95*1.65)<.01);
  assert.equal(after.current.marginBottom,'10px');assert.equal(after.personal.marginBottom,'20px');
  assert(Math.abs(parseFloat(after.personal.lineHeight)-parseFloat(after.personal.fontSize)*1.65)<.01);
  assert.equal(after.titleText.replaceAll('\u00ad',''),'Fruchttragender Olivenbaum');
  for(const line of after.lines){assert(line.left>=0&&line.right<=width);for(const token of line.text.trim().split(/\s+/))assert(['Frucht\u00ad','tragender','Frucht\u00adtragender','Olivenbaum'].includes(token))}
  for(const selector of ['.tree-stage-details','.tree-stage-why']){
   const details=page.locator(selector),summary=details.locator(':scope > summary');await summary.focus();await page.keyboard.press('Enter');assert(await details.evaluate(n=>n.open));await page.keyboard.press('Space');assert.equal(await details.evaluate(n=>n.open),false);
  }
  assert.equal(await page.evaluate(()=>JSON.stringify(localStorage)),storageBefore);
  const cdp=await context.newCDPSession(page),ax=await cdp.send('Accessibility.getFullAXTree');
  const heading=ax.nodes.find(n=>n.role?.value==='heading'&&n.name?.value.replaceAll('\u00ad','')==='Fruchttragender Olivenbaum');assert(heading);assert(heading.properties.some(p=>p.name==='level'&&p.value.value===1));
  await page.locator('#main h1').screenshot({path:new URL(`title-${width}-${scale}-${fallback?'fallback':'native'}.png`,out).pathname});
  results.push({width,scale,fallback,before,after,accessibleHeading:heading.name.value,keyboard:'PASS',storage:'UNCHANGED'});await context.close();
 }
} finally {await browser.close();fs.writeFileSync(new URL('probe-results.json',out),JSON.stringify(results,null,2))}
console.log(JSON.stringify({cases:results.length,status:'PASS'}));
