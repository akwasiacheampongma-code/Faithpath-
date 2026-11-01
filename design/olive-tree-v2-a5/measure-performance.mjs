/** Actual lab frames and Chromium counters, not physical phone/energy figures.
 * Run alone (no simultaneous screencast/QA). Target FPS is a ceiling, not 60FPS. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const root=path.dirname(fileURLToPath(import.meta.url)),origin=process.env.OLIVE_A5_ORIGIN||'http://127.0.0.1:4735',duration=Number(process.env.OLIVE_BENCH_MS||30000);
const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2}),p=await c.newPage(),cdp=await c.newCDPSession(p),system=await b.newBrowserCDPSession();
await cdp.send('Performance.enable');
const counters=async()=>Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(x=>[x.name,x.value]));
const processes=async()=>{try{return(await system.send('SystemInfo.getProcessInfo')).processInfo;}catch{return[];}};
const percentile=(xs,q)=>xs.slice().sort((a,b)=>a-b)[Math.min(xs.length-1,Math.floor(q*(xs.length-1)))];
const report={timestamp:new Date().toISOString(),browser:b.version(),scope:'Linux headless Chromium, ANGLE SwiftShader software; viewport390x844/DPR2; single active page; no video recording. NOT real iPhone/GPU/battery results.',durationMillisecondsPerCase:duration,results:[]};
try{
 for(const size of [200,300]){
  await p.goto(origin+'/?capture=1&size='+size);await p.waitForFunction(()=>window.OLIVE_A5);await p.evaluate(()=>OLIVE_A5.live.ready);await p.waitForTimeout(1500);
  const before=await counters(),procBefore=await processes(),first=await p.evaluate(()=>OLIVE_A5.live.metrics),start=performance.now();await p.waitForTimeout(duration);
  const elapsed=(performance.now()-start)/1000,last=await p.evaluate(()=>OLIVE_A5.live.metrics),after=await counters(),procAfter=await processes();
  const recent=last.renderTimes.filter(t=>t>=first.renderTimes.at(-1)),intervals=recent.slice(1).map((t,i)=>t-recent[i]),costs=last.submitTimes.slice(-Math.max(1,recent.length-1));
  const cpu=procAfter.map(a=>{const before=procBefore.find(x=>x.id===a.id);return before?{type:a.type,pid:a.id,cpuSeconds:a.cpuTime-before.cpuTime}:null;}).filter(Boolean);
  const result={sizeCss:size,elapsedSeconds:elapsed,frames:last.frames-first.frames,deliveredFPS:(last.frames-first.frames)/elapsed,frameIntervalMs:{p50:percentile(intervals,.5),p95:percentile(intervals,.95)},jsSubmissionMs:{p50:percentile(costs,.5),p95:percentile(costs,.95)},taskCPUSeconds:after.TaskDuration-before.TaskDuration,scriptCPUSeconds:after.ScriptDuration-before.ScriptDuration,jsHeapBytes:{before:before.JSHeapUsedSize,after:after.JSHeapUsedSize},processCPU:cpu,quality:last.quality,qualityChanges:last.qualityChanges,resolution:last.resolution,updatedAreaFraction:last.updatedArea,gain:last.gain};
  report.results.push(result);console.log(JSON.stringify(result));
  await p.evaluate(()=>OLIVE_A5.live.setEnabled(false));await p.waitForTimeout(150);const idleBefore=await counters(),idleFrames=(await p.evaluate(()=>OLIVE_A5.live.metrics)).frames,idleStart=performance.now();await p.waitForTimeout(4000);const idleAfter=await counters(),idle=await p.evaluate(()=>OLIVE_A5.live.metrics);result.disabled={seconds:(performance.now()-idleStart)/1000,framesAdded:idle.frames-idleFrames,rafPending:idle.rafPending,taskCPUSeconds:idleAfter.TaskDuration-idleBefore.TaskDuration};
 }
}finally{await b.close();await fs.writeFile(path.join(root,'evidence/performance.json'),JSON.stringify(report,null,2)+'\n');}
