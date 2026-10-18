/** Honest before/after captures of the real baseline and candidate, with identical data. */
import fs from 'node:fs';import assert from 'node:assert/strict';import {chromium} from 'playwright';import {KEYS} from '../../src/store.js';import {phase3Fixture} from '../phase3-fixtures.mjs';
const before=process.env.QA_BASELINE_URL,after=process.env.QA_URL,out=process.env.QA_OUT||'qa-output/phase7/visual';assert(before&&after);fs.mkdirSync(out,{recursive:true});
const b=await chromium.launch({...(process.env.FAITHPATH_CHROMIUM?{executablePath:process.env.FAITHPATH_CHROMIUM}:{}),args:['--no-sandbox']}),results=[],errors=[];
const routes={today:'today',reader:'read/JHN/3/otb',quiz:'quiz/10070',paths:'paths',journal:'journal',reviews:'reviews',tree:'tree'};
try{for(const theme of ['light','night'])for(const width of [320,390])for(const [version,base]of [['before',before],['after',after]]){
 const c=await b.newContext({viewport:{width,height:width===320?568:844},reducedMotion:'reduce'});await c.addInitScript(({KEYS,data})=>{if(!sessionStorage.getItem('visual-seed')){localStorage.setItem(KEYS.main,JSON.stringify(data));localStorage.setItem(KEYS.onboard,'done');sessionStorage.setItem('visual-seed','yes')}},{KEYS,data:phase3Fixture('tree-6',theme)});const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));
 await p.goto(base+'/#more?section=settings');await p.locator('#offline-state').filter({hasText:'Beide Bibeln und die App sind für dieses Gerät offline bereit.'}).waitFor({timeout:90000});
 for(const [name,route]of Object.entries(routes)){await p.goto(base+'/#'+route);await p.locator('#main h1').waitFor();if(name==='reader')await p.locator('.verse').first().waitFor();if(name==='tree')await p.locator('.tree-branch-scene img').evaluate(img=>img.decode());await p.evaluate(()=>document.fonts.ready);await p.screenshot({path:`${out}/${name}-${theme}-${width}-${version}.png`});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));results.push({name,route,theme,width,version,status:'PASS'})}
 await c.close();
}}finally{await b.close();fs.writeFileSync(out+'/results.json',JSON.stringify({results,errors,baseline:before,candidate:after,syntheticData:true,physicalIOS:'OFFEN'},null,2))}
assert.deepEqual(errors,[]);
