import {journeySummary,exploredChapters} from './bible-journey.js';
import {progressiveSword} from './journey-sword.js';
import {escapeHtml as e} from './view-html.js';
const route=(data,book,chapter)=>`read/${book}/${chapter}/${data.translation||'otb'}`;
const link=(label,r,cls='text-link',extra='')=>`<a class="${cls}" href="#${e(r)}" ${extra}>${e(label)}</a>`;
// Presentation adapters only. Historical events and chapter authority stay in bible-journey.js.
export const sword=()=>'<svg class="journey-symbol" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 19 3-3m-2-3 5 5M9 15l9-9 1-3-3 1-9 9M3 21l2-2"/></svg>';
export function journeyAcknowledgement(data,books,ref){const done=exploredChapters(data,books).has(ref.book+':'+ref.chapter),name=books.find(b=>b.code===ref.book)?.name||ref.book;return `<section class="journey-acknowledgement" aria-live="polite" ${done?'':'hidden'}>${sword()}<div><span class="overline">Kapitel erkundet</span><p>${e(name)} ${ref.chapter} ist jetzt Teil deiner Bibelreise.</p>${link('Dein Schwert ansehen','bible-journey')}</div></section>`;}
export function journeyView(data,books,code=''){
 const x=journeySummary(data,books),book=x.books.find(b=>b.code===code);if(code&&!book)return null;
 const reading=x.reading;
 if(book){const known=new Set(book.explored.map(e=>e.chapter)),next=book.current&&!known.has(book.current)?book.current:Array.from({length:book.chapters},(_,i)=>i+1).find(c=>!known.has(c))||book.current||1;
 return {title:book.name,body:`<p class="journey-reading-state">${known.size} von ${book.chapters} Kapiteln erkundet${known.size===book.chapters?' · vollständig erkundet':''}</p>${link('Hier weiter',route(data,code,next),'button primary')}<p class="journey-grid-key meta">✓ Erkundet · → Als Nächstes · weitere Kapitel offen</p><ol class="journey-chapters">${Array.from({length:book.chapters},(_,i)=>{const c=i+1,done=known.has(c),current=book.current===c,isNext=!done&&c===next,state=done?'erkundet':isNext?'als Nächstes':'noch nicht erkundet';return `<li class="${done?'is-explored':isNext?'is-next':''}">${link(String(c),route(data,code,c),'journey-chapter-link',`aria-label="${e(book.name)} Kapitel ${c}, ${state}${current?', zuletzt geöffnet':''}" ${isNext?'aria-current="step"':''}`)}<span class="chapter-state" aria-hidden="true">${done?'✓':isNext?'→':''}</span></li>`;}).join('')}</ol>`};
 }
 const bookRow=b=>`<li>${link(b.name,'bible-journey/'+b.code,'journey-book-link')}<span class="meta">${b.explored.length} von ${b.chapters} Kapiteln erkundet${b.explored.length===b.chapters?' · vollständig':''}</span><svg class="journey-book-track" viewBox="0 0 100 3" preserveAspectRatio="none" aria-hidden="true"><rect width="100" height="3"/><rect width="${b.explored.length/b.chapters*100}" height="3"/></svg></li>`;
 const started=x.books.filter(b=>b.explored.length>0).sort((a,b)=>(b.code===reading?.book)-(a.code===reading?.book)||Math.max(...b.explored.map(e=>Date.parse(e.at)))-Math.max(...a.explored.map(e=>Date.parse(e.at))));
 const continuation=reading?`<section class="journey-resume continuity-strip"><span class="overline">Hier weiter</span><h2>${e(books.find(b=>b.code===reading.book)?.name||reading.book)} ${reading.chapter} weiterlesen</h2>${link('Weiterlesen',route({...data,translation:data.reading.translation||data.translation},reading.book,reading.chapter),'button primary')}</section>`:link('Bibel öffnen','bible','button primary journey-start');
 return {title:'Deine Bibelreise',body:`<section class="journey-sword-hub" aria-label="Deine gelesenen Kapitel"><h2 class="sword-title">Das Schwert des Geistes</h2><p class="sword-subtitle">Gottes Wort begleitet dich durch deinen Alltag.</p><p class="sword-count">${x.chapters} von ${books.reduce((n,b)=>n+b.chapters,0).toLocaleString('de-DE')} Kapiteln erkundet</p><div class="journey-sword-scene">${progressiveSword(x)}</div>${!x.chapters?'<h2 class="journey-beginning">Deine Bibelreise beginnt hier</h2>':''}${continuation}<blockquote class="journey-scripture"><p data-journey-scripture></p><cite>${link('Epheser 6,17 · Luther 1912','read/EPH/6/l1912?from=17&to=17&origin=bible-journey','text-link')}</cite></blockquote><p class="journey-symbol-explanation meta">Dein Schwert misst nicht, wie stark dein Glaube ist. Es macht deine Bibelreise sichtbar.</p><button type="button" class="text-button sword-info" data-action="sword-info">Warum ein Schwert?</button></section>
 <dl class="journey-facts"><div><dt>Kapitel erkundet</dt><dd>${x.chapters}</dd></div><div><dt>Bücher begonnen</dt><dd>${x.begunBooks}</dd></div><div><dt>Bücher vollständig erkundet</dt><dd>${x.completedBooks}</dd></div></dl>
 ${started.length?`<section class="journey-started"><h2>Begonnene Bücher</h2><ul class="journey-books">${started.map(bookRow).join('')}</ul></section>`:''}
 ${[['Altes Testament',x.books.slice(0,39)],['Neues Testament',x.books.slice(39)]].map(([title,bs])=>`<section class="journey-testament"><h2>${title}</h2><ul class="journey-books">${bs.map(bookRow).join('')}</ul></section>`).join('')}`};
}

