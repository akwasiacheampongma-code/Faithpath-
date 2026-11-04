import fs from 'node:fs';import assert from 'node:assert/strict';import {chromium} from 'playwright';import {fixtureServer} from './first-seed/fixture-server.mjs';import {KEYS} from '../src/store.js';import {phase3Fixture} from './phase3-fixtures.mjs';
const server=await fixtureServer('dist'),browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']}),reports=[],errors=[];
try{for(const theme of ['light','atmospheric','paper','night']){
 const c=await browser.newContext({viewport:{width:390,height:844},bypassCSP:true,serviceWorkers:'block'}),data=phase3Fixture('tree-6',theme);await c.addInitScript(({KEYS,data})=>{if(!sessionStorage.seeded){localStorage.setItem(KEYS.main,JSON.stringify(data));localStorage.setItem(KEYS.onboard,'done');sessionStorage.seeded='1'}},{KEYS,data});const p=await c.newPage();
 for(const state of ['step','review','tree','first-seed']){
  if(p.url()!=='about:blank')await p.evaluate(KEYS=>localStorage.removeItem(KEYS.draft),KEYS);await p.goto(server.url+'/#'+(state==='step'||state==='review'?'path/personal-path':state));await p.reload();await p.locator('#main h1').waitFor();
  if(state==='step'){await p.locator('[data-action=edit-step]').first().click();await p.locator('[data-action=guided-candidate]').first().click();}
  if(state==='review'){await p.locator('[data-action=review-path]').click();await p.locator('.review-prompts summary').click();}
  await p.addScriptTag({path:'node_modules/axe-core/axe.min.js'});const report=await p.evaluate(async()=>{const r=await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}});return {violations:r.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)})),incomplete:r.incomplete.map(v=>({id:v.id,nodes:v.nodes.length}))}});reports.push({theme,state,...report});assert.deepEqual(report.violations,[],JSON.stringify({theme,state,report}));
 }await c.close();
}}catch(e){errors.push(e.stack)}finally{await browser.close();await server.disconnect();fs.writeFileSync('reports/guided-a51/evidence/accessibility.json',JSON.stringify({reports,errors,CSP:'Axe-only diagnostic context bypasses CSP; main browser and full-flow contexts retain production CSP',physicalVoiceOver:'OPEN'},null,2));}
console.log(JSON.stringify({scans:reports.length,errors}));process.exitCode=errors.length?1:0;
