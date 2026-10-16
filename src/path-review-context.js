import {time} from './domain.js';
import {reviewsFor} from './continuity.js';
import {escapeHtml as e} from './view-html.js';

const pathKey=key=>typeof key==='string'&&key.startsWith('path:')?key.slice(5):null;
const stepPrompt=text=>`Du wolltest ausprobieren: „${text}“`;
function validSnapshot(snapshot,key,at) {
 return snapshot&&typeof snapshot==='object'&&!Array.isArray(snapshot)&&pathKey(key)&&snapshot.key===key&&
  typeof snapshot.text==='string'&&!!snapshot.text.trim()&&typeof snapshot.title==='string'&&
  (snapshot.stepId==null||typeof snapshot.stepId==='string')&&time(snapshot.at)!=null&&time(at)!=null&&time(snapshot.at)<=time(at);
}
/** Optional metadata on the existing review record, not a new schema/key/store.
 * Only path wording needs copying: journal/reflection sources retain their existing
 * live reference and deletion semantics. A pending draft/invitation owns its snapshot. */
export function capturePathReviewSource(data,args,at) {
 const key=args.gap?.key||'path:'+args.pathId,pid=pathKey(key);
 if(!pid||(args.pathId&&args.pathId!==pid))return null;
 if(Object.hasOwn(args,'sourceSnapshot'))return validSnapshot(args.sourceSnapshot,key,at)?{...args.sourceSnapshot}:null;
 const path=data.paths.find(p=>p.id===pid);if(!path)return null;
 const step=path.steps.find(s=>!s.done),text=args.gap?.detail||step?.text||path.why||path.title;
 const stepId=step&&(text===step.text||text===stepPrompt(step.text))?step.id:null;
 return {key,title:args.gap?.title||path.title,text,at,stepId};
}
/** Resolve only an exact, verifiable source. Never substitute another current step. */
export function reviewSourceContext(data,review) {
 const key=review.sourceKey||'',pid=pathKey(key),path=pid?data.paths.find(p=>p.id===pid):null;
 const fallback={state:'missing',text:null,date:null,originalRoute:null,originalLabel:'Original öffnen',note:'Die ursprüngliche Quelle ist nicht mehr vorhanden oder nicht eindeutig verknüpft.'};
 if(pid){
  const snapshot=review.sourceSnapshot;
  if(validSnapshot(snapshot,key,review.date)){
   const step=path?.steps.find(s=>s.id===snapshot.stepId),same=step&&(snapshot.text===step.text||snapshot.text===stepPrompt(step.text));
   return {state:'snapshot',text:snapshot.text,title:snapshot.title,date:snapshot.at,label:'Beim Rückblick festgehaltener Bezug',
    originalRoute:path?'path/'+encodeURIComponent(pid)+(step?'?step='+encodeURIComponent(step.id):''):null,
    originalLabel:step?'Diesen Schritt heute öffnen':'Zugehörigen Weg öffnen',
    note:!path?'Der ursprüngliche Weg wurde gelöscht. Dein festgehaltener Bezug bleibt Teil dieses Rückblicks.':snapshot.stepId&&!step?'Dieser Schritt ist nicht mehr vorhanden. Sein festgehaltener Wortlaut bleibt erhalten.':step&&!same?'Der Schritt ist heute anders formuliert. Hier bleibt der damalige Bezug erhalten.':''};
  }
  return path?{...fallback,state:'path-only',title:path.title,originalRoute:'path/'+encodeURIComponent(pid),originalLabel:'Zugehörigen Weg öffnen',note:'Der damalige Wortlaut und der konkrete Schritt wurden bei diesem älteren Rückblick nicht mitgespeichert.'}:fallback;
 }
 // A highlight can still be opened by exact ID. Its current snippet is not
 // evidence of the wording at review time, so do not quote it as history.
 if(key.startsWith('highlight:')){
  const matches=data.highlights.filter(item=>item.id===key.slice(10));
  return matches.length===1?{...fallback,state:'reference',originalRoute:'mark/'+encodeURIComponent(matches[0].id),originalLabel:'Zugehörige Markierung öffnen',note:'Dieser Rückblick gehört zu einer Bibelmarkierung. Ihr damaliger Wortlaut wurde nicht mitgespeichert.'}:{...fallback,state:matches.length?'ambiguous':'missing'};
 }
 const [kind,...parts]=key.split(':'),id=parts.join(':'),collection=['journal','j'].includes(kind)?data.journal:['reflection','r'].includes(kind)?data.reflections:[];
 const matches=collection.filter(item=>item.id===id);if(matches.length!==1)return {...fallback,state:matches.length?'ambiguous':'missing'};
 const source=matches[0],type=['journal','j'].includes(kind)?'journal':'reflection';
 if(review.sourceAt!=null&&(time(review.sourceAt)==null||time(source.updatedAt||source.date)!==time(review.sourceAt)))return {...fallback,state:'edited',note:'Der Eintrag wurde seit der Einladung bearbeitet. Sein damaliger Wortlaut wurde nicht mitgespeichert.'};
 const original=reviewsFor(data,source,type).some(r=>r.id===review.id);
 if(!original)return {...fallback,state:source.updatedAt?'edited':'unverified',note:'Der verknüpfte Eintrag wurde nachträglich bearbeitet oder sein damaliger Wortlaut ist nicht zuverlässig verfügbar.'};
 return {state:'original',label:'Dein ursprünglicher Gedanke',text:source.text,date:source.updatedAt||source.date,originalRoute:(type==='journal'?'entry/':'reflection/')+encodeURIComponent(source.id),originalLabel:'Originaleintrag öffnen',note:''};
}
export function renderReviewSource(context,{link,date}) {
 return `<aside class="path-review-source" aria-label="Worauf du zurückblickst"><span class="overline">${e(context.label||'Bezug dieses Rückblicks')}</span>
  ${context.text?`<span class="meta">${e(date(context.date))}</span><blockquote class="preserve">${e(context.text)}</blockquote>`:''}
  ${context.note?`<p class="meta">${e(context.note)}</p>`:''}
  ${context.originalRoute?link(e(context.originalLabel),context.originalRoute,'text-link'):''}
 </aside>`;
}
