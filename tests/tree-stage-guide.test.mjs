import test from 'node:test';
import assert from 'node:assert/strict';
import {stageNames} from '../src/content.js';
import {treeLevel} from '../src/domain.js';
import {TREE_STAGE_MEANINGS,renderTreeStageGuide} from '../src/tree-stage-guide.js';
import {selectTreeHistory,renderTreeJourney} from '../src/tree-view.js';
import {treeBranchView} from '../src/experience-view.js';
import {phase3Fixture} from './phase3-fixtures.mjs';

function treePage(data){
 const model=selectTreeHistory(data);
 return renderTreeJourney(model,{back:()=>'',heading:(_,title)=>'<h1>'+title+'</h1>',stageName:stageNames[model.stage],branchMarkup:treeBranchView(data,model.stage),link:(label,route)=>'<a href="#'+route+'">'+label+'</a>',date:d=>d||'Datum unbekannt'});
}

test('seven existing names receive complete, distinct explanations',()=>{
 assert.equal(stageNames.length,7);
 assert.equal(TREE_STAGE_MEANINGS.length,7);
 for(const entry of TREE_STAGE_MEANINGS)assert.ok(entry.meaning.length>85);
 assert.equal(new Set(TREE_STAGE_MEANINGS.map(x=>x.meaning)).size,7);
});
test('current meaning precedes the image and path list without opening details',()=>{
 for(let i=0;i<7;i++){
  const data=phase3Fixture('tree-'+i),before=JSON.stringify(data),html=treePage(data);
  assert.ok(html.includes('<h1>'+stageNames[i]+'</h1>'));
  assert.ok(html.indexOf('tree-stage-current-meaning')<html.indexOf('tree-branch-scene'),'Current meaning must appear before the tree image');
  assert.ok(html.includes(TREE_STAGE_MEANINGS[i].meaning));
  assert.equal((html.match(/class="tree-stage-card"/g)||[]).length,7);
  assert.equal((html.match(/aria-current="step"/g)||[]).length,1);
  assert.ok(html.includes('Warum genau sieben?'));
  assert.equal(JSON.stringify(data),before);
 }
});
test('explanation distinguishes imagery from biblical commandments and faith ranking',()=>{
 const html=treePage(phase3Fixture('tree-0'));
 assert.ok(html.includes('keine sieben Stufen'));
 assert.ok(html.includes('nicht deinen Glauben'));
 assert.ok(html.includes('Galater 5,22–23'));
 assert.ok(html.includes('nicht automatisch'));
 assert.ok(html.includes('siebten Stufe'));
 assert.match(html,/Nähe zu Gott/);
 assert.match(html,/Gottes Güte/);
 assert.match(html,/Frucht des Geistes/);
});
test('reading, quiz and checked tasks do not advance the tree through its guide',()=>{
 const data=phase3Fixture('completed');
 data.events.push(...Array.from({length:100},(_,i)=>({id:'reading-'+i,kind:'chapter-explored',at:'2026-10-17',ref:{book:'JHN',chapter:1}})));
 data.quiz.extra={done:'2026-10-17'};
 const before=JSON.stringify(data);assert.equal(treeLevel(data),0);treePage(data);assert.equal(treeLevel(data),0);assert.equal(JSON.stringify(data),before);
});
test('invalid presentation levels fall back without inventing an eighth stage',()=>{
 for(const level of [-1,7,1.5,'1',NaN,null]){
  const html=renderTreeStageGuide(level);
  assert.ok(html.includes('aria-current="step"><strong>'+stageNames[0]+'</strong>'));
  assert.equal((html.match(/class="tree-stage-card"/g)||[]).length,7);
 }
});
test('display guide does not change existing confirmed-development thresholds',()=>{
 for(const [n,want] of [[0,0],[1,1],[2,2],[3,3],[4,3],[5,4],[6,4],[7,5],[9,5],[10,6]]){
  const state={paths:[{milestones:Array.from({length:n},()=>({}))}],reviews:[]};
  assert.equal(treeLevel(state),want);
  assert.ok(renderTreeStageGuide(want).includes(stageNames[want]));
 }
});
