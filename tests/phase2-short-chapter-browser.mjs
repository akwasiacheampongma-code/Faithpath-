import fs from 'node:fs';import assert from 'node:assert/strict';import {chromium} from 'playwright';import {KEYS,empty} from '../src/store.js';
const base=process.env.QA_URL||'http://127.0.0.1:4383',out=process.env.QA_OUT||'qa-output/uiux-phase2/short-chapter',results=[],errors=[];fs.mkdirSync(out,{recursive:true});
const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
try{for(const width of [320,390])for(const theme of ['light','atmospheric','paper','night']){
 const c=await b.newContext({viewport:{width,height:width===320?568:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'}),p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));const data=empty();data.settings.theme=theme;
 await c.addInitScript(({KEYS,data})=>{if(!localStorage.getItem(KEYS.main))localStorage.setItem(KEYS.main,JSON.stringify(data));localStorage.setItem(KEYS.onboard,'done');},{KEYS,data});
 const state=()=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEYS.main),ends=async()=>(await state()).events.filter(e=>e.kind==='chapter-explored');
 try{
  await p.goto(base+'/#read/PSA/117/otb');await p.locator('.verse').last().waitFor();await p.waitForTimeout(500);assert.equal((await ends()).length,0,'Opening a short chapter must not record exploration');
  const confirm=p.locator('[data-action="explore-chapter"]');
  // At 320×568 the same chapter may require scrolling, retaining the original end-marker rule.
  if(await confirm.isVisible()){await confirm.click();}else{await p.locator('#chapter-end-sentinel').scrollIntoViewIfNeeded();}
  await p.locator('.journey-acknowledgement').waitFor({state:'visible'});assert.equal((await ends()).length,1);assert.equal(await p.getByRole('link',{name:'Dein Schwert ansehen',exact:true}).getAttribute('href'),'#bible-journey');
  await p.reload();await p.locator('.verse').last().waitFor();assert.equal((await ends()).length,1);assert.equal(await p.locator('.short-chapter-confirm:not([hidden])').count(),0);
  await p.locator('#translation').selectOption('l1912');await p.locator('.verse').last().waitFor();assert.equal((await ends()).length,1);assert.equal(await p.locator('.short-chapter-confirm:not([hidden])').count(),0);
  await p.goto(base+'/#read/JHN/3/otb');await p.locator('.verse').last().waitFor();assert.equal((await ends()).length,1);await p.locator('#chapter-end-sentinel').scrollIntoViewIfNeeded();await p.locator('.journey-acknowledgement').waitFor({state:'visible'});assert.equal((await ends()).length,2);
  results.push({name:`Short chapter consent and unchanged long chapter / ${width} / ${theme}`,status:'PASS'});
  if(width===390){
   await p.evaluate(({KEYS,data})=>localStorage.setItem(KEYS.main,JSON.stringify(data)),{KEYS,data});await p.goto(base+'/#read/PSA/117/otb');await p.reload();await confirm.waitFor({state:'visible'});const before=await state();
   await p.evaluate(k=>{const save=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(key===k)throw new DOMException('Speicher voll','QuotaExceededError');return save.call(this,key,value);};},KEYS.main);
   await confirm.focus();await p.keyboard.press('Enter');await p.locator('#toast.error.visible').waitFor();assert.deepEqual(await state(),before);assert(await confirm.isVisible());assert(await p.locator('.journey-acknowledgement').isHidden());
   results.push({name:`Short chapter storage refusal preserves confirmation and data / ${theme}`,status:'PASS'});
  }
 }catch(e){results.push({name:`Short chapter consent / ${width} / ${theme}`,status:'FAIL',error:e.stack});}await c.close();
}}finally{await b.close();fs.writeFileSync(out+'/results.json',JSON.stringify({results,errors,syntheticDataOnly:true},null,2));}console.log(JSON.stringify(results));if(errors.length||results.some(r=>r.status==='FAIL'))process.exitCode=1;
