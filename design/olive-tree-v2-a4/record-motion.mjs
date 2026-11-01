/** Actual browser screencast using the installed system FFmpeg, no download. */
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const root=path.dirname(fileURLToPath(import.meta.url));
const temporary=await fs.mkdtemp(path.join(os.tmpdir(),'faithpath-a4-video-'));
const registry=JSON.parse(await fs.readFile(path.resolve(root,'../../node_modules/playwright-core/browsers.json'),'utf8'));
const revision=registry.browsers.find(x=>x.name==='ffmpeg').revision;
const ffmpegPath=process.env.FFMPEG_PATH||'/usr/bin/ffmpeg';
await fs.mkdir(path.join(temporary,'ffmpeg-'+revision));
await fs.symlink(ffmpegPath,path.join(temporary,'ffmpeg-'+revision,'ffmpeg-linux'));
process.env.PLAYWRIGHT_BROWSERS_PATH=temporary;
const {chromium}=await import('playwright');
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
try {
 const context=await browser.newContext({viewport:{width:390,height:900},deviceScaleFactor:1,recordVideo:{dir:path.join(temporary,'recordings'),size:{width:390,height:900}}});
 const page=await context.newPage();
 await page.goto((process.env.OLIVE_A4_ORIGIN||'http://127.0.0.1:4734')+'/demo.html?theme=paper');
 await page.evaluate(()=>document.fonts.ready);
 await page.waitForFunction(()=>window.A4_DEMO);
 if(!await page.evaluate(()=>A4_DEMO.ready))throw Error('Renderer unavailable');
 await page.waitForTimeout(500);
 const clip=await page.locator('.capture-shell').boundingBox();
 await page.locator('.capture-shell').screenshot({path:path.join(root,'evidence/screenshots/motion-poster.png')});
 const started=performance.now();
 const didStart=await page.evaluate(()=>A4_DEMO.player.play());
 if(!didStart)throw Error('Motion did not start');
 await page.waitForTimeout(9000);
 const state=await page.evaluate(()=>({running:A4_DEMO.player.running,poseMilliseconds:A4_DEMO.renderer.time,renderedFrames:A4_DEMO.renderer.frames}));
 const elapsed=(performance.now()-started)/1000;
 if(state.running||state.poseMilliseconds!==0)throw Error('Finite motion failed to stop');
 const videoPath=await page.video().path();
 await context.close();
 const crop=[Math.floor(clip.width/2)*2,Math.floor(clip.height/2)*2,Math.floor(clip.x),Math.floor(clip.y)];
 const encoded=spawnSync(ffmpegPath,['-y','-i',videoPath,'-vf','crop='+crop.join(':'),'-c:v','libx264','-preset','medium','-crf','16','-pix_fmt','yuv420p','-movflags','+faststart',path.join(temporary,'encoded.mp4')],{encoding:'utf8'});
 if(encoded.status!==0||encoded.error)throw Error(encoded.stderr||String(encoded.error));
 const rangeFixed=spawnSync(ffmpegPath,['-y','-i',path.join(temporary,'encoded.mp4'),'-c','copy','-bsf:v','h264_metadata=video_full_range_flag=1','-color_range','pc','-movflags','+faststart',path.join(root,'evidence/MOTION_BROWSER.mp4')],{encoding:'utf8'});
 if(rangeFixed.status!==0||rangeFixed.error)throw Error(rangeFixed.stderr||String(rangeFixed.error));
 const info={colorRange:'full-range capture; SPS metadata corrected without repainting/regrading frames',method:'Actual Playwright browser screencast; installed system FFmpeg; no screenshot replay',viewport:{width:390,height:900},captureCrop:crop,deviceScaleFactor:1,renderer:'Chromium SwiftShader software',observedSecondsAfterPlay:elapsed,endingState:state,physicalDeviceFPS:'NOT_MEASURED',audio:false};
 await fs.writeFile(path.join(root,'evidence/motion-capture.json'),JSON.stringify(info,null,2)+'\n');
 console.log(JSON.stringify(info));
}finally{
 await browser.close();
 await fs.rm(temporary,{recursive:true,force:true});
}
