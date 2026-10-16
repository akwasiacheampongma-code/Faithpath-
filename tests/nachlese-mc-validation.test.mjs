import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const api=await import('../scripts/validate-nachlese-mc.mjs').catch(()=>({}));
const source=JSON.parse(fs.readFileSync('data/nachlese-questions.json')).questions[0];
const verse='Am Anfang schuf Gott Himmel und Erde.';
const lookup=key=>key==='l1912:GEN:1:1'?verse:null;
function sample(){return {id:source.id,status:'ready',a:['Nur den Himmel',source.answer,'Nur die Erde','Nur das Meer'],c:1,correct_check:{key:'l1912:GEN:1:1',quote:verse,reason:'Der Vers nennt ausdrücklich Himmel und Erde zusammen.'},wrong_checks:['Nur den Himmel','Nur die Erde','Nur das Meer'].map(option=>({option,key:'l1912:GEN:1:1',quote:verse,reason:'Die ausschließliche Beschränkung widerspricht Himmel UND Erde.'}))};}
test('Nachlese audit checks preserve the exact original answer and complete evidence',()=>{
 assert.equal(typeof api.validateNachleseRecord,'function');assert.equal(api.validateNachleseRecord(source,sample(),lookup),'ready');
});
test('Nachlese audit rejects incomplete options, answer drift and fabricated evidence',()=>{
 assert.equal(typeof api.validateNachleseRecord,'function');
 for(const mutate of [r=>r.a.pop(),r=>r.c=4,r=>r.a[1]='Fremde Antwort',r=>r.a[0]=r.a[2],r=>r.wrong_checks.pop(),r=>r.wrong_checks[0].option='Nicht vorhanden',r=>r.correct_check.quote='Erfundener Bibeltext',r=>r.correct_check.key='l1912:GEN:1:999']){
  const r=sample();mutate(r);assert.throws(()=>api.validateNachleseRecord(source,r,lookup));
 }
});
test('Nachlese manual and reflection decisions need a reason and cannot silently add choices',()=>{
 assert.equal(typeof api.validateNachleseRecord,'function');
 assert.equal(api.validateNachleseRecord(source,{id:source.id,status:'manual',reason:'Die überlieferte Antwort widerspricht der angegebenen Stelle.'},lookup),'manual');
 assert.throws(()=>api.validateNachleseRecord(source,{id:source.id,status:'manual'},lookup));
 assert.throws(()=>api.validateNachleseRecord(source,{...sample(),status:'reflection',reason:'Persönliche Frage'},lookup));
});
