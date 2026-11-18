import {chromium, expect} from '@playwright/test';
import {spawn} from 'node:child_process';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import path from 'node:path';
import net from 'node:net';

const stage=process.argv[2],dist=path.resolve(process.argv[3]??'dist');
if(!['before','after'].includes(stage))throw new Error('Usage: node scripts/capture-today.mjs before|after <qualified-dist>');
const out=path.resolve('docs/evidence/today-focus');await mkdir(out+'/screens',{recursive:true});
const port=await new Promise(resolve=>{const server=net.createServer();server.listen(0,'127.0.0.1',()=>{const value=server.address().port;server.close(()=>resolve(value));});});
const server=spawn(process.execPath,['scripts/serve.mjs',dist],{env:{...process.env,PORT:String(port)},stdio:'ignore'});
const base=`http://127.0.0.1:${port}`;
for(let n=0;n<50;n++){try{if((await fetch(base)).ok)break;}catch{}await new Promise(resolve=>setTimeout(resolve,100));}
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const report={stage,dist,actualBrowser:'Local headless Chromium',fixedDate:'2026-11-18T09:00:00.000Z',syntheticData:true,deviceTest:false,scenes:[],errors:[]};
async function raw(page){return page.evaluate(()=>new Promise((resolve,reject)=>{const r=indexedDB.open('oliva-local-v1',1);r.onsuccess=()=>{const db=r.result,t=db.transaction('state'),s=t.objectStore('state'),k=s.getAllKeys(),v=s.getAll();t.oncomplete=()=>{db.close();resolve(k.result.map((key,i)=>[key,v.result[i]]));};t.onerror=()=>reject(String(t.error));};r.onerror=()=>reject(String(r.error));}));}
async function seed(page,profile,theme){
 await page.clock.setFixedTime(new Date(report.fixedDate));await page.goto(base+'/einstellungen');
 await page.getByRole('textbox',{name:'Dein Vorname (freiwillig)'}).fill('Mara');await page.getByRole('button',{name:'Namen speichern',exact:true}).click();
 await expect.poll(async()=>!!(await raw(page)).find(([k])=>k==='main')).toBe(true);
 const record=structuredClone((await raw(page)).find(([k])=>k==='main')[1]),d=record.data;
 d.name=profile==='returning'?'Mara':'';d.settings.theme=theme;d.settings.reducedMotion=true;d.revision++;
 if(profile==='returning'){
  d.onboarded=true;d.reading={book:'MRK',chapter:4,from:35,to:41};d.readingPosition={ref:{...d.reading},verse:38,mode:'read'};
  d.readChapters=['PSA:23'];d.bookmarks=['PSA:23:1'];d.highlights={'PSA:23:1':'olive'};d.growthStage=4;
  const at='2026-11-17T12:00:00.000Z';d.notes=[{id:'today-note',text:'Ein Gedanke aus meiner Sammlung.',kind:'note',createdAt:at,updatedAt:at}];
  d.drafts=[{id:'today-draft',key:'journal',revision:0,updatedAt:at,type:'journal',values:{entityId:'today-new-note',targetId:null,baseUpdatedAt:null,text:'Dieser Entwurf bleibt unverändert.',kind:'note'}}];
 }
 await page.evaluate(record=>new Promise((resolve,reject)=>{const r=indexedDB.open('oliva-local-v1',1);r.onsuccess=()=>{const db=r.result,t=db.transaction('state','readwrite');t.objectStore('state').put(record,'main');t.oncomplete=()=>{db.close();resolve();};t.onerror=()=>reject(String(t.error));};}),record);
}
async function metrics(page){return page.evaluate(()=>{
 const main=document.querySelector('[role="main"]'),m=main.getBoundingClientRect();
 const primary=[...main.querySelectorAll('[role="button"],button')].find(e=>['Deine erste Geschichte','In der Bibel weiterlesen'].includes(e.textContent.trim()));
 const b=primary.getBoundingClientRect(),hero=document.querySelector('[data-testid="home-reading-entry"]');
 return {main:{y:m.y,height:m.height,bottom:m.bottom},action:{y:b.y,height:b.height,bottom:b.bottom,fromMainTop:b.y-m.y,fullyInFirstViewport:b.y>=m.y&&b.bottom<=m.bottom},
  heroHeight:hero?.getBoundingClientRect().height??null,mainScrollHeight:main.scrollHeight,documentOverflow:document.documentElement.scrollWidth>innerWidth,mainOverflow:main.scrollWidth>main.clientWidth+1,
  actions:[...main.querySelectorAll('[role="button"],button')].filter(e=>e.getBoundingClientRect().width).map(e=>(e.getAttribute('aria-label')??e.textContent).replace(/→|↗/g,'').trim())};
});}
try{
 for(const profile of ['fresh','returning'])for(const theme of ['light','dark']){
  const context=await browser.newContext({reducedMotion:'reduce',colorScheme:theme,viewport:{width:390,height:844}}),page=await context.newPage();
  page.on('pageerror',e=>report.errors.push(e.message));await seed(page,profile,theme);const initial=await raw(page);
  for(const [width,height]of [[320,568],[375,812],[390,844]]){
   await page.setViewportSize({width,height});await page.goto(base+'/');
   await expect(page.getByRole('button',{name:profile==='fresh'?'Deine erste Geschichte':'In der Bibel weiterlesen',exact:true})).toBeVisible();
   await expect(page.getByText('Für den Offline-Neustart bereit.',{exact:true})).toBeVisible({timeout:30000});await page.evaluate(()=>document.fonts.ready);await expect.poll(()=>page.locator('img[src*="galilee-1280"]').first().evaluate(e=>e.complete&&e.naturalWidth>0)).toBe(true);
   await page.locator('[role="main"]').evaluate(e=>{e.scrollTop=0;});
   const measurements=await metrics(page);if(stage==='after'){expect(measurements.documentOverflow).toBe(false);expect(measurements.mainOverflow).toBe(false);expect(measurements.action.fullyInFirstViewport).toBe(true);}
   await page.screenshot({path:`${out}/screens/${stage}-${width}-${theme}-${profile}.png`,animations:'disabled'});
   expect(await raw(page)).toEqual(initial);report.scenes.push({profile,theme,width,height,...measurements,rawRecordsExact:true});
   if(profile==='returning'){
    await page.evaluate(()=>{const nodes=[...document.querySelectorAll('[role="main"] div,[role="main"] p,[role="main"] h1,[role="main"] span,[role="main"] input,[role="main"] textarea')];const sizes=nodes.map(e=>{const s=getComputedStyle(e);return [e,parseFloat(s.fontSize),parseFloat(s.lineHeight)];});for(const[e,f,l]of sizes){if(f)e.style.fontSize=f*2+'px';if(l)e.style.lineHeight=l*2+'px';}});
    const large=await metrics(page);if(stage==='after'){expect(large.documentOverflow).toBe(false);expect(large.mainOverflow).toBe(false);}
    report.scenes.at(-1).text200={...large,method:'CSS200%; not OS font scaling'};
    if(theme==='light')await page.screenshot({path:`${out}/screens/${stage}-${width}-text200.png`,animations:'disabled'});
   }
  }
  await context.close();
 }
 if(stage==='after'){
  const before=JSON.parse(await readFile(out+'/before.json','utf8'));
  for(const scene of report.scenes){const old=before.scenes.find(x=>x.width===scene.width&&x.theme===scene.theme&&x.profile===scene.profile);expect([...scene.actions].sort()).toEqual([...old.actions].sort());scene.allExistingActionsPreserved=true;}
 }
}catch(e){report.failure=String(e.stack??e);process.exitCode=1;}
finally{report.finishedAt=new Date().toISOString();await writeFile(out+'/'+stage+'.json',JSON.stringify(report,null,2)+'\n');await browser.close();server.kill('SIGTERM');}
console.log(JSON.stringify({stage,scenes:report.scenes.length,errors:report.errors,failure:report.failure}));
