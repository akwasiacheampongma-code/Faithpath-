/** Browser playback verification; not an acoustic or physical iPhone review. */
const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const assert=require('node:assert/strict');

(async()=>{
 const folder=process.argv[2];if(!folder)throw new Error('Pass the delivered player directory');
 const qa=path.join(folder,'qa');fs.mkdirSync(qa,{recursive:true});
 const checks=[],errors=[];
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 const context=await browser.newContext({viewport:{width:390,height:844},acceptDownloads:true});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 const record=name=>checks.push({test:name,status:'PASS'});
 try{
  await page.goto(process.env.AUDIO_PLAYER_URL||'http://127.0.0.1:8767/',{waitUntil:'networkidle'});
  await page.waitForFunction(()=>document.querySelector('#audio').readyState>=1);
  const duration=await page.$eval('#audio',a=>a.duration);
  assert(duration>150&&duration<160);assert(await page.$eval('#audio',a=>a.paused));record('Complete MP3 metadata; no autoplay');
  await page.$eval('#audio',a=>a.play());await page.waitForFunction(()=>document.querySelector('#audio').currentTime>.3);
  await page.$eval('#audio',a=>a.pause());const paused=await page.$eval('#audio',a=>a.currentTime);
  await page.$eval('#audio',a=>a.play());await page.waitForFunction(t=>document.querySelector('#audio').currentTime>t+.2,paused);
  await page.$eval('#audio',a=>a.pause());record('Playback clock advances; pause and resume preserve position');
  await page.selectOption('#rate','1.25');assert.equal(await page.$eval('#audio',a=>a.playbackRate),1.25);record('Playback speed changes');
  await page.locator('#verses li[data-verse="25"] button').click();
  await page.waitForFunction(()=>document.querySelector('#audio').currentTime>145);
  await page.$eval('#audio',a=>a.pause());const last=await page.$eval('#audio',a=>a.currentTime);record('All 25 original verses present; verse 25 seeks and plays');
  assert.equal(await page.locator('#verses li').count(),25);
  await page.locator('#next').click();assert.equal(await page.locator('#title').textContent(),'Matthäus 2');
  await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('keine geprüfte Aufnahme'));
  assert.equal(await page.$eval('#audio',a=>a.getAttribute('src')),null);assert(await page.$eval('#audio',a=>a.paused));
  assert.equal(await page.locator('#verses li').count(),23);record('Next chapter loads original text; absent audio is explicit, previous audio stops');
  await page.locator('#original').click();await page.waitForFunction(()=>document.querySelector('#audio').readyState>=1);
  await page.waitForFunction(t=>document.querySelector('#audio').currentTime>=t-.1,last);
  assert.equal(await page.$eval('#audio',a=>a.playbackRate),1.25);record('Returning restores chapter position and selected speed');
  const download=await Promise.all([page.waitForEvent('download'),page.locator('#download-mp3').click()]).then(v=>v[0]);
  const file=await download.path();
  const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
  assert.equal(hash(file),hash(path.join(folder,'output/Matthaeus_1_Luther1912_Thorsten_optimiert.mp3')));record('Downloaded MP3 matches delivered file SHA-256');
  for(const width of [320,375,390,430,768,1280])for(const textSize of [100,200]){
   await page.setViewportSize({width,height:width>500?900:844});
   await page.evaluate(size=>{document.documentElement.style.fontSize=size+'%';window.scrollTo(0,0);},textSize);
   const overflow=await page.evaluate(()=>({document:document.documentElement.scrollWidth,viewport:innerWidth}));
   assert(overflow.document<=overflow.viewport+1,JSON.stringify({width,textSize,...overflow}));
  }
  record('No horizontal overflow: six widths, 100% and 200% root text');
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{document.documentElement.style.fontSize='100%';window.scrollTo(0,0);});
  await page.screenshot({path:path.join(qa,'player-390-light.png')});
  await page.emulateMedia({colorScheme:'dark',reducedMotion:'reduce'});await page.screenshot({path:path.join(qa,'player-390-dark.png')});
  await page.evaluate(()=>document.documentElement.style.fontSize='200%');await page.screenshot({path:path.join(qa,'player-390-200percent.png')});
  await page.setViewportSize({width:320,height:568});await page.screenshot({path:path.join(qa,'player-320-200percent.png')});
  await page.evaluate(()=>document.documentElement.style.fontSize='100%');await page.setViewportSize({width:390,height:844});
  await page.locator('#next').focus();await page.keyboard.press('Enter');await page.waitForFunction(()=>document.querySelector('#title').textContent==='Matthäus 2');
  await page.locator('#original').click();await page.waitForFunction(()=>document.querySelector('#audio').readyState>=1);record('Keyboard chapter navigation');
  const axe=require('axe-core');await page.addScriptTag({content:axe.source});const accessibility=await page.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}));
  fs.writeFileSync(path.join(qa,'axe-results.json'),JSON.stringify(accessibility,null,2));assert.equal(accessibility.violations.length,0);record('axe automated WCAG checks: zero violations');
  await context.setOffline(true);await page.$eval('#audio',a=>{a.currentTime=2;return a.play();});
  await page.waitForFunction(()=>document.querySelector('#audio').currentTime>2.3);await page.$eval('#audio',a=>a.pause());record('Embedded audio plays with network offline after page load');
  assert.deepEqual(errors,[]);record('No browser JavaScript errors');
 }catch(error){checks.push({test:'Browser verification',status:'FAIL',error:String(error.stack)});}
 const report={browser:browser.version(),checks,passed:checks.filter(c=>c.status==='PASS').length,failed:checks.filter(c=>c.status==='FAIL').length,
  limits:['Chromium on Linux; not real Safari, iPhone or VoiceOver','Offline loaded standalone player tested; no new service worker or production reader integration','Audio-clock checks are not human listening']};
 fs.writeFileSync(path.join(qa,'browser-results.json'),JSON.stringify(report,null,2));await browser.close();console.log(JSON.stringify(report,null,2));
 if(report.failed)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
