/** Behavioural layout regressions. Text enlargement is synthetic, not iOS QA. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {empty,KEYS} from '../../src/store.js';
const base=process.env.QA_URL||'http://127.0.0.1:4510';
const out=process.env.QA_OUT||'qa-output/uiux6b-mobile1/focused-red';
fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const results=[];
async function check(name,width,font,route,test,inset=0){
 const context=await browser.newContext({viewport:{width,height:width===320?568:844},reducedMotion:'reduce'});
 await context.addInitScript(({KEYS,data,font,inset})=>{localStorage.setItem(KEYS.main,JSON.stringify(data));localStorage.setItem(KEYS.onboard,'done');document.addEventListener('DOMContentLoaded',()=>{document.documentElement.style.fontSize=font+'%';document.documentElement.style.setProperty('--safe-top',inset+'px')})},{KEYS,data:{...empty(),settings:{theme:'night'}},font,inset});
 const page=await context.newPage();page.setDefaultTimeout(15000);
 try{await page.goto(base+'/#'+route);await page.locator('#main h1').waitFor();if(route.startsWith('read/'))await page.locator('.verse').last().waitFor();await page.evaluate(()=>document.fonts.ready);const details=await test(page);results.push({name,width,font,inset,status:'PASS',details});}
 catch(error){results.push({name,width,font,inset,status:'FAIL',error:error.stack});}
 finally{await page.screenshot({path:out+'/'+name+'.png'});await context.close()}
}
await check('atomic-brand-individual-enlargement',320,100,'journal',async p=>{
 // Independently enlarged brand stresses anonymous flex text, not a claimed Safari setting.
 await p.locator('.wordmark').evaluate(e=>e.style.fontSize='64px');
 const geometry=await p.locator('.wordmark').evaluate(el=>{const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),rects=[];let n;while(n=walker.nextNode()){if(n.textContent==='FaithPath'){const r=document.createRange();r.selectNodeContents(n);rects.push(...[...r.getClientRects()].map(x=>({top:x.top,bottom:x.bottom})))}}const h=el.closest('header').getBoundingClientRect(),menu=document.querySelector('#menu-toggle').getBoundingClientRect();return {lines:new Set(rects.map(r=>Math.round(r.top))).size,brand:el.getBoundingClientRect().toJSON(),header:h.toJSON(),menu:menu.toJSON(),overflow:document.documentElement.scrollWidth-innerWidth}});
 assert.equal(geometry.lines,1,'FaithPath must stay on one line');assert(geometry.brand.bottom<=geometry.header.bottom&&geometry.menu.bottom<=geometry.header.bottom,'Header must grow around enlarged brand/menu');assert(geometry.overflow<=1,'No horizontal clipping or overflow');return geometry;
});
await check('header-safe-area',320,200,'journal',async p=>{const g=await p.locator('.topbar').evaluate(h=>({header:h.getBoundingClientRect().toJSON(),children:[...h.children].map(e=>e.getBoundingClientRect().toJSON())}));assert(g.children.every(r=>r.top>=44&&r.bottom<=g.header.bottom),'Safe padding and all content must fit header');return g;},44);
await check('journal-action-first-small-screen',320,200,'journal',async p=>{const g=await p.locator('[data-action=new-entry]').boundingBox();const nav=await p.locator('.primary-nav').boundingBox();assert(g.y+g.height<=nav.y,'The empty Journal entry action must fit above navigation at 200%');return {action:g,nav};});
await check('journal-empty-hierarchy',390,100,'journal',async p=>{const g=await p.locator('.page-heading').evaluate(e=>({padding:getComputedStyle(e).paddingBottom,h1:getComputedStyle(e.querySelector('h1')).fontSize}));assert.equal(g.padding,'0px','Legacy depth heading must not add an empty Journal gap');assert(parseFloat(g.h1)<=36,'Journal heading should not dominate mobile');assert(!(await p.locator('#journal-results').innerText()).includes('Ein Satz, eine Frage oder ein Gebet.'),'Empty state should not repeat the writing invitation');return g;});
await check('reader-text-earlier',390,100,'read/PSA/119/otb',async p=>{const r=await p.locator('.verse').first().boundingBox();assert(r.y<=320,'Long chapter text must start within first 320 CSS pixels');assert.equal(await p.locator('.verse').count(),176);return r;});
await check('quiz-answers-earlier',390,100,'quiz/10082',async p=>{const g=await p.locator('.quiz-title').evaluate(e=>({height:e.getBoundingClientRect().height,font:parseFloat(getComputedStyle(e).fontSize)}));assert(g.font<=30,'Long mobile questions need a text hierarchy below display headings');assert.equal(await p.locator('.answers button').count(),4);return g;});
await browser.close();fs.writeFileSync(out+'/results.json',JSON.stringify({base,results,physicalIOS:'OFFEN'},null,2));console.log(JSON.stringify(results,null,2));process.exitCode=results.some(r=>r.status!=='PASS')?1:0;
