import fs from 'node:fs';import assert from 'node:assert/strict';import {chromium} from 'playwright';
import {KEYS} from '../src/store.js';import {todayFixture} from './today-phase1-fixtures.mjs';import {BUILD} from '../src/version.js';
const out='qa-output/uiux-phase1/zoom',base=process.env.QA_URL||'http://127.0.0.1:4361';fs.mkdirSync(out,{recursive:true});
const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']}),results=[];
try{for(const width of [320,390]){
 const seed=todayFixture('returning','paper'),c=await b.newContext({viewport:{width,height:width===320?568:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
 await c.addInitScript(({seed,KEYS})=>{if(!localStorage.getItem(KEYS.main)){localStorage.setItem(KEYS.main,JSON.stringify(seed.data));localStorage.setItem(KEYS.onboard,'done');}},{seed,KEYS});const p=await c.newPage();
 await p.goto(base+'/#today');await p.locator('.today-path-action').waitFor();await p.locator('.today-tree .olive-art').waitFor();
 const raw=await p.evaluate(k=>localStorage.getItem(k),KEYS.main),cdp=await c.newCDPSession(p);await cdp.send('Emulation.setPageScaleFactor',{pageScaleFactor:2});
 const viewport=await p.evaluate(()=>({scale:visualViewport.scale,width:visualViewport.width,height:visualViewport.height,layoutWidth:innerWidth}));assert.equal(viewport.scale,2);assert(Math.abs(viewport.width-width/2)<1);
 await p.locator('.today-path-action').focus();await p.screenshot({path:`${out}/pinch-200-${width}.png`});await p.keyboard.press('Enter');await p.locator('#main h1').filter({hasText:'In Ruhe zuhören'}).waitFor();assert(p.url().endsWith('#path/today-path'));assert.equal(await p.evaluate(k=>localStorage.getItem(k),KEYS.main),raw);
 results.push({name:`Actual Chromium page-scale 200% and keyboard action ${width}`,status:'PASS',viewport});await c.close();
}}finally{await b.close();fs.writeFileSync(out+'/results.json',JSON.stringify({build:BUILD,results,physicalPinchGesture:'OFFEN; Chromium CDP page scaling exercised',syntheticDataOnly:true},null,2));}
console.log(JSON.stringify(results));
