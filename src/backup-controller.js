import {KEYS,now} from './store.js';
import {validRef} from './domain.js';
import {backupSummary,inspectBackupFile,createRestoreSession,assertRestoreSession} from './backup-model.js';
import {backupPreview,backupConfirmation} from './backup-view.js';

export const BACKUP_ACTIONS=Object.freeze(['export','raw-backup','import','check-backup','review-import','confirm-import','undo-import']);
const actions=new Set(BACKUP_ACTIONS);

/** Own the transient import lifecycle; persist exclusively through the existing Store.
 * Closing/navigating must call invalidate() before a pending file/lock resumes.
 * `view` supplies the existing shared dialog, formatting and notification adapters.
 * @param {{store:object,storage:Storage,getRoute:()=>string,getReferences:()=>object,
 * locks:LockManager|undefined,find:(selector:string)=>Element|null,view:object}} dependencies
 */
export function createBackupController({store,storage,getRoute,getReferences,locks,find,view}) {
 const {modal,closeModal,go,notify,download,button,date}=view;
 let request=0,selectedMode='import',session=null;
 const invalidate=()=>{request++;session=null;};
 function validateRefs(next) {
  const refs=[...next.highlights,...next.journal.map(x=>x.ref),...next.reflections.map(x=>x.ref),...next.reviews.map(x=>x.ref),...next.events.map(x=>x.ref),...next.paths.flatMap(p=>p.links.map(x=>x.ref)),...next.paths.flatMap(p=>p.reviews.map(x=>x.ref)),next.reading].filter(Boolean);
  for(const ref of refs)validRef(ref,getReferences());
  return next;
 }
 function preview(next,{mode='import',exported=null}={}) {
  invalidate();
  if(!store.error)store.backup();
  const nextSession=createRestoreSession(next,storage);
  modal(mode==='check'?'Backup geprüft':'Bestand vor Wiederherstellung vergleichen',backupPreview({current:backupSummary(store.state),incoming:backupSummary(next),mode,exported,date,hasDraft:nextSession.draftRaw!==null,button}));
  session=mode==='check'?null:nextSession;
 }
 async function inspectFile(file) {
  if(!file)return;
  const expected=++request,route=getRoute(),main=storage.getItem(KEYS.main),draft=storage.getItem(KEYS.draft),mode=selectedMode;
  session=null;
  const result=await inspectBackupFile(file,{store,validateRefs});
  if(expected!==request||route!==getRoute())return;
  if(main!==storage.getItem(KEYS.main)||draft!==storage.getItem(KEYS.draft))throw new Error('Daten oder Entwurf wurden während der Dateiprüfung geändert. Bitte prüfe erneut.');
  preview(result.next,{mode,exported:result.exported});
 }
 async function handle(action,data,element) {
  if(!actions.has(action))return false;
  if(action==='export') {
   download(store.backup(),'FaithPath-Backup-'+now().slice(0,10)+'.json');
   const help=find('#backup-export-help');if(help)help.textContent='Download angefordert. Bitte prüfe im Download-Ordner bzw. in Dateien, ob die JSON-Datei vorhanden ist. FaithPath kann die dauerhafte Speicherung nicht bestätigen.';
  } else if(action==='raw-backup') {
   download(store.rawBackup(),'FaithPath-Originaldaten-'+now().slice(0,10)+'.json');
  } else if(action==='import'||action==='check-backup') {
   selectedMode=action==='check-backup'?'check':'import';find('#import-file').click();
  } else if(action==='review-import') {
   assertRestoreSession(session,storage);session.stage='confirm';
   modal('Backup wirklich wiederherstellen?',backupConfirmation(button));
  } else if(action==='confirm-import') {
   if(!session||session.stage!=='confirm')return;
   const authorization=session;
   const restore=()=>{
    if(session!==authorization||authorization.stage!=='confirm'||!find('#dialog').open)return false;
    assertRestoreSession(authorization,storage);store.restore(authorization.next);authorization.stage='done';return true;
   };
   element.disabled=true;
   let restored;
   try{restored=locks?await locks.request('faithpath-journal-write',restore):restore();}
   finally{if(element.isConnected)element.disabled=false;}
   if(!restored)return;
   closeModal();go('more?section=data');notify('Backup wiederhergestellt. Ein offener Entwurf bleibt erhalten.');
  } else if(action==='undo-import') {
   const old=JSON.parse(storage.getItem(KEYS.restore)||'null');
   if(!old)throw new Error('Kein früherer Stand gefunden.');
   const restored=old.raw?JSON.parse(old.raw):{paths:[],journal:[],highlights:[]};
   preview(validateRefs(store.prepareImport({data:restored,guidedPlans:JSON.parse(old.guidedPlansRaw||'{}')})));
  }
  return true;
 }
 return Object.freeze({inspectFile,invalidate,handles:action=>actions.has(action),handle});
}
