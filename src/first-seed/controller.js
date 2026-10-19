import {KEYS} from '../store.js';
import {beginDraftSession,saveDraft,discardDraft} from '../drafts.js';
import {journalTransaction} from '../journal-storage.js';
import {newSeedDraft,seedPassage,validateSeed,commitSeed} from './model.js';
import {renderFirstSeed} from './view.js';

const fields=new Set(['topic','concern','thought','kind','next','title','translation']);
const actions=new Set(['seed-next','seed-back','seed-save','seed-retry','seed-pause','seed-export','seed-replay','seed-discard','seed-confirm-discard','seed-export-raw']);
/** Own only this editor's transient state. Existing Store/draft transactions own data. */
export function createFirstSeedController({store,storage,getReferences,getBook,id,now,view}) {
 let draft=null,session=null,active=false,dirty=false,pending=0,busy=false,queue=Promise.resolve(),error='',conflict=false,corrupt=false,rawDraft=null,complete=null;
 let sequence=0,scripture=null,verses=[],loading=false,loadedKey='';
 const model=()=>({draft,error,conflict,corrupt,complete,scripture,verses,loading,busy});
 function lockInputs(value){const editor=view.find('.seed-editor');editor?.setAttribute('aria-busy',String(value));for(const control of editor?.querySelectorAll('input,textarea,select,button')||[])control.disabled=value;}
 const paint=focus=>{view.shell(renderFirstSeed(model(),view),'paths','first-seed-page');lockInputs(busy);if(focus)view.find('#main h1')?.focus({preventScroll:true})};
 function report(problem){error='Nicht gesichert: '+problem.message+' Deine Eingaben bleiben hier erhalten.';const el=view.find('#seed-error');if(el){el.hidden=false;el.textContent=error;}else view.notify(error,true);}
 function persist(){
  if(!draft||conflict||complete)return Promise.resolve();
  const snapshot=structuredClone(draft),version=JSON.stringify(draft.values);snapshot.saved=now();pending++;
  queue=queue.catch(()=>{}).then(async()=>{await saveDraft(storage,session,snapshot);draft.saved=snapshot.saved;if(JSON.stringify(draft.values)===version){dirty=false;error='';}const status=view.find('#seed-save-status');if(status&&status.textContent!=='Entwurf auf diesem Gerät gesichert.')status.textContent='Entwurf auf diesem Gerät gesichert.';}).finally(()=>pending--);
  return queue;
 }
 async function flush(){if(dirty&&pending===0)await persist();else await queue;if(dirty)throw new Error('Der aktuelle Entwurf ist noch nicht gesichert.');}
 async function loadScripture(){
  const request=++sequence;loading=true;verses=[];
  try{scripture=seedPassage(draft.values,getReferences());const book=await getBook(scripture.ref.book,scripture.ref.translation);if(!active||request!==sequence)return;const ref=scripture.ref;verses=book.chapters[ref.chapter-1].filter(([n])=>n>=ref.from&&n<=(ref.to||ref.from));if(!verses.length)throw new Error('Diese Verse sind gerade nicht verfügbar.');}
  catch{if(!active||request!==sequence)return;verses=[];}
  finally{if(active&&request===sequence){loading=false;if(draft.values.scene===2&&!complete)paint(false);}}
 }
 async function render(){
  if(!active){
   // A discarded/finished editor must not carry a rejected queue into a new session.
   queue=Promise.resolve();pending=0;
   const raw=storage.getItem(KEYS.draft);rawDraft=raw;conflict=false;corrupt=false;complete=null;error='';verses=[];loadedKey='';
   if(raw){try{const saved=JSON.parse(raw);if(saved.type!=='first-seed'){conflict=true;draft=null;}else{
    if(!saved.args||!saved.values||!Number.isInteger(saved.values.scene)||saved.values.scene<0||saved.values.scene>5||[...fields].some(name=>typeof saved.values[name]!=='string')||!['otb','l1912'].includes(saved.values.translation))throw new Error('Dieser Entwurf kann nicht sicher geöffnet werden. Bitte sichere zuerst seine Originaldatei.');
    if(saved.values.topic)seedPassage(saved.values,getReferences());draft=saved;session=beginDraftSession(storage,raw);
   }}catch{draft=null;corrupt=true;}}else{const ids=Object.fromEntries(['pathId','journalId','reflectionId','stepId','thoughtLinkId','scriptureLinkId'].map(name=>[name,id()]));draft=newSeedDraft(ids,now());draft.values.translation=store.state.translation||'otb';session=beginDraftSession(storage,null);}
   active=true;dirty=false;
  }
  if(draft?.values.topic)scripture=seedPassage(draft.values,getReferences());
  paint(true);
  if(draft?.values.scene===2&&!conflict){const key=draft.values.topic+':'+draft.values.translation;if(key!==loadedKey){loadedKey=key;loading=true;paint(false);void loadScripture();}}
 }
 function input(target){
  if(!active||conflict||corrupt||complete||busy||!fields.has(target.name))return false;
  draft.values[target.name]=target.value;dirty=true;
  void persist().catch(report);
  if(target.name==='translation'&&draft.values.scene===2){loadedKey='';void render();}
  return true;
 }
 async function finishLeave(){await flush();active=false;sequence++;loading=false;}
 async function leave(){if(busy)throw new Error('Bitte warte einen Moment, bis dieser Schritt gesichert ist.');await finishLeave();}
 async function handle(action){
  if(!actions.has(action))return false;
  if(action==='seed-export-raw'&&corrupt){view.download({app:'FaithPath-Entwurf-Original',raw:rawDraft},'FaithPath-Entwurf-Original.json');return true;}
  if(!active||conflict||corrupt||busy)return true;
  if(action==='seed-export'){view.download({app:'FaithPath-Entwurf',draft:structuredClone(draft)},'FaithPath-Erster-Samen-Entwurf.json');return true;}
  if(action==='seed-discard'){view.modal('Diesen Anfang verwerfen?',`<p>Nur dieser Entwurf wird entfernt. Deine gespeicherten Wege und Gedanken bleiben erhalten. Sichere deine Eingaben vorher als Datei, wenn du sie behalten möchtest.</p><div class="actions">${view.button('Eingaben als Datei sichern','seed-export',{},'button quiet')}${view.button('Diesen Entwurf verwerfen','seed-confirm-discard',{},'button danger')}</div>`);return true;}
  if(action==='seed-replay'){const scene=view.find('[data-seed-planted] [data-living-tree]');if(scene){scene.dispatchEvent(new Event('faithpath-replay',{bubbles:true}));}return true;}
  busy=true;lockInputs(true);
  try{
   if(action==='seed-confirm-discard'){await queue.catch(()=>{});await discardDraft(storage,session.expectedRaw);session.expectedRaw=null;dirty=false;active=false;sequence++;view.closeModal();view.go('today');return true;}
   await flush();error='';
   if(action==='seed-pause'){await finishLeave();view.go('today');return true;}
   if(action==='seed-retry'){loadedKey='';await render();return true;}
   if(action==='seed-save'){
    validateSeed(draft.values);const ref=seedPassage(draft.values,getReferences()).ref,owned=structuredClone(draft);
    await journalTransaction(store,storage,data=>commitSeed(data,owned,ref),(_,raw)=>{if(raw!==session.expectedRaw)throw new Error('Ein anderer Entwurf wurde inzwischen gespeichert.');return null;});
    session.expectedRaw=null;dirty=false;complete=owned.args.pathId;
    try{storage.setItem(KEYS.onboard,'done')}catch{/* Main data is already committed; optional marker failure must not misreport it. */}
    paint(true);return true;
   }
   if(action==='seed-back')draft.values.scene=Math.max(0,draft.values.scene-1);
   if(action==='seed-next'){
    const v=draft.values;
    if(v.scene===1){if(!v.concern.trim())throw new Error('Beschreibe kurz, was dich beschäftigt.');const chosen=seedPassage(v,getReferences());if(!v.title.trim())v.title=chosen.topic.title;}
    if(v.scene===3&&!v.thought.trim())throw new Error('Ein eigener Gedanke oder ein Gebet genügt.');
    if(v.scene===4&&!v.next.trim())throw new Error('Beschreibe einen kleinen nächsten Schritt.');
    draft.values.scene=Math.min(5,v.scene+1);
   }
   dirty=true;await persist();await render();
  }catch(problem){report(problem);view.find('#seed-error')?.focus({preventScroll:true});}
  finally{busy=false;lockInputs(false);}
  return true;
 }
 return Object.freeze({render,input,handle,leave,flush,snapshot:()=>structuredClone(draft),isActive:()=>active,hasUnsavedWork:()=>dirty||pending>0});
}
