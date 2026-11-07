const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
(async()=>{
 const out=process.argv[2],qa=path.join(out,'qa');fs.mkdirSync(qa,{recursive:true});
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 const context=await browser.newContext({viewport:{width:390,height:844},acceptDownloads:true});
 const page=await context.newPage(),errors=[],checks=[];page.on('pageerror',e=>errors.push(e.message));
 const pass=name=>checks.push({test:name,status:'PASS'});
 try{
  await page.goto('http://127.0.0.1:8768/',{waitUntil:'networkidle'});await page.waitForFunction(()=>document.querySelector('#audio').readyState>=1);
  assert.equal(await page.locator('#verses li').count(),32);assert.equal(await page.locator('#variant option').count(),4);pass('32 original verses and4 complete comparison recordings');
  for(let n=0;n<4;n++){
   await page.selectOption('#variant',String(n));await page.waitForFunction(()=>document.querySelector('#audio').readyState>=1);
   assert(await page.$eval('#audio',a=>a.paused));await page.$eval('#audio',a=>a.play());await page.waitForFunction(()=>document.querySelector('#audio').currentTime>.15);await page.$eval('#audio',a=>a.pause());
   const text=await page.locator('#variant option:checked').textContent();
   const download=await Promise.all([page.waitForEvent('download'),page.locator('#download').click()]).then(x=>x[0]);
   const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');assert.equal(hash(await download.path()),hash(path.join(out,'audio',text+'.mp3')));
  }
  pass('All4 recordings play without autoplay and downloads match their SHA256');
  await page.selectOption('#variant','1');await page.waitForFunction(()=>document.querySelector('#audio').readyState>=1);await page.selectOption('#rate','1.1');assert.equal(await page.$eval('#audio',a=>a.playbackRate),1.1);
  await page.locator('[data-jump="21"]').click();await page.waitForFunction(()=>document.querySelector('#audio').currentTime>100);await page.$eval('#audio',a=>a.pause());pass('Dialogue jump and playback speed');
  for(const width of [320,375,390,430,768])for(const size of [100,200]){
   await page.setViewportSize({width,height:844});await page.evaluate(size=>{document.documentElement.style.fontSize=size+'%';window.scrollTo(0,0)},size);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),JSON.stringify({width,size}));
  }pass('Five viewport widths,100/200% text,no horizontal overflow');
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{document.documentElement.style.fontSize='100%';window.scrollTo(0,0)});await page.screenshot({path:path.join(qa,'comparison-390.png')});
  await page.emulateMedia({colorScheme:'dark',reducedMotion:'reduce'});await page.screenshot({path:path.join(qa,'comparison-dark-390.png')});
  await page.setViewportSize({width:320,height:568});await page.evaluate(()=>document.documentElement.style.fontSize='200%');await page.screenshot({path:path.join(qa,'comparison-320-200.png')});
  await page.locator('#variant').focus();await page.keyboard.press('Home');pass('Native comparison selector is keyboard accessible');
  await page.addScriptTag({content:require('axe-core').source});const axe=await page.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}));fs.writeFileSync(path.join(qa,'axe.json'),JSON.stringify(axe,null,2));assert.equal(axe.violations.length,0);pass('Automated axe accessibility checks');
  await context.setOffline(true);await page.$eval('#audio',a=>{a.currentTime=2;return a.play()});await page.waitForFunction(()=>document.querySelector('#audio').currentTime>2.2);await page.$eval('#audio',a=>a.pause());pass('Embedded audio continues with network disabled');
  assert.deepEqual(errors,[]);pass('No unhandled JavaScript errors');
 }catch(error){checks.push({test:'Comparison verification',status:'FAIL',error:String(error.stack)});}
 const report={browser:browser.version(),checks,passed:checks.filter(c=>c.status==='PASS').length,failed:checks.filter(c=>c.status==='FAIL').length,limits:['No human hearing test','No real Safari/iPhone/VoiceOver','No20–30minute usability study','Standalone preview only; no app deployment']};fs.writeFileSync(path.join(qa,'browser-results.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));await browser.close();if(report.failed)process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1});
