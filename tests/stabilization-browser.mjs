import fs from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {empty,KEYS} from '../src/store.js';
import {attach} from '../src/domain.js';

const base=process.env.QA_URL||'http://127.0.0.1:4174',out=process.env.QA_OUT||'qa-output/stabilization-browser';
fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.FAITHPATH_CHROMIUM||'/usr/bin/chromium',args:['--no-sandbox']});
const results=[],errors=[];
function fixture(){const d=empty(),ref={book:'JHN',chapter:3,from:1,to:1,translation:'otb'};
  d.paths=['A','B'].map(id=>({id,title:'Weg '+id,started:'2026-09-01',steps:[],reviews:[],milestones:[],links:[]}));
  d.journal=[{id:'j',text:'Gespeicherter Gedanke',date:'2026-09-01',reflectionId:'r',ref,pathIds:[]}];
  d.reflections=[{id:'r',text:'Gespeicherter Gedanke',date:'2026-09-01',ref,pathIds:[]}];attach(d,'A','j');return d;
}
async function setup(seed=fixture(),viewport={width:390,height:844}){
  const context=await browser.newContext({viewport,serviceWorkers:'block',acceptDownloads:true});
  const page=await context.newPage();page.setDefaultTimeout(10000);page.on('pageerror',e=>errors.push(e.message));
  await context.addInitScript(({seed,KEYS})=>{if(!localStorage.getItem('stabilization-seeded')){localStorage.setItem(KEYS.main,JSON.stringify(seed));localStorage.setItem(KEYS.onboard,'done');localStorage.setItem('stabilization-seeded','1');}},{seed,KEYS});
  await page.goto(base+'/#journal');await page.locator('.journal-page-entry').waitFor();return {context,page};
}
const route=async(page,hash)=>{await page.goto(base+'/#'+hash);await page.locator('#main h1').waitFor();};
const state=page=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),KEYS.main);
const draft=page=>page.evaluate(key=>localStorage.getItem(key),KEYS.draft);
const submit=page=>page.locator('#editor-form button[type=submit]').click();
async function edit(page){await route(page,'entry/j');await page.locator('.entry-options summary').click();await page.getByRole('button',{name:'Bearbeiten',exact:true}).click();}
async function test(name,fn){if(process.env.QA_CASE&&!name.includes(process.env.QA_CASE))return;try{await fn();results.push({name,status:'PASS'});console.log('PASS',name);}catch(error){results.push({name,status:'FAIL',error:error.stack});console.log('FAIL',name,error.message);}}
try{
await test('Actual editor replaces A with B and removes B, with mirror and links synchronized',async()=>{
  const {context,page}=await setup();await edit(page);await page.getByLabel('Persönlicher Weg (optional)',{exact:true}).selectOption('B');await submit(page);await page.waitForFunction(k=>JSON.parse(localStorage.getItem(k)).journal[0].pathIds[0]==='B',KEYS.main);
  assert.deepEqual((await state(page)).reflections[0].pathIds,['B']);assert(!(await state(page)).paths[0].links.some(l=>l.journalId==='j'));
  await edit(page);await page.getByLabel('Persönlicher Weg (optional)',{exact:true}).selectOption('');await submit(page);await page.waitForFunction(k=>JSON.parse(localStorage.getItem(k)).journal[0].pathIds.length===0,KEYS.main);await context.close();
});
await test('Closed journal draft survives unrelated form, export, reload, resume and save',async()=>{
  const {context,page}=await setup();await edit(page);await page.getByLabel('Dein Gedanke',{exact:true}).fill('Ungespeichert & persönlich');await page.waitForFunction(k=>JSON.parse(localStorage.getItem(k)).values.text==='Ungespeichert & persönlich',KEYS.draft);
  await page.getByRole('button',{name:'Schließen',exact:true}).click();await page.evaluate(()=>navigator.locks.request('faithpath-journal-write',async()=>{}));const raw=await draft(page);await route(page,'paths');await page.locator('[data-action="new-path"]').first().click();
  await page.getByRole('dialog',{name:'Ein Entwurf wartet auf dich'}).waitFor();assert.equal(await draft(page),raw);
  const download=page.waitForEvent('download');await page.getByRole('button',{name:'Entwurf als Datei sichern'}).click();await(await download).saveAs(out+'/draft-export.json');assert.equal(await draft(page),raw);
  await page.reload();await route(page,'today');await page.getByRole('button',{name:'Entwurf fortsetzen',exact:true}).click();assert.equal(await page.getByLabel('Dein Gedanke',{exact:true}).inputValue(),'Ungespeichert & persönlich');
  await submit(page);await page.waitForFunction(k=>JSON.parse(localStorage.getItem(k)).journal[0].text==='Ungespeichert & persönlich',KEYS.main);assert.equal(await draft(page),null);await context.close();
});
await test('Reflection draft survives cancellation and resumes with archived selected path',async()=>{
  const seed=fixture();seed.paths[0].archived=true;seed.journal[0].pathIds=['B'];seed.reflections[0].pathIds=['B'];
  const {context,page}=await setup(seed);const raw=JSON.stringify({type:'entry',args:{id:'j'},values:{text:'Mein Entwurf',kind:'Reflexion',pathId:'A'}});
  await page.evaluate(({key,raw})=>localStorage.setItem(key,raw),{key:KEYS.draft,raw});await route(page,'today');await page.getByRole('button',{name:'Entwurf fortsetzen',exact:true}).click();
  assert.equal(await page.getByLabel('Persönlicher Weg (optional)',{exact:true}).inputValue(),'A');await submit(page);await page.waitForFunction(k=>JSON.parse(localStorage.getItem(k)).journal[0].text==='Mein Entwurf',KEYS.main);assert.deepEqual((await state(page)).journal[0].pathIds,['A']);await context.close();
});
await test('Two tabs preserve the first draft while a second tab saves its distinct journal text',async()=>{
  const {context,page}=await setup();await edit(page);const second=await context.newPage();await edit(second);
  await page.getByLabel('Dein Gedanke',{exact:true}).fill('Entwurf des ersten Tabs');await page.waitForFunction(k=>JSON.parse(localStorage.getItem(k)).values.text==='Entwurf des ersten Tabs',KEYS.draft);const raw=await draft(page);
  await second.getByLabel('Dein Gedanke',{exact:true}).fill('Gespeichert im zweiten Tab');await second.getByRole('status').filter({hasText:'anderer oder neuerer Entwurf'}).waitFor();assert.equal(await draft(second),raw);
  await submit(second);await second.waitForFunction(k=>JSON.parse(localStorage.getItem(k)).journal[0].text==='Gespeichert im zweiten Tab',KEYS.main);assert.equal(await draft(second),raw);await context.close();
});
await test('In-flight save disables text input and double submit until the journal lock releases',async()=>{
  const {context,page}=await setup();await edit(page);await page.getByLabel('Dein Gedanke',{exact:true}).fill('Letzter Text vor Speichern');await page.waitForFunction(k=>JSON.parse(localStorage.getItem(k)).values.text==='Letzter Text vor Speichern',KEYS.draft);
  await page.evaluate(()=>{window.saveGate=navigator.locks.request('faithpath-journal-write',()=>new Promise(resolve=>{window.releaseSave=resolve;}));});await submit(page);
  assert(await page.getByLabel('Dein Gedanke',{exact:true}).isDisabled());assert(await page.locator('#editor-form button[type=submit]').isDisabled());
  await page.keyboard.press('Escape');assert(await page.getByRole('dialog').isVisible());await page.evaluate(()=>window.releaseSave());await page.waitForFunction(k=>JSON.parse(localStorage.getItem(k)).journal[0].text==='Letzter Text vor Speichern',KEYS.main);await page.waitForFunction(()=>!document.querySelector('dialog').open);await context.close();
});
await test('Cancel note deletion never adopts a newer draft and allows exporting the original editor words',async()=>{
  const {context,page}=await setup();await edit(page);await page.getByLabel('Dein Gedanke',{exact:true}).fill('Meine Worte vor dem Dialog');await page.waitForFunction(k=>JSON.parse(localStorage.getItem(k)).values.text==='Meine Worte vor dem Dialog',KEYS.draft);
  await page.getByRole('button',{name:'Notiz an der Bibelstelle entfernen',exact:true}).click();
  const newer=JSON.stringify({type:'entry',args:{},values:{text:'Neuerer Entwurf'}});await page.evaluate(({key,raw})=>localStorage.setItem(key,raw),{key:KEYS.draft,raw:newer});
  await page.getByRole('button',{name:'Abbrechen',exact:true}).click();await page.getByRole('dialog',{name:'Ein neuerer Entwurf bleibt erhalten'}).waitFor();assert.equal(await draft(page),newer);
  const download=page.waitForEvent('download');await page.getByRole('button',{name:'Meine Worte als Datei sichern'}).click();await(await download).saveAs(out+'/conflict-export.json');assert.equal(JSON.parse(fs.readFileSync(out+'/conflict-export.json')).draft.values.text,'Meine Worte vor dem Dialog');await context.close();
});
await test('Malformed import cannot change saved state or a pending personal draft',async()=>{
  const {context,page}=await setup();await page.evaluate(k=>localStorage.setItem(k,'original draft bytes'),KEYS.draft);const before=await state(page);
  const bad=fixture();bad.journal[0].pathIds={};await route(page,'more?section=data');await page.locator('#import-file').setInputFiles({name:'broken.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({app:'FaithPath',data:bad}))});
  await page.getByRole('status').filter({hasText:'Import abgebrochen'}).waitFor();assert.deepEqual(await state(page),before);assert.equal(await draft(page),'original draft bytes');await context.close();
});
await test('Removing the Bible-note role preserves unsaved reflection words and allows saving them without restoring that role',async()=>{
  const {context,page}=await setup();await route(page,'reflection/r');await page.getByRole('button',{name:'Notiz bearbeiten',exact:true}).click();
  await page.getByLabel('Dein Gedanke',{exact:true}).fill('Noch ungespeicherte Reflexion');await page.waitForFunction(k=>JSON.parse(localStorage.getItem(k)).values.text==='Noch ungespeicherte Reflexion',KEYS.draft);
  await page.getByRole('dialog').getByRole('button',{name:'Notiz an der Bibelstelle entfernen',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'Notiz an der Bibelstelle entfernen',exact:true}).click();
  await page.waitForFunction(k=>!!JSON.parse(localStorage.getItem(k)).reflections[0].bibleNoteDeletedAt,KEYS.main);assert(await draft(page));
  await route(page,'today');await page.getByRole('button',{name:'Entwurf fortsetzen',exact:true}).click();assert.equal(await page.getByLabel('Dein Gedanke',{exact:true}).inputValue(),'Noch ungespeicherte Reflexion');
  await submit(page);await page.waitForFunction(k=>JSON.parse(localStorage.getItem(k)).reflections[0].text==='Noch ungespeicherte Reflexion',KEYS.main);assert((await state(page)).reflections[0].bibleNoteDeletedAt);assert.equal(await draft(page),null);await context.close();
});
for(const [width,height] of [[320,568],[375,667],[390,844],[430,932]])await test(`Draft conflict dialog fits ${width}×${height}`,async()=>{
  const {context,page}=await setup(fixture(),{width,height});await page.evaluate(k=>localStorage.setItem(k,JSON.stringify({type:'entry',args:{},values:{text:'Mein Gedanke'}})),KEYS.draft);
  await page.locator('[data-action=new-entry]').click();await page.getByRole('dialog',{name:'Ein Entwurf wartet auf dich'}).waitFor();
  assert(await page.getByRole('button',{name:'Entwurf fortsetzen',exact:true}).isVisible());assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.screenshot({path:`${out}/draft-conflict-${width}.png`});await context.close();
});
}finally{await browser.close();fs.writeFileSync(out+'/results.json',JSON.stringify({base,results,errors},null,2));}
if(results.some(r=>r.status==='FAIL')||errors.length)process.exitCode=1;
