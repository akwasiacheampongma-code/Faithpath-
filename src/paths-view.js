import {renderReviewSource} from './path-review-context.js';
import {escapeHtml as e} from './view-html.js';

/** HTML only. Existing helpers/actions own navigation, editors and storage. */
export function renderPathsOverview(model,{heading,button,row,date,treePreview=''}) {
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
  ${treePreview}<div class="actions paths-actions">${cards.length?button('Einen Weg beginnen','new-path',{},'button primary'):''}${button(archived?'Aktive Wege':'Archiv','toggle-archive',{},'button quiet')}</div>
  ${archived?'<p class="meta">Ruhende Wege behalten ihre Geschichte. Du kannst sie jederzeit wieder aufnehmen.</p>':archivedCount?`<p class="meta">${archivedCount} ${archivedCount===1?'Weg ruht':'Wege ruhen'} im Archiv.</p>`:''}
  ${cards.length?`<div class="path-list">${cards.map(card).join('')}</div>`:`<section class="paths-empty empty"><h2>${archived?'Noch keine ruhenden Wege.':'Dein Weg darf klein anfangen.'}</h2><p>${archived?'Ein Weg darf ruhen und später weitergehen.':'Vielleicht begleitet dich eine Frage oder etwas, das du im Alltag ausprobieren möchtest.'}</p>${button('Einen Weg beginnen','new-path',{},'button primary')}<p class="meta">Ganz freiwillig. Dein Glaube wird hier nicht bewertet.</p></section>`}
  <section class="section paths-related" aria-label="Deine persönliche Geschichte">${row('Dein Olivenbaum','Entwicklung, die du selbst festgehalten hast.','tree')}${row('Deine ganze Geschichte','Gedanken und Rückblicke im Zusammenhang.','history')}${row('Geführte Wege','Eine ruhige Begleitung für deinen Anfang.','plans')}</section>`;
}

function pathStep(step,pathId,{button},current=false) {
 return `<div class="path-step${current?' current-path-step':''}"><label class="step-row"><input type="checkbox" ${step.done?'checked':''} data-change="step-done" data-path="${e(pathId)}" data-id="${e(step.id)}"><span>${e(step.text)}</span></label>${!step.done?`<div class="step-actions">${button('Bearbeiten','edit-step',{path:pathId,id:step.id},'text-button')}${!current?button('Als Nächstes','current-step',{path:pathId,id:step.id},'text-button'):''}</div>`:''}</div>`;
}
function thoughtLink(thought,{link,date}) {
 return `<article class="path-thought"><span class="meta">${e(date(thought.date))}</span><blockquote>${link(e(thought.text),thought.route,'thought-preview')}</blockquote></article>`;
}
function scripture(item,{link,readRoute,refLabel}) {
 return `<article class="path-scripture">${link(e(item.label||refLabel(item.ref)),readRoute(item.ref),'scripture-reference')}<blockquote data-path-quote="${e(JSON.stringify(item.ref))}"></blockquote></article>`;
}
export function renderPathDetail(model,helpers) {
 const {path:p,nextStep,thoughts,scriptures,context,visibleMoments,moments,hasMore}=model;
 const {back,heading,button,link,date,categoryLabel,facts,timelineHTML}=helpers,pid=p.id,open=p.steps.filter(step=>!step.done),past=p.steps.filter(step=>step.done);
 const controls=`<details class="path-options"><summary aria-label="Weg verwalten"><span aria-hidden="true">···</span><span class="sr-only">Weg verwalten</span></summary><div class="path-context">${button('Weg bearbeiten','edit-path',{id:pid},'text-button')}${button(p.archived?'Weg wieder aufnehmen':'Archivieren','archive-path',{id:pid},'text-button')}${button('Weg löschen','delete-path',{id:pid},'text-button danger-text')}</div></details>`;
 const moreThoughts=thoughts.slice(1,3);
 return `${back('Meine Wege','paths')}<div class="path-titlebar">${heading(categoryLabel,p.title)}${controls}</div>
  <p class="meta">Begonnen am ${e(date(p.started))}${p.archived?' · archiviert':''}</p>${facts}
  <details class="path-purpose"${p.why&&p.why.length<180?' open':''}><summary>Warum dieser Weg?</summary><p class="preserve">${e(p.why||'Du hast noch keinen Anlass dazu festgehalten.')}</p></details>
  ${p.archived?'<p class="path-archive-note meta">Dieser Weg ruht. Seine Gedanken und Schritte bleiben erhalten.</p>':''}
  <section class="next-step" aria-labelledby="path-next-step-title"><div class="section-heading"><h2 id="path-next-step-title">${nextStep?'Mein nächster Schritt':'Ein kleiner nächster Schritt'}</h2>${nextStep?button('<span aria-hidden="true">+</span><span class="sr-only">Schritt hinzufügen</span>','step',{id:pid},'icon-button'):''}</div>
   ${nextStep?pathStep(nextStep,pid,helpers,true):`<p>Wenn du möchtest: Was könntest du im Alltag ausprobieren?</p>${button('Schritt hinzufügen','step',{id:pid},'text-button')}`}
   <small>Ein Schritt ist ein Versuch. Entwicklung hältst du später selbst fest.</small>
  </section>
  <div class="actions path-main-actions">${button('Gedanken festhalten','reflect-path',{id:pid},'button primary')}${button('Zurückblicken','review-path',{id:pid},'text-button')}</div>
  <section class="path-companions section" aria-labelledby="path-companions-title"><span class="overline">Was mich begleitet</span><h2 id="path-companions-title">Gedanken & Bibelstellen</h2>
   <div class="path-continuity" aria-label="Zu diesem Weg">${scriptures[0]?`<span class="meta">${context.reading?'Zuletzt gelesen':'Verbundene Bibelstelle'}</span><div class="path-scriptures">${scripture(scriptures[0],helpers)}</div>`:''}
    ${thoughts[0]?`<span class="overline">Zuletzt festgehalten</span>${thoughtLink(thoughts[0],helpers)}`:''}
    ${!thoughts.length&&!scriptures.length?'<p class="meta">Hier finden Gedanken und Bibelstellen Platz, die du selbst mit diesem Weg verbindest.</p>':''}
   </div>
   ${moreThoughts.length||scriptures.length>1?`<details class="path-linked-history"><summary>Weitere Gedanken & Bibelstellen</summary><div class="path-thoughts">${moreThoughts.map(t=>thoughtLink(t,helpers)).join('')}</div><div class="path-scriptures">${scriptures.slice(1).map(item=>scripture(item,helpers)).join('')}</div>${thoughts.length>3?link('Alle Gedanken in der Geschichte ansehen','path/'+encodeURIComponent(pid)+'?section=story','text-link'):''}</details>`:''}
  </section>
  ${open.length>1?`<section class="further-steps section"><h2>Weitere Schritte</h2>${open.slice(1).map(step=>pathStep(step,pid,helpers)).join('')}</section>`:''}
  ${past.length?`<details class="past-steps section"><summary>Ausprobierte Schritte (${past.length})</summary>${past.map(step=>pathStep(step,pid,helpers)).join('')}</details>`:''}
  <section class="section path-story" tabindex="-1" aria-labelledby="path-story-title"><span class="overline">Von damals bis heute</span><h2 id="path-story-title">Die Geschichte dieses Weges</h2>
   <p class="meta">Deine eigenen Gedanken und festgehaltenen Momente. Auch offene Fragen gehören dazu.</p>
   ${model.reviewContexts?.length?`<details class="path-review-contexts"><summary>Deine Rückblicke im Zusammenhang (${model.reviewContexts.length})</summary>${model.reviewContexts.slice(0,3).map(({review,context})=>`<article class="path-review-card"><span class="meta">Dein Rückblick · ${e(date(review.date))}</span>${renderReviewSource(context,helpers)}<blockquote class="preserve">${e(review.text)}</blockquote><p class="meta">${review.confirmedDevelopment?'Von dir ausdrücklich als Entwicklung festgehalten.':'Ein persönlicher Rückblick, ohne Bewertung.'}</p>${link('Rückblick öffnen',review.route,'text-link')}</article>`).join('')}${model.reviewContexts.length>3?'<p class="meta">Weitere Rückblicke findest du in der folgenden Geschichte.</p>':''}</details>`:''}
   ${timelineHTML(visibleMoments,model.limit)}<p class="meta path-moment-count" aria-live="polite">${visibleMoments.length} von ${moments.length} Momenten</p>
   ${hasMore?button('Weitere Momente','more-history',{path:pid},'button quiet'):''}
  </section>`;
}
