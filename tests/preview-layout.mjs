// Explicitly records the tested origin. This is browser emulation, not iPhone QA.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {coreFixture} from './core-depth-fixture.mjs';
import {KEYS} from '../src/store.js';
const base=process.env.QA_URL||'http://127.0.0.1:4197';
const out=process.env.QA_OUT||'qa-output/preview-layout';
fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.FAITHPATH_CHROMIUM||'/usr/bin/chromium',args:['--no-sandbox']});
const results=[],errors=[];
try{
  for(const [width,height] of [[320,568],[390,844]])for(const theme of ['light','night']){
    const seed=coreFixture();seed.settings.theme=theme;
    const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,reducedMotion:'reduce',serviceWorkers:'block'});
    await context.addInitScript(({seed,KEYS})=>{if(!localStorage.getItem(KEYS.main)){localStorage.setItem(KEYS.main,JSON.stringify(seed));localStorage.setItem(KEYS.onboard,'done');}},{seed,KEYS});
    const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(15000);
    for(const route of ['today','paths','path/core-path','journal','read/JHN/3/otb','chapter-quizzes','bible-journey','more?section=settings']){
      const item={width,height,theme,route,status:'PASS'};
      try{
        await page.goto(base+'/#'+route);await page.locator('#main h1').waitFor();
        if(route.startsWith('read/'))await page.locator('.verse').first().waitFor();
        // Blocked workers deliberately produce an offline preparation notice.
        const notice=page.locator('#toast').getByRole('button',{name:'Meldung schließen',exact:true});
        if(route==='today')await notice.waitFor({timeout:5000}).catch(()=>{});
        if(await notice.isVisible())await notice.click();
        assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'horizontal overflow');
        if(route==='today'){
          await page.locator('.olive-tree-visual img').evaluate(img=>img.decode());
          item.geometry=await page.evaluate(()=>{
            const box=s=>{const r=document.querySelector(s).getBoundingClientRect();return {top:r.top,bottom:r.bottom,height:r.height};};
            return {tree:box('.olive-hero'),nextStep:box('.personal-step'),bottomNav:box('.primary-nav')};
          });
        }
        if(['today','journal','read/JHN/3/otb','bible-journey'].includes(route)){
          item.screenshot=`${width}-${theme}-${route.replaceAll('/','-')}.png`;
          await page.screenshot({path:out+'/'+item.screenshot});
        }
        if(route==='journal'){
          await page.locator('[data-action="new-entry"]').click();
          await page.getByLabel('Dein Gedanke',{exact:true}).fill('Synthetischer Tastatur- und Scrolltest');
          await page.getByLabel('Dein Gedanke',{exact:true}).focus();
          await page.locator('#editor-form button[type=submit]').scrollIntoViewIfNeeded();
          assert(await page.locator('#editor-form button[type=submit]').isVisible());
          await page.screenshot({path:`${out}/${width}-${theme}-editor.png`});
          await page.getByRole('button',{name:'Schließen',exact:true}).click();
        }
      }catch(e){item.status='FAIL';item.error=e.stack;}
      results.push(item);
    }
    await context.close();
  }
}finally{
  await browser.close();fs.writeFileSync(out+'/results.json',JSON.stringify({base,engine:'Chromium',physicalDevice:false,keyboardSimulated:false,results,errors},null,2));
}
console.log(JSON.stringify({checks:results.length,failed:results.filter(x=>x.status!=='PASS'),errors},null,2));
if(results.some(x=>x.status!=='PASS')||errors.length)process.exitCode=1;
