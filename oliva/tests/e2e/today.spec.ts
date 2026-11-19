import {test,expect,type Page} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {readFileSync} from 'node:fs';
import {mkdir,writeFile} from 'node:fs/promises';
import {rawData,localData} from './persistence';

const out=`${process.env.OLIVA_EVIDENCE_DIR??'docs/evidence/latest'}/today`;
const topic=JSON.parse(readFileSync(new URL('../../src/data/life-topics.json',import.meta.url),'utf8')).topics[0];
async function records(page:Page){return page.evaluate(()=>new Promise((resolve,reject)=>{const r=indexedDB.open('oliva-local-v1',1);r.onsuccess=()=>{const db=r.result,t=db.transaction('state'),s=t.objectStore('state'),k=s.getAllKeys(),v=s.getAll();t.oncomplete=()=>{db.close();resolve(k.result.map((key,i)=>[key,v.result[i]]));};t.onerror=()=>reject(t.error);};r.onerror=()=>reject(r.error);}));}
async function returning(page:Page,theme:'light'|'dark'='light'){
 await page.goto('/einstellungen');await page.getByRole('textbox',{name:'Dein Vorname (freiwillig)'}).fill('Mara');const saveName=page.getByRole('button',{name:'Namen speichern',exact:true});if(await saveName.isEnabled())await saveName.click();
 await expect.poll(async()=>(await localData(page))?.name).toBe('Mara');
 const record=structuredClone(await rawData(page)),d=record.data,at='2026-11-17T12:00:00.000Z';
 d.settings.theme=theme;d.settings.reducedMotion=true;d.onboarded=true;d.reading={book:'MRK',chapter:4,from:35,to:41};d.readingPosition={ref:{...d.reading},verse:38,mode:'read'};
 d.activePath=topic.id;d.readChapters=['PSA:23'];d.bookmarks=['PSA:23:1'];d.highlights={'PSA:23:1':'olive'};d.growthStage=4;d.revision++;
 d.notes=[{id:'today-saved-note',text:'Ein unveränderter persönlicher Gedanke.',kind:'note',createdAt:at,updatedAt:at}];
 d.drafts=[{id:'today-open-draft',key:'journal',revision:0,updatedAt:at,type:'journal',values:{entityId:'today-new-note',targetId:null,baseUpdatedAt:null,text:'Ein bestehender Entwurf.',kind:'note'}}];
 await page.evaluate(record=>new Promise<void>((resolve,reject)=>{const r=indexedDB.open('oliva-local-v1',1);r.onsuccess=()=>{const db=r.result,t=db.transaction('state','readwrite');t.objectStore('state').put(record,'main');t.oncomplete=()=>{db.close();resolve();};t.onerror=()=>reject(t.error);};}),record);
}

test('Heute bietet Gästen einen direkten freiwilligen Einstieg in die vorhandene erste Geschichte',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Überspringen',exact:true}).click();await expect(page.getByTestId('home-greeting')).toBeVisible();
 const action=page.getByRole('button',{name:'Jetzt Bibel lesen',exact:true});await expect(action).toBeVisible();
 const before=await records(page);await page.reload();await expect(action).toBeVisible();expect(await records(page)).toEqual(before);
 await action.click();await expect(page).toHaveURL(/\/lesen\/MRK\?/);
 await expect(page.getByRole('button',{name:/^Vers 35:/})).toBeVisible();expect((await localData(page)).readChapters).toEqual([]);
});

