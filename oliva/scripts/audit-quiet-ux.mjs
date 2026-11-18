import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { applyProposal } from '../design-previews/quiet-ux/proposal.mjs';

const base = process.env.OLIVA_AUDIT_URL ?? 'http://localhost:4188';
const proposalsOnly = process.env.OLIVA_PROPOSALS_ONLY === '1';
const root = path.resolve('docs/evidence/quiet-ux-audit');
await mkdir(path.join(root, 'screens'), {recursive:true});
const cases = [
  ['heute','/','Ein Moment, der bleibt.'], ['bibel','/bibel','Deine Bibel.'],
  ['wege','/wege','Du brauchst kein Vorwissen.'], ['garten','/garten','Wachsen braucht Zeit.'],
  ['sammlung','/sammlung','Deine Sammlung.'],
];
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
const report = { scope: 'Unveränderter qualifizierter Produktions-Webbuild 0.18; lokale Chromium-Viewports. Keine echten Geräte-/Simulator-/Screenreaderprüfungen.',
  baseline: 'oliva-6e2b52bb8e634041', productionUiChanged: false, proposalsRequireApproval: true,
  startedAt: new Date().toISOString(), matrix: [], proposals: [], axe: [], largeText: [], errors: [], network: [], checks: [] };

async function raw(page) {
  return page.evaluate(() => new Promise((resolve,reject) => {
    const q=indexedDB.open('oliva-local-v1',1);q.onerror=()=>reject(String(q.error));q.onsuccess=()=>{
      const db=q.result, t=db.transaction('state','readonly'), s=t.objectStore('state'), k=s.getAllKeys(), v=s.getAll();
      t.oncomplete=()=>{resolve(k.result.map((key,i)=>[key,v.result[i]]));db.close();}; t.onerror=()=>reject(String(t.error));
    };
  }));
}
async function store(page, value) {
  await page.evaluate(value=>new Promise((resolve,reject)=>{const r=indexedDB.open('oliva-local-v1',1);r.onsuccess=()=>{
    const db=r.result,t=db.transaction('state','readwrite');t.objectStore('state').put(value,'main');
    t.oncomplete=()=>{db.close();resolve()};t.onerror=()=>reject(String(t.error));};}),value);
}
async function profile(context, filled, theme) {
  const page=await context.newPage();
  await page.goto(base+'/einstellungen');
  await page.getByRole('textbox',{name:'Dein Vorname (freiwillig)'}).fill('Mara');
  await page.getByRole('button',{name:'Namen speichern',exact:true}).click();
  await expect.poll(async()=> (await raw(page)).some(([k])=>k==='main')).toBe(true);
  const rows=await raw(page), envelope=structuredClone(rows.find(([k])=>k==='main')[1]), d=envelope.data;
  d.name=filled?'Mara':'';d.settings.theme=theme;d.settings.reducedMotion=true;d.revision++;
  if(filled){
    d.onboarded=true;d.readChapters=['MRK:4','PSA:23'];d.reading={book:'MRK',chapter:4};d.bookmarks=['PSA:23:1'];d.highlights={'PSA:23:1':'olive'};d.growthStage=4;
    const at='2026-11-17T12:00:00.000Z';
    d.notes=[{id:'quiet-audit-note',text:'Der HERR ist mein Hirte. Ich möchte mir Zeit nehmen, diesen Gedanken wirken zu lassen.',kind:'note',ref:{book:'PSA',chapter:23,from:1,to:1},createdAt:at,updatedAt:at}];
    d.drafts=[{id:'quiet-audit-draft',key:'journal',revision:0,updatedAt:at,type:'journal',values:{entityId:'quiet-audit-new',targetId:null,baseUpdatedAt:null,text:'Ein angefangener Gedanke darf warten.',kind:'note'}}];
  }
  await store(page,envelope);return page;
}
async function open(page,route,title){
  await page.goto(base+route);await expect(page.getByRole('heading',{name:title,exact:true})).toBeVisible();
  await page.evaluate(()=>document.fonts.ready);
  await page.locator('[role="main"]').evaluate(e=>{e.scrollTop=0;});
  if(route==='/garten') await expect(page.getByTestId('olive-tree')).toHaveAttribute('data-a51-stage',/\d/);
}
async function metrics(page,area){
  return page.evaluate(area=>{
    const main=document.querySelector('[role="main"]'), mb=main.getBoundingClientRect();
    const nodes=[...main.querySelectorAll('[role="button"],button,input,select,textarea,a[href]')].filter(e=>e.getBoundingClientRect().width&&e.getBoundingClientRect().height);
    const label=e=>e.getAttribute('aria-label')??e.textContent.trim().slice(0,100);
    const box=e=>{if(!e)return null;const b=e.getBoundingClientRect();return {x:b.x,y:b.y,width:b.width,height:b.height,fromContentTop:b.y-mb.y+main.scrollTop}};
    const buttons=nodes.map(e=>({label:label(e),...box(e),visibleInFirstScreen:e.getBoundingClientRect().y<mb.bottom&&e.getBoundingClientRect().bottom>mb.top}));
    const mainWidth=main.clientWidth;
    const overflow=[...main.querySelectorAll('*')].filter(e=>{const b=e.getBoundingClientRect(),s=getComputedStyle(e);return b.width&&b.x<-1||b.width&&b.right>innerWidth+1&&s.position!=='absolute';}).slice(0,15).map(e=>({text:label(e),...box(e)}));
    const action=nodes.find(e=> area==='heute'?/^(In der Bibel weiterlesen|Deine erste Geschichte)$/.test(label(e)):area==='bibel'?label(e).startsWith('1. Mose,'):area==='wege'?/Minuten.*Schritten$/.test(label(e)):area==='sammlung'?/^(Einen Gedanken festhalten|Entwurf fortsetzen)$/.test(label(e)):label(e)==='Stadium 1 ansehen: Samen');
    return {main:box(main),contentHeight:main.scrollHeight,documentOverflow:document.documentElement.scrollWidth>innerWidth,
      contentOverflow:main.scrollWidth>mainWidth+1,overflow,firstAction:action?{label:label(action),...box(action)}:null,
      actionableCount:buttons.length,actionsInFirstScreen:buttons.filter(x=>x.visibleInFirstScreen).length,
      touchUnder44:buttons.filter(x=>x.width<44||x.height<44),
      headings:[...main.querySelectorAll('h1,[role="heading"]')].map(e=>({text:e.textContent,...box(e)})),
      smallTextNodes:[...main.querySelectorAll('div,span,p')].filter(e=>!e.children.length&&e.textContent.trim()&&parseFloat(getComputedStyle(e).fontSize)<12).length,
      collectionTabs:area==='sammlung'?buttons.filter(x=>['Gedanken','Entwürfe','Lesezeichen','Markierungen'].includes(x.label)):undefined,
      sword:box(main.querySelector('[data-testid="spiritual-word-card"]')),
      bookList:box(main.querySelector('[data-testid="bible-book-list"]')),
      search:box(main.querySelector('input'))};
  },area);
}
async function shot(page,name){
  await page.screenshot({path:path.join(root,'screens',name+'.png'),animations:'disabled'});
}
try{
  for(const filled of (proposalsOnly ? [true] : [false,true])) for(const theme of ['light','dark']){
    const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce',colorScheme:theme});
    const page=await profile(context,filled,theme);
    page.on('pageerror',e=>report.errors.push({filled,theme,message:e.message}));
    page.on('request',r=>{const u=new URL(r.url());if(!['data:','blob:'].includes(u.protocol)&&u.origin!==base)report.network.push({origin:u.origin,method:r.method(),type:r.resourceType()});});
    const snapshot=await raw(page);
    for(const width of [320,375,390,430,1440]){
      await page.setViewportSize({width,height:width===1440?1000:844});
      for(const [area,route,title] of cases){
        await open(page,route,title);const before=await metrics(page,area);
        report.matrix.push({area,width,theme,filled,...before});
        if(!proposalsOnly&&width===390&&(filled||theme==='light'))await shot(page,`before-${area}-${width}-${theme}-${filled?'filled':'empty'}`);
        if(!proposalsOnly&&width===390&&filled){
          const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
          report.axe.push({area,theme,violations:axe.violations.map(v=>({id:v.id,impact:v.impact,help:v.help,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});
        }
        if(filled)for(const variant of ['A','B']){
          if(variant==='B')await open(page,route,title);
          const buttonsBefore=await page.locator('[role="main"] [role="button"],[role="main"] button').count();
          await page.evaluate(applyProposal,{area,variant});
          const result=await metrics(page,area);
          const buttonsAfter=await page.locator('[role="main"] [role="button"],[role="main"] button').count();
          if(buttonsAfter!==buttonsBefore)throw new Error('Proposal removed an existing action: '+area);
          report.proposals.push({area,width,theme,variant,reviewOnly:true,existingActionCountUnchanged:true,...result});
          if(proposalsOnly&&width===390){
            const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
            report.axe.push({area,theme,variant,reviewOnly:true,violations:axe.violations.map(v=>({id:v.id,impact:v.impact,help:v.help,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});
          }
          if(width===390)await shot(page,`proposal-${variant}-${area}-${width}-${theme}-filled`);
        }
      }
    }
    if(JSON.stringify(await raw(page))!==JSON.stringify(snapshot))throw new Error('Read-only main-area audit changed a stored record');
    report.checks.push({id:'raw-records-unchanged-main-areas',filled,theme,passed:true});
    if(filled&&!proposalsOnly){
      await page.setViewportSize({width:390,height:844});
      for(const [area,route,title]of cases){
        await open(page,route,title);
        await page.evaluate(()=>{
          for(const e of document.querySelectorAll('div,p,span,h1,input,select,textarea')){
            const s=getComputedStyle(e);e.dataset.auditFont=s.fontSize;e.dataset.auditLine=s.lineHeight;
          }
          for(const e of document.querySelectorAll('[data-audit-font]')){
            if(parseFloat(e.dataset.auditFont)>0)e.style.fontSize=parseFloat(e.dataset.auditFont)*2+'px';
            if(parseFloat(e.dataset.auditLine)>0)e.style.lineHeight=parseFloat(e.dataset.auditLine)*2+'px';
          }
        });
        report.largeText.push({area,theme,method:'200% CSS-Textvergrößerung im Chromium; keine OS-Systemschriftprüfung',...await metrics(page,area)});
        if(theme==='light')await shot(page,`before-${area}-390-light-text200`);
      }
    }
    await context.close();
    console.log(JSON.stringify({finished:{filled,theme},baselineCases:report.matrix.length,proposalCases:report.proposals.length}));
    await writeFile(path.join(root,'browser-audit-progress.json'),JSON.stringify(report,null,2));
  }
  const c=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}),p=await profile(c,true,'light');
  await open(p,'/sammlung','Deine Sammlung.');
  for(const label of ['Gedanken','Entwürfe','Lesezeichen','Markierungen']){
    await p.getByRole('button',{name:label,exact:true}).click();
    await shot(p,`before-sammlung-${label.toLowerCase()}-filled`);
    report.checks.push({id:'collection-existing-tab',label,passed:await p.getByRole('button',{name:label,exact:true}).getAttribute('aria-pressed')==='true'});
  }
  await open(p,'/bibel','Deine Bibel.');await p.getByRole('textbox',{name:'Buch suchen',exact:true}).fill(' 1 .  M o s e ');
  await expect(p.getByRole('button',{name:'1. Mose, 50 Kapitel',exact:true})).toBeVisible();
  report.checks.push({id:'whitespace-book-search',passed:true});
  await p.getByRole('textbox',{name:'Buch suchen',exact:true}).fill('');
  const books=JSON.parse(await readFile('src/data/catalog.json','utf8'));
  await expect(p.getByRole('button',{name:/, \d+ Kapitel$/})).toHaveCount(66);
  for(const book of books){const row=p.getByRole('button',{name:`${book.name}, ${book.chapters} Kapitel`,exact:true});await row.click();await expect(p.getByRole('button',{name:new RegExp(`^${book.name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}, Kapitel \\d+(, gelesen)?$`)})).toHaveCount(book.chapters);await row.click();}
  report.checks.push({id:'66-books-1189-chapters',passed:true});
  await p.getByRole('button',{name:'Epheser 6,17 lesen',exact:true}).click();await expect(p).toHaveURL(/\/lesen\/EPH\?/);
  report.checks.push({id:'ephesians-correct-reader',passed:new URL(p.url()).searchParams.get('from')==='17'});
  await open(p,'/garten','Wachsen braucht Zeit.');
  for(let i=0;i<7;i++){await p.getByRole('button',{name:new RegExp(`^Stadium ${i+1} ansehen:`)}).click();await expect(p.getByTestId('olive-tree')).toHaveAttribute('data-a51-stage',String(i));}
  report.checks.push({id:'seven-tree-preview-stages',passed:true});
  await open(p,'/bibel','Deine Bibel.');await expect(p.getByText('Für den Offline-Neustart bereit.',{exact:true})).toBeVisible();
  const offlineBefore=await raw(p);await c.setOffline(true);await p.reload();await expect(p.getByRole('heading',{name:'Deine Bibel.',exact:true})).toBeVisible();
  await expect(p.getByRole('button',{name:/, \d+ Kapitel$/})).toHaveCount(66);
  report.checks.push({id:'offline-restart-records-exact',passed:JSON.stringify(offlineBefore)===JSON.stringify(await raw(p))});
  await c.close();
}catch(e){report.failure=String(e.stack??e);process.exitCode=1;}
finally{report.finishedAt=new Date().toISOString();await writeFile(path.join(root,'browser-audit.json'),JSON.stringify(report,null,2)+'\n');await browser.close();}
console.log(JSON.stringify({baselineCases:report.matrix.length,proposals:report.proposals.length,axeCases:report.axe.length,largeText:report.largeText.length,checks:report.checks,errors:report.errors,unexpectedNetwork:report.network,failure:report.failure}));
