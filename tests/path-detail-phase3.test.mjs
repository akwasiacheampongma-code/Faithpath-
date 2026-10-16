import test from 'node:test';import assert from 'node:assert/strict';import {selectPathDetail} from '../src/paths-model.js';import {phase3Fixture} from './phase3-fixtures.mjs';
test('path projection uses canonical evidence and existing current step without mutation',()=>{
 const data=phase3Fixture('multiple-links'),before=JSON.stringify(data),model=selectPathDetail(data,'personal-path');assert.equal(model.path.id,'personal-path');assert.equal(model.nextStep.id,'step-0');assert.equal(model.thoughts.length,2);assert.equal(model.thoughts[0].id,'thought-new');assert.equal(model.reviews[0].id,'review-old');assert.equal(JSON.stringify(data),before);assert.equal(selectPathDetail(data,'missing'),null);
 assert.equal(selectPathDetail(data,'p-1').thoughts.filter(t=>t.id==='thought-old').length,1);
});
test('path history retains global linked reviews and original entry routes exactly once',()=>{
 const data=phase3Fixture(),model=selectPathDetail(data,'personal-path');
 assert.equal(model.moments.filter(m=>m.route==='entry/thought-old'&&m.at===data.journal[0].date).length,1);
 assert.equal(model.moments.filter(m=>m.route==='review/review-old').length,1);assert(model.moments.every(m=>m.id));
});
test('large histories expose true continuation, completed and reopened steps stay factual',()=>{
 const data=phase3Fixture('many-thoughts'),model=selectPathDetail(data,'personal-path',{limit:40});assert(model.moments.length>40);assert.equal(model.visibleMoments.length,40);assert(model.hasMore);assert.equal(selectPathDetail(data,'personal-path',{limit:1000}).hasMore,false);
 data.paths[0].steps.forEach(s=>s.done=true);assert.equal(selectPathDetail(data,'personal-path').nextStep,null);data.paths[0].steps[1].done=false;assert.equal(selectPathDetail(data,'personal-path').nextStep.id,'later-0');
});
