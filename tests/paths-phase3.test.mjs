import test from 'node:test';import assert from 'node:assert/strict';
import {selectPathsOverview} from '../src/paths-model.js';import {renderPathsOverview} from '../src/paths-view.js';import {selectToday} from '../src/today-model.js';import {phase3Fixture} from './phase3-fixtures.mjs';
const helpers={heading:()=>'',button:(label,action)=>`<button data-action="${action}">${label}</button>`,row:()=>'',date:()=> '1. August 2026'};
test('overview keeps Today priority, all paths and stable order without touching personal data',()=>{
 for(const name of ['empty','active','five','many','archived','mixed','long']){
  const data=phase3Fixture(name),before=JSON.stringify(data),model=selectPathsOverview(data);
  assert.equal(model.current?.id,selectToday(data).currentPath?.id);assert.equal(model.cards.length,data.paths.filter(p=>!p.archived).length);
  assert.equal(model.archivedCount,data.paths.filter(p=>p.archived).length);assert.equal(JSON.stringify(data),before);
  assert.equal(selectPathsOverview(data,{archived:true}).cards.length,model.archivedCount);
 }
 const data=phase3Fixture('five');data.paths[0].steps.forEach(s=>s.done=true);const model=selectPathsOverview(data);assert.equal(model.cards[0].path.id,'p-1');assert.deepEqual(model.cards.slice(1).map(c=>c.path.id),['personal-path','p-2','p-3','p-4']);
});
test('overview shows exact existing next step, voluntary start and safe unique links',()=>{
 const data=phase3Fixture();data.paths[0].id='a/b & c';data.paths[0].title='<img src=x onerror=alert(1)>';const model=selectPathsOverview(data);const html=renderPathsOverview(model,helpers);
 assert.match(html,/Im nächsten Gespräch ausreden lassen\./);assert.match(html,/Weg öffnen/);assert.match(html,/&lt;img/);assert.doesNotMatch(html,/<img/);assert.equal((html.match(/href="#path\/a%2Fb%20%26%20c"/g)||[]).length,1);assert.match(html,/data-action="new-path"/);
 const empty=renderPathsOverview(selectPathsOverview(phase3Fixture('empty')),helpers);assert.match(empty,/Einen Weg beginnen/);assert.doesNotMatch(empty,/Mein nächster Schritt/);
});
