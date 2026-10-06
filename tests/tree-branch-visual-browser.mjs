import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {chromium} from 'playwright';
import {KEYS} from '../src/store.js';
import {treeLevel} from '../src/domain.js';
import {treeBranches} from '../src/tree-branches.js';
import {experienceFixture} from './final-experience-fixture.mjs';

const base=process.env.FAITHPATH_QA_URL||'http://127.0.0.1:4270';
const out=process.env.FAITHPATH_QA_OUT||'qa-output/tree-branch-visual-refinement/after';
const before=process.env.BRANCH_BEFORE==='1';
fs.mkdirSync(out,{recursive:true});
const axe=fs.readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'),'utf8');
const cases=[];
for(const theme of ['light','atmospheric','paper','night']) {
 for(const [width,height,text] of [[390,844,100],[320,568,200],[768,1024,100]])
  for(const count of [1,3,5,8]) cases.push({theme,width,height,text,count});
 for(const milestones of [8,12]) cases.push({theme,width:390,height:844,text:100,count:5,milestones});
}
const results=[],errors=[],consoleErrors=[],loadErrors=[];
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
try {
 for(const test of cases.slice(0,Number(process.env.BRANCH_LIMIT)||cases.length)) {
  const {theme,width,height,text,count,milestones}=test;
  const name=`${theme}-${width}-${text}-${count}${milestones?'-history-'+milestones:''}`;
  const seed=experienceFixture(count);seed.settings.theme=theme;
  if(milestones) seed.paths[0].milestones=Array.from({length:milestones},(_,i)=>({id:'qa-milestone-'+i,text:'Selbst dokumentiert',date:'2026-09-12T12:00:00Z'}));
  const expected=treeBranches(seed,treeLevel(seed));
  const context=await browser.newContext({viewport:{width,height},serviceWorkers:'block',reducedMotion:'reduce'});
  await context.addInitScript(({seed,KEYS,text})=>{
   if(!localStorage.getItem(KEYS.main)){localStorage.setItem(KEYS.main,JSON.stringify(seed));localStorage.setItem(KEYS.onboard,'done');}
   document.addEventListener('DOMContentLoaded',()=>document.documentElement.style.fontSize=text+'%');
  },{seed,KEYS,text});
  const p=await context.newPage();p.setDefaultTimeout(10000);
  p.on('pageerror',e=>errors.push(e.message));
  p.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text());});
  p.on('response',r=>{if(r.status()>=400)loadErrors.push(r.url());});
  try {
   await p.goto(base+'/#tree',{waitUntil:'networkidle'});
   const scene=p.locator('.tree-branch-scene');await scene.waitFor();
   const warning=p.locator('#toast').filter({hasText:'Offline-Vorbereitung konnte nicht abgeschlossen'});
   if(await warning.isVisible()) await warning.getByRole('button',{name:'Meldung schließen'}).click();
   const dataBefore=await p.evaluate(k=>localStorage.getItem(k),KEYS.main);
   assert.equal(await p.locator('.tree-branch-hit').count(),expected.visible.length);
   assert.equal(await p.locator('.tree-other-paths li').count(),expected.other.length);
   await scene.scrollIntoViewIfNeeded();
   await p.screenshot({path:path.join(out,name+'.png')});
   // Isolated artwork crop: temporarily hide fixed navigation using CSSOM, respecting CSP.
   const navVisibility=await p.locator('.primary-nav').evaluate(el=>{const old=el.style.visibility;el.style.visibility='hidden';return old;});
   await scene.screenshot({path:path.join(out,name+'-tree.png')});
   await p.locator('.primary-nav').evaluate((el,old)=>el.style.visibility=old,navVisibility);
   const hits=await p.locator('.tree-branch-hit').all(),boxes=[];
   for(let i=0;i<hits.length;i++) {
    const a=hits[i],r=await a.boundingBox();boxes.push(r);
    assert(r.width>=44&&r.height>=44,'hit area below 44px');
    assert.equal(await a.getAttribute('href'),'#path/'+encodeURIComponent(expected.visible[i].path.id));
    assert.equal(await a.getAttribute('aria-label'),'Weg '+expected.visible[i].path.title+', öffnen');
    assert.equal((await a.innerText()).trim(),String(i+1));
    assert((await p.locator('.tree-paths li').nth(i).innerText()).includes(expected.visible[i].path.title));
    if(!before) {
     assert.equal(await a.locator('.tree-branch-marker').count(),1,'small visual marker must be separate from hit target');
     const face=await a.locator('.tree-branch-marker').boundingBox();
     assert(face,'small visual marker must be separate from hit target');
     const aligned=await a.evaluate((el,index)=>{
      const curve=document.querySelectorAll('.tree-branch-overlay .branch-bark')[index],end=curve.getPointAtLength(curve.getTotalLength()),point=new DOMPoint(end.x,end.y).matrixTransform(curve.getScreenCTM()),box=el.getBoundingClientRect();
      return Math.hypot(point.x-(box.x+box.width/2),point.y-(box.y+box.height/2))<1;
     },i);
     assert(aligned,'marker is detached from its branch endpoint');
     assert(face.width<r.width&&face.height<r.height,'visual marker still dominates hit target');
     assert(await a.locator('.tree-branch-marker').evaluate(el=>el.scrollWidth<=el.clientWidth),'marker numeral clipped');
    }
   }
   for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++) {
    const a=boxes[i],b=boxes[j];assert(!(a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y),'hit targets overlap');
   }
   assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'horizontal overflow');
   if(!before) {
    await p.evaluate(axe);
    const review=await p.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}));
    assert.deepEqual(review.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[]);
    await p.keyboard.press('Tab');
    await hits[0].focus();
    assert(await hits[0].evaluate(el=>document.activeElement===el&&getComputedStyle(el).outlineStyle==='solid'),'focus invisible');
    await p.screenshot({path:path.join(out,name+'-focus.png')});
    await p.keyboard.press('Enter');
    await p.locator('.path-history-facts').waitFor();
    assert(p.url().endsWith('#path/'+encodeURIComponent(expected.visible[0].path.id)));
    assert.equal(await p.evaluate(k=>localStorage.getItem(k),KEYS.main),dataBefore,'tree display/interaction changed user data');
   }
   results.push({...test,name,stage:treeLevel(seed),status:'PASS',targets:boxes.length});
  } catch(e) {results.push({...test,name,status:'FAIL',error:e.stack});console.log('FAIL',name,e.message);}
  await context.close();
 }
} finally {
 await browser.close();
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({base,before,results,errors,consoleErrors,loadErrors},null,2));
}
console.log(JSON.stringify({cases:results.length,fail:results.filter(x=>x.status==='FAIL').length,errors:errors.length,console:consoleErrors.length,loads:loadErrors.length}));
if(results.some(x=>x.status==='FAIL')||errors.length||consoleErrors.length||loadErrors.length) process.exitCode=1;
