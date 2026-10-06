import {journeySummary,exploredChapters} from './bible-journey.js';
import {treeBranches,pathEvidence} from './tree-branches.js';
import {THEMES,themeId} from './themes.js';
const e=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const route=(data,book,chapter)=>`read/${book}/${chapter}/${data.translation||'otb'}`;
const link=(label,r,cls='text-link',extra='')=>`<a class="${cls}" href="#${e(r)}" ${extra}>${e(label)}</a>`;
export const sword=()=>'<svg class="journey-symbol" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 19 3-3m-2-3 5 5M9 15l9-9 1-3-3 1-9 9M3 21l2-2"/></svg>';
export function journeyAcknowledgement(data,books,ref){const done=exploredChapters(data,books).has(ref.book+':'+ref.chapter),name=books.find(b=>b.code===ref.book)?.name||ref.book;return `<section class="journey-acknowledgement" aria-live="polite" ${done?'':'hidden'}>${sword()}<div><span class="overline">Kapitel erkundet</span><p>${e(name)} ${ref.chapter} ist jetzt Teil deiner Bibelreise.</p>${link('Deine Bibelreise ansehen','bible-journey/'+ref.book)}</div></section>`;}
export function journeyView(data,books,code=''){
 const x=journeySummary(data,books),book=x.books.find(b=>b.code===code);if(code&&!book)return null;
 const reading=x.reading;
 if(book){const known=new Set(book.explored.map(e=>e.chapter)),next=book.current&&!known.has(book.current)?book.current:Array.from({length:book.chapters},(_,i)=>i+1).find(c=>!known.has(c))||book.current||1;
  return {title:book.name,body:`<p class="journey-reading-state">${known.size} von ${book.chapters} Kapiteln erkundet${known.size===book.chapters?' · vollständig erkundet':''}</p>${link('Hier weiter',route(data,code,next),'button primary')}<ol class="journey-chapters">${Array.from({length:book.chapters},(_,i)=>{const c=i+1,done=known.has(c),current=book.current===c;return `<li>${link('Kapitel '+c,route(data,code,c),'journey-chapter-link',`aria-label="${e(book.name)} Kapitel ${c}, ${done?'erkundet':'noch nicht erkundet'}${current?', zuletzt geöffnet':''}"`)}<span class="meta">${done?'✓ Erkundet':'Noch nicht erkundet'}${current?' · zuletzt geöffnet':''}</span></li>`;}).join('')}</ol>`};
 }
 return {title:'Deine Bibelreise',body:`<p class="journey-intro">${sword()} Was du gelesen hast, bleibt sichtbar. Ohne Bewertung deines Glaubens.</p><dl class="journey-facts"><div><dt>Kapitel erkundet</dt><dd>${x.chapters}</dd></div><div><dt>Bücher begonnen</dt><dd>${x.begunBooks}</dd></div><div><dt>Bücher vollständig erkundet</dt><dd>${x.completedBooks}</dd></div></dl>${reading?`<div class="continuity-strip"><span class="overline">Hier weiter</span>${link((books.find(b=>b.code===reading.book)?.name||reading.book)+' '+reading.chapter,route(data,reading.book,reading.chapter))}</div>`:''}${[ ['Altes Testament',x.books.slice(0,39)],['Neues Testament',x.books.slice(39)]].map(([title,bs])=>`<section class="journey-testament"><h2>${title}</h2><ul class="journey-books">${bs.map(b=>`<li>${link(b.name,'bible-journey/'+b.code,'journey-book-link')}<span class="meta">${b.explored.length} von ${b.chapters} Kapiteln erkundet${b.explored.length===b.chapters?' · vollständig':''}</span></li>`).join('')}</ul></section>`).join('')}`};
}
// Fixed attachment zones traced against each original tree asset; presentation only.
const branchGeometry = {
 2: [
  {x:59.5,y:54.5,curve:'M49.9 64.5 C50.4 61.6 54.8 59 59.5 54.5'},
 ],
 3: [
  {x:31,y:45,curve:'M47 64 C44 61 41 59 39 55 C37 51 35 48 31 45'},
  {x:65,y:30,curve:'M49 53 C51 48 54 43 60 39 C63 36 64 33 65 30'},
  {x:80,y:47,curve:'M51 60 C56 57 61 54 68 53 C74 52 77 49 80 47'},
 ],
 4: [
  {x:35,y:34,curve:'M44 57 C40 54 37 49 36 44 C35 40 35 37 35 34'},
  {x:76,y:35,curve:'M50 52 C57 48 63 45 67 41 C71 39 74 37 76 35'},
  {x:18,y:51,curve:'M43 59 C37 56 30 55 26 54 C22 53 20 52 18 51'},
  {x:85,y:47,curve:'M54 58 C59 55 65 52 71 51 C77 50 82 49 85 47'},
  {x:57,y:23,curve:'M48 50 C49 44 53 40 54 34 C55 29 56 26 57 23'},
 ],
 5: [
  {x:30,y:38,curve:'M44 60 C40 57 38 51 36 47 C34 43 31 41 30 38'},
  {x:76,y:32,curve:'M49 55 C53 49 60 44 65 41 C71 38 74 35 76 32'},
  {x:16,y:51,curve:'M40 59 C34 56 29 56 24 55 C20 54 18 52 16 51'},
  {x:89,y:49,curve:'M55 57 C62 54 67 52 74 51 C80 50 85 50 89 49'},
  {x:55,y:22,curve:'M48 50 C49 42 53 36 54 30 C54 26 55 24 55 22'},
 ],
 6: [
  {x:29,y:35,curve:'M42 58 C38 54 35 49 33 44 C31 40 30 37 29 35'},
  {x:80,y:27,curve:'M51 50 C57 43 63 38 69 35 C74 32 77 29 80 27'},
  {x:14,y:51,curve:'M38 59 C32 56 26 55 22 54 C18 53 16 52 14 51'},
  {x:91,y:50,curve:'M56 56 C62 52 70 51 76 51 C82 51 87 51 91 50'},
  {x:55,y:15,curve:'M47 48 C48 40 51 33 53 26 C54 21 54 18 55 15'},
 ],
};
// A narrow bark ribbon tapers into the crown. Coordinates are image-relative;
// the aspect correction keeps its width natural on both original image formats.
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
 const scene=`<div class="tree-branch-scene branch-stage-${stage}"><img src="trees/tree-stage-${stage+1}.webp" alt="Olivenbaum" width="${stage===2?784:1086}" height="${stage===2?1168:1448}">${visible.length?`<svg class="tree-branch-overlay" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${visible.map((v,i)=>{const {curve}=slots[i];return `<g class="${v.hasReview?'branch-reviewed':''}"><path class="branch-bark" d="${curve}"/><path class="branch-grain" d="${branchRibbon(curve,stage===2?1168/784:4/3)}"/></g>`;}).join('')}</svg>${visible.map((v,i)=>`<a class="tree-branch-hit" href="#path/${e(encodeURIComponent(v.path.id))}" data-slot="${i}" data-path-id="${e(v.path.id)}" aria-label="Weg ${e(v.path.title)}, öffnen"><span class="tree-branch-marker${v.hasReview?' branch-reviewed':''}" aria-hidden="true">${i+1}</span></a>`).join('')}`:''}</div>`;
 const item=(v,i)=>`<li>${link((i?i+'. ':'')+v.path.title,'path/'+encodeURIComponent(v.path.id),'branch-path-link')}<span class="meta">${v.hasMilestone?'Entwicklung selbst festgehalten':v.hasReview?'Rückblick festgehalten':'Persönliche Geschichte festgehalten'}${v.path.archived?' · archiviert':''}</span></li>`;
 return `<figure class="tree-figure interactive-tree">${scene}<figcaption>Ruhende Wege und schwierige Zeiten nehmen deiner Geschichte nichts weg.</figcaption></figure>${visible.length?`<section class="tree-paths"><h2>Wege an deinem Baum</h2><ol>${visible.map((v,i)=>item(v,i+1)).join('')}</ol></section>`:''}${other.length?`<section class="tree-other-paths"><h2>Weitere Wege</h2><ul>${other.map(v=>item(v,0)).join('')}</ul></section>`:''}`;
}
export function pathFacts(data,pid){const x=pathEvidence(data,pid);if(!x?.documented)return '';return `<p class="path-history-facts meta" aria-label="Zu diesem Weg festgehalten">${x.thoughts.length} Gedanken · ${x.steps.length} Schritte · ${x.reviews.length} Rückblicke</p>`;}
export function themePicker(data){const selected=themeId(data);return `<section class="section appearance-section"><h2 id="appearance-title">Darstellung</h2><p>Eine andere Atmosphäre. Deine Geschichte bleibt dieselbe.</p><div class="theme-picker" role="radiogroup" aria-labelledby="appearance-title">${THEMES.map(t=>`<button type="button" role="radio" aria-checked="${t.id===selected}" tabindex="${t.id===selected?0:-1}" data-action="set-theme" data-theme-id="${t.id}" class="theme-tile"><span class="theme-preview" data-preview="${t.id}" aria-hidden="true"><span>Aa</span><i></i></span><span>${e(t.label)}</span>${t.id===selected?'<span class="theme-selected">✓ Ausgewählt</span>':''}</button>`).join('')}</div></section>`;}