export function swordExplanation() {
 return `<p class="overline">Das Schwert des Geistes</p><p>Gottes Wort begleitet dich durch deinen Alltag.</p>
 <p>Das Leben bringt Herausforderungen mit sich: Zweifel, Angst, Versuchungen und schwierige Entscheidungen.</p>
 <p>Gottes Wort kann dir Orientierung geben, deinen Glauben stärken und dir helfen, geistlichen Herausforderungen standhaft zu begegnen.</p>
 <p>Je mehr du die Bibel liest, verstehst und in deinem Alltag anwendest, desto vertrauter wirst du mit ihren Worten und ihrer Bedeutung.</p>
 <p>Dein Schwert macht sichtbar, welche Kapitel du bereits erkundet hast. Es erinnert dich daran, Gottes Wort nicht nur zu lesen, sondern auch danach zu handeln.</p>
 <blockquote class="journey-scripture"><p data-journey-scripture></p><cite><a class="text-link" href="#read/EPH/6/l1912?from=17&amp;to=17&amp;origin=bible-journey">Epheser 6,17 · Luther 1912</a></cite></blockquote>
 <p>Dein Schwert misst nicht, wie stark dein Glaube ist. Es macht deine Bibelreise sichtbar. Bibellesen erzeugt nicht automatisch geistliche Stärke.</p>
 <p>Das Schwert ist ein geistliches Bild aus Epheser 6,10–18. Es richtet sich nicht gegen Menschen oder Andersgläubige und ruft nicht zu Gewalt auf.</p>
 <p class="meta">Sichtbar werden nur Kapitel, deren Ende du im Reader erreicht hast. Erneutes Lesen zählt dasselbe Kapitel nicht doppelt. Kapitelfragen sind freiwillig.</p>
 <p class="meta">Der Olivenbaum zeigt deine selbst dokumentierte persönliche Glaubensgeschichte. Das Schwert zeigt deine Beschäftigung mit der Bibel. Keines bewertet deine Nähe zu Gott.</p>`;
}
