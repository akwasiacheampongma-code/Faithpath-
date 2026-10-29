/** Phase A only: tests the isolated gallery, never the app's personal storage. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
const root=path.dirname(fileURLToPath(import.meta.url));
const origin=process.env.OLIVE_STUDY_ORIGIN||'http://127.0.0.1:4731';
const evidence=path.join(root,'evidence');
fs.mkdirSync(path.join(evidence,'screenshots'),{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const results={study:'FP-DESIGN-20261029-OLIVE-V2-A',date:new Date().toISOString(),browser:browser.version(),
 syntheticDataOnly:true,scope:'Isolated Phase A study; not an app integration or device certification.',
 textScaling:'Root font size 16/32px in Chromium; not Safari page zoom or iOS Dynamic Type.',
 physicalIphone:'OPEN',voiceOver:'OPEN',phaseB:'NOT_STARTED',checks:[],screenshots:[],errors:[],open:[]};
const errors=[];
function check(name,pass,detail={}){results.checks.push({name,pass,...detail});if(!pass)errors.push({name,...detail});}
async function ready(page){await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].filter(x=>x.loading!=='lazy').map(x=>x.decode().catch(()=>{})));});}
async function capture(page,name,fullPage=false){const relative='screenshots/'+name+'.png';await page.evaluate(async()=>{document.activeElement?.blur();scrollTo({top:0,behavior:'instant'});await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));});await page.screenshot({path:path.join(evidence,relative),fullPage});results.screenshots.push(relative);}
async function overflow(page){return page.evaluate(()=>({width:innerWidth,documentWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth}));}
try{
 const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,reducedMotion:'reduce'});
 const page=await context.newPage();
 page.on('pageerror',e=>results.errors.push(e.message));
 page.on('response',r=>{if(r.status()>=400)results.errors.push(r.status()+' '+r.url());});
 const themes=['light','paper','atmospheric','night'];
 for(const theme of themes)for(const width of [320,390])for(const text of [100,200]){
  const height=width===320?568:844;
  await page.setViewportSize({width,height});
  for(let stage=0;stage<7;stage++){
   const test={theme,width,height,text,stage};
   await page.goto(`${origin}/preview.html?view=tree&theme=${theme}&stage=${stage}`);
   if(text===200)await page.addStyleTag({content:'html{font-size:32px}'});
   await ready(page);
   const flow=await overflow(page);
   const images=await page.locator('.detail-art img').evaluateAll(a=>a.every(x=>x.complete&&x.naturalWidth>0));
   check('tree-layout',flow.documentWidth<=width&&flow.bodyWidth<=width&&images,{...test,...flow,images});
   await page.locator('summary').click();
   check('stage-guide-opens',await page.locator('details').getAttribute('open')!==null,test);
   await page.locator('summary').click();
   check('stage-guide-closes',await page.locator('details').getAttribute('open')===null,test);
   if((width===390&&text===100)||(width===320&&text===200&&stage===6))await capture(page,`tree-${theme}-${width}-${text}-stage${stage+1}`);
  }
  for(const view of ['today','paths','seed','guide']){
   const test={theme,width,height,text,view};
   await page.goto(`${origin}/preview.html?view=${view}&theme=${theme}&stage=6`);
   if(text===200)await page.addStyleTag({content:'html{font-size:32px}'});
   await ready(page);const flow=await overflow(page);
   check('view-layout',flow.documentWidth<=width&&flow.bodyWidth<=width,{...test,...flow});
   if(view==='today'){
    const brand=await page.locator('.brand').evaluate(el=>({height:el.getBoundingClientRect().height,line:parseFloat(getComputedStyle(el).lineHeight)}));
    check('brand-single-line',brand.height<=brand.line+1,{...test,...brand});
    const primary=page.locator('.next-step .primary');
    if(text===100){const b=await primary.boundingBox(),nav=await page.locator('.app-nav').boundingBox();check('next-step-first-screen',b.y+b.height<=nav.y,{...test,buttonBottom:b.y+b.height,navTop:nav.y});}
    await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));
    const end=await page.locator('.small-thought').boundingBox(),nav=await page.locator('.app-nav').boundingBox();
    check('content-clear-of-navigation',end.y+end.height<=nav.y+1,{...test,lastContentBottom:end.y+end.height,navTop:nav.y});
    await page.evaluate(()=>scrollTo(0,0));
    if(text===100)await capture(page,`today-${theme}-${width}-${text}`);
   }
   if(theme==='night'&&width===390&&text===100&&view==='paths')await capture(page,'paths-night-390');
   if(theme==='light'&&width===390&&text===100&&view==='seed')await capture(page,'first-seed-light-390');
   if(theme==='paper'&&width===390&&text===100&&view==='guide')await capture(page,'guide-paper-390',true);
  }
 }
 await page.setViewportSize({width:390,height:844});
 await page.goto(`${origin}/preview.html?view=today&theme=night&stage=6`);await ready(page);
 await page.getByRole('button',{name:/Meinen Weg ansehen/}).click();
 check('prototype-navigation',await page.locator('.view-paths').count()===1);
 await page.getByRole('button',{name:'Bibel',exact:true}).click();
 check('demo-action-is-explicit',await page.locator('dialog').evaluate(x=>x.open));
 await page.getByRole('button',{name:'Verstanden'}).click();
 check('dialog-closes',!await page.locator('dialog').evaluate(x=>x.open));
 await page.keyboard.press('Tab');
 check('keyboard-focus',await page.evaluate(()=>document.activeElement!==document.body));
 check('no-personal-storage-writes',await page.evaluate(()=>localStorage.length===0&&sessionStorage.length===0));
 check('no-service-worker-registration',await page.evaluate(async()=>(await navigator.serviceWorker.getRegistrations()).length===0));
 for(const theme of themes){
  await page.setViewportSize({width:1800,height:760});
  await page.goto(`${origin}/sheet.html?theme=${theme}`);await ready(page);
  await capture(page,'seven-stages-'+theme,true);
  await page.setViewportSize({width:1440,height:960});
  await page.goto(`${origin}/?theme=${theme}`);await ready(page);
  check('old-svg-loaded',await page.locator('#old-art').evaluate(x=>x.complete&&x.naturalWidth>0),{theme});
  await capture(page,'master-'+theme);
  await page.locator('#compare').scrollIntoViewIfNeeded();
  await page.locator('#compare').screenshot({path:path.join(evidence,'screenshots','comparison-'+theme+'.png')});results.screenshots.push('screenshots/comparison-'+theme+'.png');
 }
 for(const theme of themes)for(const width of [320,390])for(const text of [100,200]){
  await page.setViewportSize({width,height:width===320?568:844});
  await page.goto(`${origin}/?theme=${theme}`);if(text===200)await page.addStyleTag({content:'html{font-size:32px}'});await ready(page);
  const flow=await overflow(page);check('gallery-layout',flow.documentWidth<=width,{theme,width,text,...flow});
 }
 await page.setViewportSize({width:390,height:844});
 for(const theme of themes){
  await page.goto(`${origin}/preview.html?view=tree&theme=${theme}&stage=6`);await ready(page);
  await page.addScriptTag({path:path.resolve('node_modules/axe-core/axe.min.js')});
  const axe=await page.evaluate(()=>window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}));
  check('axe-tree',axe.violations.length===0,{theme,violations:axe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)})),incomplete:axe.incomplete.map(v=>v.id)});
 }
 await page.goto(origin+'/');await ready(page);await page.addScriptTag({path:path.resolve('node_modules/axe-core/axe.min.js')});
 const axe=await page.evaluate(()=>window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}));check('axe-gallery',axe.violations.length===0,{violations:axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),incomplete:axe.incomplete.map(v=>v.id)});
 await context.close();
 const local=await browser.newContext({offline:true});const file=await local.newPage();
 try{
  await file.goto(pathToFileURL(path.join(root,'index.html')).href);await ready(file);
  check('portable-file-gallery-offline',await file.locator('.stage-card').count()===7&&await file.locator('.master-art').evaluate(x=>x.complete&&x.naturalWidth>0));
  await file.goto(pathToFileURL(path.join(root,'preview.html')).href+'?view=tree&stage=6&theme=night');await ready(file);
  check('portable-file-preview-offline',await file.locator('.detail-art img').evaluate(x=>x.complete&&x.naturalWidth>0));
 }catch(e){if(String(e).includes('ERR_BLOCKED_BY_ADMINISTRATOR'))results.open.push({name:'file-protocol-offline',reason:'Managed browser policy blocks file:// navigation. Local HTTP gallery tested; double-click opening requires manual confirmation.'});else throw e;}
 await local.close();
}catch(e){results.errors.push(e.stack);}finally{await browser.close();}
results.failures=errors;results.pass=errors.length===0&&results.errors.length===0;
results.summary={checks:results.checks.length,passed:results.checks.filter(x=>x.pass).length,failed:errors.length,screenshots:results.screenshots.length};
fs.writeFileSync(path.join(evidence,'qa-results.json'),JSON.stringify(results,null,2)+'\n');
console.log(JSON.stringify({pass:results.pass,...results.summary,errors:results.errors,failures:errors},null,2));
if(!results.pass)process.exitCode=1;
