import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {empty,KEYS} from '../src/store.js';
const module=await import('../src/app-router.js').catch(e=>{if(e.code==='ERR_MODULE_NOT_FOUND'&&e.message.includes('app-router.js'))return {};throw e;});
const books=JSON.parse(fs.readFileSync('data/index.json'));
const unit=JSON.parse(fs.readFileSync('data/stories.json')).find(x=>x.kind==='chapter-quiz');
function harness(hash='#today'){
 assert.equal(typeof module.createAppRouter,'function','Routing boundary is not exposed yet');
 const calls=[],data=empty(),ui={route:'today',token:0,stories:[unit],books,quiz:null},location={hash};
 const names=['mergedStory','sourceQuestion','home','guidance','topic','bible','chapters','chapterCollection','reader','marks','markDetail','discover','story','quizIndex','quiz','chapterQuizComplete','paths','path','tree','plans','plan','journal','entry','history','reviews','more','contentStatus','licenses','openForm','notFound','fillJourneyScripture'];
 const views=Object.fromEntries(names.map(name=>[name,(...args)=>calls.push({name,args})]));
 const h1={focus:()=>calls.push({name:'focus'})},document={querySelector:selector=>selector==='h1'?h1:null,querySelectorAll:()=>[]};
 const storage={getItem:()=>null};
 const helpers={shell:(...args)=>calls.push({name:'shell',args}),heading:(...x)=>x.join(' / '),back:()=>'',button:()=>''};
 const render=module.createAppRouter({ui,getState:()=>data,views,helpers,canonicalStoryForLegacy:()=>null,go:route=>calls.push({name:'go',args:[route]}),storage,document,window:{scrollTo:()=>calls.push({name:'scroll'})},location});
 return {render,calls,data,ui,location,views,storage,document};
}
test('hash parsing preserves encoded IDs, queries and malformed-URI rejection',()=>{
 assert.equal(typeof module.parseHashRoute,'function','Hash parser is not exposed yet');
 assert.equal(module.parseHashRoute('').kind,'today');
 const r=module.parseHashRoute('#entry/a%2Fb?source=hello%20world');
 assert.deepEqual(r.parts,['entry','a/b']);assert.equal(r.key,'a/b');assert.equal(r.query,'source=hello%20world');
 assert.throws(()=>module.parseHashRoute('#path/%E0%A4'),URIError);
});
test('existing route names dispatch to their exact adapters without data mutation',async()=>{
 for(const [route,name,args] of [
  ['today','home',[]],['guidance','guidance',[]],['topic/angst','topic',['angst']],['bible','bible',[]],['chapters/JHN','chapters',['JHN']],['chapter-quizzes/JHN','chapterCollection',['JHN']],['marks','marks',[]],['mark/m1','markDetail',['m1']],['discover','discover',[]],['story/7','story',['7']],['quizzes','quizIndex',[]],['paths','paths',[]],['path/p1','path',['p1']],['tree','tree',[]],['plans','plans',[]],['plan/start7','plan',['plan','start7']],['guide/start','plan',['guide','start']],['journal','journal',[]],['entry/j1','entry',['j1','entry']],['reflection/r1','entry',['r1','reflection']],['review/r1','entry',['r1','review']],['history','history',[]],['reviews','reviews',[]],['more?section=data','more',[]],['content-status','contentStatus',[]],['licenses','licenses',[]],['merged-story/N-1','mergedStory',['N-1']],['question/N-0001','sourceQuestion',['N-0001']],['unknown','notFound',[]]
 ]){const h=harness('#'+route),before=JSON.stringify(h.data);await h.render();assert.deepEqual(h.calls.find(x=>x.name===name)?.args,args,route);assert.equal(JSON.stringify(h.data),before);assert.equal(h.ui.route,route);}
});
test('a stale reader completion cannot steal focus from the newer route',async()=>{
 const h=harness('#read/JHN/3/otb?from=1&to=2');let resolve;
 h.views.reader=(parts,params,token)=>{assert.deepEqual(parts,['read','JHN','3','otb']);assert.equal(params.get('from'),'1');assert.equal(token,1);return new Promise(r=>resolve=r)};
 const pending=h.render();h.location.hash='#journal';await h.render();resolve();await pending;
 assert.equal(h.ui.route,'journal');assert.equal(h.calls.filter(x=>x.name==='focus').length,1);
});
test('quiz return identity, unfinished state and explicit completion keep existing keys',async()=>{
 const h=harness('#quiz/'+unit.id+'?return=chapter-quizzes%2F'+unit.book);await h.render();
 h.ui.quiz.index=2;h.ui.quiz.answer=1;await h.render();assert.equal(h.ui.quiz.index,2);assert.equal(h.ui.quiz.answer,1);
 h.location.hash='#quiz/'+unit.id+'?return=bible';await h.render();assert.equal(h.ui.quiz.index,0);assert.equal(h.ui.quiz.returnRoute,'bible');
 h.data.quiz[unit.id]={done:'2026-10-18'};h.location.hash+="&complete=1";await h.render();assert(h.calls.some(x=>x.name==='chapterQuizComplete'));assert.deepEqual(Object.keys(h.data.quiz),[String(unit.id)]);
});
test('compose resumes the exact existing draft without writes and invalid links show the existing error view',async()=>{
 const h=harness('#compose'),draft={type:'entry',args:{id:'j1'},values:{text:'Meine unveränderten Worte'}};
 h.storage.getItem=key=>key===KEYS.draft?JSON.stringify(draft):null;await h.render();assert.deepEqual(h.calls.find(x=>x.name==='openForm').args,[draft.type,draft.args,draft.values]);
 h.location.hash='#path/%E0%A4';await h.render();assert(h.calls.some(x=>x.name==='shell'&&x.args[0].includes('Dieser Inhalt ist gerade nicht verfügbar.')));
});

test('step deep links open the existing disclosure and focus the exact encoded step',async()=>{
 const h=harness('#path/p1?step=s%2F1'),disclosure={open:false};let focused=false,scroll;
 const input={dataset:{id:'s/1'},closest:()=>disclosure,focus:()=>focused=true,scrollIntoView:args=>scroll=args};
 h.document.querySelectorAll=selector=>selector==='.path-step input'?[input]:[];
 await h.render();assert.equal(disclosure.open,true);assert.equal(focused,true);assert.equal(scroll.block,'center');
});

test('compose continues an owned first-seed draft through its real route without opening an unsupported editor',async()=>{const h=harness('#compose'),raw=JSON.stringify({type:'first-seed',args:{},values:{scene:3,thought:'Meine Worte'}});h.storage.getItem=key=>key===KEYS.draft?raw:null;await h.render();assert.deepEqual(h.calls.find(x=>x.name==='go')?.args,['first-seed']);assert(!h.calls.some(x=>x.name==='openForm'));assert.equal(h.storage.getItem(KEYS.draft),raw)});
