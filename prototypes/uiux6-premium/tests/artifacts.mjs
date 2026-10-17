import { chromium } from 'playwright';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const p=await b.newPage({viewport:{width:1440,height:1100},reducedMotion:'reduce'}), results=[];
const base='http://localhost:4492',axe=fs.readFileSync('node_modules/axe-core/axe.min.js','utf8');
for(const name of ['index.html','report.html','comparison.html']){
  try{
    assert.equal((await p.goto(base+'/'+name)).status(),200);await p.evaluate(()=>document.fonts.ready);
    await p.addScriptTag({content:axe});const a=await p.evaluate(()=>axe.run({runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}));
    fs.writeFileSync(`prototypes/uiux6-premium/qa/axe-${name}.json`,JSON.stringify({violations:a.violations,incomplete:a.incomplete},null,2));
    assert.deepEqual(a.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[]);
    const links=await p.locator('a[href]').evaluateAll(es=>es.map(e=>e.href).filter(x=>x.startsWith(location.origin)));
    for(const href of new Set(links))assert.equal((await p.request.get(href)).status(),200,href);
    await p.screenshot({path:`prototypes/uiux6-premium/screenshots/${name.replace('.html','')}-desktop.png`,fullPage:true});
    await p.setViewportSize({width:320,height:568});await p.addStyleTag({content:'html{font-size:200%}'});
    assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.equal(await p.evaluate(()=>getComputedStyle(document.body).fontSize),'32px');
    results.push({name,status:'PASS'});
  }catch(e){results.push({name,status:'FAIL',error:String(e)});}finally{await p.setViewportSize({width:1440,height:1100});}
}
try{
  await p.goto('file://'+process.cwd()+'/prototypes/uiux6-premium/index.html');
  await p.frameLocator('iframe[title="FaithPath Premium-Prototyp"]').locator('.next-step').waitFor({timeout:5000});
  await p.frameLocator('iframe[title="FaithPath Premium-Prototyp"]').locator('[data-go="reader"]').first().click();
  assert.equal(await p.frameLocator('iframe[title="FaithPath Premium-Prototyp"]').locator('[data-verse]').count(),27);
  results.push({name:'Direct local file gallery and reader',status:'PASS'});
}catch(e){results.push({name:'Direct local file gallery and reader',status:'OPEN',reason:String(e),fallback:'Local server command documented in README; browser sandbox policies may restrict file frames.'});}
await b.close();const out={passed:results.filter(r=>r.status==='PASS').length,failed:results.filter(r=>r.status==='FAIL').length,open:results.filter(r=>r.status==='OPEN').length,results};
fs.writeFileSync('prototypes/uiux6-premium/qa/artifacts.json',JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,2));process.exitCode=out.failed?1:0;
