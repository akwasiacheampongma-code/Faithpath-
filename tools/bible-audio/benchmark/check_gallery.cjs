// Playback/availability checks are not a human hearing test.
const {chromium} = require('playwright');
const axe = require('axe-core');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');

(async()=>{
  const root = path.resolve(process.argv[2]), out = path.resolve(process.argv[3]);
  fs.mkdirSync(path.join(out, 'screenshots'), {recursive:true});
  // Managed Chrome disallows file:// navigation; serve our own local files.
  const server=http.createServer((req,res)=>{
    const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
    if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
    fs.readFile(file===root?path.join(root,'index.html'):file,(error,body)=>{
      if(error){res.writeHead(404);res.end();return;}
      res.setHeader('Content-Type',file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.mp3')?'audio/mpeg':'text/plain; charset=utf-8');res.end(body);
    });
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const origin=`http://127.0.0.1:${server.address().port}`;
  let browser;
  const results=[];
  try {
    browser = await chromium.launch({executablePath:'/usr/bin/chromium', headless:true, args:['--no-sandbox']});
    const page=await browser.newPage({viewport:{width:390,height:844}});
    const external=[];
    page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(origin+'/')) external.push(r.url());});
    await page.goto(origin+'/index.html');
    const audio=page.locator('audio');
    assert.equal(await audio.count(),4);
    for(let i=0;i<4;i++){
      const result=await audio.nth(i).evaluate(async a=>{
        await a.play();
        await new Promise((resolve,reject)=>{
          const timer=setTimeout(()=>reject(new Error('Audio clock did not advance')),8000);
          a.addEventListener('timeupdate',function advance(){if(a.currentTime>.15){clearTimeout(timer);a.removeEventListener('timeupdate',advance);resolve();}});
        });
        const value={duration:a.duration,currentTime:a.currentTime,readyState:a.readyState,error:a.error?.message||null};
        a.pause();return value;
      });
      assert(result.duration>25&&result.currentTime>0&&!result.error);
      results.push({check:`audio-${i+1}-decode-and-clock`,status:'PASS',...result});
    }
    await audio.nth(0).evaluate(a=>a.play());
    await audio.nth(1).evaluate(a=>a.play());
    assert.equal(await audio.nth(0).evaluate(a=>a.paused),true);
    await audio.nth(1).evaluate(a=>a.pause());
    results.push({check:'only-one-audio-playing',status:'PASS'});
    await page.context().setOffline(true);
    await audio.nth(3).evaluate(a=>a.play());
    await audio.nth(3).evaluate(a=>a.pause());
    results.push({check:'embedded-audio-offline',status:'PASS'});
    for(const [width,height] of [[320,568],[375,667],[390,844],[430,932]]){
      await page.setViewportSize({width,height});
      for(const large of [false,true]){
        await page.evaluate(v=>document.documentElement.style.fontSize=v?'200%':'100%',large);
        const overflow=await page.evaluate(()=>({viewport:innerWidth,width:document.documentElement.scrollWidth,
          elements:[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1)
            .map(e=>({tag:e.tagName,text:e.tagName==='AUDIO'?'audio':e.textContent.slice(0,70),width:e.getBoundingClientRect().width}))}));
        if(overflow.width>overflow.viewport){console.error(JSON.stringify(overflow));await page.screenshot({path:path.join(out,'screenshots','overflow-before-fix.png'),fullPage:true});}
        assert.equal(overflow.width<=overflow.viewport,true);
        results.push({check:`layout-${width}-${large?'200':'100'}percent`,status:'PASS'});
      }
      await page.evaluate(()=>document.documentElement.style.fontSize='100%');
      await page.screenshot({path:path.join(out,'screenshots',`gallery-${width}.png`),fullPage:true});
    }
    await page.addScriptTag({content:axe.source});
    const accessibility=await page.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}));
    fs.writeFileSync(path.join(out,'accessibility.json'),JSON.stringify(accessibility,null,2));
    assert.equal(accessibility.violations.length,0);
    results.push({check:'axe-wcag-AA',status:'PASS',violations:0,incomplete:accessibility.incomplete.length});
    await page.emulateMedia({colorScheme:'dark',reducedMotion:'reduce'});
    await page.screenshot({path:path.join(out,'screenshots','gallery-430-dark.png'),fullPage:true});
    assert.equal(external.length,0);
    results.push({check:'no-external-requests',status:'PASS'});
  } finally {
    await browser?.close();
    await new Promise(resolve=>server.close(resolve));
    fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify({browser:'Chromium/Linux',human_hearing:'NOT PERFORMED',iphone_safari:'OPEN',results},null,2));
  }
  console.log(JSON.stringify(results));
})().catch(error=>{console.error(error);process.exitCode=1;});
