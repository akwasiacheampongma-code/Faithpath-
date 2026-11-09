import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {KEYS,empty} from '../src/store.js';
import {testServer} from './helpers/at-rounds-browser-support.mjs';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),{chromium}=require('playwright');
const before=process.env.AT_VISUAL_BEFORE,after=process.env.AT_ROUNDS_TEST_ROOT||'qa-output/at-rounds-test';
if(!before)throw new Error('AT_VISUAL_BEFORE must identify the actual baseline build');
const out=process.env.AT_ROUNDS_QA_OUT||'qa-output/at-rounds-visual';fs.mkdirSync(out,{recursive:true});
const server=await testServer(before),records=[];
const browser=await chromium.launch({executablePath:process.env.FAITHPATH_CHROMIUM||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
try{
  for(const [width,height]of [[320,568],[390,844]]){
    for(const [label,root]of [['before',before],['after',after]]){
      server.setRoot(root);const context=await browser.newContext({viewport:{width,height}});
      await context.addInitScript(({seed,KEYS})=>{localStorage.setItem(KEYS.main,JSON.stringify(seed));localStorage.setItem(KEYS.onboard,'done');},{seed:empty(),KEYS});
      const p=await context.newPage();p.setDefaultTimeout(20000);
      async function shot(name){const file=`${label}-${width}-${name}.png`;await p.screenshot({path:path.join(out,file)});records.push({file,width,height,phase:label,url:new URL(p.url()).hash});}
      await p.goto(server.url+'#read/1KI/8/l1912');await p.locator('#verses').waitFor();await p.evaluate(()=>navigator.serviceWorker.ready);
      await p.locator('.chapter-nav').evaluate(el=>el.scrollIntoView({block:'center'}));await shot('reader-end');
      await p.goto(server.url+'#chapter-quizzes');await p.locator('main h1').waitFor();await shot('collection');
      if(label==='after'){
        await p.goto(server.url+'#chapter-quizzes/2KI/15');await p.locator('.quiz-title').waitFor();await p.evaluate(()=>scrollTo(0,0));await shot('round-A');
        assert((await p.locator('.at-test-notice').boundingBox()).height<=90,'Collapsed test notice must leave room for answers at 320/390px');
        await p.locator('.at-test-notice summary').focus();await p.keyboard.press('Enter');
        await p.getByRole('button',{name:'Runde neu starten',exact:true}).waitFor({state:'visible'});
        await p.locator('.at-test-notice summary').press('Enter');
        await p.addStyleTag({content:'html{font-size:200% !important}'});await p.evaluate(()=>scrollTo(0,0));await shot('round-A-200-top');
        await p.locator('.answer').first().scrollIntoViewIfNeeded();await shot('round-A-200-answers');
      }
      await context.close();
    }
  }
}finally{await browser.close();await server.close();}
fs.writeFileSync(path.join(out,'visual-captures.json'),JSON.stringify({engine:'Chromium/Linux',type:'real browser viewport captures, not mockups',physical_iphone:'OPEN',records},null,2));
console.log(`Captured ${records.length} actual viewport screenshots`);
