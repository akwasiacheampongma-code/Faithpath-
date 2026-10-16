import fs from 'node:fs';import {chromium} from 'playwright';import {KEYS,empty} from '../src/store.js';
const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']}),out='qa-output/uiux-phase2/short-visual',results=[];fs.mkdirSync(out,{recursive:true});
try{for(const theme of ['light','night'])for(const [phase,port]of [['before',4380],['after',4383]]){
 const c=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'}),data=empty();data.settings.theme=theme;
 await c.addInitScript(({KEYS,data})=>{if(!localStorage.getItem(KEYS.main))localStorage.setItem(KEYS.main,JSON.stringify(data));localStorage.setItem(KEYS.onboard,'done');},{KEYS,data});const p=await c.newPage();await p.goto(`http://127.0.0.1:${port}/#read/PSA/117/otb`);await p.locator('.verse').last().waitFor();await p.waitForTimeout(500);
 await p.locator('.toast.visible').waitFor({state:'hidden',timeout:8000});await p.locator('.reading-text').scrollIntoViewIfNeeded();await p.screenshot({path:`${out}/${phase}-${theme}.png`,fullPage:true});
 results.push({phase,theme,events:await p.evaluate(k=>JSON.parse(localStorage.getItem(k)).events.filter(e=>e.kind==='chapter-explored'),KEYS.main)});
 if(phase==='after'){await p.locator('[data-action="explore-chapter"]').click();await p.screenshot({path:`${out}/confirmed-${theme}.png`,fullPage:true});}
 await c.close();
}}finally{await b.close();fs.writeFileSync(out+'/results.json',JSON.stringify({results,syntheticDataOnly:true},null,2));}
