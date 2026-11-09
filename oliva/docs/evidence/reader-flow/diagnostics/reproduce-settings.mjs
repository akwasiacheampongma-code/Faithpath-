import { chromium, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
const output=process.argv[2] ?? new URL('./settings-observation.json',import.meta.url).pathname;
const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:390,height:844}});const page=await context.newPage();
const steps=[];const errors=[];page.on('pageerror',e=>errors.push(String(e)));
await page.addInitScript(()=>{
 const trace=[];window.__readerTrace=trace;
 for(const name of ['scroll','scrollTo']){const original=Element.prototype[name];if(typeof original==='function')Element.prototype[name]=function(...args){trace.push({t:performance.now(),event:'api-'+name,args,tag:this.tagName,role:this.getAttribute('role')});return original.apply(this,args);};}
 const descriptor=Object.getOwnPropertyDescriptor(Element.prototype,'scrollTop');if(descriptor?.set)Object.defineProperty(Element.prototype,'scrollTop',{...descriptor,set(value){trace.push({t:performance.now(),event:'api-set-scrollTop',value,tag:this.tagName,role:this.getAttribute('role')});descriptor.set.call(this,value);}});

 function rect(v){const el=document.querySelector(`[data-testid="flow-verse-${v}"]`);if(!el)return null;const r=el.getBoundingClientRect();return {y:r.y,height:r.height,rects:[...el.getClientRects()].map(r=>({y:r.y,height:r.height,x:r.x,width:r.width}))};}
 function dom(){const main=document.querySelector('[role="main"]');return {scroll:main?.scrollTop,viewport:{width:innerWidth,height:innerHeight},v119:rect(119),v120:rect(120),active:document.activeElement?.getAttribute('aria-label')??document.activeElement?.textContent?.slice(0,45),settings:!![...document.querySelectorAll('[role="button"]')].find(el=>el.textContent==='Leseeinstellungen schließen')};}
 let last='';
 setInterval(async()=>{const d=dom();let data=null;try{data=await new Promise(resolve=>{const req=indexedDB.open('oliva-local-v1',1);req.onupgradeneeded=()=>req.transaction?.abort();req.onsuccess=()=>{const db=req.result;if(!db.objectStoreNames.contains('state')){db.close();resolve(null);return;}const tx=db.transaction('state','readonly');const q=tx.objectStore('state').get('main');q.onsuccess=()=>resolve(q.result?.data??q.result);tx.oncomplete=()=>db.close();};req.onerror=()=>resolve(null);});}catch{}
 const value={...d,position:data?.readingPosition,preferences:data?.settings,revision:data?.revision};const key=JSON.stringify(value);if(key!==last){last=key;trace.push({t:performance.now(),event:'sample',...value});}},70);
 for(const name of ['scroll','pointerdown','click','focusin'])document.addEventListener(name,event=>{const target=event.target;trace.push({t:performance.now(),event:name,label:target instanceof Element?(target.getAttribute('aria-label')??target.textContent?.slice(0,45)):String(target),...dom()});},true);
});
async function local(){return page.evaluate(()=>new Promise(resolve=>{const req=indexedDB.open('oliva-local-v1',1);req.onupgradeneeded=()=>req.transaction?.abort();req.onsuccess=()=>{const db=req.result;if(!db.objectStoreNames.contains('state')){db.close();resolve(null);return;}const tx=db.transaction('state','readonly'),q=tx.objectStore('state').get('main');q.onsuccess=()=>resolve(q.result?.data??q.result);tx.oncomplete=()=>db.close();};req.onerror=()=>resolve(null);}));}
async function snapshot(label){steps.push({label,at:Date.now(),local:await local(),box:await page.getByRole('button',{name:/^Vers 120:/}).boundingBox()});}
try{
 await page.goto('http://localhost:4173/lesen/PSA?chapter=119&verse=90');await expect.poll(async()=>(await local())?.readingPosition?.verse,{timeout:15000}).toBe(90);await snapshot('initial-90');
 await page.getByRole('button',{name:'Versaktionen',exact:true}).click();await page.getByRole('button',{name:'Vers 120',exact:true}).click();await expect.poll(async()=>(await local())?.readingPosition?.verse).toBe(120);await snapshot('picker-120');
 if(process.argv.includes('--disable-scroll-anchoring'))await page.addStyleTag({content:'[role=main] { overflow-anchor: none !important; }'});await page.setViewportSize({width:1440,height:1000});await expect.poll(async()=>{const b=await page.getByRole('button',{name:/^Vers 120:/}).boundingBox();return b&&b.y>=0&&b.y<120;}).toBe(true);await snapshot('wide-120');
 await page.getByRole('button',{name:'Leseeinstellungen',exact:true}).click();await snapshot('settings-open');
 await page.getByRole('button',{name:'Größer',exact:true}).click();await snapshot('font-bigger');
 await page.getByRole('button',{name:'2,1',exact:true}).click();await snapshot('line-2.1');
 await page.getByRole('button',{name:'Leseeinstellungen schließen',exact:true}).click();await snapshot('settings-closed-immediate');
 await page.waitForTimeout(1800);await snapshot('settings-closed-settled');await page.screenshot({path:output.replace('.json','.png')});
}catch(e){errors.push(String(e));}
await writeFile(output,JSON.stringify({build:await page.locator('meta[name="oliva-build"]').getAttribute('content'),steps,trace:await page.evaluate(()=>window.__readerTrace),errors},null,2)+'\n');
console.log(JSON.stringify({output,steps:steps.map(s=>({label:s.label,position:s.local?.readingPosition?.verse,box:s.box})),errors}));await browser.close();
