import {chromium, expect} from '@playwright/test';
import {spawn} from 'node:child_process';
import {mkdir, writeFile, readFile} from 'node:fs/promises';
import path from 'node:path';
import net from 'node:net';

const stage=process.argv[2], dist=path.resolve(process.argv[3]??'dist');
if(!['before','after'].includes(stage))throw new Error('Usage: node scripts/capture-bible-paths.mjs before|after <qualified-dist>');
const out=path.resolve('docs/evidence/bible-paths-focus');await mkdir(out+'/screens',{recursive:true});
const port=await new Promise(resolve=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>resolve(p));});});
const server=spawn(process.execPath,['scripts/serve.mjs',dist],{env:{...process.env,PORT:String(port)},stdio:'ignore'}),base=`http://127.0.0.1:${port}`;
for(let n=0;n<50;n++){try{if((await fetch(base)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const report={stage,dist,actualBrowser:'Local headless Chromium',fixedDate:'2026-11-18T09:00:00.000Z',syntheticData:true,deviceTest:false,scenes:[],protectedScenes:[],errors:[]};
async function raw(page){return page.evaluate(()=>new Promise((resolve,reject)=>{const r=indexedDB.open('oliva-local-v1',1);r.onsuccess=()=>{const db=r.result,t=db.transaction('state'),s=t.objectStore('state'),k=s.getAllKeys(),v=s.getAll();t.oncomplete=()=>{db.close();resolve(k.result.map((key,i)=>[key,v.result[i]]));};t.onerror=()=>reject(String(t.error));};r.onerror=()=>reject(String(r.error));}));}
async function seed(page,profile,theme){
 await page.clock.setFixedTime(new Date(report.fixedDate));await page.goto(base+'/einstellungen');
 await page.getByRole('textbox',{name:'Dein Vorname (freiwillig)'}).fill('Mara');const save=page.getByRole('button',{name:'Namen speichern',exact:true});if(await save.isEnabled())await save.click();
 await expect.poll(async()=>!!(await raw(page)).find(([k])=>k==='main')).toBe(true);
 const record=structuredClone((await raw(page)).find(([k])=>k==='main')[1]),d=record.data;
 d.name=profile==='returning'?'Mara':'';d.settings.theme=theme;d.settings.reducedMotion=true;d.revision++;
 if(profile==='returning'){
  d.onboarded=true;d.reading={book:'MRK',chapter:4,from:35,to:41};d.readingPosition={ref:{...d.reading},verse:38,mode:'read'};
  d.readChapters=['PSA:23','MRK:1'];d.bookmarks=['PSA:23:1'];d.highlights={'PSA:23:1':'olive'};d.growthStage=4;
  d.readSteps=['jesus:0'];d.completedSteps=['jesus:0'];d.activePath='jesus';
  const at='2026-11-17T12:00:00.000Z';d.notes=[{id:'focus-note',text:'Ein Gedanke aus meiner Sammlung.',kind:'note',createdAt:at,updatedAt:at}];
  d.drafts=[{id:'focus-draft',key:'journal',revision:0,updatedAt:at,type:'journal',values:{entityId:'focus-new-note',targetId:null,baseUpdatedAt:null,text:'Dieser Entwurf bleibt unverändert.',kind:'note'}}];
 }
 await page.evaluate(record=>new Promise((resolve,reject)=>{const r=indexedDB.open('oliva-local-v1',1);r.onsuccess=()=>{const db=r.result,t=db.transaction('state','readwrite');t.objectStore('state').put(record,'main');t.oncomplete=()=>{db.close();resolve();};t.onerror=()=>reject(String(t.error));};}),record);
}
async function ready(page,area){
 await page.goto(base+'/'+area);await expect(page.getByRole('main')).toBeVisible();
 await expect(page.getByText('Für den Offline-Neustart bereit.',{exact:true})).toBeVisible({timeout:30000});
 await page.evaluate(()=>document.fonts.ready);
 await expect.poll(()=>page.locator('[role="main"] img').evaluateAll(nodes=>nodes.every(e=>e.complete&&e.naturalWidth>0))).toBe(true);
 await page.locator('[role="main"]').evaluate(e=>e.scrollTop=0);
}
async function metrics(page,area){return page.evaluate(area=>{
 const main=document.querySelector('[role="main"]'),rect=e=>{if(!e)return null;const b=e.getBoundingClientRect();return{x:b.x,y:b.y,height:b.height,bottom:b.bottom,width:b.width};},buttons=[...main.querySelectorAll('[role="button"],button')];
 const books=buttons.filter(e=>/, \d+ Kapitel$/.test(e.getAttribute('aria-label')??'')),paths=buttons.filter(e=>/Minuten, \d+ von \d+ Schritten$/.test(e.getAttribute('aria-label')??''));
 const list=main.querySelector('[data-testid="bible-book-list"]'),sword=main.querySelector('[data-testid="spiritual-word-card"]');
 return {area,main:rect(main),mainScrollHeight:main.scrollHeight,documentOverflow:document.documentElement.scrollWidth>innerWidth,mainOverflow:main.scrollWidth>main.clientWidth+1,
  search:rect(main.querySelector('input')),scope:rect(main.querySelector('select')),firstBook:rect(books[0]),bookList:rect(list),sword:rect(sword),firstPath:rect(paths[0]),
  books:books.map(e=>e.getAttribute('aria-label')),paths:paths.map(e=>e.getAttribute('aria-label')),
  images:[...main.querySelectorAll('img')].map(e=>({src:new URL(e.src).pathname,...rect(e)}))};
},area);}
try{
 for(const profile of ['fresh','returning'])for(const theme of ['light','dark']){
  const context=await browser.newContext({reducedMotion:'reduce',colorScheme:theme,viewport:{width:390,height:844}}),page=await context.newPage();
  page.on('pageerror',e=>report.errors.push(e.message));await seed(page,profile,theme);const initial=await raw(page);
  for(const [width,height]of [[320,568],[375,812],[390,844],[430,932]])for(const area of ['bibel','wege']){
   await page.setViewportSize({width,height});await ready(page,area);const measurements=await metrics(page,area);
   if(stage==='after'){expect(measurements.documentOverflow).toBe(false);expect(measurements.mainOverflow).toBe(false);expect(area==='bibel'?measurements.books.length:measurements.paths.length).toBe(area==='bibel'?66:9);}
   await page.screenshot({path:`${out}/screens/${stage}-${area}-${width}-${theme}-${profile}.png`,animations:'disabled'});
   expect(await raw(page)).toEqual(initial);report.scenes.push({profile,theme,width,height,...measurements,rawRecordsExact:true});
   if(profile==='returning'){
    await page.evaluate(()=>{const nodes=[...document.querySelectorAll('[role="main"] div,[role="main"] p,[role="main"] h1,[role="main"] span,[role="main"] input,[role="main"] textarea,[role="main"] select')];const sizes=nodes.map(e=>{const s=getComputedStyle(e);return[e,parseFloat(s.fontSize),parseFloat(s.lineHeight)];});for(const[e,f,l]of sizes){if(f)e.style.fontSize=f*2+'px';if(l)e.style.lineHeight=l*2+'px';}});
    const large=await metrics(page,area);if(stage==='after'){expect(large.documentOverflow).toBe(false);expect(large.mainOverflow).toBe(false);}
    report.scenes.at(-1).text200={...large,method:'CSS 200%; not OS font scaling'};
    await page.screenshot({path:`${out}/screens/${stage}-${area}-${width}-${theme}-text200.png`,animations:'disabled'});
    expect(await raw(page)).toEqual(initial);
   }
  }
  if(profile==='returning')for(const area of ['','garten','sammlung']){
   await page.setViewportSize({width:390,height:844});await ready(page,area);const file=`screens/${stage}-protected-${area||'heute'}-${theme}.png`;await page.screenshot({path:out+'/'+file,animations:'disabled'});
   report.protectedScenes.push({area:area||'heute',theme,file});expect(await raw(page)).toEqual(initial);
  }
  await context.close();
 }
 if(stage==='after'){
  const before=JSON.parse(await readFile(out+'/before.json','utf8'));
  for(const scene of report.scenes){const old=before.scenes.find(x=>x.area===scene.area&&x.width===scene.width&&x.theme===scene.theme&&x.profile===scene.profile);expect(scene.books).toEqual(old.books);expect(scene.paths).toEqual(old.paths);scene.catalogAndProgressExact=true;}
  // Exact source checks establish scope. Canvas antialiasing may vary by a few pixels;
  // retain byte comparisons for inspection rather than misclassifying them as UI edits.
  const oldInputs=JSON.parse(await readFile('docs/evidence/today-focus/runtime-inputs.json','utf8'));
  const newInputs=JSON.parse(await readFile(out+'/runtime-inputs.json','utf8'));
  const allowed=new Set(['app/bibel.tsx','app/wege.tsx','src/features/bible/BibleScopeSelect.tsx','src/features/bible/BibleScopeSelect.web.tsx']);
  for(const row of oldInputs.files)if(!allowed.has(row.path))expect(newInputs.files.find(x=>x.path===row.path)?.sha256,row.path+' unchanged').toBe(row.sha256);
  report.allOtherRuntimeSourcesExact=true;
  for(const scene of report.protectedScenes){const old=before.protectedScenes.find(x=>x.area===scene.area&&x.theme===scene.theme);scene.screenshotBytesExact=(await readFile(out+'/'+scene.file)).equals(await readFile(out+'/'+old.file));}
 }
}catch(e){report.failure=String(e.stack??e);process.exitCode=1;}
finally{report.finishedAt=new Date().toISOString();await writeFile(out+'/'+stage+'.json',JSON.stringify(report,null,2)+'\n');await browser.close();server.kill('SIGTERM');}
console.log(JSON.stringify({stage,scenes:report.scenes.length,protectedScenes:report.protectedScenes.length,errors:report.errors,failure:report.failure}));
