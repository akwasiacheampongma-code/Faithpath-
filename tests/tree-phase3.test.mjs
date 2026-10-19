import test from 'node:test';import assert from 'node:assert/strict';import {selectTreeHistory,renderTreeJourney} from '../src/tree-view.js';import {treeBranchView} from '../src/experience-view.js';import {treeLevel,developmentCount} from '../src/domain.js';import {detachPath} from '../src/core-experience.js';import {phase3Fixture} from './phase3-fixtures.mjs';
const helpers={back:()=>'',heading:()=>'',date:d=>d||'Datum unbekannt',link:(label,route)=>`<a href="#${route}">${label}</a>`,stageName:'Olivenbaum'};
test('seven stages retain exact development authority and matching illustration, never task or Bible points',()=>{
 for(let stage=0;stage<7;stage++){
  const data=phase3Fixture('tree-'+stage),before=JSON.stringify(data),model=selectTreeHistory(data),html=renderTreeJourney(model,{...helpers,branchMarkup:treeBranchView(data,stage)});
  assert.equal(model.stage,stage);assert.equal(model.count,developmentCount(data));assert.equal(model.sources.length,model.count);assert(html.includes('data-tree-stage="'+stage+'"'));assert.equal(JSON.stringify(data),before);
 }
 const data=phase3Fixture('completed');assert.equal(treeLevel(data),0);assert.equal(selectTreeHistory(data).count,0);
});
test('undocumented and archived paths stay addressable without invented branch markers',()=>{
 const data=phase3Fixture('no-evidence');data.paths[0].archived=true;const model=selectTreeHistory(data);assert.equal(model.unplaced[0].id,'personal-path');const html=renderTreeJourney(model,{...helpers,branchMarkup:treeBranchView(data,0)});assert(html.includes('#path/personal-path'));assert(!html.includes('class="tree-branch-hit"'));assert.match(html,/noch ohne verbundene Momente/i);
});
test('archive/deletion preserve counted historical source text, undo restores the original',()=>{
 const data=phase3Fixture('tree-6'),before=structuredClone(data);data.paths[0].archived=true;assert.equal(selectTreeHistory(data).count,10);detachPath(data,'personal-path');const model=selectTreeHistory(data);assert.equal(model.stage,6);assert.equal(model.sources.length,10);assert.equal(model.unplaced.length,0);assert(model.sources.every(s=>s.route?.startsWith('review/')));assert.equal(selectTreeHistory(before).count,model.count);
 const legacy=phase3Fixture('tree-1');legacy.paths[0].milestones[0].date=null;assert.equal(selectTreeHistory(legacy).sources[0].date,null);assert.equal(selectTreeHistory(legacy).count,1);
});
