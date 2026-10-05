import {time} from './domain.js';
const text=x=>typeof x?.text==='string'&&!!x.text.trim();
export const branchSlots=Object.freeze({2:[[50,55]],3:[[30,46],[67,39],[70,58]],4:[[29,33],[68,32],[22,49],[75,47],[48,23]],5:[[29,33],[68,32],[22,49],[75,47],[48,23]],6:[[29,33],[68,32],[22,49],[75,47],[48,23]]});
export function pathEvidence(data,pid){
 const path=data.paths.find(p=>p.id===pid);if(!path)return null;
 const linked=(item,kind)=>item.pathIds?.includes(pid)||(path.links||[]).some(l=>l[kind+'Id']===item.id);
 const journal=(data.journal||[]).filter(j=>text(j)&&linked(j,'journal'));
 const reflections=(data.reflections||[]).filter(r=>text(r)&&linked(r,'reflection')&&!journal.some(j=>j.reflectionId===r.id));
 const thoughts=[...journal,...reflections],steps=(path.steps||[]).filter(text),milestones=(path.milestones||[]).filter(text);
 const thoughtKeys=[...journal.flatMap(j=>['journal:'+j.id,'j:'+j.id,...(j.reflectionId?['reflection:'+j.reflectionId,'r:'+j.reflectionId]:[])]),...reflections.flatMap(r=>['reflection:'+r.id,'r:'+r.id])];
 const reviews=[...(path.reviews||[]),...(data.reviews||[]).filter(r=>r.pathId===pid||r.sourceKey==='path:'+pid||thoughtKeys.includes(r.sourceKey))].filter(text).filter((r,i,a)=>a.findIndex(x=>x.id===r.id)===i);
 const records=[...thoughts,...steps,...reviews,...milestones];
 return {path,thoughts,steps,reviews,milestones,documented:records.length>0,latest:Math.max(0,...records.map(x=>time(x.updatedAt||x.date||x.completedAt||x.createdAt)||0)),hasReview:reviews.length>0,hasMilestone:milestones.length>0};
}
export function treeBranches(data,stage){
 const entries=data.paths.map(p=>pathEvidence(data,p.id)).filter(x=>x.documented).sort((a,b)=>Number(!!a.path.archived)-Number(!!b.path.archived)||b.latest-a.latest||(time(b.path.started)||0)-(time(a.path.started)||0)||String(a.path.id).localeCompare(String(b.path.id),'en'));
 const cap=branchSlots[stage]?.length||0;return {visible:entries.slice(0,cap),other:entries.slice(cap),all:entries};
}
