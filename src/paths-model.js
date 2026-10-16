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
