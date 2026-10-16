import fs from 'node:fs';import assert from 'node:assert/strict';import {createRequire} from 'node:module';import {chromium} from 'playwright';import {KEYS} from '../src/store.js';import {phase3Fixture} from './phase3-fixtures.mjs';import {selectPathsOverview} from '../src/paths-model.js';
const base=process.env.QA_URL||'http://127.0.0.1:4391',out=process.env.QA_OUT||'qa-output/uiux-phase3/overview';fs.mkdirSync(out,{recursive:true});const results=[],errors=[],axe=fs.readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'),'utf8');const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const check=async(name,fn)=>{try{await fn();results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',error:e.stack});}console.log(results.at(-1).status,name)};
try{for(const width of [320,390])for(const theme of ['light','atmospheric','paper','night']){
 const c=await b.newContext({viewport:{width,height:width===320?568:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'}),p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));await c.addInitScript(KEYS=>localStorage.setItem(KEYS.onboard,'done'),KEYS);await p.goto(base+'/#paths');await p.locator('#main h1').waitFor();
 for(const name of ['empty','active','five','many','archived','mixed','long'])await check(`${name} / ${theme} / ${width}`,async()=>{
  const data=phase3Fixture(name,theme);await p.evaluate(({KEYS,data})=>localStorage.setItem(KEYS.main,JSON.stringify(data)),{KEYS,data});await p.reload();await p.locator('#main h1').waitFor();
  const before=await p.evaluate(k=>localStorage.getItem(k),KEYS.main),model=selectPathsOverview(data);
  assert.equal(await p.locator('[data-path-card]').count(),model.cards.length);
  if(model.cards.length){assert.equal(await p.locator('[data-path-card]').first().getAttribute('data-path-card'),model.cards[0].path.id);assert.equal(await p.locator('[data-path-card] a').count(),model.cards.length);}
  assert(await p.getByRole('button',{name:'Einen Weg beginnen',exact:true}).isVisible());assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await p.getByRole('button',{name:'Archiv',exact:true}).click();assert.equal(await p.locator('[data-path-card]').count(),model.archivedCount);
  if(model.archivedCount){await p.locator('[data-path-card] a').first().click();await p.locator('.path-page').waitFor();await p.goto(base+'/#paths');await p.locator('.paths-page').waitFor();}
  else await p.getByRole('button',{name:'Aktive Wege',exact:true}).click();
  assert.equal(await p.evaluate(k=>localStorage.getItem(k),KEYS.main),before,'Overview/archive must not mutate personal data');
  if(name==='active'){await p.evaluate(axe);const r=await p.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}));assert.deepEqual(r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[]);}
 });await c.close();
}}finally{await b.close();fs.writeFileSync(out+'/results.json',JSON.stringify({base,results,errors},null,2));}if(errors.length||results.some(x=>x.status==='FAIL'))process.exitCode=1;
