import {LIFE_TOPICS} from '../content.js';
import {validRef} from '../domain.js';

/** Existing single-draft envelope. IDs are allocated once outside transactions. */
export function newSeedDraft(ids,at) {
 return {type:'first-seed',args:{...ids},values:{scene:0,topic:'',concern:'',thought:'',kind:'Gedanken',next:'',title:'',translation:'otb'},saved:at};
}
export function seedPassage(values,refs) {
 const topic=LIFE_TOPICS.find(item=>item.id===values.topic);
 if(!topic)throw new Error('Wähle ein Thema für deinen Bibelgedanken.');
 if(!['otb','l1912'].includes(values.translation))throw new Error('Wähle eine vorhandene Bibelübersetzung.');
 const source=topic.refs[0];
 return {ref:validRef({...source,translation:values.translation},refs),context:source.context,question:source.question,topic};
}
export function validateSeed(values) {
 const labels={concern:'Beschreibe kurz, was dich beschäftigt.',thought:'Halte einen eigenen Gedanken oder ein Gebet fest.',next:'Beschreibe einen kleinen nächsten Schritt.',title:'Gib deinem persönlichen Weg einen Namen.'};
 const result={...values};
 for(const [field,message]of Object.entries(labels)){if(typeof values[field]!=='string'||!values[field].trim())throw new Error(message);result[field]=values[field].trim();}
 if(!['Gedanken','Gebet'].includes(values.kind))throw new Error('Wähle Gedanke oder Gebet.');
 return result;
}
/** Deterministic existing V5 records, evaluated twice by journalTransaction.
 * No milestone/event/reading/quiz mutation; symbolic planting is presentation.
 */
export function commitSeed(data,draft,ref) {
 const values=validateSeed(draft.values),ids=draft.args,at=draft.saved;
 for(const name of ['pathId','journalId','reflectionId','stepId','thoughtLinkId','scriptureLinkId'])if(typeof ids[name]!=='string'||!ids[name])throw new Error('Der Anfang konnte nicht sicher zugeordnet werden. Bitte öffne deinen Entwurf erneut.');
 const existing=data.paths.find(p=>p.id===ids.pathId);
 if(existing){
  const journal=data.journal.find(j=>j.id===ids.journalId),reflection=data.reflections.find(r=>r.id===ids.reflectionId);
  if(existing.title===values.title&&existing.why===values.concern&&journal?.text===values.thought&&reflection?.text===values.thought&&journal.reflectionId===ids.reflectionId&&journal.pathIds?.includes(ids.pathId)&&existing.steps.some(s=>s.id===ids.stepId&&s.text===values.next))return ids.pathId;
  throw new Error('Dieser Weg wurde inzwischen verändert. Deine Eingaben bleiben im Entwurf.');
 }
 if(data.journal.some(j=>j.id===ids.journalId)||data.reflections.some(r=>r.id===ids.reflectionId))throw new Error('Diese Aufzeichnung ist bereits vorhanden. Bitte lade deinen Datenstand neu.');
 const topic=LIFE_TOPICS.find(t=>t.id===values.topic);
 if(!topic||!ref?.book)throw new Error('Der Bibelgedanke ist noch nicht zugeordnet.');
 const path={id:ids.pathId,title:values.title,why:values.concern,category:topic.category,started:at,lastReview:null,archived:false,steps:[{id:ids.stepId,text:values.next,done:false,createdAt:at}],links:[
  {id:ids.scriptureLinkId,kind:'verse',label:ref.label,ref:{...ref},date:at},
  {id:ids.thoughtLinkId,kind:'reflection',journalId:ids.journalId,reflectionId:ids.reflectionId,label:values.kind,date:at}
 ],reviews:[],milestones:[]};
 data.paths.unshift(path);
 data.journal.unshift({id:ids.journalId,type:'Journal',subtype:values.kind,text:values.thought,date:at,ref:{...ref},pathIds:[ids.pathId],reflectionId:ids.reflectionId,storyId:null});
 data.reflections.unshift({id:ids.reflectionId,text:values.thought,date:at,label:values.kind,ref:{...ref},pathIds:[ids.pathId],storyId:null});
 return ids.pathId;
}
