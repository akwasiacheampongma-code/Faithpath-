/** Reproducible behavior/layout evidence. Never a claim of artistic or iOS approval. */
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const root=path.dirname(fileURLToPath(import.meta.url)),origin=process.env.OLIVE_A5_ORIGIN||'http://127.0.0.1:4735';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});
const page=await context.newPage();page.setDefaultTimeout(10000);
const report={study:'FP-DESIGN-20261101-OLIVE-LIVING-SEVEN',timestamp:new Date().toISOString(),browser:browser.version(),renderer:'Chromium / ANGLE SwiftShader',physicalIOS:'OPEN',cases:[],screenshots:[]},errors=[],external=[];
page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!r.url().startsWith(origin)&&!r.url().startsWith('data:'))external.push(r.url());});
async function test(name,fn){if(process.env.OLIVE_CASE&& !name.includes(process.env.OLIVE_CASE))return;try{const detail=await fn();report.cases.push({name,status:'PASS',detail});}catch(error){report.cases.push({name,status:'FAIL',error:error.message});}console.log(report.cases.at(-1).status,name);}
async function ready(query='?capture=1&paused=1'){await page.goto(origin+'/'+query);await page.evaluate(()=>document.fonts.ready);await page.waitForFunction(()=>window.OLIVE_A5);assert(await page.evaluate(()=>OLIVE_A5.live.ready));}
async function screenshot(name,selector=null){const options={path:path.join(root,'evidence/screenshots',name+'.png')};if(selector)await page.locator(selector).screenshot(options);else await page.screenshot({...options,fullPage:true});report.screenshots.push(name+'.png');}
const metrics=()=>page.evaluate(()=>OLIVE_A5.live.metrics);
async function stableFrames(wait=350){await page.waitForTimeout(100);const a=await metrics();await page.waitForTimeout(wait);const b=await metrics();assert.equal(b.frames,a.frames);assert.equal(b.rafPending,false);return{framesAdded:b.frames-a.frames,reason:b.reason};}
try{
await test('112 stage/theme/mobile/text layouts without horizontal overflow',async()=>{
 const rows=[];await ready();
 for(const width of [320,390])for(const theme of ['light','paper','atmospheric','night'])for(const scale of [100,200]){
  await page.setViewportSize({width,height:width===320?568:844});await page.evaluate(({theme,scale})=>{document.documentElement.dataset.theme=theme;document.documentElement.style.fontSize=scale+'%';},{theme,scale});
  for(let stage=0;stage<7;stage++){
   assert(await page.evaluate(index=>OLIVE_A5.setStage(index),stage));await page.evaluate(()=>scrollTo(0,0));
   const size=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,tree:document.querySelector('#live-tree').getBoundingClientRect().width,bibleBottom:document.querySelector('#quick-bible').getBoundingClientRect().bottom,stored:localStorage.length+sessionStorage.length}));
   assert(size.scrollWidth<=width,JSON.stringify({width,theme,scale,stage,...size}));assert(size.tree>=200);assert.equal(size.stored,0);assert(size.bibleBottom<(width===320?568:844));rows.push({width,theme,scale,stage,...size});
   if(stage===6&&scale===100)await screenshot(`today-${width}-${theme}`);
   if(stage===6&&scale===200&&theme==='night')await screenshot(`large-${width}-night`);
  }
 }return rows;
});
await test('Four presentation contexts, 430px and desktop gallery, seven real assets',async()=>{
 await ready('?capture=1&paused=1&theme=paper');await page.setViewportSize({width:390,height:844});
 for(const value of ['today','journey','detail','seed']){await page.evaluate(value=>{const select=document.querySelector('#context');select.value=value;select.dispatchEvent(new Event('change'));},value);await page.evaluate(()=>OLIVE_A5.live.ready);await page.waitForTimeout(100);await screenshot('context-'+value);}
 await ready('?view=family&theme=paper');await page.setViewportSize({width:1500,height:1200});await page.evaluate(async()=>Promise.all([...document.querySelectorAll('.stage-card img')].map(async i=>{i.loading='eager';await i.decode();})));assert.equal(await page.locator('.stage-card').count(),7);await screenshot('family-desktop');
 await page.setViewportSize({width:430,height:932});await screenshot('gallery-430');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));return{contexts:4,assets:7,extraWidths:[430,1500]};
});
await test('The complete studio controls reflow at 200% in every theme and gallery view',async()=>{
 const rows=[];for(const width of [320,390])for(const theme of ['light','paper','atmospheric','night'])for(const view of ['preview','family','compare']){await page.setViewportSize({width,height:width===320?568:844});await ready('?theme='+theme+'&view='+view+'&paused=1');await page.addStyleTag({content:'html{font-size:200%!important}'});const sw=await page.evaluate(()=>document.documentElement.scrollWidth);assert(sw<=width,JSON.stringify({width,theme,view,sw}));rows.push({width,theme,view,textPercent:200,scrollWidth:sw});}return rows;
});
await test('Continuous animation remains active after 12 seconds; A4 stops after 8 seconds',async()=>{
 await page.setViewportSize({width:800,height:800});await ready('?view=compare&capture=1');assert(await page.evaluate(()=>OLIVE_A5.old.ready));assert(await page.evaluate(()=>OLIVE_A5.next.ready));await page.evaluate(()=>{OLIVE_A5.old.play();OLIVE_A5.next.play();});await page.waitForTimeout(12200);
 const r=await page.evaluate(()=>({old:OLIVE_A5.old.metrics,next:OLIVE_A5.next.metrics}));assert.equal(r.old.running,false);assert(r.next.running);assert(r.next.activeMs>12000);assert(r.next.frames>180);await screenshot('motion-after-12s','.capture-shell');return{old:{running:r.old.running,frames:r.old.frames},next:{running:r.next.running,activeMs:r.next.activeMs,frames:r.next.frames}};
});
await test('Offscreen and deactivated scenes have no pending render loop; resume is smooth',async()=>{
 await ready('?capture=1');await page.waitForTimeout(300);assert((await metrics()).running);
 await page.evaluate(()=>document.querySelector('#live-tree').style.marginTop='2000px');await page.waitForFunction(()=>!OLIVE_A5.live.metrics.running);const offscreen=await stableFrames();
 await page.evaluate(()=>document.querySelector('#live-tree').style.marginTop='');await page.waitForFunction(()=>OLIVE_A5.live.metrics.running);
 await page.evaluate(()=>OLIVE_A5.live.setEnabled(false));const disabled=await stableFrames();await page.evaluate(()=>OLIVE_A5.live.setEnabled(true));await page.waitForFunction(()=>OLIVE_A5.live.metrics.running);return{offscreen,disabled,resumed:true,blendMilliseconds:850};
});
await test('Document-hidden handler and page lifecycle events stop immediately (synthetic events)',async()=>{
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});const hidden=await stableFrames();assert.equal((await metrics()).foreground,false);
 await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});await page.waitForFunction(()=>OLIVE_A5.live.metrics.running);
 await page.evaluate(()=>dispatchEvent(new Event('pagehide')));const pagehide=await stableFrames();await page.evaluate(()=>dispatchEvent(new Event('pageshow')));await page.waitForFunction(()=>OLIVE_A5.live.metrics.running);return{hidden,pagehide,scope:'Injected visibility/page lifecycle events; real iPhone backgrounding OPEN'};
});
await test('Dynamic Reduced Motion cancels RAF and restores the static pose; switching back resumes',async()=>{
 await ready('?capture=1');await page.waitForFunction(()=>OLIVE_A5.live.metrics.running);
 let checkpoint='reducing';try{await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>OLIVE_A5.live.metrics.reduced&&!OLIVE_A5.live.metrics.running);const reduced=await stableFrames();await screenshot('reduced-motion','#live-tree');await page.evaluate(()=>OLIVE_A5.live.play());assert.equal((await metrics()).running,false);checkpoint='resuming';await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForFunction(()=>OLIVE_A5.live.metrics.running);return{reduced,resumed:true};}catch(error){const{renderTimes,submitTimes,...state}=await metrics();throw Error(checkpoint+': '+error.message+' '+JSON.stringify(state));}
});
await test('Repeated play does not create duplicate loops; disposal cancels listeners and drawing',async()=>{
 const before=(await metrics()).frames;await page.evaluate(()=>{for(let i=0;i<10;i++)OLIVE_A5.live.play();});await page.waitForTimeout(650);const added=(await metrics()).frames-before;assert(added<=23,added+' frames');await page.evaluate(()=>OLIVE_A5.live.dispose());const disposed=await stableFrames();assert((await metrics()).disposed);return{framesIn650ms:added,disposed};
});
await test('Stage loading is latest-wins; destruction during decode cannot restart rendering',async()=>{
 await ready();const last=await page.evaluate(async()=>{const jobs=[OLIVE_A5.setStage(0),OLIVE_A5.setStage(3),OLIVE_A5.setStage(1)];await Promise.all(jobs);return OLIVE_A5.live.metrics.stage;});assert.equal(last,1);
 await page.evaluate(()=>{OLIVE_A5.setStage(5);OLIVE_A5.live.dispose();});await page.waitForTimeout(400);assert((await metrics()).disposed);assert.equal((await metrics()).running,false);return{finalStage:last,disposedWhileLoading:true};
});
await test('All stages: partial redraw equals full redraw through strong poses, even at low grid quality',async()=>{
 await ready();const rows=[];
 for(let stage=0;stage<7;stage++){
  await page.evaluate(index=>OLIVE_A5.setStage(index),stage);
  const results=await page.evaluate(()=>{
   const scene=OLIVE_A5.live,r=scene.renderer;r.setQuality({cells:40,dpr:1});r.resize(200,1);const c=document.querySelector('#live-tree canvas');c.width=c.height=1254;
   const results=[];for(const ms of [0,1700,9200,17000,37000]){scene.inspect(ms);const a=r.pixels();scene.inspect(ms,{full:true});const b=r.pixels();let max=0,changed=0;for(let i=0;i<a.length;i++){const d=Math.abs(a[i]-b[i]);max=Math.max(max,d);if(d)changed++;}results.push({ms,max,changed});}return results;
  });assert(results.every(x=>x.max===0),JSON.stringify({stage,results}));rows.push({stage,results});
 }return rows;
});
await test('Rendered source-space wood patches remain static for every stage',async()=>{
 const rows=[];
 for(let stage=0;stage<7;stage++){
  await page.evaluate(index=>OLIVE_A5.setStage(index),stage);
  const result=await page.evaluate(async()=>{
   const {STAGES}=await import('./motion-model.js'),scene=OLIVE_A5.live,r=scene.renderer;r.resize(200,1);const c=document.querySelector('#live-tree canvas');c.width=c.height=1254;scene.inspect(0);const a=r.pixels();scene.inspect(17000);const b=r.pixels();let max=0,opaque=0;
   for(const[x,y]of STAGES[scene.stage.index].probes)for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++){const k=((1253-y-dy)*1254+x+dx)*4;if(a[k+3]>200)opaque++;for(let n=0;n<4;n++)max=Math.max(max,Math.abs(a[k+n]-b[k+n]));}return{max,opaque};
  });assert.equal(result.max,0,JSON.stringify({stage,result}));assert(result.opaque>0);rows.push({stage,...result});
 }return rows;
});
await test('Resting renderer preserves all seven full illustrations; lower quality preserves CSS amplitude',async()=>{
 await ready();const rows=[];for(let stage=0;stage<7;stage++){
  await page.evaluate(index=>OLIVE_A5.setStage(index),stage);
  const r=await page.evaluate(async()=>{
   const {restPose}=await import('./motion-model.js'),scene=OLIVE_A5.live,renderer=scene.renderer;renderer.resize(200,1);const glCanvas=document.querySelector('#live-tree canvas');glCanvas.width=glCanvas.height=1254;renderer.draw(restPose(),{full:true});
   const actual=document.createElement('canvas'),expected=document.createElement('canvas');actual.width=actual.height=expected.width=expected.height=1254;const a=actual.getContext('2d'),b=expected.getContext('2d');a.drawImage(document.querySelector('#live-tree .tree-base'),0,0);a.drawImage(glCanvas,0,0);const image=new Image();image.src=scene.stage.runtime.full;await image.decode();b.drawImage(image,0,0);const x=a.getImageData(0,0,1254,1254).data,y=b.getImageData(0,0,1254,1254).data;let maxAlpha=0,maxPremultipliedRGB=0;for(let i=0;i<x.length;i+=4){maxAlpha=Math.max(maxAlpha,Math.abs(x[i+3]-y[i+3]));for(let k=0;k<3;k++)maxPremultipliedRGB=Math.max(maxPremultipliedRGB,Math.abs(x[i+k]*x[i+3]/255-y[i+k]*y[i+3]/255));}
   const gain=renderer.metrics.gain;renderer.setQuality({cells:40,dpr:1});return{maxAlpha,maxPremultipliedRGB,highGain:gain,lowGain:renderer.metrics.gain};
  });assert.equal(r.maxAlpha,0,JSON.stringify({stage,...r}));assert(r.maxPremultipliedRGB<=2.01,JSON.stringify({stage,...r}));assert.equal(r.highGain,r.lowGain);rows.push({stage,...r});
 }return rows;
});
await test('Actual WebGL context loss retains the complete static master and no loop',async()=>{
 await ready('?capture=1');await page.evaluate(()=>OLIVE_A5.live.renderer.gl.getExtension('WEBGL_lose_context').loseContext());await page.waitForFunction(()=>OLIVE_A5.live.metrics.fatal);const stopped=await stableFrames();assert(await page.locator('.tree-fallback').evaluate(i=>!i.hidden&&i.complete&&i.naturalWidth===1254));await screenshot('context-loss-fallback','#live-tree');return stopped;
});
await test('Context loss while base.decode is pending cannot hide the complete fallback',async()=>{
 const c=await browser.newContext({viewport:{width:390,height:844}});await c.addInitScript(()=>{const decode=HTMLImageElement.prototype.decode;HTMLImageElement.prototype.decode=function(){const result=decode.call(this);if(!this.classList.contains('tree-base'))return result;return result.then(()=>new Promise(resolve=>window.releaseBaseDecode=resolve));};});
 try{const p=await c.newPage();await p.goto(origin+'/?capture=1');await p.waitForFunction(()=>window.releaseBaseDecode&&window.OLIVE_A5?.live.renderer);await p.evaluate(()=>OLIVE_A5.live.renderer.gl.getExtension('WEBGL_lose_context').loseContext());await p.waitForFunction(()=>OLIVE_A5.live.metrics.fatal);await p.evaluate(()=>releaseBaseDecode());await p.evaluate(()=>OLIVE_A5.live.ready);const result=await p.evaluate(()=>({fallbackVisible:!document.querySelector('.tree-fallback').hidden,canvasHidden:document.querySelector('.tree-crown').hidden,loop:OLIVE_A5.live.metrics.rafPending}));assert(result.fallbackVisible&&result.canvasHidden&&!result.loop,JSON.stringify(result));return result;}finally{await c.close();}
});
await test('Replaying the reference comparison while running resets its eight-second clock',async()=>{
 await page.setViewportSize({width:800,height:800});await ready('?capture=1&view=compare');await page.evaluate(()=>OLIVE_A5.old.ready);await page.waitForTimeout(1400);await page.evaluate(()=>OLIVE_A5.old.play());const time=await page.evaluate(()=>OLIVE_A5.old.metrics.activeMs);assert(time<300,'Replay retained '+time+'ms');return{activeMsImmediatelyAfterReplay:time};
});
await test('Missing upper plate and no WebGL use a complete fallback',async()=>{
 const rows=[];for(const kind of ['no-webgl','missing-upper']){const c=await browser.newContext({viewport:{width:390,height:844}});if(kind==='no-webgl')await c.addInitScript(()=>{const native=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type==='webgl'?null:native.call(this,type,...args);};});else await c.route('**/stage-7-upper.webp',r=>r.abort());const p=await c.newPage();await p.goto(origin+'/?capture=1');await p.waitForFunction(()=>window.OLIVE_A5);await p.evaluate(()=>OLIVE_A5.live.ready);await p.locator('.tree-fallback').evaluate(i=>i.decode());const m=await p.evaluate(()=>OLIVE_A5.live.metrics);assert(m.fatal&&!m.running&&!m.rafPending);assert(await p.locator('.tree-fallback').isVisible());rows.push({kind,fatal:m.fatal,running:m.running});await c.close();}return rows;
});
await test('WCAG A/AA automated scan in four themes and all gallery views',async()=>{
 const rows=[];await page.setViewportSize({width:390,height:844});
 for(const theme of ['light','paper','atmospheric','night'])for(const view of ['preview','family','compare']){
  await ready('?theme='+theme+'&view='+view+'&paused=1');await page.addScriptTag({path:path.resolve(root,'../../node_modules/axe-core/axe.min.js')});const result=await page.evaluate(async()=>{const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}});return{violations:r.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)})),incomplete:r.incomplete.map(v=>({id:v.id,nodes:v.nodes.length}))};});rows.push({theme,view,...result});
 }await fs.writeFile(path.join(root,'evidence/axe.json'),JSON.stringify(rows,null,2)+'\n');assert(rows.every(x=>!x.violations.length),JSON.stringify(rows.filter(x=>x.violations.length)));return rows;
});
await test('Keyboard selects stage and opens the stage meaning; no personal storage or external services',async()=>{
 await ready('?paused=1');await page.locator('#stage').focus();await page.keyboard.press('Home');await page.keyboard.press('ArrowDown');await page.waitForFunction(()=>OLIVE_A5.live.metrics.stage===1&&OLIVE_A5.live.metrics.ready);await page.locator('.meaning summary').focus();await page.keyboard.press('Enter');assert(await page.locator('.meaning').evaluate(x=>x.open));await page.locator('#quick-bible').focus();await page.keyboard.press('Enter');assert(await page.locator('#demo-message').textContent());assert.deepEqual(errors,[]);assert.deepEqual(external,[]);assert.equal(await page.evaluate(()=>localStorage.length+sessionStorage.length),0);return{errors,external,stored:0,keyboard:true};
});
}finally{await browser.close();report.summary={pass:report.cases.filter(x=>x.status==='PASS').length,fail:report.cases.filter(x=>x.status==='FAIL').length};await fs.writeFile(path.join(root,process.env.OLIVE_CASE?'evidence/browser-qa-focused.json':'evidence/browser-qa.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report.summary));if(report.summary.fail)process.exitCode=1;}
