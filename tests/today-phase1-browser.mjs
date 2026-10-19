// Axe audit contexts bypass CSP for its diagnostic styles; uninstrumented 6B route audit verifies the production CSP.
import fs from 'node:fs';import assert from 'node:assert/strict';import {createRequire} from 'node:module';import {chromium} from 'playwright';
import {KEYS} from '../src/store.js';import {BUILD} from '../src/version.js';import {todayFixture,TEST_NOW} from './today-phase1-fixtures.mjs';
const base=process.env.QA_URL||'http://127.0.0.1:4361',out='qa-output/uiux-phase1/browser';fs.mkdirSync(out,{recursive:true});
const axe=fs.readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'),'utf8');
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']}),results=[],errors=[],measurements=[],accessibility=[];
const check=async(name,fn)=>{try{await fn();results.push({name,status:'PASS'});console.log('PASS',name)}catch(error){results.push({name,status:'FAIL',error:error.stack});console.log('FAIL',name,error.message)}};
const states=['new','returning','draft','draft-only','review','many-reviews','archived','no-step','reading-only','journal-only','guided-only','many-paths','long'];
const route=async(p,hash)=>{await p.goto(base+'/#'+hash);await p.locator('#main h1').waitFor();};
async function measure(p){return p.evaluate(()=>{const box=s=>{const el=document.querySelector(s);if(!el)return null;const r=el.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom}};return{width:innerWidth,height:innerHeight,nav:box('.primary-nav'),tree:box('.today-tree .olive-art'),primary:box('.today-path-action'),draft:box('.draft-strip'),overflow:document.documentElement.scrollWidth>innerWidth}})}
async function layout(p){
 assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Horizontal overflow');
 const tree=p.locator('.today-tree .olive-art');assert(await tree.evaluate(el=>el.viewBox.baseVal.width>0&&el.getBBox().width>0),'Complete tree image');
 assert.equal(await p.locator('#main h1').count(),1);
 for(const el of await p.locator('#main a,#main button').all()){
  await el.evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));const r=await el.boundingBox();assert(r&&r.height>=43.5,'Touch target below 44px: '+await el.innerText());
  assert(await el.evaluate(el=>{const r=el.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return hit===el||el.contains(hit)}),'Control covered: '+await el.innerText());
 }
 await p.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
}
try{
 for(const width of [320,390])for(const theme of ['light','atmospheric','paper','night']){
  const height=width===320?568:844,c=await browser.newContext({bypassCSP:true,viewport:{width,height},isMobile:true,hasTouch:true,reducedMotion:'reduce',acceptDownloads:true});
  const p=await c.newPage();p.setDefaultTimeout(15000);p.on('pageerror',e=>errors.push(e.message));
  await c.addInitScript(now=>Date.now=()=>Date.parse(now),TEST_NOW);
  await route(p,'more?section=settings');await p.locator('#offline-state').filter({hasText:'Beide Bibeln und die App sind für dieses Gerät offline bereit.'}).waitFor({timeout:90000});
  // Dismiss only the initial onboarding dialog; following states are synthetic.
  if(await p.locator('dialog[open]').count())await p.locator('dialog [data-action="onboard-skip"]').click().catch(async()=>{await p.evaluate(()=>document.querySelector('dialog').close())});
  for(const name of states)await check(`${name} / ${theme} / ${width}`,async()=>{
   const seed=todayFixture(name,theme);await p.evaluate(({seed,KEYS})=>{localStorage.setItem(KEYS.main,JSON.stringify(seed.data));localStorage.setItem(KEYS.onboard,'done');localStorage.removeItem(KEYS.draft);if(seed.draft)localStorage.setItem(KEYS.draft,JSON.stringify(seed.draft));},{seed,KEYS});
   await p.reload();await route(p,'today');await p.locator('.today-tree .olive-art').waitFor();await p.locator('.toast.visible').waitFor({state:'hidden',timeout:8000});
   assert.equal(await p.locator('html').getAttribute('data-theme'),theme);assert.equal(await p.locator('.today-phase1').count(),1);assert.equal(await p.locator('#main').getByText('Neu im Glauben',{exact:true}).count(),0);
   const raw=await p.evaluate(KEYS=>({main:localStorage.getItem(KEYS.main),draft:localStorage.getItem(KEYS.draft)}),KEYS);
   await layout(p);const m=await measure(p);measurements.push({name,theme,...m});
   if(name==='new'||name==='draft-only')for(const a of await p.locator('.today-entry-actions .button').all())assert((await a.boundingBox()).y+(await a.boundingBox()).height<=m.nav.y+1,'New-user entry below navigation');
   if(name==='returning'||name==='draft'){
    if(width===390){assert(m.primary.bottom<=m.nav.y+1,'Primary action outside first viewport');assert(m.tree.bottom<=m.nav.y+1,'Tree outside first viewport');}
    assert.equal(await p.locator('#main a[href="#path/today-path"]').count(),1);
   }
   assert.equal(await p.locator('.draft-strip').count(),seed.draft?1:0);if(seed.draft){assert(m.draft.y<m.tree.y);await p.getByRole('button',{name:'Entwurf fortsetzen',exact:true}).click();assert.equal(await p.getByLabel('Dein Gedanke',{exact:true}).inputValue(),seed.draft.values.text);await route(p,'today');}
   assert.equal(await p.locator('[data-action="gap"]').count(),['review','many-reviews'].includes(name)?1:0);
   if(name==='many-paths')assert.equal(await p.locator('.today-other-paths .list-row').count(),2);
   if(name==='archived'){assert.equal(await p.locator('.today-next').count(),0);assert.equal(await p.getByRole('link',{name:'Wege und Archiv öffnen',exact:true}).getAttribute('href'),'#paths');await p.getByRole('link',{name:'Wege und Archiv öffnen',exact:true}).click();await p.getByRole('button',{name:'Archiv',exact:true}).click();await p.locator('.path-list a[href="#path/today-path"]').click();await p.locator('#main h1').filter({hasText:'In Ruhe zuhören'}).waitFor();await route(p,'today');}
   if(name==='no-step'){assert.equal(await p.locator('.today-next .overline').textContent(),'Dein aktueller Weg');assert(!(await p.locator('.today-next').innerText()).includes('Dein nächster Schritt'));}
   if(name==='reading-only')assert.equal(await p.locator('.today-reading a').getAttribute('href'),'#read/JHN/3/otb');
   if(name==='long')assert.equal(await p.locator('.today-step-text').innerText(),seed.data.paths[0].steps[0].text.trim());
   if(['new','returning','draft','review','archived'].includes(name)){await p.evaluate(()=>window.scrollTo(0,0));await p.screenshot({path:`${out}/${name}-${theme}-${width}.png`});}
   // Merely viewing Today and reloading must not alter any personal data.
   if(!seed.draft){await p.reload();await p.locator('.today-phase1').waitFor();assert.deepEqual(await p.evaluate(KEYS=>({main:localStorage.getItem(KEYS.main),draft:localStorage.getItem(KEYS.draft)}),KEYS),raw);}
  });
  await check(`Accessibility and keyboard / ${theme} / ${width}`,async()=>{
   const seed=todayFixture('returning',theme);await p.evaluate(({seed,KEYS})=>localStorage.setItem(KEYS.main,JSON.stringify(seed.data)),{seed,KEYS});await p.reload();await route(p,'today');await p.evaluate(axe);
   const report=await p.evaluate(async()=>await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}));accessibility.push({theme,width,violations:report.violations});assert.deepEqual(report.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[]);
   const primary=p.locator('.today-path-action');await primary.focus();assert(await primary.evaluate(el=>el===document.activeElement&&getComputedStyle(el).outlineStyle!=='none'));await p.keyboard.press('Enter');await p.locator('#main h1').filter({hasText:'In Ruhe zuhören'}).waitFor();assert(p.url().endsWith('#path/today-path'));
   await p.getByRole('link',{name:'FaithPath Startseite',exact:true}).click();await p.locator('.today-phase1').waitFor();
   assert(await p.locator('#main h1').evaluate(el=>el===document.activeElement),'Route handoff must focus Today heading');
  });
  await check(`Entry navigation and first-path creation / ${theme} / ${width}`,async()=>{
   const seed=todayFixture('new',theme);await p.evaluate(({seed,KEYS})=>{localStorage.setItem(KEYS.main,JSON.stringify(seed.data));localStorage.removeItem(KEYS.draft);},{seed,KEYS});await p.reload();await route(p,'today');
   await p.getByRole('link',{name:'Themen und Orientierung entdecken',exact:true}).click();await p.getByRole('heading',{name:'Was beschäftigt dich?',exact:true}).waitFor();
   await p.locator('.beginner-entry a[href="#guide/start"]').click();await p.locator('#main h1').waitFor();assert(p.url().includes('#guide/start'));
   await route(p,'today');await p.getByRole('link',{name:'Direkt zur Bibel',exact:true}).click();await p.locator('.bible-page').waitFor();assert(p.url().endsWith('#bible'));
   await route(p,'today');await p.getByRole('button',{name:'Einen Weg beginnen',exact:true}).click();assert(await p.getByRole('dialog').isVisible());await p.getByRole('dialog').getByRole('button',{name:'Schließen',exact:true}).click();assert.equal(await p.evaluate(k=>JSON.parse(localStorage.getItem(k)).paths.length,KEYS.main),0);
  });
  await c.close();
 }
 // Seven stage titles, zoom, simulated safe areas and very long personal prose.
 for(const [name,width,font,safe]of [...Array.from({length:7},(_,i)=>['stage-'+i,390,100,false]),['long',320,200,false],['returning',390,200,true],['new',320,200,true]])await check(`Stress ${name} / ${width} / text ${font}% / safe ${safe}`,async()=>{
  const c=await browser.newContext({bypassCSP:true,viewport:{width,height:width===320?568:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});const seed=todayFixture(name,'night');
  await c.addInitScript(({seed,KEYS,font,safe})=>{if(!localStorage.getItem(KEYS.main)){localStorage.setItem(KEYS.main,JSON.stringify(seed.data));localStorage.setItem(KEYS.onboard,'done');}document.addEventListener('DOMContentLoaded',()=>{document.documentElement.style.fontSize=font+'%';if(safe){document.documentElement.style.setProperty('--safe-top','44px');document.documentElement.style.setProperty('--safe-bottom','34px');}})},{seed,KEYS,font,safe});
  const p=await c.newPage();await route(p,'today');await p.locator('.today-tree .olive-art').waitFor();await layout(p);if(name.startsWith('stage-'))assert.equal(await p.locator('.today-tree .olive-art').getAttribute('data-tree-stage'),name.at(-1));
  await p.screenshot({path:`${out}/stress-${name}-${width}-${font}-${safe}.png`,fullPage:true});await c.close();
 });
}finally{await browser.close();fs.writeFileSync(out+'/results.json',JSON.stringify({build:BUILD,base,results,errors,measurements,accessibility,physicalDeviceGate:'OFFEN',syntheticDataOnly:true},null,2));}
if(errors.length||results.some(r=>r.status==='FAIL'))process.exitCode=1;