test('die Hauptaktion setzt den gespeicherten Abschnitt am tatsächlichen Vers fort',async({page})=>{
 await returning(page);await page.goto('/');await expect(page.getByText('Zuletzt bei Vers 38',{exact:true})).toBeVisible();
 const before=await localData(page);await page.getByTestId('home-primary-action').click();await expect(page).toHaveURL(/\/lesen\/MRK\?/);
 expect(Object.fromEntries(new URL(page.url()).searchParams)).toMatchObject({chapter:'4',from:'35',to:'41',mode:'read'});
 await expect.poll(async()=>{const b=await page.getByRole('button',{name:/^Vers 38:/}).boundingBox();return !!b&&b.y>=0&&b.y<120;}).toBe(true);
 const after=await localData(page);for(const key of ['notes','drafts','goals','imports','bookmarks','highlights','readChapters','readPassages','completedSteps','growthStage']as const)expect(after[key],key).toEqual(before[key]);
});

test('persönliche Inhalte und alle weiteren Heute-Zugänge bleiben beim Ansehen und Neustart erhalten',async({page})=>{
 await returning(page);const before=await records(page);await page.goto('/');
 for(const label of ['Im Kontext lesen →','Alle Themen →','Dein Thema fortsetzen','Meinen Garten ansehen','Kapitelübersicht öffnen','Deine Entwürfe ansehen'])await expect(page.getByRole('button',{name:label,exact:true})).toBeVisible();
 await expect(page.getByRole('textbox',{name:'Deine freiwillige Tagesreflexion',exact:true})).toBeVisible();
 expect(await records(page)).toEqual(before);await page.reload();await expect(page.getByTestId('home-primary-action')).toBeVisible();expect(await records(page)).toEqual(before);
});

test('Heute bleibt in beiden Themen bei320/375/390px mit reduzierter Bewegung zugänglich',async({page})=>{
 test.setTimeout(180000);await mkdir(out,{recursive:true});const results=[];
 for(const theme of ['light','dark']as const){
  await returning(page,theme);
  for(const [width,height]of [[320,568],[375,812],[390,844]] as const){
   await page.setViewportSize({width,height});await page.goto('/');await expect(page.getByTestId('home-primary-action')).toBeVisible();await page.evaluate(()=>document.fonts.ready);
   const m=await page.getByRole('main').boundingBox(),b=await page.getByTestId('home-primary-action').boundingBox();expect(b!.y).toBeGreaterThanOrEqual(m!.y);expect(b!.y+b!.height).toBeLessThanOrEqual(m!.y+m!.height);expect(b!.height).toBeGreaterThanOrEqual(48);
   expect(await page.getByRole('main').evaluate(e=>e.scrollWidth<=e.clientWidth+1)).toBe(true);
   const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(axe.violations).toEqual([]);results.push({theme,width,axeViolations:axe.violations,primaryFullyVisible:true});
  }
 }
 await writeFile(out+'/accessibility.json',JSON.stringify({localChromiumOnly:true,realDeviceTest:false,results},null,2)+'\n');
});

test('Heute und die gespeicherte Lesestelle funktionieren nach einem Offline-Neustart',async({page,context})=>{
 await returning(page);await page.goto('/');await expect(page.getByText('Für den Offline-Neustart bereit.',{exact:true})).toBeVisible();const before=await records(page);
 await context.setOffline(true);await page.reload();await expect(page.getByTestId('home-primary-action')).toBeVisible();expect(await records(page)).toEqual(before);
 await page.getByTestId('home-primary-action').click();await expect(page).toHaveURL(/\/lesen\/MRK\?/);await expect(page.getByRole('button',{name:/^Vers 38:/})).toBeVisible();
});

test.describe('ohne geladenes Landschaftsbild',()=>{
 test.use({serviceWorkers:'block'});
 test('Begrüßung und Hauptaktion bleiben vollständig bedienbar',async({page})=>{
  await page.route('**/galilee-640*.webp',route=>route.abort());await page.goto('/');
  await page.getByRole('button',{name:'Überspringen',exact:true}).click();
  await expect(page.getByTestId('home-greeting')).toBeVisible();const action=page.getByRole('button',{name:'Jetzt Bibel lesen',exact:true});await expect(action).toBeVisible();await action.click();await expect(page).toHaveURL(/\/lesen\/MRK\?/);
 });
});
