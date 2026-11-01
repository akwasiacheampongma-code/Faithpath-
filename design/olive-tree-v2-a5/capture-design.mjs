/** Real browser images of fixed sources and the actual WebGL scene. */
import fs from 'node:fs/promises';import path from 'node:path';import{fileURLToPath}from'node:url';import{chromium}from'playwright';
const root=path.dirname(fileURLToPath(import.meta.url)),origin=process.env.OLIVE_A5_ORIGIN||'http://127.0.0.1:4735',b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']}),p=await b.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1});
const observations=[];
try{
 await p.goto(origin+'/boards.html');await p.evaluate(()=>document.fonts.ready);await p.waitForFunction(()=>document.querySelectorAll('#family img').length===7);await p.evaluate(()=>Promise.all([...document.images].map(i=>i.decode())));
 await p.locator('#family').screenshot({path:path.join(root,'evidence/screenshots/SIEBEN_STUFEN_200.png')});
 const widths=await p.locator('#family img').evaluateAll(xs=>xs.map(i=>i.getBoundingClientRect().width));observations.push({image:'SIEBEN_STUFEN_200.png',actualCSSWidths:widths});
 await p.setViewportSize({width:740,height:1000});await p.screenshot({path:path.join(root,'evidence/screenshots/SIEBEN_STUFEN.png'),fullPage:true});
 await p.addStyleTag({content:'#family>figure:nth-child(-n+4){display:none}'});await p.locator('#family').screenshot({path:path.join(root,'evidence/screenshots/LETZTE_DREI_200.png')});
 await p.setViewportSize({width:390,height:844});await p.goto(origin+'/?capture=1&paused=1&size=200');await p.evaluate(()=>document.fonts.ready);await p.waitForFunction(()=>window.OLIVE_A5);await p.evaluate(()=>OLIVE_A5.live.ready);
 for(let stage=0;stage<7;stage++){await p.evaluate(index=>OLIVE_A5.setStage(index),stage);await p.evaluate(()=>OLIVE_A5.live.inspect(10250));await p.locator('#live-tree').screenshot({path:path.join(root,'evidence/screenshots','stage-'+(stage+1)+'-200.png')});}
 await p.evaluate(()=>OLIVE_A5.setStage(6));await p.evaluate(()=>document.querySelector('#live-tree').style.width='280px');
 for(const[label,ms]of[['wind-3s',3000],['wind-maximum',10250],['wind-22s',22000]]){await p.evaluate(ms=>OLIVE_A5.live.inspect(ms),ms);await p.locator('#live-tree').screenshot({path:path.join(root,'evidence/screenshots',label+'.png')});}
 await p.evaluate(async()=>{const{restPose}=await import('./motion-model.js');OLIVE_A5.live.renderer.draw(restPose(),{full:true});});await p.locator('#live-tree').screenshot({path:path.join(root,'evidence/screenshots/ruhe.png')});
 for(const view of ['preview','family','compare']){await p.goto(origin+'/?view='+view+'&paused=1');await p.evaluate(()=>document.fonts.ready);await p.addStyleTag({content:'html{font-size:200%!important}'});await p.setViewportSize({width:320,height:568});const width=await p.evaluate(()=>document.documentElement.scrollWidth);observations.push({view,cssWidth:320,textPercent:200,scrollWidth:width});if(width>320)throw Error('Gallery overflow '+view+' '+width);}
}finally{await b.close();await fs.writeFile(path.join(root,'evidence/design-capture.json'),JSON.stringify({method:'Actual Chromium screenshot',physicalIOS:'OPEN',observations},null,2)+'\n');}
