/** Tests the A.2 design files only. This is not a Phase B app/PWA release gate. */
import {chromium} from 'playwright';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url)),out=path.join(root,'evidence'),base=process.env.OLIVE_A2_ORIGIN||'http://127.0.0.1:4732';
fs.mkdirSync(path.join(out,'screenshots'),{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
const r={study:'FP-DESIGN-20261029-OLIVE-V2-A2',date:new Date().toISOString(),browser:browser.version(),scope:'Isolated art-direction files, synthetic data only. No real app integration.',checks:[],screenshots:[],errors:[],open:['User design decision','Real iPhone Safari / PWA / VoiceOver','Layer registration and animation production','Human recognition study at 180–220px'],textScaling:'Chromium root font 16/32px, not iOS Dynamic Type.'};
const check=(name,pass,detail={})=>r.checks.push({name,pass,...detail});
async function ready(p){await p.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].filter(x=>x.loading!=='lazy').map(x=>x.decode().catch(()=>{})));});}
async function shot(p,name,board=false){await p.evaluate(async()=>{document.activeElement?.blur();scrollTo({top:0,behavior:'instant'});await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));});const file='screenshots/'+name+'.png';if(board)await p.locator('#artboard').screenshot({path:path.join(out,file)});else await p.screenshot({path:path.join(out,file)});r.screenshots.push(file);}
try{
 const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,reducedMotion:'reduce'}),p=await context.newPage();
 p.on('pageerror',e=>r.errors.push(String(e)));p.on('response',v=>{if(v.status()>=400)r.errors.push(v.status()+' '+v.url());});
 for(const theme of ['light','paper','atmospheric','night'])for(const width of [320,390]){
  await p.setViewportSize({width,height:width===320?568:844});
  for(const text of [100,200])for(let stage=0;stage<7;stage++){
   await p.goto(`${base}/preview.html?view=tree&theme=${theme}&stage=${stage}`);if(text===200)await p.addStyleTag({content:'html{font-size:32px}'});await ready(p);
   const detail=await p.evaluate(()=>({viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,images:[...document.querySelectorAll('.detail-art img')].every(x=>x.complete&&x.naturalWidth>0)}));
   check('tree-mobile-layout',detail.scrollWidth<=width&&detail.images,{theme,width,text,stage,...detail});
   if(text===100&&((theme==='light'&&width===390)||stage===6))await shot(p,`tree-${theme}-${width}-${text}-stage${stage+1}`);
  }
  for(const view of ['today','paths','seed','guide']){
   await p.goto(`${base}/preview.html?view=${view}&theme=${theme}&stage=6`);await ready(p);
   const w=await p.evaluate(()=>document.documentElement.scrollWidth);check('preview-layout',w<=width,{theme,width,view,scrollWidth:w});
   if(view==='today'){
    const b=await p.locator('.next-step .primary').boundingBox(),n=await p.locator('.app-nav').boundingBox();check('next-step-first-viewport',b.y+b.height<=n.y,{theme,width,buttonBottom:b.y+b.height,navigationTop:n.y});
    await shot(p,`today-${theme}-${width}`);
   }
   if(view==='paths')await shot(p,`paths-${theme}-${width}`);
   if(view==='seed'&&theme==='light'&&width===390)await shot(p,'seed-light-390');
   if(view==='guide'){
    check('seven-stage-meanings',await p.locator('.stage-guide li').count()===7,{theme,width});
    if(theme==='paper'&&width===390)await shot(p,'guide-paper-390');
   }
  }
  await p.goto(`${base}/?theme=${theme}`);await ready(p);check('gallery-mobile-layout',await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),{theme,width});
 }
 for(const theme of ['light','paper','atmospheric','night']){
  await p.setViewportSize({width:1500,height:1100});
  for(const board of ['masters','stages']){
   if(board==='stages')await p.setViewportSize({width:1800,height:900});
   await p.goto(`${base}/boards.html?board=${board}&theme=${theme}`);await ready(p);await shot(p,`${board}-${theme}`,true);
  }
  await p.setViewportSize({width:1000,height:700});
  for(const size of [180,200,220]){
   await p.goto(`${base}/boards.html?board=small&size=${size}&theme=${theme}`);await ready(p);
   const dims=await p.locator('.small-row img').evaluateAll(a=>a.map(x=>({width:x.getBoundingClientRect().width,height:x.getBoundingClientRect().height})));
   check('actual-thumbnail-css-size',dims.length===3&&dims.every(x=>x.width===size&&x.height===size),{theme,size,dimensions:dims});await shot(p,`small-${size}-${theme}`,true);
  }
 }
 await p.setViewportSize({width:1500,height:1100});
 for(const board of ['overlays','comparison','evolution','layers']){await p.goto(`${base}/boards.html?board=${board}`);await ready(p);if(board==='overlays')check('actual-half-opacity-overlays',await p.locator('.overlay-scene img').evaluateAll(a=>a.length===8&&a.every(x=>getComputedStyle(x).opacity==='0.5')));await shot(p,board+'-light',true);}
 for(const theme of ['light','paper','atmospheric','night']){
  await p.setViewportSize({width:390,height:844});await p.goto(`${base}/preview.html?view=tree&stage=6&theme=${theme}`);await ready(p);await p.addScriptTag({path:path.resolve('node_modules/axe-core/axe.min.js')});
  const a=await p.evaluate(()=>window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}));check('axe-tree',a.violations.length===0,{theme,violations:a.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),incomplete:a.incomplete.map(v=>v.id)});
 }
 check('no-study-personal-writes',await p.evaluate(()=>localStorage.length===0&&sessionStorage.length===0));
 check('no-study-worker-registration',await p.evaluate(async()=>(await navigator.serviceWorker.getRegistrations()).length===0));
 await context.close();
}catch(e){r.errors.push(String(e.stack));}finally{await browser.close();}
r.summary={checks:r.checks.length,failed:r.checks.filter(x=>!x.pass).length,screenshots:r.screenshots.length};r.pass=r.summary.failed===0&&r.errors.length===0;
fs.writeFileSync(path.join(out,'qa-results.json'),JSON.stringify(r,null,2)+'\n');console.log(JSON.stringify({pass:r.pass,...r.summary,errors:r.errors,failures:r.checks.filter(x=>!x.pass)},null,2));if(!r.pass)process.exitCode=1;
