// Read-only explanation of the existing domain reminders. No scheduler or new preference.
import {gaps,time} from './domain.js';
import {escapeHtml as e} from './view-html.js';
export function selectReminderControls(data,now=Date.now()){
 const pending=gaps(data,now),visible=new Set(pending.map(x=>x.key));
 // Ask the same domain selector for eligible sources, independent of due dates.
 // Only presentation uses this projection; actual invitations always use gaps(data,now).
 const sources=gaps({...data,reminderSnoozes:{},dismissedGaps:{}},Number.MAX_SAFE_INTEGER);
 const paused=sources.filter(g=>time(g.at)<=now&&!visible.has(g.key)).map(g=>{
  const dismissed=time(data.dismissedGaps?.[g.key]),until=time(data.reminderSnoozes?.[g.key]);
  return dismissed!==null&&dismissed>=time(g.at)?{...g,mode:'dismissed',until:null}:until!==null&&until>now?{...g,mode:'snoozed',until}:null;
 }).filter(Boolean);
 return {pending,paused};
}
export function renderReminderControls(model,{date,button}){
 return `<section class="reminder-controls" aria-labelledby="reminder-title"><h2 id="reminder-title">Deine Erinnerungen</h2><p>Einladungen erscheinen nur, wenn du FaithPath öffnest oder nutzt. Es gibt keine Push-, E-Mail- oder Hintergrundbenachrichtigungen.</p><p class="meta">Du bestimmst, ob und wann du zurückblickst. Ein vergangener Zeitraum sagt nichts über deine Entwicklung aus.</p>${model.paused.length?`<details><summary>Zurückgestellt oder beiseitegelegt · ${model.paused.length}</summary>${model.paused.map(g=>`<article class="reminder-paused"><h3>${e(g.title)}</h3><p>${g.mode==='snoozed'?'Frühestens ab '+e(date(g.until))+' wieder beim Öffnen der App.':'Für diese Quelle beiseitegelegt. Neue Aktivität kann später eine neue Einladung ermöglichen.'}</p>${button('Einladung wieder zulassen','resume-reminder',{key:g.key},'text-button')}</article>`).join('')}</details>`:'<p class="meta">Keine Einladung ist gerade von dir zurückgestellt.</p>'}</section>`;
}
export function reminderWhy(g,date){return `<details class="reminder-why"><summary>Warum diese Erinnerung?</summary><p>Diese Einladung bezieht sich auf ${g.type==='path'?'deinen persönlichen Weg':'diesen gespeicherten Eintrag'} und dessen letzte belegte Aktivität am ${e(date(g.at))}. Der oben gezeigte Bezug stammt aus deinen vorhandenen Daten. Du entscheidest, ob du dazu etwas festhalten möchtest.</p><p>„In zwei Wochen erinnern“ verschiebt die Einladung. Sie erscheint dann erst wieder beim Öffnen der App. „Im Moment nicht“ legt sie für diese Quelle beiseite.</p></details>`;}
