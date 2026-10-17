import {escapeHtml as e} from './view-html.js';
import {discoveryShortcuts} from './navigation-view.js';
export function discoveryCount(model) {
 const noun=model.kind==='geschichte'?'Geschichten':model.kind==='kapitel'?'Kapitelübungen':'Einheiten';
 return `${model.total} ${noun} gefunden · ${model.visible.length} angezeigt`;
}
export function renderDiscoveryResults(model,{button},legacyQuiz=false) {
 if(!model.total)return `<section class="empty"><h3>Hier haben wir noch keinen Treffer.</h3><p>Versuche ein anderes Wort, ein anderes Buch oder setze die Filter zurück.</p>${button('Alle Einheiten ansehen','reset-discover',{},'button primary')}</section>`;
 return `<div class="discovery-result-list">${model.visible.map(item=>`<a class="list-row" href="#${e(legacyQuiz?item.quizRoute:item.route)}" data-discovery-key="${e(item.key)}"><span><span class="overline">${item.kind==='kapitel'?'Kapitelübung':'Geschichte'}</span><strong>${e(item.title)}</strong><small>${e(item.reference)} · ${item.questions} Fragen</small></span><span class="discovery-arrow" aria-hidden="true">→</span></a>`).join('')}</div>${model.hasMore?button('Weitere 20 anzeigen','more-discover',{},'button quiet discovery-more'):''}`;
}
export function renderDiscovery({model,books,filters,editorial,legacyQuiz=false},{heading,link,button}) {
 return `${heading(legacyQuiz?'Fragensammlung':'Entdecken',legacyQuiz?'Verstehen darf wachsen.':'Vom Leben zurück zum Wort.','Ein Text für deine Fragen. Ein neuer Blick auf Vertrautes.')}
 <section class="discovery-search" aria-labelledby="discovery-search-title"><h2 id="discovery-search-title" class="sr-only">${legacyQuiz?'Fragensammlung durchsuchen':'Passenden Text finden'}</h2>
 <p class="sr-only" id="discovery-scope">Suche in Titeln, Themenhinweisen und Bibelstellen von 436 Geschichten und 260 NT-Kapitelübungen.</p>
 <div class="field"><label class="sr-only" for="story-search">Geschichte, Thema oder Bibelstelle suchen</label><input id="story-search" type="search" data-input="stories" aria-describedby="discovery-scope" aria-controls="story-results" value="${e(filters.query)}" placeholder="Zum Beispiel Vergebung"></div>
 <div class="filter-pair"><div class="field"><label for="story-book">Buch</label><select id="story-book" data-change="story-book"><option value="">Alle Bücher</option>${books.map(book=>`<option value="${e(book.code)}" ${book.code===filters.book?'selected':''}>${e(book.name)}</option>`).join('')}</select></div>
 <div class="field"><label for="story-kind">Inhalte</label><select id="story-kind" data-change="story-kind">${[['alle','Alle Einheiten'],['geschichte','Geschichten'],['kapitel','Kapitelübungen']].map(([value,label])=>`<option value="${value}" ${filters.kind===value?'selected':''}>${label}</option>`).join('')}</select></div></div>
 <div class="discovery-filter-status"><p id="discovery-count" class="meta" role="status" aria-live="polite" aria-atomic="true">${discoveryCount(model)}</p>${button('Filter zurücksetzen','reset-discover',{},'text-button')}</div></section>
 ${!legacyQuiz&&editorial[0]?`<section class="discovery-curation" ${model.filtered?'hidden':''}><img src="${e(new URL('./verbunden/assets/brand-sprig.svg',import.meta.url).href)}" alt="" width="220" height="160"><div><span class="overline">Eine Geschichte zum Verweilen</span><h2>${link(e(editorial[0].title),'merged-story/'+encodeURIComponent(editorial[0].story_id))}</h2><p>${e(editorial[0].ref)}</p>${link('Die Geschichte entdecken →','merged-story/'+encodeURIComponent(editorial[0].story_id),'text-link')}</div></section>`:''}
 <div class="segmented">${link('Lesen','bible')}${link('Entdecken','discover','active')}${link('Markierungen','marks')}</div>
 <nav class="discovery-starts" aria-label="Inhalte entdecken">${button('Geschichten','discover-kind',{kind:'geschichte'},'button quiet')}${link('Kapitelübungen','chapter-quizzes','button quiet')}</nav>
 ${discoveryShortcuts({link})}
 <section aria-labelledby="discovery-results-title"><h2 id="discovery-results-title" tabindex="-1">${legacyQuiz?'Verständnisfragen':'Geschichten & Kapitelübungen'}</h2><div id="story-results">${renderDiscoveryResults(model,{button},legacyQuiz)}</div></section>
 <details class="discover-editorial" ${model.filtered?'hidden':''}><summary>Eine Geschichte zum Anfang</summary><p class="meta">Drei Einstiege aus den vorhandenen Geschichten.</p>${editorial.map(story=>`<article><h3>${link(e(story.title),'merged-story/'+encodeURIComponent(story.story_id))}</h3><p class="meta">${e(story.ref)}</p></article>`).join('')}</details>
 ${link('So sind die Inhalte geprüft','content-status','text-link')}`;
}
