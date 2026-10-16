import test from 'node:test';import assert from 'node:assert/strict';import {capturePathReviewSource,reviewSourceContext,renderReviewSource} from '../src/path-review-context.js';import {phase3Fixture} from './phase3-fixtures.mjs';import {empty,migrate,createStore,KEYS} from '../src/store.js';
const at='2026-10-16T12:00:00.000Z';
test('path review freezes the exact current step without changing the store or source ID',()=>{
 const data=phase3Fixture(),before=JSON.stringify(data),source=capturePathReviewSource(data,{pathId:'personal-path'},at);assert.equal(source.key,'path:personal-path');assert.equal(source.stepId,'step-0');assert.equal(source.text,'Im nächsten Gespräch ausreden lassen.');assert.equal(JSON.stringify(data),before);
 const review={id:'review',date:at,text:'Mein Rückblick',sourceKey:source.key,sourceSnapshot:source};data.paths[0].steps[0].text='Ein später anders formulierter Schritt.';data.paths[0].steps.unshift({id:'other',text:'Ein ganz anderer Schritt.',done:false});const context=reviewSourceContext(data,review);assert.equal(context.text,source.text);assert.equal(context.state,'snapshot');assert(context.originalRoute.includes('step=step-0'));assert(!context.originalRoute.includes('other'));assert.match(context.note,/anders/);
});
test('legacy path source never invents its old wording from the current first step',()=>{
 const data=phase3Fixture(),r={id:'old',date:at,sourceKey:'path:personal-path',text:'Alter Rückblick'};const x=reviewSourceContext(data,r);assert.equal(x.state,'path-only');assert.equal(x.text,null);assert.match(x.note,/nicht mitgespeichert/);assert(!x.originalRoute?.includes('step='));
});
test('original journal review is exact; edited, missing and ambiguous originals have honest fallbacks',()=>{
 const data=phase3Fixture(),r=data.reviews[0];let x=reviewSourceContext(data,r);assert.equal(x.text,data.journal[0].text);assert.equal(x.originalRoute,'entry/thought-old');data.journal[0].updatedAt='2026-10-01';data.journal[0].text='Nachträglich geändert';x=reviewSourceContext(data,r);assert.equal(x.text,null);assert.equal(x.state,'edited');assert(!renderReviewSource(x,{date:()=>'',link:()=>''}).includes('Nachträglich geändert'));
 data.journal=[];assert.equal(reviewSourceContext(data,r).state,'missing');
});
test('frozen invitation preserves its displayed text when the current step changes',()=>{
 const data=phase3Fixture(),gap={key:'path:personal-path',title:'In Ruhe zuhören',detail:'Du wolltest ausprobieren: „Im nächsten Gespräch ausreden lassen.“',at:'2026-08-01',pathId:'personal-path'};data.paths[0].steps[0].text='Ein anderer Text';const source=capturePathReviewSource(data,{pathId:'personal-path',gap},at);assert.equal(source.text,gap.detail);assert.equal(source.stepId,null);assert.equal(capturePathReviewSource(data,{gap:{key:'journal:thought-old'}},at),null);
});
test('optional path snapshot roundtrips through V5 backup without migration or ID changes',()=>{
 const data=phase3Fixture(),r={id:'review',date:at,text:'Eine selbst bestätigte Entwicklung',sourceKey:'path:personal-path',sourceSnapshot:capturePathReviewSource(data,{pathId:'personal-path'},at),confirmedDevelopment:true};data.paths[0].reviews.push(r);data.paths[0].milestones.push({id:'milestone',date:at,text:r.text,reviewId:r.id});const mem=new Map([[KEYS.main,JSON.stringify(data)]]),storage={getItem:k=>mem.get(k)||null,setItem:(k,v)=>mem.set(k,v),removeItem:k=>mem.delete(k)},store=createStore(storage);assert.deepEqual(store.prepareImport(store.backup()),migrate(data));assert.equal(store.state.version,5);assert.deepEqual(store.state.paths[0].reviews.at(-1).sourceSnapshot,r.sourceSnapshot);
});
test('source snapshot rejects mismatched/future metadata, escapes text and never trusts imported routes',()=>{
 const data=phase3Fixture(),snapshot={...capturePathReviewSource(data,{pathId:'personal-path'},at),text:'<img src=x onerror=alert(1)>',route:'javascript:alert(1)'},r={id:'r',date:at,sourceKey:'path:personal-path',sourceSnapshot:snapshot};let x=reviewSourceContext(data,r);const html=renderReviewSource(x,{date:()=>'',link:(label,route)=>`<a href="#${route}">${label}</a>`});assert.match(html,/&lt;img/);assert.doesNotMatch(html,/javascript:|<img/);r.sourceSnapshot={...snapshot,key:'path:wrong'};assert.equal(reviewSourceContext(data,r).text,null);r.sourceSnapshot={...snapshot,at:'2027-01-01'};assert.equal(reviewSourceContext(data,r).text,null);
});

test('journal edits between a frozen invitation and review save never become the old quoted text',()=>{
 const data=phase3Fixture(),r=data.reviews[0];r.sourceAt=data.journal[0].date;data.journal[0].text='Edited before the review was saved';data.journal[0].updatedAt='2026-08-15T12:00:00.000Z';const x=reviewSourceContext(data,r);assert.equal(x.state,'edited');assert.equal(x.text,null);
});
test('real highlight sources retain a truthful exact-ID reference without invented historical wording',()=>{
 const data=phase3Fixture();data.highlights=[{id:'h/x',book:'JHN',chapter:3,from:1,to:1,translation:'otb',snippet:'Heutiger Text',at:'2026-08-01'}];const r={id:'rh',sourceKey:'highlight:h/x',date:at};let x=reviewSourceContext(data,r);assert.equal(x.state,'reference');assert.equal(x.originalRoute,'mark/h%2Fx');assert.equal(x.text,null);assert.doesNotMatch(x.note,/nicht mehr vorhanden/);data.highlights=[];assert.equal(reviewSourceContext(data,r).state,'missing');
});
