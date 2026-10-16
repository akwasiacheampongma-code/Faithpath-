import {escapeHtml as e} from './view-html.js';

/** HTML only. Existing helpers/actions own navigation, editors and storage. */
export function renderPathsOverview(model,{heading,button,row,date}) {
 const {cards,archived,archivedCount}=model;
 const card=({path,nextStep,isCurrent})=>`<article class="personal-path-card${isCurrent?' is-current':''}" data-path-card="${e(path.id)}">
  <a class="path-card-link" href="#path/${e(encodeURIComponent(path.id))}">
   <span class="overline">${archived?'Ruhender Weg':isCurrent?'Gerade bei dir':'Dein persönlicher Weg'}</span>
   <h2 class="path-title">${e(path.title)}</h2>
   ${path.why?`<p class="path-card-context">${e(path.why)}</p>`:''}
   ${nextStep?`<div class="path-card-next"><span class="meta">${archived?'Zuletzt offen':'Dein nächster Schritt'}</span><p>${e(nextStep.text)}</p></div>`:'<p class="meta">Du kannst hier weiterlesen oder einen nächsten Schritt festhalten.</p>'}
   <span class="path-card-footer"><small>Seit ${e(date(path.started))}</small><span class="path-open">Weg öffnen <span aria-hidden="true">→</span></span></span>
  </a></article>`;
 return `${heading('Mein Weg',archived?'Deine ruhenden Wege.':'Was dich gerade begleitet.','Bibelstellen, Gedanken und kleine Schritte bleiben zusammen.')}
  <div class="actions paths-actions">${cards.length?button('Einen Weg beginnen','new-path',{},'button primary'):''}${button(archived?'Aktive Wege':'Archiv','toggle-archive',{},'button quiet')}</div>
  ${archived?'<p class="meta">Ruhende Wege behalten ihre Geschichte. Du kannst sie jederzeit wieder aufnehmen.</p>':archivedCount?`<p class="meta">${archivedCount} ${archivedCount===1?'Weg ruht':'Wege ruhen'} im Archiv.</p>`:''}
  ${cards.length?`<div class="path-list">${cards.map(card).join('')}</div>`:`<section class="paths-empty"><h2>${archived?'Noch keine ruhenden Wege.':'Dein Weg darf klein anfangen.'}</h2><p>${archived?'Ein Weg darf ruhen und später weitergehen.':'Vielleicht begleitet dich eine Frage oder etwas, das du im Alltag ausprobieren möchtest.'}</p>${button('Einen Weg beginnen','new-path',{},'button primary')}<p class="meta">Ganz freiwillig. Dein Glaube wird hier nicht bewertet.</p></section>`}
  <section class="section paths-related" aria-label="Deine persönliche Geschichte">${row('Dein Olivenbaum','Entwicklung, die du selbst festgehalten hast.','tree')}${row('Deine ganze Geschichte','Gedanken und Rückblicke im Zusammenhang.','history')}${row('Geführte Wege','Eine ruhige Begleitung für deinen Anfang.','plans')}</section>`;
}
