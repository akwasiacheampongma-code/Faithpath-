import test from 'node:test';
import assert from 'node:assert/strict';
import {empty} from '../src/store.js';
import {gaps} from '../src/domain.js';
import {pathContext} from '../src/continuity.js';
const old='2026-08-01T12:00:00Z',recent='2026-09-01T12:00:00Z';
const ref={book:'JHN',chapter:3,from:1,to:1,translation:'otb'};
function fixture(){const d=empty();d.paths=[{id:'p',title:'Zuhören',started:old,steps:[{id:'next',text:'Zuerst zuhören',done:false,createdAt:old},{id:'later',text:'Später antworten',done:false,createdAt:old}],links:[{id:'first-ref',ref,date:old},{id:'second-ref',ref:{...ref,from:2,to:2},date:recent}],reviews:[],milestones:[]}];return d;}
test('Read reference and latest linked reference stay distinct and do not mutate data',()=>{const d=fixture();d.reading={...ref};const before=JSON.stringify(d);const c=pathContext(d,'p');assert.equal(c.reference.from,2);assert.deepEqual(c.reading.ref,ref);assert.equal(JSON.stringify(d),before);});
test('Unrelated reading keeps newest linked reference without a read claim',()=>{const d=fixture();d.reading={...ref,from:3,to:3};const c=pathContext(d,'p');assert.equal(c.reading,null);assert.equal(c.reference.from,2);});
test('Reminder quotes the first unfinished current step rather than the last open step',()=>{const d=fixture();const g=gaps(d,Date.parse('2026-10-03T12:00:00Z')).find(g=>g.key==='path:p');assert(g);assert(g.detail.includes('Zuerst zuhören'));assert(!g.detail.includes('Später antworten'));});
test('Reprioritizing unfinished steps changes reminder copy without changing due date',()=>{const d=fixture();const at=Date.parse('2026-10-03T12:00:00Z');const a=gaps(d,at).find(g=>g.key==='path:p');d.paths[0].steps.reverse();const b=gaps(d,at).find(g=>g.key==='path:p');assert.equal(a.due,b.due);assert(b.detail.includes('Später antworten'));});
