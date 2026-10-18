/** Smoke-test both local delivery galleries, including absent before images. */
import fs from 'node:fs';import assert from 'node:assert/strict';import {chromium} from 'playwright';
const out='qa-output/uiux6d/gallery';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']}),results=[],errors=[];
try{
 for(const[name,port]of[['representative',4534],['full',4535]])for(const width of [390,1440]){
  const context=await browser.newContext({viewport:{width,height:900}}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
  await page.goto('http://127.0.0.1:'+port+'/index.html');assert.equal(await page.locator('#stage option').count(),7);assert.equal(await page.locator('#theme option').count(),4);
  for(const[stage,theme,size,state,before]of[['0','night','390-100','top',true],['6','night','390-100','top',true],['2','paper','390-100','guide',false],['6','paper','320-200','top',true]]){
   await page.selectOption('#stage',stage);await page.selectOption('#theme',theme);await page.selectOption('#size',size);await page.selectOption('#state',state);
   await page.locator('#new').evaluate(img=>img.decode());assert.equal(await page.locator('#old').isVisible(),before);if(before)await page.locator('#old').evaluate(img=>img.decode());
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));results.push({name,width,stage,theme,size,state,status:'PASS'});
  }
  await page.selectOption('#size','320-100');await page.selectOption('#theme','night');assert.equal(await page.locator('#size').inputValue(),'320-100');
  await page.locator('#stage').focus();for(const id of ['theme','size','state']){await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),id)}
  await page.screenshot({path:`${out}/${name}-${width}.png`});await context.close();
 }
}catch(error){errors.push(error.stack)}finally{await browser.close()}
fs.writeFileSync(out+'/results.json',JSON.stringify({results,errors},null,2));console.log(JSON.stringify({cases:results.length,errors}));process.exitCode=errors.length?1:0;
