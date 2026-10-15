import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {empty,createStore,KEYS} from '../src/store.js';
import {attach} from '../src/domain.js';
import {setJournalPath} from '../src/journal-management.js';
import {journalTransaction} from '../src/journal-storage.js';

// Exercise the actual app submit handler with a minimal editor/DOM boundary.
const app=fs.readFileSync('src/app.js','utf8');
const submit=app.slice(app.indexOf('async function submitForm()'),app.indexOf('\nfunction openGap('));
for(const selection of ['B',''])test(`Editing replaces A with ${selection||'no path'} and synchronizes the exact mirror`,async()=>{
  const d=empty();d.paths=['A','B'].map(id=>({id,title:id,steps:[],reviews:[],milestones:[],links:[]}));
  d.journal=[{id:'j',text:'Alt',date:'2026-01-01',reflectionId:'r',pathIds:[]}];
  d.reflections=[{id:'r',text:'Alt',date:'2026-01-01',pathIds:[]}];attach(d,'A','j');
  const values=new Map([[KEYS.main,JSON.stringify(d)]]),storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)},store=createStore(storage);
  const context={ui:{form:{type:'entry',args:{id:'j'}}},snapshotForm:()=>({text:'Neu',kind:'Gedanken',pathId:selection}),now:()=> '2026-10-15',id:()=> 'new-id',change:fn=>store.transact(fn),finishForm:async()=>{},go:()=>{},notify:()=>{},attach,setJournalPath,journalTransaction,store,localStorage:storage,completedDraft:(_,raw)=>raw};
  await vm.runInNewContext(submit+';submitForm()',context);
  assert.deepEqual(store.state.journal[0].pathIds,selection?[selection]:[]);
  assert.deepEqual(store.state.reflections[0].pathIds,selection?[selection]:[]);
  assert(!store.state.paths[0].links.some(l=>l.journalId==='j'));
  assert.equal(store.state.journal[0].text,'Neu');assert.equal(store.state.reflections[0].text,'Neu');
});
