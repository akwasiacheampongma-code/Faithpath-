/** Mobile layout inventory on the built app. Synthetic root text zoom != Safari page zoom. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {KEYS} from '../../src/store.js';
import {phase3Fixture} from '../phase3-fixtures.mjs';

const base=process.env.QA_URL||'http://127.0.0.1:4516';
const out=process.env.QA_OUT||'qa-output/uiux6b-mobile1/matrix';
const before=process.env.QA_BEFORE==='1';
const themes=(process.env.QA_THEMES||'light,atmospheric,paper,night').split(',');
const sizes=[[320,568],[390,844],[430,932],[1440,900]];
const routes={today:'today',bible:'bible',reader:'read/PSA/119/otb',luther:'read/PSA/119/l1912',short:'read/PSA/117/otb',journey:'bible-journey',tree:'tree',paths:'paths',path:'path/personal-path',journal:'journal',entry:'entry/thought-new',reviews:'reviews',review:'review/review-old',discover:'discover',story:'merged-story/NS-0297',question:'question/N-1595',quiz:'quiz/10082',more:'more',settings:'more?section=settings',backup:'more?section=data'};
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
fs.mkdirSync(out,{recursive:true});const results=[],errors=[];
const metadata=await (await fetch(base+'/release-integrity.json')).json();
function fixture(theme){const d=phase3Fixture('many',theme);d.reading={book:'JHN',chapter:15,translation:'otb'};d.journal.find(j=>j.id==='thought-new').text='Mein langer, ausschließlich synthetischer Gedanke.\n'.repeat(400);return d;}
for(const theme of themes)for(const[width,height]of sizes)for(const font of [100,150,200]){
 if(before&&!((width===390&&font===100)||(width===320&&font===200)))continue;
 const context=await browser.newContext({viewport:{width,height},isMobile:width<700,reducedMotion:'reduce'});
 await context.addInitScript(({KEYS,data,font})=>{if(!sessionStorage.getItem('seed')){localStorage.setItem(KEYS.main,JSON.stringify(data));localStorage.setItem(KEYS.onboard,'done');sessionStorage.setItem('seed','1')}document.addEventListener('DOMContentLoaded',()=>document.documentElement.style.fontSize=font+'%')},{KEYS,data:fixture(theme),font});
 const page=await context.newPage();page.setDefaultTimeout(20000);
 page.on('pageerror',e=>errors.push({theme,width,font,message:e.message}));
 async function capture(name,route,prepare){
  const row={name,route,theme,width,height,font,build:metadata.build,buildHash:metadata.build_hash};
  try{
   await page.goto(base+'/#'+route);await page.locator('#main h1').waitFor();
   await page.waitForFunction(()=>!!navigator.serviceWorker.controller,{timeout:90000});
   if(route.startsWith('read/'))await page.locator('.verse').last().waitFor();
   await page.evaluate(()=>document.fonts.ready);if(prepare)await prepare();
   row.geometry=await page.evaluate(()=>{
    const rect=e=>e.getBoundingClientRect().toJSON();const nav=document.querySelector('.primary-nav');
    return {viewport:innerWidth,visualViewport:visualViewport?.width,visualScale:visualViewport?.scale,scrollWidth:document.documentElement.scrollWidth,rootFont:getComputedStyle(document.documentElement).fontSize,nav:rect(nav),navLinks:[...nav.children].map(rect),brand:rect(document.querySelector('.wordmark')),header:rect(document.querySelector('.topbar')),mainTitle:rect(document.querySelector('#main h1')),firstVerse:document.querySelector('.verse')?rect(document.querySelector('.verse')):null,firstAnswer:document.querySelector('.answer')?rect(document.querySelector('.answer')):null,fonts:document.fonts.check('16px DM')&&document.fonts.check('20px Newsreader')};
   });
   assert(row.geometry.scrollWidth<=width+1,'Horizontal page overflow');
   assert.equal(row.geometry.viewport,width,'CSS viewport differs from requested viewport');
   assert.equal(parseFloat(row.geometry.rootFont),16*font/100,'Root text enlargement did not apply');
   assert(row.geometry.fonts,'Local fonts unavailable');
   assert(await page.locator('#main img').evaluateAll(es=>es.every(e=>e.complete&&e.naturalWidth>0)),'Missing image');
   for(const r of row.geometry.navLinks){assert(r.width>=44&&r.height>=44,'Navigation touch target <44px');assert(r.left>=-1&&r.right<=width+1,'Navigation outside viewport')}
   if(name==='journal-empty'){assert.equal(await page.locator('[data-journal-id]').count(),0);assert.equal(await page.locator('[data-action=new-entry]').count(),1)}
   if(name==='reader'||name==='luther')assert.equal(await page.locator('.verse').count(),176,'Long chapter verse loss');
   if(!before&&(name==='reader'||name==='luther')&&width===320){
    const line=await page.locator('.verse').first().evaluate(e=>e.getClientRects()[0].toJSON());
    assert(line.bottom<=row.geometry.nav.y+1,'Opening reading line hidden below navigation');
   }
   if(!before&&(name==='settings'||name==='journey')){
    const word=name==='settings'?'Einstellungen':'Bibelreise';
    const count=await page.locator('#main h1').evaluate((el,word)=>{const text=el.firstChild,start=text.textContent.indexOf(word),range=document.createRange();range.setStart(text,start);range.setEnd(text,start+word.length);return range.getClientRects().length},word);
    assert.equal(count,1,'Ordinary page-title word split across lines');
   }
   if(name==='question'||name==='quiz')assert.equal(await page.locator('.answers button').count(),4,'Answer option loss');
   row.status='PASS';
  }catch(error){row.status='FAIL';row.error=error.stack;}
  row.screenshot=`${name}-${theme}-${width}-${font}.png`;
  await page.screenshot({path:path.join(out,row.screenshot)});
  results.push(row);fs.appendFileSync(out+'/progress.jsonl',JSON.stringify(row)+'\n');
 }
 for(const[name,route]of Object.entries(routes)){
  if(before&&!['reader','quiz','journal','today','settings','journey'].includes(name))continue;
  await capture(name,route);
 }
 await page.evaluate(({KEYS,data})=>localStorage.setItem(KEYS.main,JSON.stringify(data)),{KEYS,data:phase3Fixture('empty',theme)});
 await capture('journal-empty','journal',async()=>{await page.reload();await page.locator('[data-action=new-entry]').waitFor();await page.evaluate(()=>document.fonts.ready)});
 if(!before){
  await capture('editor-empty','journal',async()=>{await page.locator('[data-action=new-entry]').click();await page.locator('.writing-dialog textarea').waitFor()});
  await page.keyboard.press('Escape');
  await capture('search-empty','discover',async()=>{await page.locator('#main input[type=search]').fill('SYNTHETISCH-KEIN-TREFFER-20261017');await page.locator('#discovery-count').filter({hasText:'0 Einheiten'}).waitFor()});
 }
 await context.close();console.log(JSON.stringify({theme,width,font,completed:results.length,failures:results.filter(r=>r.status==='FAIL').length}));
 fs.writeFileSync(out+'/results.json',JSON.stringify({metadata,method:'Real Chromium PNGs, production CSP and active worker. CSS root font size, not Safari page zoom. Separate tests verify offline/update.',physicalIOS:'OFFEN',results,errors},null,2));
}
await browser.close();process.exitCode=results.some(r=>r.status==='FAIL')||errors.length?1:0;
