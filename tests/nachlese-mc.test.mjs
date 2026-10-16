import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRuntimeModel} from '../src/runtime-model.js';
const read=p=>JSON.parse(fs.readFileSync(p));
const inputs=()=>['index','stories','reference-index','faithpath-content-index','nachlese-stories','nachlese-questions','faithpath-nachlese-story-flow'].map(x=>read('data/'+x+'.json'));
const sample=()=>{const data=inputs(),q=data[5].questions[0];q.a=['Nur den Himmel',q.answer,'Nur die Erde','Nur das Meer'];q.c=1;return data;};
test('Nachlese optional MC accepts four choices and keeps the original correct answer',()=>{
  const data=sample(),model=createRuntimeModel(data);assert.equal(model.n.get('N-0001').a[1],model.n.get('N-0001').answer);
});
test('Nachlese optional MC rejects malformed or ambiguous option structures',()=>{
  const mutations=[q=>q.a.pop(),q=>q.a[0]='',q=>q.a[0]='  ',q=>q.a[0]=q.a[1],q=>q.a[0]=' '+q.a[1].toUpperCase()+' ',q=>q.c=4,q=>q.c=1.5,q=>q.c=0,q=>delete q.c,q=>delete q.a];
  for(const mutate of mutations){const data=sample();mutate(data[5].questions[0]);assert.throws(()=>createRuntimeModel(data),/N-MC/);}
});
test('Nachlese original open answers remain supported without changing IDs or story links',()=>{
  const data=inputs();for(const q of data[5].questions){delete q.a;delete q.c;}const model=createRuntimeModel(data);
  assert.equal(model.n.size,2314);assert.equal(model.stories.size,436);assert.equal(model.n.get('N-0001').source_story_id,'NS-0001');
});
