import {gaps,treeLevel,time} from './domain.js';

/** Read-only projection for Today. Reuses the existing reminder and tree rules.
 * Input is normalized store data; `at` makes reminder selection deterministic.
 * This function never writes storage, changes progress or consumes a draft.
 */
export function selectToday(data,{draft=null,at=Date.now()}={}){
 const active=data.paths.filter(path=>!path.archived);
 const currentPath=active.find(path=>path.steps.some(step=>!step.done))||active[0]||null;
 const nextStep=currentPath?.steps.find(step=>!step.done)||null;
 const thoughts=[
  ...data.journal.map(entry=>({...entry,route:'entry/'+encodeURIComponent(entry.id)})),
  ...data.reflections.map(entry=>({...entry,route:'reflection/'+encodeURIComponent(entry.id)})),
 ].sort((a,b)=>(time(b.date)||0)-(time(a.date)||0));
 const pending=gaps(data,at);
 const hasDraft=!!draft?.values;
 const returning=!!(data.paths.length||thoughts.length||data.reading||data.highlights.length||data.reviews.length||Object.values(data.guidedPlans).some(plan=>Object.values(plan).some(Boolean)));
 return {
  returning,currentPath,nextStep,hasDraft,reading:data.reading,lastThought:thoughts[0]||null,
  level:treeLevel(data),pending:pending[0]||null,pendingCount:pending.length,
  activeCount:active.length,archivedCount:data.paths.length-active.length,
  otherPaths:active.filter(path=>path.id!==currentPath?.id).slice(0,2),
 };
}
