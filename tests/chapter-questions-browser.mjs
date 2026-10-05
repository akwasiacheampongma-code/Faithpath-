import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {chromium} from 'playwright';
import {KEYS} from '../src/store.js';
import {BUILD} from '../src/version.js';
import {coreFixture} from './core-depth-fixture.mjs';
const base = process.env.FAITHPATH_QA_URL || 'http://127.0.0.1:4251';
const out = process.env.FAITHPATH_QA_OUT || 'qa-output/chapter-questions-integration/local-chapter';
const baseline = process.env.CHAPTER_BASELINE === '1';
const axe = fs.readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');
const units = JSON.parse(fs.readFileSync('data/stories.json')).filter(unit => unit.kind === 'chapter-quiz');
const books = JSON.parse(fs.readFileSync('data/index.json'));
const john = units.find(unit => unit.book === 'JHN' && unit.chapter === 2);
const seed = coreFixture();
seed.quiz = {'1':{done:'2026-09-01T12:00:00Z',legacy:'story'},'10000':{done:'2026-09-01T12:00:00Z'},'10070':{legacy:'retain'}};
const blockedPages = new WeakSet();
const results = [], errors = [], consoleErrors = [], loads = [], shots = [];
fs.mkdirSync(out, {recursive:true});
const b = await chromium.launch({executablePath:'/usr/bin/chromium', args:['--no-sandbox', ...(process.env.FAITHPATH_PROXY_SPKI ? ['--ignore-certificate-errors-spki-list='+process.env.FAITHPATH_PROXY_SPKI] : [])]});
async function check(name, fn) {try {await fn();results.push({name,status:'PASS'});} catch(error) {results.push({name,status:'FAIL',error:error.stack});}}
async function context(w=390,h=844,text=100,sw='block') {
  const c = await b.newContext({viewport:{width:w,height:h},serviceWorkers:sw,reducedMotion:'reduce'});
  await c.addInitScript(({seed,KEYS,text}) => {
    if (!localStorage.getItem(KEYS.main)) {localStorage.setItem(KEYS.main, JSON.stringify(seed));localStorage.setItem(KEYS.onboard,'done');}
    document.addEventListener('DOMContentLoaded', () => document.documentElement.style.fontSize=text+'%');
  }, {seed,KEYS,text});
  const p = await c.newPage();if(sw==='block')blockedPages.add(p);p.setDefaultTimeout(12000);
  p.on('pageerror', e => errors.push(e.message));p.on('console', m => {if(m.type()==='error')consoleErrors.push(m.text());});p.on('response', r => {if(r.status()>=400)loads.push({url:r.url(),status:r.status()});});
  return {c,p};
}
async function route(p,r) {await p.goto(base+'/#'+r,{waitUntil:'networkidle'});await p.locator('#main h1').waitFor();if(r.startsWith('read/'))await p.locator('.verse').first().waitFor();if(blockedPages.has(p)){const t=p.locator('#toast').filter({hasText:'Offline-Vorbereitung konnte nicht abgeschlossen'});if(await t.isVisible())await t.getByRole('button',{name:'Meldung schließen'}).click();}}
const state = p => p.evaluate(KEYS => JSON.parse(localStorage.getItem(KEYS.main)), KEYS);
async function shot(p,name) {const file=path.join(out,name+'.png');await p.screenshot({path:file});shots.push(file);}
async function play(p,unit=john,keyboard=false) {
  for(let i=0;i<unit.questions.length;i++) {
    const q=unit.questions[i];
    assert((await p.locator('.quiz-head').innerText()).includes(`Frage ${i+1} von ${unit.questions.length}`));
    assert.equal(await p.locator('[data-question-id]').getAttribute('data-question-id'),q.faithpath_id);
    assert.equal(await p.locator('.answers button').count(),4);
    assert.equal((await p.locator('.quiz-title').innerText()),q.q);
    const option=p.locator(`.answer[data-answer="${i===0 ? (q.c+1)%4 : q.c}"]`);
    if(keyboard){await option.focus();await p.keyboard.press('Enter');}else await option.click();
    assert.equal(await p.locator('.answer.correct').count(),1);
    assert((await p.locator('.answer.correct').innerText()).includes(q.a[q.c]));
    assert((await p.locator('.explanation').innerText()).includes(q.x));
    assert((await p.locator('.explanation').innerText()).includes(q.ref || q.p));
    if(i===0){await shot(p,'09-answered-question');assert.equal(await p.locator('.answer.selected-wrong').count(),1);}
    if(i===4)await shot(p,'10-question-5');
    if(keyboard){assert(await p.locator('.explanation').evaluate(el=>el===document.activeElement));await p.keyboard.press('Tab');assert(await p.locator('[data-action="next-question"]').evaluate(el=>el===document.activeElement));await p.keyboard.press('Enter');}
    else await p.locator('[data-action="next-question"]').click();
  }
  await p.locator('.chapter-quiz-complete').waitFor();
  assert((await p.locator('.chapter-quiz-complete').innerText()).includes(unit.ref));
}
async function axeCheck(p) {await p.evaluate(axe);const a=await p.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}));assert.deepEqual(a.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})),[]);}
async function bounds(p) {assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'page horizontal overflow');}
try {
  const {c,p}=await context();
  await check('reader has the canonical chapter quiz strictly after the final verse', async()=>{
    await route(p,'read/JHN/3/otb');const section=p.locator('.reader-chapter-questions');assert.equal(await section.count(),1);
    assert.equal(await section.getAttribute('data-unit-id'),String(john.id));
    const last=await p.locator('.reading-text').boundingBox(),s=await section.boundingBox();assert(s.y>=last.y+last.height);
    const href=await section.getByRole('link',{name:'Fragen starten',exact:true}).getAttribute('href');assert.equal(href.split('?')[0],'#quiz/'+john.id);
    await section.scrollIntoViewIfNeeded();await shot(p,'01-reader-end-390');
  });
  await check('one compact collection contains 27 books, 260 chapters and 1300 questions', async()=>{
    await route(p,'chapter-quizzes');const rows=p.locator('[data-chapter-book]');assert.equal(await rows.count(),27);
    const data=await rows.evaluateAll(rows=>rows.map(row=>({book:row.dataset.chapterBook,chapters:+row.dataset.chapters,questions:+row.dataset.questions})));
    assert.equal(data.reduce((n,row)=>n+row.chapters,0),260);assert.equal(data.reduce((n,row)=>n+row.questions,0),1300);assert.equal(new Set(data.map(row=>row.book)).size,27);
    for(const row of data){assert.equal(row.chapters,units.filter(unit=>unit.book===row.book).length);assert.equal(row.questions,row.chapters*5);}
    await shot(p,'05-collection-books');
  });
  if(baseline){
    await check('existing fifth chapter question reaches the required quiet chapter completion',async()=>{
      await route(p,'quiz/10070');
      for(let i=0;i<5;i++){await p.locator('.answer').first().click();await p.locator('[data-action="next-question"]').click();}
      await p.locator('[data-action="reflect-story"]').waitFor();
      assert.equal(await p.locator('.chapter-quiz-complete').count(),1);
    });
    await c.close();
  }
  else {
    await check('every book collection exposes precisely its existing canonical units without duplicate questions',async()=>{
      for(const book of books.filter(book=>units.some(unit=>unit.book===book.code))){await route(p,'chapter-quizzes/'+book.code);const rows=p.locator('[data-chapter-unit]');const expected=units.filter(unit=>unit.book===book.code);assert.equal(await rows.count(),expected.length,book.code);const ids=await rows.evaluateAll(rows=>rows.map(row=>Number(row.dataset.chapterUnit)));assert.deepEqual(ids,expected.map(unit=>unit.id));}
      await route(p,'chapter-quizzes/JHN');await shot(p,'06-collection-chapters');
    });
    await check('all required boundary mappings and no-data chapter have the right reader behavior',async()=>{
      for(const[book,chapter]of[['MAT',1],['MAT',28],['MRK',1],['JHN',3],['ACT',28],['REV',22]]){await route(p,`read/${book}/${chapter}/otb`);const unit=units.find(unit=>unit.book===book&&unit.chapter===chapter-1);assert.equal(await p.locator('.reader-chapter-questions').getAttribute('data-unit-id'),String(unit.id));}
      await route(p,'read/GEN/1/otb');assert.equal(await p.locator('.reader-chapter-questions').count(),0);assert(await p.locator('.verse').count()>0);await p.locator('.verse').last().scrollIntoViewIfNeeded();await shot(p,'04-reader-without-quiz');
    });
    await check('Später skips only the current UI section and creates no quiz, reminder or task',async()=>{
      await route(p,'read/JHN/3/otb');const before=await state(p);const url=p.url();await p.locator('.reader-chapter-questions').getByRole('button',{name:'Später',exact:true}).click();const after=await state(p);assert.equal(p.url(),url);assert.equal(await p.locator('.reader-chapter-questions').count(),0);assert.deepEqual(after,before);assert.equal(await p.locator('.chapter-nav a').count(),2);
    });
    await check('reader origin, full five questions, canonical status sync, reload and original personal data',async()=>{
      const origin='read/JHN/3/l1912?from=1&to=3&origin=path%2Fcore-path';await route(p,origin);const before=await state(p);
      await p.locator('.reader-chapter-questions').getByRole('link',{name:'Fragen starten',exact:true}).click();await p.locator('.quiz-title').waitFor();await shot(p,'08-question-1');await play(p);await shot(p,'11-quiz-completed');
      const after=await state(p);assert(after.quiz[john.id].done);assert.equal(after.quiz[john.id].legacy,'retain');assert.deepEqual(after.quiz['1'],before.quiz['1']);assert.deepEqual(after.quiz['10000'],before.quiz['10000']);
      for(const field of['paths','journal','reflections','highlights','reviews','settings','guidedPlans'])assert.deepEqual(after[field],before[field],field);
      assert.equal(await p.getByRole('link',{name:'Zurück zum Kapitel',exact:true}).getAttribute('href'),'#'+origin);
      assert.equal(await p.getByRole('link',{name:'Nächstes Kapitel lesen',exact:true}).getAttribute('href'),'#read/JHN/4/l1912');
      await p.getByRole('link',{name:'Zurück zum Kapitel',exact:true}).click();await p.locator('.verse').first().waitFor();assert.equal(decodeURIComponent(new URL(p.url()).hash.slice(1)),decodeURIComponent(origin));await p.locator('.reader-chapter-questions').scrollIntoViewIfNeeded();assert((await p.locator('.reader-chapter-questions').innerText()).includes('angesehen'));await shot(p,'12-reader-return');
      await route(p,'chapter-quizzes/JHN');assert((await p.locator('[data-chapter-unit="10070"]').innerText()).includes('angesehen'));await shot(p,'07-completed-chapter');await p.reload({waitUntil:'networkidle'});assert((await p.locator('[data-chapter-unit="10070"]').innerText()).includes('angesehen'));
    });
    await check('collection origin returns to its book and preserves reader translation; direct and legacy routes work',async()=>{
      await route(p,'chapter-quizzes/JHN');await p.locator('[data-chapter-unit="10070"]').click();await p.locator('.quiz-title').waitFor();assert.equal(await p.locator('.back-link').getAttribute('href'),'#chapter-quizzes/JHN');await play(p);await p.getByRole('link',{name:'Zur Sammlung',exact:true}).click();await p.locator('[data-chapter-unit="10070"]').waitFor();
      await route(p,'quiz/10070');assert.equal(await p.locator('[data-question-id]').getAttribute('data-question-id'),'FP-0611');
      await route(p,'story/10070');await p.locator('[data-action="quiz"]').click();await p.locator('.quiz-title').waitFor();assert.equal(await p.locator('.back-link').getAttribute('href'),'#story/10070');
      await route(p,'quiz/10259?return=read%2FREV%2F22%2Fotb');await play(p,units.at(-1));assert.equal(await p.getByRole('link',{name:'Nächstes Kapitel lesen',exact:true}).count(),0);
    });
    await check('book quiz links accessible from existing Entdecken architecture',async()=>{await route(p,'discover');await p.getByRole('link',{name:'Kapitelübungen',exact:true}).click();await p.locator('[data-chapter-book="JHN"]').waitFor();});
    await check('backup preserves the single canonical completion and its existing metadata',async()=>{await route(p,'more?section=data');const download=p.waitForEvent('download');await p.getByRole('button',{name:'Backup exportieren',exact:true}).click();const file=path.join(out,'chapter-backup.json');await(await download).saveAs(file);const backup=JSON.parse(fs.readFileSync(file));assert(backup.data.quiz[john.id].done);assert.equal(backup.data.quiz[john.id].legacy,'retain');assert.equal(backup.data.version,5);await p.locator('#import-file').setInputFiles(file);await p.getByRole('heading',{name:'Backup wiederherstellen?',exact:true}).waitFor();await p.getByRole('button',{name:'Backup wiederherstellen',exact:true}).click();await p.getByRole('heading',{name:'Daten & Backup',exact:true}).waitFor();assert.deepEqual((await state(p)).quiz,backup.data.quiz);await route(p,'chapter-quizzes/JHN');assert((await p.locator('[data-chapter-unit="10070"]').innerText()).includes('angesehen'));});
    await c.close();
    for(const[w,h,text]of[[320,568,100],[390,844,100],[768,1024,100],[1440,1000,100],[320,568,200],[390,844,200]]){
      const{c,p}=await context(w,h,text);await check(`responsive ${w}x${h} @${text}% and axe`,async()=>{
        for(const r of['chapter-quizzes','chapter-quizzes/JHN','chapter-quizzes/ACT','read/JHN/3/otb','quiz/10070']){await route(p,r);await bounds(p);await axeCheck(p);}
        await route(p,'read/JHN/3/otb');await p.locator('.reader-chapter-questions').scrollIntoViewIfNeeded();await shot(p,`reader-end-${w}-${text}`);
        for(const target of await p.locator('.reader-chapter-questions a,.reader-chapter-questions button').all()){const box=await target.boundingBox();assert(box.height>=44);assert(box.x>=0&&box.x+box.width<=w);}
        await p.locator('.reader-chapter-questions').getByRole('link',{name:'Fragen starten',exact:true}).click();await p.locator('.quiz-title').waitFor();await play(p);await bounds(p);await axeCheck(p);await shot(p,`completion-${w}-${text}`);
        await route(p,'chapter-quizzes');await shot(p,`${w}-collection-${text}`);
      });await c.close();
    }
    const keyboard=await context(320,568,200);await check('complete keyboard flow and Reduced Motion from final verse to completion',async()=>{
      const p=keyboard.p;await route(p,'read/JHN/3/otb');await p.locator('.verse').last().focus();await p.keyboard.press('Tab');assert(await p.locator('.reader-chapter-questions a').first().evaluate(el=>el===document.activeElement));await p.keyboard.press('Enter');await p.locator('.quiz-title').waitFor();await play(p,john,true);assert(await p.evaluate(()=>matchMedia('(prefers-reduced-motion:reduce)').matches));await p.keyboard.press('Tab');assert(await p.getByRole('link',{name:'Zurück zum Kapitel',exact:true}).evaluate(el=>el===document.activeElement));await p.keyboard.press('Enter');await p.locator('.verse').first().waitFor();
    });await keyboard.c.close();
    const offline=await context(390,844,100,'allow');await check('prepared offline reader to all five questions, correct return, collection status and offline reload',async()=>{
      const{c,p}=offline;await route(p,'more?section=settings');await p.locator('#offline-state').filter({hasText:'Beide Bibeln und die App sind für dieses Gerät offline bereit.'}).waitFor({timeout:90000});await p.waitForFunction(async()=>!!navigator.serviceWorker.controller,{},{timeout:90000});await c.setOffline(true);await p.reload({waitUntil:'networkidle'});await route(p,'read/JHN/3/otb');await p.locator('.reader-chapter-questions').getByRole('link',{name:'Fragen starten',exact:true}).click();await p.locator('.quiz-title').waitFor();await play(p);await p.getByRole('link',{name:'Zurück zum Kapitel',exact:true}).click();await p.locator('.verse').first().waitFor();await route(p,'chapter-quizzes/JHN');assert((await p.locator('[data-chapter-unit="10070"]').innerText()).includes('angesehen'));await p.reload({waitUntil:'networkidle'});assert((await p.locator('[data-chapter-unit="10070"]').innerText()).includes('angesehen'));await route(p,'more?section=data');
    });await offline.c.close();
  }
} finally {await b.close();fs.writeFileSync(out+'/results.json',JSON.stringify({base,build:BUILD,baseline,results,shots,errors,consoleErrors,loads},null,2));}
console.log(JSON.stringify({results,errors,consoleErrors,loads}));
if(results.some(result=>result.status==='FAIL')||errors.length||consoleErrors.length||loads.length)process.exitCode=1;
