import test from 'node:test';
import assert from 'node:assert/strict';
import {treeBranchView} from '../src/experience-view.js';
import {treeBranches} from '../src/tree-branches.js';
import {experienceFixture} from './final-experience-fixture.mjs';

test('tree presentation preserves canonical path order, caps, further paths and user data at every stage',()=>{
 const data=experienceFixture(8),before=JSON.stringify(data);
 for(let stage=0;stage<7;stage++){
  const selection=treeBranches(data,stage),html=treeBranchView(data,stage);
  const ids=[...html.matchAll(/data-path-id="([^"]+)"/g)].map(m=>m[1]);
  assert.deepEqual(ids,selection.visible.map(v=>v.path.id));
  assert.equal((html.match(/class="tree-branch-hit"/g)||[]).length,[0,0,1,3,5,5,5][stage]);
  for(const entry of selection.all)assert(html.includes('#path/'+encodeURIComponent(entry.path.id)));
  assert(html.includes(`trees/tree-stage-${stage+1}.webp`));
 }
 assert.equal(JSON.stringify(data),before);
});

test('branch names and IDs remain safe and accessible independently of the visible number',()=>{
 const data=experienceFixture(1);data.paths[0].title='Familie < & "Freunde"';data.paths[0].id='path/with spaces';
 const html=treeBranchView(data,2);
 assert(html.includes('href="#path/path%2Fwith%20spaces"'));
 assert(html.includes('aria-label="Weg Familie &lt; &amp; &quot;Freunde&quot;, öffnen"'));
 assert(!html.includes('< & "Freunde"'));
});
