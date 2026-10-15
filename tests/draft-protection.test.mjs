import test from 'node:test';
import assert from 'node:assert/strict';
import {KEYS,createStore} from '../src/store.js';
import {journalTransaction,JOURNAL_WRITE_KEY} from '../src/journal-storage.js';
import {beginDraftSession,saveDraft,clearDraft,discardDraft,completedDraft} from '../src/drafts.js';

const first={type:'entry',args:{ref:{book:'JHN',chapter:3}},values:{text:'Ein ungespeicherter Gedanke'},saved:'2026-10-15'};
function memory(raw=null){const values=new Map(raw?[[KEYS.draft,raw]]:[]);return {values,getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};}
test('Opening a different form cannot take ownership of an existing legacy draft',()=>{
  const raw=JSON.stringify(first),storage=memory(raw);
  assert.throws(()=>beginDraftSession(storage,null),/Entwurf/);assert.equal(storage.getItem(KEYS.draft),raw);
});
test('Resumed legacy draft preserves its shape and can be updated and cleared by its owner',async()=>{
  const storage=memory(JSON.stringify(first)),session=beginDraftSession(storage,JSON.stringify(first));
  await saveDraft(storage,session,{...first,values:{text:'Weitergeschrieben'}});
  assert.deepEqual(JSON.parse(storage.getItem(KEYS.draft)),{...first,values:{text:'Weitergeschrieben'}});
  await clearDraft(storage,session);assert.equal(storage.getItem(KEYS.draft),null);
});
test('Two forms/tabs never overwrite or clear a newer draft they did not read',async()=>{
  const storage=memory(),one=beginDraftSession(storage,null),two=beginDraftSession(storage,null);
  await saveDraft(storage,one,first);const raw=storage.getItem(KEYS.draft);
  await assert.rejects(saveDraft(storage,two,{...first,values:{text:'Anderer Tab'}}),/Entwurf/);
  await clearDraft(storage,two);assert.equal(storage.getItem(KEYS.draft),raw);
  await assert.rejects(discardDraft(storage,null),/Entwurf/);assert.equal(storage.getItem(KEYS.draft),raw);
});
test('An explicit discard compares the confirmed bytes and preserves concurrent changes',async()=>{
  const raw=JSON.stringify(first),storage=memory(raw);
  storage.setItem(KEYS.draft,'newer');await assert.rejects(discardDraft(storage,raw),/Entwurf/);
  assert.equal(storage.getItem(KEYS.draft),'newer');await discardDraft(storage,'newer');assert.equal(storage.getItem(KEYS.draft),null);
});
test('Storage refusal preserves original draft and session ownership for retry',async()=>{
  const raw=JSON.stringify(first),storage=memory(raw),session=beginDraftSession(storage,raw),write=storage.setItem;
  storage.setItem=()=>{throw new Error('quota');};await assert.rejects(saveDraft(storage,session,{...first,values:{text:'Neu'}}));
  assert.equal(storage.getItem(KEYS.draft),raw);assert.equal(session.expectedRaw,raw);
  storage.setItem=write;await saveDraft(storage,session,first);
});
test('Pending journal recovery prevents a draft-only write',async()=>{
  const storage=memory(),session=beginDraftSession(storage,null);storage.setItem(JOURNAL_WRITE_KEY,'pending');
  await assert.rejects(saveDraft(storage,session,first));assert.equal(storage.getItem(KEYS.draft),null);
});
test('Journal save and owned draft cleanup are atomic, including storage failure',async()=>{
  const raw=JSON.stringify(first),storage=memory(raw),session=beginDraftSession(storage,raw),store=createStore(storage);
  const mutate=d=>d.journal.push({id:'j',text:'Gespeichert',date:'2026-10-15'}),remove=storage.removeItem;
  storage.removeItem=()=>{throw new Error('blocked');};
  await assert.rejects(journalTransaction(store,storage,mutate,(_,draft)=>completedDraft(session,draft)));
  assert.equal(store.state.journal.length,0);assert.equal(storage.getItem(KEYS.draft),raw);
  storage.removeItem=remove;await journalTransaction(store,storage,mutate,(_,draft)=>completedDraft(session,draft));
  assert.equal(store.state.journal.length,1);assert.equal(storage.getItem(KEYS.draft),null);
});
