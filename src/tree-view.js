import {treeLevel,developmentCount,time} from './domain.js';
import {treeBranches} from './tree-branches.js';
import {allReviews} from './continuity.js';
import {escapeHtml as e} from './view-html.js';
import {renderTreeStageMeaning,renderTreeStageGuide} from './tree-stage-guide.js';

/** Source rows follow the unchanged counting rule, including retained development
 * after a path deletion. Unknown dates/text stay unknown; never manufacture evidence. */
export function selectTreeHistory(data) {
 const stage=treeLevel(data),branches=treeBranches(data,stage),reviews=allReviews(data);
 const sources=[];
 for(const path of data.paths)for(const milestone of path.milestones||[]){
  const review=reviews.find(r=>r.id===milestone.reviewId&&r.pathId===path.id);
  sources.push({key:'milestone:'+path.id+':'+milestone.id,text:milestone.text,date:milestone.date||null,pathTitle:path.title,archived:!!path.archived,route:review?.route||'path/'+encodeURIComponent(path.id)});
 }
 for(const review of data.reviews||[])if(review.confirmedDevelopment&&!review.pathId){
  const original=reviews.find(r=>r.id===review.id);
  sources.push({key:'review:'+review.id,text:review.text,date:review.date||null,pathTitle:null,archived:false,route:original?.route||null});
 }
 sources.sort((a,b)=>(time(b.date)||0)-(time(a.date)||0));
 return {stage,count:developmentCount(data),sources,unplaced:data.paths.filter(p=>!branches.all.some(entry=>entry.path.id===p.id))};
}
export function renderTreeJourney(model,{back,heading,stageName,branchMarkup,link,date}) {
 const sources=model.sources.map(source=>`<li><span class="meta">${e(date(source.date))}${source.pathTitle?' · '+e(source.pathTitle):' · In deiner Geschichte erhalten'}${source.archived?' · archiviert':''}</span><blockquote class="preserve">${e(source.text||'Der damalige Wortlaut ist nicht gespeichert.')}</blockquote>${source.route?link('Ursprünglichen Moment öffnen',source.route,'text-link'):'<p class="meta">Die ursprüngliche Quelle ist nicht mehr eindeutig verfügbar.</p>'}</li>`).join('');
 return `${back('Mein Weg','paths')}${heading('Dein Olivenbaum',stageName)}
  ${renderTreeStageMeaning(model.stage)}
  ${branchMarkup}
  ${renderTreeStageGuide(model.stage)}
  ${model.unplaced.length?`<section class="tree-unplaced"><h2>Wege noch ohne verbundene Momente</h2><p class="meta">Auch diese Wege gehören zu dir. Du brauchst keinen Zweig, um sie zu öffnen.</p><ul>${model.unplaced.map(path=>`<li>${link(e(path.title),'path/'+encodeURIComponent(path.id),'branch-path-link')}${path.archived?'<span class="meta">archiviert</span>':''}</li>`).join('')}</ul></section>`:''}
  <section class="section tree-evidence"><h2>Was hinter dem Baum steht</h2>
   ${model.count?`<p>${model.count} ${model.count===1?'Entwicklung, die':'Entwicklungen, die'} du selbst festgehalten hast.</p><details><summary>Welche Momente gehören dazu?</summary><ol class="tree-source-list">${sources}</ol></details>`:'<p>Deine Gedanken und Schritte haben hier ihren Platz. Wenn du später selbst eine Entwicklung bestätigst, wird sie sichtbar.</p>'}
   <details class="tree-explanation"><summary>Wie sich das Bild verändert</summary><p>Die sieben vorhandenen Bilder folgen deiner dokumentierten Entwicklung: 0, 1, 2, 3–4, 5–6, 7–9 und ab 10 ausdrücklich festgehaltenen Entwicklungen. Ein abgehakter Schritt, ein Quiz oder ein gelesenes Kapitel verändert den Baum nicht automatisch.</p><p>Die nummerierten Zweige öffnen ausschließlich echte Wege mit deinen eigenen Aufzeichnungen. Ruhende Wege und schwierige Zeiten bleiben Teil deiner Geschichte.</p><p>Der Olivenbaum zeigt deine persönliche Glaubensgeschichte. Das Schwert zeigt deine Beschäftigung mit der Bibel.</p>${link('Deine Bibelreise ansehen','bible-journey','text-link')}</details>
   ${link('Meine Wege öffnen','paths','button quiet')}
  </section>`;
}
