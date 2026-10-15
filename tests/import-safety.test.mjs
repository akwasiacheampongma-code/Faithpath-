import test from 'node:test';
import assert from 'node:assert/strict';
import {createStore,empty,KEYS} from '../src/store.js';

function memory(){const values=new Map();return {values,getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};}
function fixture(){const d=empty();d.paths=[{id:'p',title:'Geduld',steps:[{id:'s',text:'Zuhören'}],links:[],reviews:[],milestones:[]}];d.journal=[{id:'j',text:'Mein Gedanke',reflectionId:'r',pathIds:['p']}];d.reflections=[{id:'r',text:'Mein Gedanke',pathIds:['p']}];return d;}
const invalid=[
  ['pathIds object',d=>d.journal[0].pathIds={}],
  ['global review text',d=>d.reviews=[{id:'rv',text:7}]],
  ['missing path',d=>d.journal[0].pathIds=['missing']],
  ['missing mirror',d=>d.journal[0].reflectionId='missing'],
  ['missing journal link',d=>d.paths[0].links=[{id:'l',journalId:'missing'}]],
  ['duplicate nested ID',d=>d.paths[0].steps.push({id:'s',text:'Anderer Schritt'})],
  ['invalid ref object',d=>d.journal[0].ref='Johannes 3'],
  ['invalid quiz state',d=>d.quiz={1000:7}],
  ['invalid reading',d=>d.reading=[]],
  ['invalid default translation',d=>d.translation='invalid'],
  ['null default translation',d=>d.translation=null],
];
for(const [name,mutate] of invalid)test(`Import rejects ${name} before any storage mutation`,()=>{
  const storage=memory(),store=createStore(storage);store.transact(d=>d.settings.keep='original');
  const raw=storage.getItem(KEYS.main),before=structuredClone(store.state),bad=fixture();mutate(bad);
  assert.throws(()=>store.prepareImport({app:'FaithPath',data:bad}));
  assert.deepEqual(store.state,before);assert.equal(storage.getItem(KEYS.main),raw);assert.equal(storage.getItem(KEYS.restore),null);
  assert.throws(()=>store.restore(bad));assert.equal(storage.getItem(KEYS.main),raw);assert.equal(storage.getItem(KEYS.restore),null);
});
test('Valid legacy IDs, unknown fields and detached historical review sources survive import/export/reload',()=>{
  const storage=memory(),store=createStore(storage),legacy=fixture();legacy.version=3;delete legacy.paths[0].steps[0].id;
  legacy.customFeature={preserve:['all','fields']};legacy.reviews=[{id:'historical',text:'Bleibt erhalten',sourceKey:'path:deleted'}];
  const next=store.prepareImport({data:legacy,guidedPlans:{start7:{0:true}}});store.restore(next);
  assert.deepEqual(createStore(storage).state,store.state);assert.deepEqual(store.backup().data.customFeature,legacy.customFeature);
  assert.equal(store.state.reviews[0].sourceKey,'path:deleted');assert.ok(store.state.paths[0].steps[0].id);
});
