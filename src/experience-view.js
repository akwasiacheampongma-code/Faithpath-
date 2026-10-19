import {renderOliveTree} from './olive-tree.js';
export {journeyView,journeyAcknowledgement,sword} from './journey-view.js';
import {treeBranches,pathEvidence} from './tree-branches.js';
import {countLabel} from './journey-sword.js';
import {THEMES,themeId} from './themes.js';
const e=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const link=(label,r,cls='text-link',extra='')=>`<a class="${cls}" href="#${e(r)}" ${extra}>${e(label)}</a>`;
// Attachment coordinates follow the new original SVG canvas, not historical photos.
// IDs/order/cap remain entirely owned by treeBranches; this table is presentation.
const points={2:[[59.5,54.5]],3:[[31,45],[65,30],[80,55]],4:[[30,32],[75,32],[22,56],[80,56],[50,17]],5:[[30,32],[75,32],[22,56],[80,56],[50,17]],6:[[30,32],[75,32],[22,56],[80,56],[50,17]]};
const branchGeometry=Object.fromEntries(Object.entries(points).map(([stage,slots])=>[stage,slots.map(([x,y])=>({x,y,curve:`M50 70 C50 59 ${50+(x-50)*.45} ${y+10} ${x} ${y}`}))]));
// A narrow bark ribbon tapers into the crown. Coordinates are image-relative;
// the aspect correction keeps its width natural on the shared SVG canvas.
function branchRibbon(curve,aspect){
 const values=curve.match(/-?\d+(?:\.\d+)?/g).map(Number),points=[];
 let start=values.slice(0,2);
 for(let k=2;k<values.length;k+=6){
  const [ax,ay,bx,by,ex,ey]=values.slice(k,k+6);
  for(let n=0;n<=16;n++){
   if(k>2&&n===0)continue;
   const t=n/16,u=1-t;
   points.push([u*u*u*start[0]+3*u*u*t*ax+3*u*t*t*bx+t*t*t*ex,u*u*u*start[1]+3*u*u*t*ay+3*u*t*t*by+t*t*t*ey]);
  }
  start=[ex,ey];
 }
 const sides=[[],[]];
 points.forEach((p,i)=>{
  const a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)],dx=b[0]-a[0],dy=(b[1]-a[1])*aspect,length=Math.hypot(dx,dy)||1;
  const width=.42*(1-i/(points.length-1))+.08;
  for(let side=0;side<2;side++){const sign=side?1:-1;sides[side].push([p[0]+sign*(-dy/length)*width,p[1]+sign*(dx/length)*width/aspect]);}
 });
 return 'M'+[...sides[0],...sides[1].reverse()].map(p=>p.map(n=>n.toFixed(3)).join(' ')).join(' L')+' Z';
}
export function treeBranchView(data,stage){
 const {visible,other}=treeBranches(data,stage),slots=branchGeometry[stage]||[];
 const scene=`<div class="tree-branch-scene branch-stage-${stage}">${renderOliveTree(stage,{context:'tree'})}${visible.length?`<svg class="tree-branch-overlay" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${visible.map((v,i)=>{const {curve}=slots[i];return `<g class="${v.hasReview?'branch-reviewed':''}"><path class="branch-bark" d="${curve}"/><path class="branch-grain" d="${branchRibbon(curve,400/420)}"/></g>`;}).join('')}</svg>${visible.map((v,i)=>`<a class="tree-branch-hit" href="#path/${e(encodeURIComponent(v.path.id))}" data-slot="${i}" data-path-id="${e(v.path.id)}" aria-label="Weg ${e(v.path.title)}, öffnen"><span class="tree-branch-marker${v.hasReview?' branch-reviewed':''}" aria-hidden="true">${i+1}</span></a>`).join('')}`:''}</div>`;
 const item=(v,i)=>`<li>${link((i?i+'. ':'')+v.path.title,'path/'+encodeURIComponent(v.path.id),'branch-path-link')}<span class="meta">${v.hasMilestone?'Entwicklung selbst festgehalten':v.hasReview?'Rückblick festgehalten':'Persönliche Geschichte festgehalten'}${v.path.archived?' · archiviert':''}</span></li>`;
 return `<figure class="tree-figure interactive-tree">${scene}<figcaption>Ruhende Wege und schwierige Zeiten nehmen deiner Geschichte nichts weg.</figcaption></figure>${visible.length?`<section class="tree-paths"><h2>Wege an deinem Baum</h2><ol>${visible.map((v,i)=>item(v,i+1)).join('')}</ol></section>`:''}${other.length?`<section class="tree-other-paths"><h2>Weitere Wege</h2><ul>${other.map(v=>item(v,0)).join('')}</ul></section>`:''}`;
}
export function pathFacts(data,pid){const x=pathEvidence(data,pid);if(!x?.documented)return '';return `<p class="path-history-facts meta" aria-label="Zu diesem Weg festgehalten">${countLabel(x.thoughts.length,'Gedanke','Gedanken')} · ${countLabel(x.steps.length,'Schritt','Schritte')} · ${countLabel(x.reviews.length,'Rückblick','Rückblicke')}</p>`;}
export function themePicker(data){const selected=themeId(data);return `<section class="section appearance-section"><h2 id="appearance-title">Darstellung</h2><p>Eine andere Atmosphäre. Deine Geschichte bleibt dieselbe.</p><div class="theme-picker" role="radiogroup" aria-labelledby="appearance-title">${THEMES.map(t=>`<button type="button" role="radio" aria-checked="${t.id===selected}" tabindex="${t.id===selected?0:-1}" data-action="set-theme" data-theme-id="${t.id}" class="theme-tile"><span class="theme-preview" data-preview="${t.id}" aria-hidden="true"><span>Aa</span><i></i></span><span>${e(t.label)}</span>${t.id===selected?'<span class="theme-selected">✓ Ausgewählt</span>':''}</button>`).join('')}</div></section>`;}
