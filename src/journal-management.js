// Physical Journal deletion. Bible-note role deletion remains in bible-notes.js.
// Undo stores field/record deltas in memory, never replaces the full user state.
import {sameRef} from './domain.js';
const copy = x => x === undefined ? undefined : structuredClone(x);
const equal = (a,b) => JSON.stringify(a) === JSON.stringify(b);
const object = x => x !== null && typeof x === 'object' && !Array.isArray(x);
const recordArray = x => Array.isArray(x) && x.every(v=>object(v)&&typeof v.id==='string') && new Set(x.map(v=>v.id)).size===x.length;
const error = () => new Error('Betroffene Daten wurden inzwischen verändert. Rückgängig würde neuere Daten überschreiben.');
function delta(before,after,path=[],out=[]){
  if(equal(before,after))return out;
  if(recordArray(before)&&recordArray(after)){
    for(const x of before){const y=after.find(y=>y.id===x.id);if(!y)out.push({path,id:x.id,before:copy(x),after:undefined,index:before.indexOf(x),previous:before[before.indexOf(x)-1]?.id,next:before[before.indexOf(x)+1]?.id});else delta(x,y,[...path,{id:x.id}],out);}
  }else if(object(before)&&object(after)){
    for(const key of new Set([...Object.keys(before),...Object.keys(after)]))delta(before[key],after[key],[...path,key],out);
  }else out.push({path,before:copy(before),after:copy(after)});
  return out;
}
function get(root,path){let x=root;for(const key of path){x=typeof key==='object'?x?.find?.(v=>v.id===key.id):x?.[key];}return x;}
function cleanReferences(item,jid,rid,keys){
  if(!item||typeof item!=='object')return;
  for(const key of Object.keys(item)){
    if(((key==='journalId'||key==='entryId')&&item[key]===jid)||(key==='reflectionId'&&rid&&item[key]===rid)||(key==='sourceKey'&&keys.has(item[key])))delete item[key];
    else if(key==='route'&&typeof item[key]==='string'&&['entry/'+encodeURIComponent(jid),rid&&'reflection/'+encodeURIComponent(rid)].includes(item[key].replace(/^#/,'')))delete item[key];
    else cleanReferences(item[key],jid,rid,keys);
  }
}
function detachLinks(path,jid,rid){
  path.links=(path.links||[]).filter(l=>{
    const affected=l.journalId===jid||l.entryId===jid||(rid&&l.reflectionId===rid);
    if(!affected)return true;
    if(l.journalId===jid)delete l.journalId;if(l.entryId===jid)delete l.entryId;if(rid&&l.reflectionId===rid)delete l.reflectionId;
    if(l.journalId||l.entryId||l.reflectionId)return true;
    if(l.ref){l.kind='verse';return true;}
    return false;
  });
}
export function deleteJournalEntry(data,id){
  const entry=data.journal.find(j=>j.id===id);if(!entry)throw new Error('Dieser Journaleintrag ist nicht mehr vorhanden.');
  const before=copy(data);
  const mirror=data.reflections.find(r=>r.id===entry.reflectionId&&r.text===entry.text&&r.date===entry.date&&((!r.ref&&!entry.ref)||sameRef(r.ref,entry.ref))&&!data.journal.some(j=>j.id!==id&&j.reflectionId===r.id));
  const rid=mirror?.id,keys=new Set(['journal:'+id,'j:'+id,...(rid?['reflection:'+rid,'r:'+rid]:[])]);
  data.journal=data.journal.filter(j=>j.id!==id);
  if(rid)data.reflections=data.reflections.filter(r=>r.id!==rid);
  for(const p of data.paths)detachLinks(p,id,rid);
  cleanReferences(data,id,rid,keys);
  for(const dictionary of [data.dismissedGaps,data.reminderSnoozes])if(dictionary)for(const key of keys)delete dictionary[key];
  return {id,reflectionId:rid,changes:delta(before,data)};
}
export function restoreJournalEntry(data,snapshot){
  for(const x of snapshot.changes.filter(x=>x.id&&['journal','reflections'].includes(x.path[0]))){
    if((x.before.pathIds||[]).some(id=>!data.paths.some(p=>p.id===id)))throw error();
    if(x.before.reflectionId&&!data.reflections.some(r=>r.id===x.before.reflectionId)&&!snapshot.changes.some(c=>c.id===x.before.reflectionId&&c.path[0]==='reflections'))throw error();
  }
  // Validate every delta before applying any of them (also safe outside transact).
  for(const x of snapshot.changes){
    if(x.id){const list=get(data,x.path);if(!recordArray(list)||list.some(v=>v.id===x.id))throw error();}
    else {if(!object(get(data,x.path.slice(0,-1)))||!equal(get(data,x.path),x.after))throw error();}
  }
  for(const x of snapshot.changes){
    if(x.id){const list=get(data,x.path),next=list.findIndex(v=>v.id===x.next),previous=list.findIndex(v=>v.id===x.previous);const index=next>=0?next:previous>=0?previous+1:Math.min(x.index,list.length);list.splice(index,0,copy(x.before));}
    else {const parent=get(data,x.path.slice(0,-1)),key=x.path.at(-1);if(x.before===undefined)delete parent[key];else parent[key]=copy(x.before);}
  }
}
export function journalDraftMatches(draft,snapshot){
  return !!draft&&((['entry','journal-path'].includes(draft.type)&&draft.args?.id===snapshot.id)||(snapshot.reflectionId&&draft.type==='note'&&draft.args?.id===snapshot.reflectionId));
}
export function setJournalPath(data,id,pathId){
  const entry=data.journal.find(j=>j.id===id);if(!entry)throw new Error('Dieser Eintrag ist nicht mehr vorhanden.');
  if(pathId&&!data.paths.some(p=>p.id===pathId))throw new Error('Dieser Weg ist nicht mehr vorhanden.');
  const reflection=data.reflections.find(r=>r.id===entry.reflectionId&&r.text===entry.text&&r.date===entry.date&&((!r.ref&&!entry.ref)||sameRef(r.ref,entry.ref))&&!data.journal.some(j=>j.id!==id&&j.reflectionId===r.id));
  for(const p of data.paths)if(p.id!==pathId)detachLinks(p,id,reflection?.id);
  entry.pathIds=[];if(reflection)reflection.pathIds=[];
  if(pathId){const p=data.paths.find(p=>p.id===pathId);entry.pathIds=[pathId];if(reflection)reflection.pathIds=[pathId];if(!p.links.some(l=>l.journalId===id)){let linkId='entry-'+id;for(let n=2;p.links.some(l=>l.id===linkId);n++)linkId='entry-'+id+'-'+n;p.links.push({id:linkId,kind:'reflection',journalId:id,...(reflection?{reflectionId:reflection.id}:{}),ref:entry.ref||null,label:entry.ref?.label||entry.subtype||'Gedanke',date:entry.date});}}
}
