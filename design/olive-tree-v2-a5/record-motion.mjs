/** Actual browser video; local FFmpeg, no screenshot-sequence reconstruction. */
import fs from 'node:fs/promises';import path from 'node:path';import os from 'node:os';import{fileURLToPath}from'node:url';import{spawnSync}from'node:child_process';
const root=path.dirname(fileURLToPath(import.meta.url)),temporary=await fs.mkdtemp(path.join(os.tmpdir(),'faithpath-a5-video-'));
const registry=JSON.parse(await fs.readFile(path.resolve(root,'../../node_modules/playwright-core/browsers.json'),'utf8')),revision=registry.browsers.find(x=>x.name==='ffmpeg').revision,ffmpeg=process.env.FFMPEG_PATH||'/usr/bin/ffmpeg';
await fs.mkdir(path.join(temporary,'ffmpeg-'+revision));await fs.symlink(ffmpeg,path.join(temporary,'ffmpeg-'+revision,'ffmpeg-linux'));process.env.PLAYWRIGHT_BROWSERS_PATH=temporary;
const{chromium}=await import('playwright'),browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const report={method:'Actual Playwright browser screencast; system FFmpeg; no image replay',encodingFPS:25,encodingFPSIsNotDeviceFPS:true,physicalIPhone:'OPEN',recordings:[]};
const origin=process.env.OLIVE_A5_ORIGIN||'http://127.0.0.1:4735';
function run(args){const p=spawnSync(ffmpeg,args,{encoding:'utf8'});if(p.status!==0||p.error)throw Error(p.stderr||String(p.error));}
try{
 for(const item of [{name:'VERGLEICH_BEWEGUNG',width:800,height:620,query:'?view=compare&capture=1&theme=paper',selector:'.capture-shell',seconds:22},{name:'MOBIL_LEBENDIG',width:390,height:844,query:'?capture=1&theme=paper',selector:'.phone',seconds:14}]){
  const context=await browser.newContext({viewport:{width:item.width,height:item.height},deviceScaleFactor:1,recordVideo:{dir:path.join(temporary,item.name),size:{width:item.width,height:item.height}}}),page=await context.newPage();await page.goto(origin+'/'+item.query);await page.evaluate(()=>document.fonts.ready);await page.waitForFunction(()=>window.OLIVE_A5);await page.evaluate(()=>OLIVE_A5.live.ready);
  if(item.name==='VERGLEICH_BEWEGUNG'){await page.evaluate(()=>Promise.all([OLIVE_A5.old.ready,OLIVE_A5.next.ready]));await page.evaluate(()=>{OLIVE_A5.old.play();OLIVE_A5.next.play();});}
  const clip=await page.locator(item.selector).boundingBox();await page.screenshot({path:path.join(root,'evidence/screenshots',item.name+'-poster.png')});const started=performance.now();await page.waitForTimeout(item.seconds*1000);
  const state=await page.evaluate(()=>{const scene=OLIVE_A5.next||OLIVE_A5.live,m=scene.metrics;return{running:m.running,activeMs:m.activeMs,frames:m.frames,quality:m.quality,oldRunning:OLIVE_A5.old?.metrics.running};});if(!state.running||state.activeMs<item.seconds*900)throw Error('Continuous motion was not active throughout capture');
  const source=await page.video().path();await context.close();const crop=[Math.floor(Math.min(clip.width,item.width)/2)*2,Math.floor(Math.min(clip.height,item.height)/2)*2,Math.floor(clip.x),Math.floor(clip.y)];
  run(['-y','-i',source,'-vf','crop='+crop.join(':'),'-c:v','libx264','-preset','medium','-crf','16','-pix_fmt','yuv420p',path.join(temporary,'encoded.mp4')]);
  // Playwright/system-FFmpeg supplies full-range frames. Correct SPS metadata
  // without grading or repainting them (otherwise warm paper becomes white).
  run(['-y','-i',path.join(temporary,'encoded.mp4'),'-c','copy','-bsf:v','h264_metadata=video_full_range_flag=1','-color_range','pc','-movflags','+faststart',path.join(root,'evidence',item.name+'.mp4')]);
  report.recordings.push({file:item.name+'.mp4',viewport:{width:item.width,height:item.height},captureCrop:crop,observationSeconds:(performance.now()-started)/1000,endingState:state,colorRange:'pc/full, corrected metadata only'});
 }
}finally{await browser.close();await fs.rm(temporary,{recursive:true,force:true});await fs.writeFile(path.join(root,'evidence/motion-capture.json'),JSON.stringify(report,null,2)+'\n');}
