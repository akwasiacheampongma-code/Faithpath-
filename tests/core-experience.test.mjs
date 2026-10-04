import test from 'node:test';
import assert from 'node:assert/strict';
import { empty, createStore, KEYS } from '../src/store.js';
import { developmentCount, treeLevel } from '../src/domain.js';
import { paintRange, clearRange, detachPath, highlightColor } from '../src/core-experience.js';
const ref={book:'JHN',chapter:3,from:1,to:3,translation:'otb'};
const verses=[[1,'Eins'],[2,'Zwei'],[3,'Drei'],[4,'Vier']];let n=0;const id=()=>`new-${++n}`;
test('Range color edits preserve old ID, metadata and unselected verse colors',()=>{
 const d=empty();d.highlights=[{...ref,to:4,id:'existing',at:'2026-09-01',snippet:'Eins Zwei Drei Vier',unknown:'retained'}];
 paintRange(d,{...ref,from:2,to:3},'gold',verses,id,'2026-10-01');
 assert.equal(d.highlights.find(h=>h.id==='existing').color,'gold');
 assert.equal(d.highlights.find(h=>h.from===1).color,undefined);assert.equal(d.highlights.find(h=>h.from===4).color,undefined);
 assert(d.highlights.every(h=>h.unknown==='retained'));assert.equal(new Set(d.highlights.map(h=>h.id)).size,3);
});
test('Existing overlaps plus new verses are all colored without losing original IDs',()=>{
 const d=empty();d.highlights=[{...ref,from:2,to:2,id:'single'}];paintRange(d,ref,'sage',verses,id,'2026-10-01');assert.equal(d.highlights.find(h=>h.id==='single').color,'sage');for(let v=1;v<=3;v++)assert(d.highlights.some(h=>h.from<=v&&h.to>=v&&h.color==='sage'));
});
test('Legacy highlight has safe default; optional colors round-trip in unchanged V5 backup',()=>{
 assert.equal(highlightColor({}),'olive');assert.equal(highlightColor({color:'unknown'}),'olive');
 const map=new Map();const storage={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)};const store=createStore(storage);store.transact(d=>paintRange(d,ref,'terra',verses,id,'2026-10-01'));const backup=store.backup();assert.equal(backup.schemaVersion,5);const next=store.prepareImport(backup);store.restore(next);assert.equal(store.state.highlights[0].color,'terra');assert.equal(JSON.parse(storage.getItem(KEYS.main)).version,5);
});
function fixture(){const d=empty();d.paths=[{id:'p',title:'Weg',started:'2026-09-01',steps:[{id:'step',text:'Offener Schritt',done:false}],links:[],reviews:[{id:'review',text:'Persönlicher Rückblick',date:'2026-09-20',confirmedDevelopment:true}],milestones:[{id:'milestone',reviewId:'review',text:'Persönlicher Rückblick',date:'2026-09-20'}]}];d.journal=[{id:'journal',text:'Bleibt',pathIds:['p']}];d.highlights=[{...ref,id:'highlight',color:'gold'}];return d;}
test('Path deletion retains personal content, review/milestone IDs and tree stage',()=>{
 const d=fixture(),stage=treeLevel(d),count=developmentCount(d);detachPath(d,'p');assert.equal(d.paths.length,0);assert.equal(d.journal[0].id,'journal');assert.deepEqual(d.journal[0].pathIds,[]);assert.equal(d.highlights[0].id,'highlight');assert.equal(d.reviews[0].id,'review');assert.equal(d.reviews[0].milestones[0].id,'milestone');assert.equal(developmentCount(d),count);assert.equal(treeLevel(d),stage);
});
test('Conflicting review IDs refuse deletion rather than overwrite a record',()=>{const d=fixture();d.reviews=[{id:'review',text:'Anderer Rückblick'}];assert.throws(()=>detachPath(d,'p'),/ID/);assert.equal(d.paths.length,1);});

test('Removing part of a range preserves outside verses and original ID',()=>{const d=empty();d.highlights=[{...ref,to:4,id:'range',color:'gold',unknown:'keep'}];clearRange(d,{...ref,from:2,to:3},verses,id);assert.equal(d.highlights.length,2);assert.equal(d.highlights[0].id,'range');assert.equal(d.highlights[0].to,1);assert.equal(d.highlights[1].from,4);assert(d.highlights.every(h=>h.color==='gold'&&h.unknown==='keep'));});
