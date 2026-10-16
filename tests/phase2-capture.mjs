import fs from 'node:fs';import {chromium} from 'playwright';
import {KEYS} from '../src/store.js';import {phase2Fixture,sampleStory,TEST_NOW} from './phase2-fixtures.mjs';
const phase=process.argv[2]||'before',base=process.argv[3]||'http://127.0.0.1:4380',out=`qa-output/uiux-phase2/${phase}`;
fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']}),results=[],errors=[];
const scenes=[['reader','read/JHN/3/otb'],['chapter-end','read/JHN/3/otb'],['story','merged-story/'+sampleStory.story_id],['question','question/'+sampleStory.flow_items[0].primary_question_id],['answer','question/'+sampleStory.flow_items[0].primary_question_id],['reflection','merged-story/'+sampleStory.story_id],... [0,1,5,300,1189].map(n=>['sword-'+n,'bible-journey',n])];
try{for(const [width,height] of [[320,568],[390,844],[430,932]])for(const theme of ['light','night']){
 const c=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,reducedMotion:'reduce'}),p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));
 await c.addInitScript(({KEYS,now})=>{Date.now=()=>Date.parse(now);localStorage.setItem(KEYS.onboard,'done');},{KEYS,now:TEST_NOW});
 await p.goto(base+'/#today');await p.locator('#main h1').waitFor();
 for(const [name,route,count=1]of scenes){
  await p.evaluate(({data,KEYS})=>localStorage.setItem(KEYS.main,JSON.stringify(data)),{data:phase2Fixture(theme,count),KEYS});await p.reload();await p.goto(base+'/#'+route);await p.locator('#main h1').waitFor();
  if(name==='chapter-end'){await p.locator('#chapter-end-sentinel').scrollIntoViewIfNeeded();await p.locator('.reader-chapter-questions').scrollIntoViewIfNeeded();}
  if(name==='answer')await p.locator('.answer').first().click();
  if(name==='reflection'){await p.locator('[data-action="reflect-story"]').click();await p.getByLabel('Dein Gedanke',{exact:true}).fill('Ein synthetischer Gedanke für die visuelle Prüfung.');}
  if(name.startsWith('sword'))await p.locator('.journey-sword').waitFor();
  await p.evaluate(()=>document.fonts.ready);await p.locator('.toast.visible').waitFor({state:'hidden',timeout:8000});
  const file=`${name}-${theme}-${width}.png`;await p.screenshot({path:out+'/'+file});
  if(['reader','story','sword-1','chapter-end'].includes(name))await p.screenshot({path:out+'/'+file.replace('.png','-full.png'),fullPage:true});
  results.push({name,width,height,theme,screenshot:file,overflow:await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1)});
 }
 await c.close();
}}finally{await browser.close();fs.writeFileSync(out+'/measurements.json',JSON.stringify({phase,base,results,errors,syntheticDataOnly:true},null,2));}console.log(JSON.stringify({captures:results.length,errors}));
