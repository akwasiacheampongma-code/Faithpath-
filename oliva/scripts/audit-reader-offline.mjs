import { chromium, expect } from '@playwright/test';
import { writeFile, mkdir } from 'node:fs/promises';
const root='docs/evidence/quiet-ux-audit',base='http://localhost:4188';
const result={scope:'Existing 0.18 production app; local Chromium only',routes:[],offline:[],keyboard:[],errors:[]};
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
await mkdir(root+'/screens',{recursive:true});
try{
  for(const theme of ['light','dark']){
    const context=await browser.newContext({viewport:{width:390,height:844},colorScheme:theme,reducedMotion:'reduce'}),p=await context.newPage();
    p.on('pageerror',e=>result.errors.push(e.message));
    await p.goto(base+'/einstellungen');await p.getByRole('textbox',{name:'Dein Vorname (freiwillig)'}).fill('Mara');await p.getByRole('button',{name:'Namen speichern',exact:true}).click();
    await expect.poll(()=>p.evaluate(()=>new Promise(resolve=>{const r=indexedDB.open('oliva-local-v1',1);r.onsuccess=()=>{const d=r.result,q=d.transaction('state').objectStore('state').get('main');q.onsuccess=()=>{resolve(!!q.result);d.close()};};}))).toBe(true);
    await p.evaluate(theme=>new Promise(resolve=>{const r=indexedDB.open('oliva-local-v1',1);r.onsuccess=()=>{const db=r.result,t=db.transaction('state','readwrite'),s=t.objectStore('state'),q=s.get('main');q.onsuccess=()=>{const raw=q.result;raw.data.settings.theme=theme;raw.data.settings.fontSize=30;raw.data.settings.lineHeight=2.1;raw.data.settings.reducedMotion=true;raw.data.revision++;s.put(raw,'main')};t.oncomplete=()=>{db.close();resolve()};};}),theme);
    for(const width of [320,375,390,430,1440]){
      await p.setViewportSize({width,height:width===1440?1000:844});
      for(const [id,route,title]of [
        ['reader','/lesen/MRK?chapter=4&from=35&to=41',null],
        ['noah','/geschichte/NS-0006','Da gedachte Gott an Noah'],
        ['psalm','/geschichte/NS-0073','Der HERR ist mein Hirte'],
        ['letter','/geschichte/NS-0349','Ich schäme mich des Evangeliums nicht'],
      ]){
        await p.goto(base+route);
        if(title)await expect(p.getByRole('heading',{name:title,exact:true})).toBeVisible();
        else await expect(p.getByRole('button',{name:'Leseeinstellungen',exact:true})).toBeVisible();
        await p.evaluate(()=>document.fonts.ready);
        const m=await p.evaluate(()=>{
          const main=document.querySelector('[role="main"]'),r=main.getBoundingClientRect();
          return {documentOverflow:document.documentElement.scrollWidth>innerWidth,mainOverflow:main.scrollWidth>main.clientWidth+1,
            readerFontMax:Math.max(0,...[...main.querySelectorAll('[data-testid^="flow-paragraph"] p')].map(e=>parseFloat(getComputedStyle(e).fontSize))),
            images:[...main.querySelectorAll('img')].filter(e=>e.getBoundingClientRect().width>0).map(e=>({width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height,loaded:e.complete&&e.naturalWidth>0})),
            mainTop:r.y,mainBottom:r.bottom,headings:[...main.querySelectorAll('h1,[role="heading"]')].map(e=>e.textContent)};
        });
        result.routes.push({id,width,theme,readerSettingsFont:30,lineHeight:2.1,...m});
        if(width===390)await p.screenshot({path:`${root}/screens/before-${id}-390-${theme}.png`,animations:'disabled'});
        if(id==='reader'&&width===390){
          await p.getByRole('button',{name:/^Vers 35:/}).click();await p.getByRole('button',{name:/^Vers 36:/}).click();
          await expect(p.getByRole('toolbar',{name:'Versauswahl',exact:true})).toBeVisible();
          await expect(p.getByRole('button',{name:/^Vers 35:/})).toHaveAttribute('aria-pressed','true');
          await expect(p.getByRole('button',{name:/^Vers 36:/})).toHaveAttribute('aria-pressed','true');
          result.routes.at(-1).directVerseSelection=true;
        }
      }
    }
    await context.close();
  }
  for(const mode of ['normal','api-absent','registration-blocked']){
    const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:mode==='registration-blocked'?'block':'allow'});
    if(mode==='api-absent')await context.addInitScript(()=>{delete Navigator.prototype.serviceWorker;});
    const p=await context.newPage();await p.goto(base+'/bibel');await expect(p.getByRole('heading',{name:'Deine Bibel.',exact:true})).toBeVisible();
    const message=mode==='normal'?'Für den Offline-Neustart bereit.':mode==='api-absent'?'Dieser Browser unterstützt keinen Offline-Neustart.':'Offline-Paket noch nicht vollständig. Mit Verbindung erneut öffnen.';
    await expect(p.getByText(message,{exact:true})).toBeVisible({timeout:20000});
    result.offline.push({mode,message,conditions:await p.evaluate(()=>({secureContext:isSecureContext,serviceWorkerExposed:'serviceWorker'in navigator,online:navigator.onLine})),passed:true});
    await context.close();
  }
  const context=await browser.newContext({viewport:{width:390,height:844}}),p=await context.newPage();
  for(const route of ['/','/bibel','/wege','/garten','/sammlung']){
    await p.goto(base+route);await p.locator('[role="navigation"][aria-label="Hauptnavigation"]').waitFor();
    const focus=[];
    for(let i=0;i<12;i++){await p.keyboard.press('Tab');focus.push(await p.evaluate(()=>({tag:document.activeElement.tagName,role:document.activeElement.getAttribute('role'),name:document.activeElement.getAttribute('aria-label')??document.activeElement.textContent?.slice(0,80),outlineStyle:getComputedStyle(document.activeElement).outlineStyle,outlineWidth:getComputedStyle(document.activeElement).outlineWidth})));}
    result.keyboard.push({route,focus,focusLeavesBody:focus.some(x=>x.tag!=='BODY')});
  }
  await context.close();
}catch(e){result.failure=String(e.stack??e);process.exitCode=1;}
finally{result.finishedAt=new Date().toISOString();await writeFile(root+'/reader-offline-audit.json',JSON.stringify(result,null,2)+'\n');await browser.close();}
console.log(JSON.stringify({routes:result.routes.length,offline:result.offline,keyboard:result.keyboard.length,errors:result.errors,failure:result.failure}));
