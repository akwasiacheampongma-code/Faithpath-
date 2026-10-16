import test from 'node:test';import assert from 'node:assert/strict';
import {todayFixture,TEST_NOW} from './today-phase1-fixtures.mjs';
let selectToday,renderToday;
try{({selectToday}=await import('../src/today-model.js'));({renderToday}=await import('../src/today-view.js'));}catch{}
const at=Date.parse(TEST_NOW),model=name=>{const {data,draft}=todayFixture(name);return selectToday(data,{draft,at});};
const e=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const adapter={e,link:(label,route,cls='')=>`<a href="#${e(route)}" class="${e(cls)}">${label}</a>`,button:(label,action,args={},cls='')=>`<button data-action="${e(action)}" class="${e(cls)}">${e(label)}</button>`,icon:()=>'<svg aria-hidden="true"></svg>',refLabel:r=>`${r.book} ${r.chapter}`,readRoute:r=>`read/${r.book}/${r.chapter}/${r.translation}`,date:s=>s,category:()=>({label:'Persönlicher Weg'})};

test('Today distinguishes app history from faith experience and offers two honest entry routes',()=>{
 const m=model('new');assert.equal(m.returning,false);assert.equal(m.currentPath,null);const html=renderToday(m,adapter);
 assert(!html.includes('Neu im Glauben'));assert.equal((html.match(/<h1\b/g)||[]).length,1);assert(html.includes('href="#guidance"'));assert(html.includes('href="#bible"'));assert.equal((html.match(/data-action="new-path"/g)||[]).length,1);
});
test('Today prioritizes an unfinished active path and never selects an archived one',()=>{
 const {data}=todayFixture('returning');const selected=data.paths[0];data.paths.unshift({...structuredClone(selected),id:'closed',steps:selected.steps.map(s=>({...s,done:true}))});data.paths.unshift({...structuredClone(selected),id:'archived',archived:true});
 const m=selectToday(data,{at});assert.equal(m.currentPath.id,'today-path');assert.equal(m.nextStep.text,selected.steps[0].text);assert(!m.otherPaths.some(p=>p.archived||p.id===m.currentPath.id));
});
test('Today keeps completed paths and archived history distinct without inventing an open step',()=>{
 const m=model('no-step');assert.equal(m.currentPath.id,'today-path');assert.equal(m.nextStep,null);
 const a=model('archived');assert(a.returning);assert.equal(a.currentPath,null);assert.equal(a.activeCount,0);assert.equal(a.archivedCount,1);
});
test('Today recognizes reading-only, journal-only and guided history as returning use',()=>{
 for(const name of ['reading-only','journal-only','guided-only'])assert.equal(model(name).returning,true,name);
 assert.equal(model('reading-only').reading.book,'JHN');assert.equal(model('journal-only').lastThought.id,'only-note');
});
test('Today preserves exact journal/reflection IDs and selects the latest thought without mutating storage',()=>{
 const {data,draft}=todayFixture('returning');data.reflections.push({id:'reflection/#?',text:'Neuer Gedanke',date:TEST_NOW});const before=JSON.stringify(data);
 const m=selectToday(data,{draft,at});assert.equal(m.lastThought.route,'reflection/reflection%2F%23%3F');assert.equal(JSON.stringify(data),before);
});
test('Today exposes only a genuinely due reminder and caps the preview instead of creating a task dashboard',()=>{
 assert.equal(model('returning').pending,null);const m=model('many-reviews');assert.equal(m.pendingCount,8);assert.equal(m.pending.key,'path:p-0');
 const html=renderToday(m,adapter);assert.equal((html.match(/data-action="gap"/g)||[]).length,1);assert(html.includes('href="#reviews"'));assert(!html.includes('Noch offen · 8'));
});
test('Today surfaces a saved draft before the tree and other continuity links without consuming it',()=>{
 const {data,draft}=todayFixture('draft');const raw=JSON.stringify({data,draft});const m=selectToday(data,{draft,at});const html=renderToday(m,adapter);
 assert(m.hasDraft);assert.equal((html.match(/data-action="resume"/g)||[]).length,1);assert(html.indexOf('data-action="resume"')<html.indexOf('olive-hero'));assert.equal(JSON.stringify({data,draft}),raw);
});
test('Today preserves all seven existing olive stages and never treats a checked step as growth',()=>{
 for(let i=0;i<7;i++){const m=model('stage-'+i);assert.equal(m.level,i);const html=renderToday(m,adapter);assert(html.includes(`trees/tree-stage-${i+1}.webp`));}
 assert.equal(model('no-step').level,0);
});
test('Today provides one primary link to the current path and lists only other paths',()=>{
 const html=renderToday(model('returning'),adapter);assert.equal((html.match(/href="#path\/today-path"/g)||[]).length,1);assert(html.indexOf('personal-path')<html.indexOf('olive-hero'));
 const many=model('many-paths');assert.equal(many.otherPaths.length,2);assert.equal(many.activeCount,8);
});
test('Today escapes personal prose and retains complete long texts without creating executable markup',()=>{
 const {data}=todayFixture('long');data.paths[0].title='<img src=x onerror=alert(1)>';data.paths[0].steps[0].text='<script>alert(1)</script>';data.journal[0].text='<svg onload=alert(1)>';
 const html=renderToday(selectToday(data,{at}),adapter);assert(!html.includes('<script>')&&!html.includes('<img src=x')&&!html.includes('<svg onload'));assert(html.includes('&lt;script&gt;'));
});
test('An unsaved first draft does not move the two new-user entry routes below secondary sections',()=>{
 const m=model('draft-only');assert.equal(m.returning,false);assert(m.hasDraft);
 const html=renderToday(m,adapter);assert(html.indexOf('today-entry-actions')<html.indexOf('olive-hero'));
});
test('Archived-only entry names the existing overview honestly instead of promising an already-open archive filter',()=>{
 const html=renderToday(model('archived'),adapter);assert(html.includes('Wege und Archiv öffnen'));assert(html.includes('href="#paths"'));assert(!html.includes('Archivierte Wege ansehen'));
});
test('Today heading remains programmatically focusable for the existing route focus handoff',()=>{
 const html=renderToday(model('returning'),adapter);assert(html.includes('<h1 tabindex="-1">Was bewegt dich gerade?</h1>'));
});
