// Own the existing single draft by its exact bytes; no storage/schema migration.
import {KEYS} from './store.js';
import {JOURNAL_WRITE_KEY} from './journal-storage.js';
const conflict=()=>new Error('Ein anderer oder neuerer Entwurf bleibt erhalten. Bitte öffne ihn erneut.');
const locked=fn=>globalThis.navigator?.locks ? navigator.locks.request('faithpath-journal-write',async()=>fn()) : Promise.resolve().then(fn);
export function beginDraftSession(storage,expectedRaw=null){
  if(storage.getItem(KEYS.draft)!==expectedRaw)throw conflict();
  return {expectedRaw};
}
export async function saveDraft(storage,session,draft){
  return locked(()=>{
    if(storage.getItem(JOURNAL_WRITE_KEY))throw new Error('Ein Journal-Speichervorgang ist noch offen. Bitte lade FaithPath neu.');
    if(storage.getItem(KEYS.draft)!==session.expectedRaw)throw conflict();
    const raw=JSON.stringify(draft);storage.setItem(KEYS.draft,raw);session.expectedRaw=raw;
  });
}
export async function clearDraft(storage,session){
  if(!session)return;
  return locked(()=>{
    if(storage.getItem(JOURNAL_WRITE_KEY))return;
    if(session.expectedRaw!==null&&storage.getItem(KEYS.draft)===session.expectedRaw){
      storage.removeItem(KEYS.draft);session.expectedRaw=null;
    }
  });
}
export async function discardDraft(storage,expectedRaw){
  return locked(()=>{
    if(storage.getItem(JOURNAL_WRITE_KEY))throw new Error('Ein Journal-Speichervorgang ist noch offen.');
    if(storage.getItem(KEYS.draft)!==expectedRaw)throw conflict();
    storage.removeItem(KEYS.draft);
  });
}
// Called inside journalTransaction's lock; unrelated drafts are never consumed.
export const completedDraft=(session,raw)=>session&&raw===session.expectedRaw ? null : raw;
