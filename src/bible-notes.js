// Bible notes share their records with Journal/history. Deletion removes only
// the Bible-note role; original IDs, text and historical links remain intact.
import {sameRef,time} from './domain.js';
import {overlapsRef} from './core-experience.js';
export const isBibleNote = x => !!x?.ref && typeof x.text === 'string' && !!x.text.trim() && !x.bibleNoteDeletedAt;
const collection = (data,kind) => kind === 'journal' ? data.journal : kind === 'reflection' ? data.reflections : null;
const mirror = (j,r) => j.reflectionId === r.id && sameRef(j.ref,r.ref) && j.text === r.text;
export function bibleNotes(data,ref){
  const js=data.journal.filter(isBibleNote).map(x=>({...x,kind:'journal',route:'entry/'+encodeURIComponent(x.id)}));
  const rs=data.reflections.filter(x=>isBibleNote(x)&&!data.journal.some(j=>mirror(j,x))).map(x=>({...x,kind:'reflection',route:'reflection/'+encodeURIComponent(x.id)}));
  return [...js,...rs].filter(x=>!ref||overlapsRef(x.ref,ref)).sort((a,b)=>(time(b.date)||0)-(time(a.date)||0));
}
export function deleteBibleNote(data,kind,id,at){
  const list=collection(data,kind),note=list?.find(x=>x.id===id);
  if(!isBibleNote(note))throw new Error('Diese Bibelnotiz ist nicht mehr vorhanden.');
  if(time(at)==null)throw new Error('Die Notiz konnte nicht sicher entfernt werden.');
  const targets=[{kind,item:note}];
  if(kind==='journal'){const r=data.reflections.find(r=>mirror(note,r));if(r)targets.push({kind:'reflection',item:r});}
  else {const j=data.journal.find(j=>mirror(j,note));if(j)targets.push({kind:'journal',item:j});}
  const snapshot=targets.map(({kind,item})=>({kind,id:item.id,before:structuredClone(item)}));
  targets.forEach(({item})=>item.bibleNoteDeletedAt=at);
  return snapshot.map(x=>({...x,after:structuredClone(collection(data,x.kind).find(n=>n.id===x.id))}));
}
export function restoreBibleNote(data,snapshot){
  for(const x of snapshot){const actual=collection(data,x.kind)?.find(n=>n.id===x.id);if(!actual||JSON.stringify(actual)!==JSON.stringify(x.after))throw new Error('Diese Notiz wurde inzwischen geändert. Rückgängig würde neuere Daten überschreiben.');}
  for(const x of snapshot){const actual=collection(data,x.kind).find(n=>n.id===x.id);for(const key of Object.keys(actual))delete actual[key];Object.assign(actual,structuredClone(x.before));}
}
