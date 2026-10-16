import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {canonicalHash} from '../scripts/validate-nachlese-mc.mjs';
const api=await import('../scripts/validate-nachlese-editorial.mjs').catch(()=>({}));
const questions=JSON.parse(fs.readFileSync('reports/nachlese-editorial-56/baseline-mc-questions.json')).questions;
const cache=new Map();
const lookup=key=>{const m=/^(otb|l1912):([A-Z0-9]{3}):(\d+):(\d+)$/.exec(key);if(!m)return null;const p=`data/bibles/${m[1]}/${m[2]}.json`;if(!cache.has(p))cache.set(p,JSON.parse(fs.readFileSync(p)).chapters);return cache.get(p)[+m[3]-1]?.find(v=>v[0]===+m[4])?.[1];};
const selected=q=>Object.fromEntries(['q','answer','a','c','ref','references','x'].filter(k=>Object.hasOwn(q,k)).map(k=>[k,structuredClone(q[k])]));
function proofs(final,book,chapter,verses){return Object.fromEntries(['l1912','otb'].map(tr=>{const key=`${tr}:${book}:${chapter}:${verses[tr]}`,quote=lookup(key);return [tr,{correct_check:{key,quote,reason:'Die Aussage steht in diesem Vers.'},wrong_checks:final.a.filter((_,i)=>i!==final.c).map(option=>({option,key,quote,reason:'Diese Alternative widerspricht der ausdrücklich genannten Aussage.'}))}];}));}
function corrected(){const source=questions[387],final={...selected(source),q:'Welche Aussage trifft Psalm 121,4 über den Hüter Israels?',answer:'Der Hüter Israels schläft und schlummert nicht.',a:['Er schläft jede Nacht.','Der Hüter Israels schläft und schlummert nicht.','Er schläft nur am Tag.','Er schläft, solange Israel ruht.'],c:1};return {source,record:{id:source.id,source_sha256:canonicalHash(source),group:'proposal56',decision:'ACCEPT',reason:'Die im Original fehlende Verneinung wird anhand beider Fassungen korrigiert.',final,evidence:proofs(final,'PSA',121,{l1912:4,otb:4})}};}
test('Verified editorial corrections can repair a wrong original answer with both translations',()=>{assert.equal(typeof api.validateEditorialDecision,'function');const {source,record}=corrected();assert.equal(api.validateEditorialDecision(source,record,lookup),'verified');});
test('Editorial review rejects missing translations, fabricated evidence and changes to identity fields',()=>{
 assert.equal(typeof api.validateEditorialDecision,'function');
 for(const mutate of [r=>delete r.evidence.otb,r=>r.evidence.otb.correct_check.key='l1912:PSA:121:4',r=>r.evidence.otb.correct_check.quote='Erfundener Vers',r=>r.evidence.l1912.wrong_checks.pop(),r=>r.final.a.pop(),r=>r.final.c=4,r=>r.final.a[0]=r.final.a[1],r=>r.final.id='N-9999',r=>r.final.source_story_id='NS-9999',r=>r.source_sha256='wrong']){const {source,record}=corrected();mutate(record);assert.throws(()=>api.validateEditorialDecision(source,record,lookup));}
});
test('Heuristic KEEP decisions cannot silently change existing options',()=>{
 assert.equal(typeof api.validateEditorialDecision,'function');const source=questions[0],final=selected(source),record={id:source.id,source_sha256:canonicalHash(source),group:'marked150',decision:'KEEP',reason:'Die drei ausschließlichen Teilmengen widersprechen Himmel UND Erde; Ähnlichkeit ist kein Fehler.',final,evidence:proofs(final,'GEN',1,{l1912:1,otb:1})};
 assert.equal(api.validateEditorialDecision(source,record,lookup),'verified');record.final.a[0]='Veränderte Ablenkung';assert.throws(()=>api.validateEditorialDecision(source,record,lookup),/KEEP/);
});
test('Segmented John reference must include the actual supporting verse in each translation',()=>{
 assert.equal(typeof api.validateEditorialDecision,'function');const source=questions[1534],final={...selected(source),ref:'Johannes 10,10–11',references:[{book:'JHN',chapter:10,from:10,to:11}],x:'In OTB steht die Aussage unter Vers 10, in der lokalen Luther-Datei unter Vers 11.'};
 const record={id:source.id,source_sha256:canonicalHash(source),group:'segmentation',decision:'CORRECT',error_kind:'translation_reference_mismatch',reason:'Der bisherige Einzelvers führt in OTB zur anderen Aussage.',final,evidence:proofs(final,'JHN',10,{l1912:11,otb:10})};
 assert.equal(api.validateEditorialDecision(source,record,lookup),'verified');record.final.references[0].from=11;assert.throws(()=>api.validateEditorialDecision(source,record,lookup),/Segmented/);
});
