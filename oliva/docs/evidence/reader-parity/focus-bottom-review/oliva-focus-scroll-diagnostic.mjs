import { chromium, expect } from '/workspace/faithpath-next/node_modules/@playwright/test/index.mjs';
import { spawn } from 'node:child_process';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import net from 'node:net';
const root='/workspace/faithpath-next', out=root+'/docs/evidence/reader-parity/focus-bottom-review';
const port=await new Promise(resolve=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>resolve(p));});});
const server=spawn(process.execPath,['scripts/serve.mjs'],{cwd:root,env:{...process.env,PORT:String(port)},stdio:'ignore'});
const base='http://127.0.0.1:'+port;
await expect.poll(async()=>{try{return(await fetch(base)).ok;}catch{return false;}},{timeout:10000}).toBe(true);
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const results=[];
try{
 for(const rate of [1,4,6]){
  const context=await browser.newContext({viewport:{width:320,height:844},reducedMotion:'reduce'}),page=await context.newPage();
  const cdp=await context.newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate});
  await page.goto(base+'/lesen/MRK?chapter=4&mode=deep');
  await page.getByTestId('reader-flow').filter({visible:true}).waitFor();
  await page.evaluate(()=>document.fonts.ready.then(()=>undefined));
  expect(await page.locator('meta[name="oliva-build"]').getAttribute('content')).toBe('oliva-71cf17993d0bc7fd');
  await page.getByRole('main').evaluate(main=>{
   window.focusScrollLog=[];
   const rect=n=>{const r=n?.getBoundingClientRect();return r?{x:r.x,y:r.y,width:r.width,height:r.height}:null;};
   const snap=(type,detail={})=>{const last=document.querySelector('[data-testid="reader-flow"] [data-verse="41"]');window.focusScrollLog.push({type,at:performance.now(),top:main.scrollTop,max:main.scrollHeight-main.clientHeight,main:rect(main),last:rect(last),...detail});};
   main.addEventListener('scroll',()=>snap('scroll'));
   const native=main.scrollTo;main.scrollTo=function(...args){snap('scrollTo-call',{args});return Reflect.apply(native,this,args);};
   window.focusScrollSnapshot=snap;
  });
  for(const theme of ['light','dark']){
   const toggle=page.getByRole('button',{name:theme==='dark'?'Dunklen Modus aktivieren':'Hellen Modus aktivieren',exact:true});if(await toggle.count())await toggle.click();
   await page.getByRole('button',{name:'Lesefokus starten',exact:true}).click();
   const flow=page.getByTestId('reader-flow').filter({visible:true});
   await expect(page.getByRole('button',{name:'Lesefokus beenden',exact:true})).toBeInViewport({ratio:1});
   expect(await flow.locator('[data-verse]').count()).toBe(41);
   for(const label of ['Lesefokus starten','Leseeinstellungen','Versaktionen','Einfach lesen','Tiefer verstehen','Kapitel als gelesen bestätigen','Vorheriges Kapitel','Nächstes Kapitel'])await expect(page.getByRole('button',{name:label,exact:true})).toHaveCount(0);
   await flow.locator('[data-verse]').last().evaluate(node=>{window.focusScrollSnapshot('before-scrollIntoView');node.scrollIntoView({block:'start'});window.focusScrollSnapshot('after-scrollIntoView');});
   const frames=await page.getByRole('main').evaluate(main=>new Promise(resolve=>{const start=performance.now(),rows=[];function tick(){rows.push({at:performance.now(),top:main.scrollTop,max:main.scrollHeight-main.clientHeight,remaining:main.scrollHeight-main.clientHeight-main.scrollTop});if(performance.now()-start<1800)requestAnimationFrame(tick);else resolve(rows);}requestAnimationFrame(tick);}));
   const log=await page.evaluate(()=>{const value=window.focusScrollLog;window.focusScrollLog=[];return value;});
   const row={rate,theme,frames,log,atBottom:await page.getByRole('main').evaluate(main=>main.scrollHeight-main.clientHeight-main.scrollTop<2)};results.push(row);
   await page.screenshot({path:out+`/diagnostic-rate-${rate}-${theme}.png`});
   if(theme==='light')await page.getByRole('button',{name:'Lesefokus beenden',exact:true}).click();else await page.keyboard.press('Escape');
   await expect(page.getByRole('button',{name:'Lesefokus starten',exact:true})).toBeFocused();
  }
  await context.close();
 }
}finally{await browser.close();server.kill('SIGTERM');await mkdir(out,{recursive:true});await writeFile(out+'/scroll-timeline.json',JSON.stringify({checkedAt:new Date().toISOString(),sourceBuild:'oliva-71cf17993d0bc7fd',method:'Real native scrollIntoView and delegated RN DOM scrollTo observation; bounded requestAnimationFrame geometry samples, optional actual Chromium CPU throttle; no forged positions or events.',results},null,2)+'\n');}
console.log(JSON.stringify(results.map(({rate,theme,atBottom,frames,log})=>({rate,theme,atBottom,minRemaining:Math.min(...frames.map(f=>f.remaining)),maxRemaining:Math.max(...frames.map(f=>f.remaining)),scrollToCalls:log.filter(l=>l.type==='scrollTo-call').map(l=>({at:l.at,args:l.args,top:l.top,max:l.max}))}))));
