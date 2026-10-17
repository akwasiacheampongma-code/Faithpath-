import test from 'node:test';
import assert from 'node:assert/strict';
import {stageNames} from '../src/content.js';
import {treeLevel} from '../src/domain.js';
import {TREE_STAGE_MEANINGS,renderTreeStageGuide} from '../src/tree-stage-guide.js';

test('seven existing names receive complete, distinct explanations',()=>{
 assert.equal(stageNames.length,7);
 assert.equal(TREE_STAGE_MEANINGS.length,7);
 for(const entry of TREE_STAGE_MEANINGS)assert.ok(entry.meaning.length>85);
 assert.equal(new Set(TREE_STAGE_MEANINGS.map(x=>x.meaning)).size,7);
});
test('current stage is visible without opening details',()=>{
 for(let i=0;i<7;i++){
  const html=renderTreeStageGuide(i);
  assert.ok(html.includes(stageNames[i]+': Was dieses Bild bedeutet'));
  assert.ok(html.includes(TREE_STAGE_MEANINGS[i].meaning));
  assert.equal((html.match(/class="tree-stage-card"/g)||[]).length,7);
  assert.equal((html.match(/aria-current="step"/g)||[]).length,1);
  assert.ok(html.includes('Warum genau sieben?'));
 }
});
test('explanation distinguishes imagery from biblical commandments and faith ranking',()=>{
 const html=renderTreeStageGuide(0);
 assert.ok(html.includes('keine sieben Stufen'));
 assert.ok(html.includes('nicht deinen Glauben'));
 assert.ok(html.includes('Galater 5,22–23'));
 assert.ok(html.includes('nicht automatisch'));
 assert.ok(html.includes('siebten Stufe'));
});
test('display guide does not change existing confirmed-development thresholds',()=>{
 for(const [n,want] of [[0,0],[1,1],[2,2],[3,3],[4,3],[5,4],[6,4],[7,5],[9,5],[10,6]]){
  const state={paths:[{milestones:Array.from({length:n},()=>({}))}],reviews:[]};
  assert.equal(treeLevel(state),want);
  assert.ok(renderTreeStageGuide(want).includes(stageNames[want]));
 }
});
