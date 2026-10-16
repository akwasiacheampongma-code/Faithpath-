import {stageNames} from './content.js';

/** Pure Today markup; no DOM, storage, listeners or state changes.
 * The app supplies its existing UI adapter: e, link, button, icon, refLabel,
 * readRoute, date and category. Every personal string is escaped with `e`.
 */
export function renderToday(model,ui){
 const {e,link,button,icon,refLabel,readRoute,date,category}=ui;
 const {returning,currentPath,nextStep,level,reading,lastThought,pending}=model;
 const entry=(primary=false)=>`
  <nav class="today-entry-actions${primary?' today-entry-actions--first':''}" aria-label="Deinen Einstieg wählen">
   ${link('Ich brauche Orientierung','guidance','button '+(primary?'primary':'quiet'))}
   ${link('Direkt zur Bibel','bible','button quiet')}
  </nav>`;

 const path=currentPath?`
  <section class="personal-path today-next" aria-labelledby="today-path-title">
   <span class="overline">${nextStep?'Dein nächster Schritt':'Dein aktueller Weg'}</span>
   <h2 id="today-path-title">${e(currentPath.title)}</h2>
   ${nextStep
    ? `<p class="today-step-text">${e(nextStep.text)}</p>`
    : '<p class="today-step-text">Ein Moment zum Festhalten oder Zurückblicken.</p>'}
   ${link(`${nextStep?'Nächsten Schritt ansehen':'Meinen Weg öffnen'} ${icon('arrow')}`,
     'path/'+encodeURIComponent(currentPath.id),'button primary today-path-action')}
  </section>`:'';

 const draft=model.hasDraft?`
  <aside class="draft-strip today-draft" aria-label="Ungespeicherter Gedanke">
   <span class="overline">Ungespeicherter Gedanke</span>
   ${button('Entwurf fortsetzen','resume',{},'text-button')}
  </aside>`:'';

 const tree=`
  <section class="olive-hero today-tree" aria-labelledby="today-tree-title">
   <div class="olive-hero-copy">
    <span class="overline">Deine Entwicklung</span>
    <h2 id="today-tree-title">${e(stageNames[level])}</h2>
    <p>Aus dem, was du selbst festgehalten hast.</p>
   </div>
   <div class="olive-tree-visual">
    <img src="trees/tree-stage-${level+1}.webp" alt="Olivenbaum – ${e(stageNames[level])}" width="1086" height="1448">
   </div>
  </section>`;

 const continuity=reading||lastThought?`
  <section class="personal-recent today-continuity" aria-label="Zu deiner Geschichte zurückkehren">
   ${reading?`
    <article class="today-reading">
     <span class="overline">Zuletzt gelesen</span>
     <h2>${e(refLabel(reading))}</h2>
     ${link(`Weiterlesen ${icon('arrow')}`,readRoute(reading),'text-link')}
    </article>`:''}
   ${lastThought?`
    <article class="today-thought">
     <span class="overline">Dein letzter Gedanke</span>
     <p class="thought-preview">${e(lastThought.text)}</p>
     ${link(`Wieder ansehen ${icon('arrow')}`,lastThought.route,'text-link')}
    </article>`:''}
  </section>`:'';

 const review=pending?`
  <section class="revisit continuity-reminder today-review" aria-labelledby="today-review-title">
   <span class="overline">Ein offener Rückblick · ${date(pending.at)}</span>
   <h2 id="today-review-title">Mit etwas Abstand</h2>
   <p>${e(pending.title)}</p>
   <blockquote>${e(pending.detail)}</blockquote>
   <div class="actions">
    ${button('Darauf zurückblicken','gap',{key:pending.key},'text-button')}
    ${model.pendingCount>1?link('Weitere Rückblicke','reviews','text-link'):''}
   </div>
  </section>`:'';

 const start=!currentPath?`
  <section class="today-start-path" aria-labelledby="today-start-title">
   <span class="overline">${model.archivedCount?'Ein neuer Abschnitt':'Dein persönlicher Weg'}</span>
   <h2 id="today-start-title">Was dich beschäftigt, darf dich begleiten.</h2>
   <p>Halte einen Gedanken fest, verbinde ihn mit einem kleinen Schritt und schau später darauf zurück.</p>
   ${button('Einen Weg beginnen','new-path',{},'text-button')}
   ${model.archivedCount?link('Wege und Archiv öffnen','paths','text-link'):''}
  </section>`:'';

 const others=model.otherPaths.length?`
  <section class="today-other-paths" aria-labelledby="today-other-title">
   <div class="section-heading">
    <h2 id="today-other-title">Was dich noch begleitet</h2>
    ${link('Alle Wege','paths','text-link')}
   </div>
   <div class="list">${model.otherPaths.map(p=>`
    <a class="list-row" href="#path/${e(encodeURIComponent(p.id))}">
     <span><strong>${e(p.title)}</strong><small>${e(p.why||category(p.category).label)}</small></span>
     ${icon('arrow')}
    </a>`).join('')}
   </div>
  </section>`:'';

 // DOM order is also visual, keyboard and screenreader order.
 return `
  <header class="today-header">
   <span class="overline">${returning?'Schön, dass du da bist':'Ein Moment für dich'}</span>
   <h1 tabindex="-1">Was bewegt dich gerade?</h1>
  </header>
  ${returning?path:entry(true)}
  ${draft}
  ${tree}
  ${continuity}
  ${review}
  ${start}
  ${returning?entry():''}
  <nav class="quick-links today-capture" aria-label="Deine Gedanken und Geschichte">
   ${link(`${icon('pen')}<span>Festhalten</span>`,'compose','quick-link')}
   ${link(`${icon('history')}<span>Meine Geschichte</span>`,'history','quick-link')}
  </nav>
  ${others}
  <div class="manifesto">
   <span>${icon('leaf')}</span>
   <p>FaithPath misst nicht deinen Glauben.<br><strong>Deine persönliche Geschichte zählt.</strong></p>
  </div>`;
}
