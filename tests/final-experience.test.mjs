import assert from 'node:assert/strict';
import {empty,migrate,createStore,KEYS} from '../src/store.js';
import {treeLevel} from '../src/domain.js';
import fs from 'node:fs';
const books=JSON.parse(fs.readFileSync('data/index.json'));
const j=await import('../src/bible-journey.js').catch(()=>({}));
const b=await import('../src/tree-branches.js').catch(()=>({}));
const t=await import('../src/themes.js').catch(()=>({}));
const at='2026-10-05T12:00:00Z';
{
 const s=empty();s.reading={book:'JHN',chapter:3};s.quiz={10070:{done:at}};s.events=[{id:'old',kind:'reading',at,ref:s.reading}];assert.equal(j.journeySummary(s,books).chapters,0,'opens and quiz are not reading completion');
 assert(j.recordExploredChapter(s,{book:'Johannes',chapter:3},books,at,'end-1'));assert(!j.recordExploredChapter(s,{book:'JHN',chapter:3,translation:'l1912'},books,at,'end-2'));assert.equal(j.journeySummary(s,books).chapters,1);assert.equal(s.events.filter(e=>e.kind==='chapter-explored').length,1);assert.equal(treeLevel(s),0);
}
{
 const s=empty();for(const c of[1,2,3])j.recordExploredChapter(s,{book:'2JN',chapter:c},books,at,'two-'+c);const x=j.journeySummary(s,books);assert.equal(x.chapters,1);assert.equal(x.completedBooks,1);assert.equal(x.begunBooks,1);
 s.events.push({id:'bad',kind:'chapter-explored',at,ref:{book:'XYZ',chapter:1}},{id:'no-date',kind:'chapter-explored',ref:{book:'JHN',chapter:3}},{id:'duplicate',kind:'chapter-explored',at,ref:{book:'2JN',chapter:1}});assert.equal(j.journeySummary(s,books).chapters,1);
 assert(!j.recordExploredChapter(s,{book:'JHN',chapter:0},books,at,'invalid'));assert(!j.recordExploredChapter(s,{book:'JHN',chapter:22},books,at,'invalid'));assert.throws(()=>j.recordExploredChapter(s,{book:'JHN',chapter:1},books,'invalid','bad-date'));
}
{
 const s=empty();s.paths=Array.from({length:8},(_,i)=>({id:'p'+i,title:'Weg '+i,started:at,archived:i===7,steps:i? [{id:'s'+i,text:'Eigener Schritt',createdAt:`2026-09-0${i}T12:00:00Z`}]:[],milestones:[],reviews:[],links:[]}));
 s.journal=[{id:'j',text:'Eigener Gedanke',date:at,pathIds:['p0'],reflectionId:'r'}];s.reflections=[{id:'r',text:'Eigener Gedanke',date:at,pathIds:['p0']}];assert.equal(b.pathEvidence(s,'p0').thoughts.length,1);assert.deepEqual(b.treeBranches(s,0).visible,[]);assert.deepEqual(b.treeBranches(s,1).visible,[]);assert.equal(b.treeBranches(s,2).visible.length,1);assert.equal(b.treeBranches(s,3).visible.length,3);assert.equal(b.treeBranches(s,4).visible.length,5);assert.equal(b.treeBranches(s,4).other.length,3);assert.equal(b.treeBranches(s,4).visible[0].path.id,'p0');assert.equal(b.treeBranches(s,4).other.at(-1).path.id,'p7');assert.equal(b.treeBranches(s,4).visible[0].path,s.paths[0]);
 const before=JSON.stringify(s);b.treeBranches(s,6);assert.equal(JSON.stringify(s),before);assert.equal(b.branchSlots[2].length,1);assert.equal(b.branchSlots[3].length,3);assert.equal(b.branchSlots[4].length,5);
}
{
 const s=empty();s.paths=[{id:'only-opened',title:'Gestartet',started:at,steps:[],milestones:[],reviews:[],links:[]}];s.guidedPlans={vertrauen:{0:true}};s.events=[{id:'q',kind:'reading',at,ref:{book:'JHN',chapter:3}}];assert.equal(b.treeBranches(s,6).visible.length,0);s.journal=[{id:'orphan',text:'Ein Gedanke',date:at,pathIds:['missing']}];assert.equal(b.treeBranches(s,6).visible.length,0);
 s.paths[0].reviews.push({id:'explicit',text:'Eigener Rückblick',date:at});assert.equal(b.treeBranches(s,6).visible.length,1);assert(b.treeBranches(s,6).visible[0].hasReview);assert(!b.treeBranches(s,6).visible[0].hasMilestone);
}
{
 const s=empty();s.paths=[{id:'p',title:'Weg',steps:[],milestones:[],reviews:[],links:[]}];s.journal=[{id:'same',text:'Mein Gedanke',pathIds:['p']}];s.reflections=[{id:'same',text:'Unverbunden',pathIds:[]}];s.reviews=[{id:'wrong',text:'Anderer Rückblick',sourceKey:'reflection:same'}];assert.equal(b.pathEvidence(s,'p').reviews.length,0,'collection namespaces cannot create false review links');
 s.journal[0].reflectionId='same';assert.equal(b.pathEvidence(s,'p').reviews.length,1,'explicit mirror reference remains valid');
}
{
 assert.deepEqual(t.THEMES.map(x=>x.id),['light','atmospheric','paper','night']);for(const id of['light','atmospheric','paper','night'])assert.equal(t.themeId({settings:{theme:id}}),id);assert.equal(t.themeId(empty()),'light');assert.equal(t.themeId({settings:{theme:'unknown'}}),'light');
 const dom={documentElement:{dataset:{}},querySelector:()=>null};assert.equal(t.applyTheme(dom,'night'),'night');assert.equal(dom.documentElement.dataset.theme,'night');assert.equal(t.applyTheme(dom,'unknown'),'light');
}
{
 const s=empty();s.settings={theme:'night',existing:true};j.recordExploredChapter(s,{book:'JHN',chapter:3},books,at,'journey');const migrated=migrate(s);assert.deepEqual(migrated,s);const mem=new Map([[KEYS.main,JSON.stringify(s)]]),storage={getItem:k=>mem.get(k)||null,setItem:(k,v)=>mem.set(k,v)};const store=createStore(storage);const backup=store.backup();assert.equal(backup.schemaVersion,5);assert.deepEqual(store.prepareImport(backup),s);const old=migrate(empty());assert.equal(t.themeId(old),'light');assert.equal(j.journeySummary(old,books).chapters,0);
}
console.log('PASS factual journey, branches, themes, backward-compatible storage');
