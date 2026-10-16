// Backup inspection delegates to the one authoritative import validator.
import {KEYS} from './store.js';
import {JOURNAL_WRITE_KEY} from './journal-storage.js';
export const MAX_BACKUP_BYTES=20*1024*1024;
export function backupSummary(data){return {paths:data.paths.length,steps:data.paths.reduce((n,p)=>n+p.steps.length,0),journal:data.journal.length,reflections:data.reflections.length,reviews:data.reviews.length+data.paths.reduce((n,p)=>n+p.reviews.length,0),highlights:data.highlights.length,quiz:Object.keys(data.quiz).length};}
export async function inspectBackupFile(file,{store,validateRefs}){
 if(file.size>MAX_BACKUP_BYTES)throw new Error('Diese Datei ist zu groß. Unterstützt werden Backups bis 20 MB.');
 const input=JSON.parse(await file.text()),next=validateRefs(store.prepareImport(input));
 return {next,summary:backupSummary(next),exported:input.exported||null};
}
export function createRestoreSession(next,storage){
 if(storage.getItem(JOURNAL_WRITE_KEY))throw new Error('Ein Journal-Speichervorgang ist noch offen. Bitte lade FaithPath neu.');
 return {next,mainRaw:storage.getItem(KEYS.main),draftRaw:storage.getItem(KEYS.draft),stage:'preview'};
}
export function assertRestoreSession(session,storage){
 if(!session||storage.getItem(JOURNAL_WRITE_KEY)||storage.getItem(KEYS.main)!==session.mainRaw||storage.getItem(KEYS.draft)!==session.draftRaw)throw new Error('Daten oder Entwurf wurden inzwischen geändert. Bitte prüfe die Datei erneut; der neuere Stand bleibt erhalten.');
}
