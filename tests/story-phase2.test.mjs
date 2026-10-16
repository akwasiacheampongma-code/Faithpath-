import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {storyQuestionState,reflectionInvitation} from '../src/story-flow-view.js';import {createRuntimeModel} from '../src/runtime-model.js';
const read=p=>JSON.parse(fs.readFileSync(p));
const model=createRuntimeModel(['index','stories','reference-index','faithpath-content-index','nachlese-stories','nachlese-questions','faithpath-nachlese-story-flow'].map(n=>read('data/'+n+'.json')));
test('all canonical story questions and aliases retain their active story, order and content',()=>{
 const before=JSON.stringify(model.flow);
 for(const story of model.flow.stories)for(const [i,item] of story.flow_items.entries())for(const id of item.source_question_ids){
  const x=storyQuestionState(model,id,{});assert.equal(x.story.story_id,story.story_id);assert.equal(x.index,i);assert.equal(x.previous,i?story.flow_items[i-1].primary_question_id:null);assert.equal(x.next,i<story.flow_items.length-1?story.flow_items[i+1].primary_question_id:null);assert.equal(x.result,null);
  assert.equal(storyQuestionState(model,id,{sourceAnswerId:id,sourceAnswer:0}).result,0);assert.equal(storyQuestionState(model,id,{sourceAnswerId:'another',sourceAnswer:0}).result,null);
 }
 assert.equal(JSON.stringify(model.flow),before);assert.equal(storyQuestionState(model,'missing',{}),null);
});
test('reflection keeps exact source prompt, is voluntary and uses existing editor action',()=>{
 const story={story_id:'NS-0001',reflection:'Eigener <Gedanke> & Leben'};
 const html=reflectionInvitation(story);assert.match(html,/Was bedeutet diese Geschichte für dich\?/);assert.match(html,/Eigener &lt;Gedanke&gt; &amp; Leben/);assert.match(html,/data-action="reflect-story"/);assert.match(html,/wird nicht bewertet/);assert.doesNotMatch(html,/richtig|abgeschlossen/);
});
