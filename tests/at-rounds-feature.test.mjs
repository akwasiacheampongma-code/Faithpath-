import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {KEYS} from '../src/store.js';
const api = await import('../src/at-rounds-feature.js').catch(()=>({}));
const raw=fs.readFileSync('tests/fixtures/at-rounds.test-only.json','utf8');
const sha='08ce19855640b47b0419345fb58b29ddca466f1708b1b7bf021bad6691598285';
const load=async(storage,body=raw)=>{
  assert.equal(typeof api.loadAtRoundFeature,'function');
  return api.loadAtRoundFeature(new URL('http://localhost/data/'),storage,sha,async()=>new Response(body));
};
test('fixture storage is namespaced and never touches personal or prototype keys',async()=>{
  const values=new Map([[KEYS.main,'personal-original'],['faithpath.at.preview.quiz-rounds.v1','prototype-original']]);
  const touched=[];
  const feature=await load({getItem:k=>{touched.push(k);return values.get(k)??null;},setItem:(k,v)=>{touched.push(k);values.set(k,v);}});
  feature.controller.answer('1KI',8,'A',2);
  assert(touched.every(k=>k.startsWith(api.AT_TEST_STORAGE_PREFIX)));
  assert.equal(values.get(KEYS.main),'personal-original');
  assert.equal(values.get('faithpath.at.preview.quiz-rounds.v1'),'prototype-original');
  const resumed=await load({getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)});
  assert.equal(resumed.controller.session('1KI',8,'A').answer,2);
});
test('bad hashes, HTTP failure, and blocked storage fail without manufacturing progress',async()=>{
  const storage={getItem:()=>null,setItem:()=>{throw new Error('quota');}};
  await assert.rejects(load(storage,raw+' '),/Prüfsumme/);
  await assert.rejects(api.loadAtRoundFeature(new URL('http://localhost/'),storage,sha,async()=>new Response('',{status:404})),/geladen/);
  await assert.rejects(load({getItem:()=>{throw new Error('blocked');}}),/Testspeicher/);
  const feature=await load(storage);
  assert.throws(()=>feature.controller.answer('1KI',8,'A',0),/Nicht gespeichert/);
});
test('route builder keeps the exact reader origin, question adapter retains source IDs',async()=>{
  const feature=await load({getItem:()=>null,setItem:()=>{}});
  const origin='read/1KI/8/l1912?from=10&to=14&return=chapters%2F1KI';
  assert.equal(new URLSearchParams(api.atRoundRoute('1KI',8,'A',origin).split('?')[1]).get('return'),origin);
  const view=api.atRoundView(feature.controller.session('1KI',8,'A'));
  assert.equal(view.story.id,undefined,'No synthetic canonical content ID');
  assert.equal(view.story.book,'1KI');assert.equal(view.story.chapter,7);
  assert.equal(view.story.questions[0].faithpath_id,'1270-Q5');
  assert.equal(view.story.questions[0].c,2);
  assert.equal(view.atRound.round,'A');
});
