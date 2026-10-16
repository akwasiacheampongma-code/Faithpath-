import {escapeHtml as e} from './view-html.js';
// Pure presentation adapters: catalog lookup, navigation and persistence stay in app.js.
export function chapterOffer(options) {
 if (!options?.unit) return '';
 const {unit,quizRoute,done}=options;
 return `<section class="reader-chapter-questions" data-unit-id="${e(unit.id)}" aria-labelledby="chapter-questions-title"><span class="overline">Lesen & verstehen · freiwillig</span><h2 id="chapter-questions-title">Was hast du verstanden?</h2><p>${unit.questions.length} vorhandene Fragen helfen dir, auf den Text zurückzublicken. Du kannst sie auch überspringen und weiterlesen.</p>${done?'<p class="meta">Fragen zu diesem Kapitel bereits angesehen.</p>':''}<div class="chapter-questions-actions"><a class="button primary" href="#${e(quizRoute)}">Fragen starten</a><button type="button" class="text-button" data-action="skip-chapter-quiz">Später</button></div></section>`;
}
export function chapterNavigation({previous,next}) {
 return `<nav class="chapter-nav" aria-label="Kapitel wechseln">${previous?`<a href="#${e(previous)}">← Vorheriges Kapitel</a>`:''}${next?`<a href="#${e(next)}">Nächstes Kapitel →</a>`:''}</nav>`;
}

// At scroll position zero, a very short chapter can expose its end immediately.
// Seeing that initial layout is not evidence of reading; request a deliberate confirmation.
export function initiallyVisibleChapterEnd({top,bottom,scrollY,topbarBottom,navTop}) {
 return top+scrollY>=topbarBottom && bottom+scrollY<=navTop;
}

// Match the chapter-end observer: a sidebar is not a bottom obstruction.
// Used before the router resets scroll, when projecting the chapter's opening layout.
export function chapterOpeningBottom({nav,topbarBottom,viewportWidth,viewportHeight}) {
 return nav&&nav.top>topbarBottom&&nav.bottom>=viewportHeight-1&&nav.width>viewportWidth/2
  ? Math.min(viewportHeight,nav.top):viewportHeight;
}
