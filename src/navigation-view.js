/** Secondary destinations only. Navigation/state and all writes belong to app.js. */
export function renderMore({heading,row,button}) {
 return `${heading('Mehr','Gut aufgehoben.','Deine Geschichte, Einstellungen und Sicherungen.')}
 <section class="more-secondary" aria-labelledby="more-personal"><h2 id="more-personal">Deine Geschichte</h2>
 ${row('Meine Geschichte','Gedanken und Rückblicke im zeitlichen Zusammenhang.','history')}
 ${row('Rückblicke','Auf frühere Gedanken zurückschauen.','reviews')}</section>
 <section class="more-secondary" aria-labelledby="more-utility"><h2 id="more-utility">Einstellungen & Daten</h2>
 ${row('Einstellungen','Darstellung, Offline-Status und Datenschutz.','more?section=settings')}
 ${row('Daten & Backup','Deine Einträge sichern oder wiederherstellen.','more?section=data')}
 <div class="more-introduction"><h3>FaithPath kennenlernen</h3><p>Wähle deinen Einstieg erneut – ganz ohne Pflichtprogramm.</p>${button('Einführung ansehen','onboard',{},'button quiet')}</div></section>`;
}
/** Existing secondary discovery destinations, shared by the hub and coverage map. */
export function discoveryShortcuts({link}) {
 return `<nav class="discovery-shortcuts" aria-label="Weitere Einstiege">${link('Was beschäftigt dich?','guidance','text-link')}${link('Geführte Wege','plans','text-link')}${link('Fragensammlung','quizzes','text-link')}</nav>`;
}
