// A short-lived recovery record coordinates the existing main and draft keys.
// It is not part of the user schema or backup. No unrelated state is restored.
import {KEYS} from './store.js';
export const JOURNAL_WRITE_KEY = 'faithpath_journal_write_pending';
let active=false;
export const journalWriteActive = () => active;
const hash = async raw => [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(raw ?? '')))].map(x=>x.toString(16).padStart(2,'0')).join('');
function writeDraft(storage,raw){if(raw===null)storage.removeItem(KEYS.draft);else storage.setItem(KEYS.draft,raw);}
const locked = fn => globalThis.navigator?.locks ? navigator.locks.request('faithpath-journal-write',fn) : fn();
export async function recoverJournalWrite(storage){return locked(()=>recover(storage));}
async function recover(storage){
  const raw=storage.getItem(JOURNAL_WRITE_KEY);if(!raw)return;
  const main=storage.getItem(KEYS.main),pending=JSON.parse(raw),current=await hash(main);
  if(storage.getItem(KEYS.main)!==main||storage.getItem(JOURNAL_WRITE_KEY)!==raw)throw new Error('Deine Daten wurden während der Wiederherstellung geändert. Bitte lade FaithPath neu.');
  if(pending.version!==1||![pending.before,pending.after].includes(current))throw new Error('Ein Journal-Speichervorgang ist noch offen. Bitte sichere deine Daten und lade FaithPath neu.');
  const desired=current===pending.after?pending.draftAfter:pending.draftBefore,actual=storage.getItem(KEYS.draft);
  if(actual!==desired){
    if(actual!==pending.draftBefore&&actual!==pending.draftAfter)throw new Error('Ein neuerer Entwurf bleibt erhalten. Der offene Journal-Speichervorgang kann nicht automatisch abgeschlossen werden.');
    writeDraft(storage,desired);
  }
  storage.removeItem(JOURNAL_WRITE_KEY);
}
export async function journalTransaction(store,storage,mutate,selectDraft){
  if(active)throw new Error('Der Journal-Speichervorgang läuft noch. Bitte warte einen Moment.');
  active=true;
  try{return await locked(()=>commitJournalTransaction(store,storage,mutate,selectDraft));}finally{active=false;}
}
async function commitJournalTransaction(store,storage,mutate,selectDraft){
  await recover(storage);
  const mainBefore=storage.getItem(KEYS.main),draftBefore=storage.getItem(KEYS.draft),next=structuredClone(store.state),result=mutate(next),draftAfter=selectDraft(result,draftBefore);
  if(draftAfter===draftBefore){store.transact(mutate);return result;}
  const pending={version:1,before:await hash(mainBefore),after:await hash(JSON.stringify(next)),draftBefore,draftAfter};
  if(storage.getItem(KEYS.main)!==mainBefore||storage.getItem(KEYS.draft)!==draftBefore)throw new Error('Deine Daten wurden inzwischen geändert. Bitte lade FaithPath neu.');
  // Write the recovery record before touching either user's key.
  storage.setItem(JOURNAL_WRITE_KEY,JSON.stringify(pending));
  try{writeDraft(storage,draftAfter);store.transact(mutate);}
  catch(error){
    try{await recover(storage);}catch{throw new Error('Nicht abgeschlossen: Deine Daten und dein Entwurf sind gesichert. Bitte lade FaithPath neu, sobald der Gerätespeicher verfügbar ist.');}
    throw error;
  }
  // If cleanup is denied, leave the durable record for the next load.
  // The saved state and draft already match the committed transaction.
  try{storage.removeItem(JOURNAL_WRITE_KEY);}catch{}
  return result;
}
