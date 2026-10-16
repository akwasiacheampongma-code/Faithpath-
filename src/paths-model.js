import {reviewSourceContext} from './path-review-context.js';
import {timeline,time,sameRef,gaps} from './domain.js';
import {pathContext,allReviews} from './continuity.js';
import {pathEvidence} from './tree-branches.js';
import {selectToday} from './today-model.js';

/** Read-only overview over normalized V5 data. Priority follows Today exactly;
 * other paths retain their stored order, including ties and archived paths. */
export function selectPathsOverview(data,{archived=false}={}) {
 const current=selectToday(data).currentPath;
 const paths=data.paths.filter(path=>!!path.archived===archived);
 const ordered=archived?paths:[...paths.filter(p=>p.id===current?.id),...paths.filter(p=>p.id!==current?.id)];
 return {archived,current,activeCount:data.paths.filter(p=>!p.archived).length,archivedCount:data.paths.filter(p=>p.archived).length,
  cards:ordered.map(path=>({path,nextStep:path.steps.find(step=>!step.done)||null,isCurrent:!archived&&path.id===current?.id}))};
}


/** Canonical path presentation. No inferred development, source edits or writes. */
export function selectPathDetail(data,pid,{limit=40,at=Date.now()}={}) {
 const path=data.paths.find(p=>p.id===pid);if(!path)return null;
 const evidence=pathEvidence(data,pid),context=pathContext(data,pid);
 // Match timeline's legacy mirror rule too; older backups lack reflectionId.
 const canonicalThoughts=evidence.thoughts.filter(thought=>data.journal.includes(thought)||!data.journal.some(j=>j.reflectionId===thought.id||(j.text===thought.text&&j.date===thought.date)));
 const thoughts=canonicalThoughts.map(thought=>({...thought,route:(data.journal.includes(thought)?'entry/':'reflection/')+encodeURIComponent(thought.id)})).sort((a,b)=>(time(b.date)||0)-(time(a.date)||0));
 const reviews=allReviews(data).filter(review=>evidence.reviews.some(r=>r.id===review.id));
 const scriptures=[];
 for(const link of path.links||[])if(link.ref&&!scriptures.some(item=>sameRef(item.ref,link.ref)))scriptures.push({id:link.id,label:link.label,ref:link.ref});
 // Prefer the actual current reading reference over a newer but unread linked reference.
 if(context.reading){const i=scriptures.findIndex(item=>sameRef(item.ref,context.reading.ref));if(i>0)scriptures.unshift(...scriptures.splice(i,1));}
 let moments=timeline(data,pid).map(moment=>{
  const review=reviews.find(r=>moment.id==='pr:'+r.id);
  return review?{...moment,route:review.route}:moment;
 });
 for(const thought of thoughts)if(!moments.some(m=>m.route===thought.route&&!m.id.startsWith('l:')))moments.push({id:(thought.route.startsWith('entry/')?'j:':'r:')+thought.id,at:thought.date,kind:thought.subtype||thought.type||'Gedanke',title:thought.text,pathId:pid,route:thought.route,ref:thought.ref});
 for(const review of reviews)if(!moments.some(m=>m.route===review.route))moments.push({id:'gr:'+review.id,at:review.date,kind:review.confirmedDevelopment?'Entwicklung festgehalten':'Rückblick',title:review.text,pathId:pid,route:review.route});
 moments=moments.filter(moment=>!moment.id.startsWith('l:')||!moments.some(other=>other!==moment&&!other.id.startsWith('l:')&&other.route===moment.route&&other.at===moment.at)).sort((a,b)=>(time(b.at)||0)-(time(a.at)||0));
 return {path,context,evidence,nextStep:context.step,thoughts,reviews,reviewContexts:reviews.map(review=>({review,context:reviewSourceContext(data,review)})),scriptures,moments,visibleMoments:moments.slice(0,limit),hasMore:moments.length>limit,limit,pending:gaps(data,at).filter(g=>g.pathId===pid)};
}
