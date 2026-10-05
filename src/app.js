import {createChapterCatalog,chapterUnit,chapterQuizRoute,chapterQuizNavigation} from "./chapter-questions.js";
import {journalMatches} from "./journal-search.js";
import {deleteJournalEntry,restoreJournalEntry,journalDraftMatches,setJournalPath} from "./journal-management.js";
import {journalTransaction,recoverJournalWrite,JOURNAL_WRITE_KEY,journalWriteActive} from "./journal-storage.js";
import {isBibleNote,bibleNotes,deleteBibleNote,restoreBibleNote} from "./bible-notes.js";
import {readingContext,previousThought,allReviews,reviewsFor,reviewPairs,pathContext,highlightContext} from "./continuity.js";
import { HIGHLIGHT_COLORS, highlightColor, overlapsRef, paintRange, clearRange, detachPath } from "./core-experience.js";
import { closeMenu, menuMarkup } from "./menu.js";
import { createStore, KEYS, id, now } from "./store.js";
import {
  normBook,
  validRef,
  sameRef,
  gaps,
  timeline,
  treeLevel,
  developmentCount,
  attach,
  time,
} from "./domain.js";
import {
  LIFE_TOPICS,
  GUIDED_PLANS,
  BEGINNER_GUIDES,
  PATH_CATEGORIES,
  stageNames,
  TRANSLATIONS,
} from "./content.js";
import { BUILD } from "./version.js";
import { loadRuntimeModel } from "./runtime-model.js";
let runtimeModel;
const CONTENT_BASE = new URL("../data/", import.meta.url);

const $ = (s, r = document) => r.querySelector(s),
  $$ = (s, r = document) => [...r.querySelectorAll(s)];
const e = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const date = (d) =>
  time(d) == null
    ? "Datum unbekannt"
    : new Date(d).toLocaleDateString("de-DE", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
const shortDate = (d) =>
  time(d) == null
    ? ""
    : new Date(d).toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "short",
      });
// Access through an adapter so a blocked browser storage API becomes a recoverable error.
let journalRecoveryError=null;
try{await recoverJournalWrite(window.localStorage);}catch(error){journalRecoveryError=error;}
const deviceStorage = {
  getItem: (k) => window.localStorage.getItem(k),
  setItem: (k, v) => {if(journalRecoveryError)throw journalRecoveryError;if(!journalWriteActive()&&localStorage.getItem(JOURNAL_WRITE_KEY))throw new Error("Ein Journal-Speichervorgang ist noch offen. Bitte lade FaithPath neu, bevor du weiterschreibst.");window.localStorage.setItem(k, v);},
};
const store = createStore(deviceStorage),
  s = () => store.state;
const ui = {
  books: [],
  stories: [],
  refs: {},
  contentStatus: {},
  cache: new Map(),
  route: "today",
  token: 0,
  selection: new Set(),
  reader: null,
  filter: "Alle",
  search: "",
  storySearch: "",
  storyBook: "",
  storyKind: "alle",
  historyLimit: 40,
  journalLimit: 40,
  quiz: null,
  form: null,
  import: null,
  offline: false,
  waiting: null,
  archive: false,
  markColor: "", markBook: "", markContext: "",
};
const icons = {
  home: '<path d="m3 10 9-7 9 7v11h-6v-7H9v7H3Z"/>',
  book: '<path d="M12 5v16M12 5C9 3 5 3 2 4v15c4-1 7-1 10 2 3-3 6-3 10-2V4c-3-1-7-1-10 1Z"/>',
  path: '<path d="M7 21c-8-9 17-8 9-18M5 21h4M14 3h4"/>',
  pen: '<path d="m16 3 5 5-12 12-6 1 1-6ZM14 5l5 5"/>',
  more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  leaf: '<path d="M20 3C4 1 1 9 6 15c5 6 15 1 14-12ZM4 21 16 7M8 16l-1-6M12 12l5 1"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  back: '<path d="M20 12H4m6-6-6 6 6 6"/>',
  plus: '<path d="M12 4v16M4 12h16"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  search: '<circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/>',
  history: '<path d="M3 10a9 9 0 1 1 1 8M3 4v6h6M12 7v5l3 2"/>',
  check: '<path d="m4 12 5 5L20 6"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
};
const icon = (n) =>
  `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${icons[n] || icons.leaf}</svg>`;
const attrs = (o) =>
  Object.entries(o)
    .filter(([, v]) => v != null)
    .map(([k, v]) => `data-${k}="${e(v)}"`)
    .join(" ");
const button = (label, action, values = {}, cls = "button") =>
  `<button type="button" class="${cls}" data-action="${action}" ${attrs(values)} ${label === "Journaleintrag löschen" ? 'aria-label="Journaleintrag löschen"' : ""}>${label === "Journaleintrag löschen" ? "Journal<wbr>eintrag löschen" : label}</button>`;
const link = (label, route, cls = "text-link") =>
  `<a class="${cls}" href="#${e(route)}">${label}</a>`;
const row = (title, sub, route, kind = "") =>
  link(
    `<span>${kind ? `<span class="overline">${e(kind)}</span>` : ""}<strong>${e(title)}</strong>${sub ? `<small>${e(sub)}</small>` : ""}</span>${icon("arrow")}`,
    route,
    "list-row",
  );
const heading = (k, title, desc = "") =>
  `<header class="page-heading"><span class="overline">${e(k)}</span><h1 tabindex="-1">${e(title)}</h1>${desc ? `<p>${e(desc)}</p>` : ""}</header>`;
const back = (title, route) =>
  link(`${icon("back")}${e(title)}`, route, "back-link");
const empty = (title, text, cta = "") =>
  `<section class="empty"><span class="empty-icon">${icon("leaf")}</span><h2>${e(title)}</h2><p>${e(text)}</p>${cta}</section>`;
const category = (id) =>
  PATH_CATEGORIES.find((c) => c.id === id) || PATH_CATEGORIES.at(-1);
function notify(text, error = false) {
  const t = $("#toast");
  t.innerHTML = text.length > 90 ? `<details><summary>${e(text.slice(0,45))} … Mehr</summary><p>${e(text)}</p></details>` : e(text);
  if (error) t.insertAdjacentHTML("beforeend",button("Meldung schließen","dismiss-status",{},"text-button"));
  t.querySelector("details")?.addEventListener("toggle",()=>{if(t.querySelector("details").open)clearTimeout(notify.timer);});
  t.className = error ? "toast error visible" : "toast visible";
  clearTimeout(notify.timer);
  if (!error) notify.timer = setTimeout(() => t.classList.remove("visible"), 4500);
}
function showError(error) {
  const message =
    error?.message || "Das hat nicht funktioniert. Bitte versuche es erneut.";
  const field = $("#form-error");
  if (field) {
    field.textContent = message;
    field.focus();
  } else notify(message, true);
}
function change(fn) {
  if(journalRecoveryError)throw journalRecoveryError;
  if(!journalWriteActive()&&localStorage.getItem(JOURNAL_WRITE_KEY))throw new Error("Ein Journal-Speichervorgang ist noch offen. Bitte lade FaithPath neu, bevor du weiterschreibst.");
  store.transact(fn);
}
const refLabel = (r) =>
  r.label ||
  `${ui.books.find((b) => b.code === normBook(r.book))?.name || r.book} ${r.chapter}${r.from ? "," + r.from + (r.to && r.to !== r.from ? "–" + r.to : "") : ""}`;
function readRoute(ref, origin = "") {
  const r = { ...ref, translation: ref.translation || s().translation };
  const q = new URLSearchParams();
  if (r.from != null) q.set("from", r.from);
  if (r.to != null) q.set("to", r.to);
  if (origin) q.set("origin", origin);
  return `read/${normBook(r.book)}/${r.chapter}/${r.translation}${q.size ? "?" + q : ""}`;
}
function go(route) {
  if (location.hash.slice(1) === route) render();
  else location.hash = route;
}
function shell(body, active = "today", cls = "") {
  closeMenu(false);
  const toast=$("#toast"); if(toast) document.body.append(toast);
  $("#app").innerHTML =
    `<header class="topbar"><a class="wordmark" href="#today" aria-label="FaithPath Startseite"><img class="brand-icon" src="./icons/olive-v2-192.png" alt="" aria-hidden="true" width="28" height="28" decoding="async">FaithPath<span class="brand-dot">.</span></a><div class="top-right"><span class="offline-label">${!navigator.onLine ? "Offline" : ui.offline ? "Auf diesem Gerät" : ""}</span><button type="button" id="menu-toggle" class="icon-button" aria-label="Hauptmenü öffnen oder schließen" aria-expanded="false" aria-controls="main-menu">${icon("more")}</button></div></header><div id="notification-slot"></div><nav class="primary-nav" aria-label="Hauptnavigation">${[
      ["today", "home", "Heute"],
      ["bible", "book", "Bibel"],
      ["paths", "path", "Mein Weg"],
      ["journal", "pen", "Journal"],
    ]
      .map(
        ([route, ic, t]) =>
          `<a href="#${route}" ${active === route ? 'aria-current="page"' : ""}>${icon(ic)}<span>${t}</span></a>`,
      )
      .join(
        "",
      )}</nav><div class="page ${cls}">${ui.waiting ? `<aside class="update-notice" role="status">Eine neue Version ist bereit. ${button("Jetzt aktualisieren", "update", {}, "text-button")}</aside>` : ""}${store.error ? `<aside class="error-notice" role="alert"><strong>Deine gespeicherten Daten brauchen Aufmerksamkeit.</strong><p>${e(store.error.message)} Der Originalstand bleibt erhalten.</p>${button("Originaldaten sichern", "raw-backup", {}, "text-button")}${link("Backup wiederherstellen", "more")}</aside>` : ""}<main id="main">${body}</main><footer class="page-footer">Deine persönliche Glaubensgeschichte.</footer></div>${menuMarkup(ui.route)}`;
  $("#notification-slot").append(toast);
  ui.navObserver?.disconnect();
  ui.navObserver=new ResizeObserver(entries=>{if(innerWidth<1100)document.documentElement.style.setProperty("--bottom-nav-height",entries[0].target.getBoundingClientRect().height+"px");});
  ui.navObserver.observe($(".primary-nav"));
  document.title = `FaithPath · ${$("h1")?.textContent || "Deine persönliche Glaubensgeschichte"}`;
}
function timelineHTML(items, limit = 40) {
  return items.length
    ? `<ol class="timeline">${items
        .slice(0, limit)
        .map(
          (x) =>
            `<li><time datetime="${e(x.at)}">${e(shortDate(x.at))}<span>${time(x.at) != null ? new Date(x.at).getFullYear() : ""}</span></time><div class="timeline-content"><span class="overline">${e(x.kind)}</span>${x.route ? link(e(x.title || (x.ref ? refLabel(x.ref) : x.kind)), x.route, "timeline-title") : x.ref ? link(e(x.title || refLabel(x.ref)), readRoute(x.ref), "timeline-title") : `<p class="preserve">${e(x.title)}</p>`}${storyConnections(x)}</div></li>`,
        )
        .join("")}</ol>`
    : "";
}
function hasPersonalHistory(data=s()) {
  return !!(data.paths.length || data.journal.length || data.reflections.length || data.reading || data.highlights.length || data.reviews.length || Object.values(data.guidedPlans).some(p=>Object.values(p).some(Boolean)));
}
function canonicalStoryForLegacy(unit) {
  if(!unit || unit.kind === "chapter-quiz")return null;
  const mapping=runtimeModel.flow.mapping_links.find(l=>l.FP_ID===unit.questions[0]?.faithpath_id);
  return mapping ? runtimeModel.stories.get(mapping.Story_ID) : null;
}
function discoveryItems() {
  return [...runtimeModel.flow.stories,...ui.stories.filter(x=>x.kind==="chapter-quiz")];
}
function storyConnections(x) {
  const paths=[...new Set([...(x.pathIds||[]),...(x.pathId?[x.pathId]:[])])].map(id=>s().paths.find(p=>p.id===id)).filter(Boolean);
  const pieces=[...(x.ref?[link(e(refLabel(x.ref)),readRoute(x.ref))]:[]),...paths.map(p=>link("Teil deines Weges: "+e(p.title),"path/"+encodeURIComponent(p.id)))];
  return pieces.length ? `<div class="story-connections">${pieces.join("")}</div>` : "";
}
function home() {
  const data = s(),
    pending = gaps(data),
    lvl = treeLevel(data),
    active = data.paths.filter((p) => !p.archived),
    currentPath = active.find((p) => p.steps.some((step) => !step.done)) || active[0],
    nextStep = currentPath?.steps.find((step) => !step.done),
    lastThought = [
      ...data.journal.map((j) => ({ ...j, route: "entry/" + encodeURIComponent(j.id) })),
      ...data.reflections.map((r) => ({ ...r, route: "reflection/" + encodeURIComponent(r.id) })),
    ].sort((a, b) => (time(b.date) || 0) - (time(a.date) || 0))[0],
    returning = !!(data.paths.length || lastThought || data.reading || data.highlights.length || data.reviews.length),
    explanation = `<section class="home-note"><span class="overline">Deine persönliche Glaubensgeschichte</span><h2>Ein Gedanke. Ein Schritt.<br>Und später ein neuer Blick.</h2><p>Verbinde, was dich beschäftigt, mit deinem persönlichen Weg. FaithPath erinnert dich später daran.</p></section>`;
  let draft = null;
  try {
    draft = JSON.parse(localStorage.getItem(KEYS.draft));
  } catch {}
  shell(`<header class="today-header">${heading(returning ? "Schön, dass du da bist" : "Ein Moment für dich", "Was bewegt dich gerade?")}</header>
 <section class="olive-hero ${stageNames[lvl].length > 20 ? "olive-hero--long-title" : ""}" aria-labelledby="today-tree-title">
   <div class="olive-hero-copy"><div class="olive-hero-heading"><span class="overline">Deine Entwicklung</span><h2 id="today-tree-title">${e(stageNames[lvl])}</h2></div><p>Aus dem, was du selbst festgehalten hast.</p>${currentPath ? link("Deinen Weg ansehen", "path/" + encodeURIComponent(currentPath.id), "text-link olive-hero-cta") : data.paths.length ? link("Deinen Weg ansehen", "paths", "text-link olive-hero-cta") : button("Deinen Weg beginnen", "new-path", {}, "text-button olive-hero-cta")}</div>
   <div class="olive-tree-visual"><img src="trees/tree-stage-${lvl + 1}.webp" alt="Olivenbaum – ${e(stageNames[lvl])}" width="1086" height="1448"></div>
 </section>
 <nav class="today-entry-actions" aria-label="Deinen Einstieg wählen">${link("Ich brauche Orientierung", "guidance", "button primary")}${link("Direkt zur Bibel", "bible", "button quiet")}</nav>
 ${currentPath ? `<section class="personal-path"><div class="section-heading"><span class="overline">Dein aktueller Weg</span>${icon("leaf")}</div><h2>${link(e(currentPath.title), "path/" + encodeURIComponent(currentPath.id), "personal-title")}</h2>${currentPath.why ? `<p class="path-why">${e(currentPath.why)}</p>` : ""}${nextStep ? `<div class="personal-step"><span class="overline">Dein nächster Schritt</span><p>${e(nextStep.text)}</p></div>` : `<p class="meta">Ein Moment zum Festhalten oder Zurückblicken.</p>`}${link(`Meinen Weg öffnen ${icon("arrow")}`, "path/" + encodeURIComponent(currentPath.id), "text-link")}</section>` : `<section class="personal-path today-first-path ${!hasPersonalHistory(data) ? "beginner-entry" : ""}">${!hasPersonalHistory(data) ? `<span class="overline">Neu im Glauben</span><h2>Du brauchst kein Vorwissen.</h2>${link("Neu im Glauben", "guide/start", "text-link")}` : `<span class="overline">Dein erster Weg</span><h2>Ein Thema, das dich begleitet.</h2><p>Vielleicht Geduld, Vertrauen oder eine offene Frage. Dein Weg darf klein anfangen.</p>${button("Einen Weg beginnen", "new-path", {}, "text-button")}`}</section>`}
 ${pending.length ? `<section class="revisit continuity-reminder"><span class="overline">Noch offen · ${date(pending[0].at)}</span><h2>Möchtest du noch einmal darauf schauen?</h2><p>${e(pending[0].title)}</p><blockquote>${e(pending[0].detail)}</blockquote><div class="actions">${button("Darauf zurückblicken", "gap", { key: pending[0].key }, "text-button")}${link(pending.length > 1 ? `${pending.length} offene Rückblicke` : "Alle Rückblicke", "reviews")}</div></section>` : ""}
 ${data.reading || lastThought ? `<section class="personal-recent" aria-label="Zu deiner Geschichte zurückkehren">${data.reading ? `<article><span class="overline">Zuletzt gelesen</span><h2>${link(e(refLabel(data.reading)), readRoute(data.reading), "personal-title")}</h2>${link(`Weiterlesen ${icon("arrow")}`, readRoute(data.reading), "text-link")}</article>` : ""}${lastThought ? `<article><span class="overline">Dein letzter Gedanke</span><p class="thought-preview">${e(lastThought.text)}</p>${link(`Wieder ansehen ${icon("arrow")}`, lastThought.route, "text-link")}</article>` : ""}</section>` : ""}

 ${draft?.values ? `<aside class="draft-strip"><span>Ein Gedanke wartet noch auf dich.</span>${button("Entwurf fortsetzen", "resume", {}, "text-button")}</aside>` : ""}
 ${explanation}
 <div class="quick-links">${link(`${icon("pen")}<span>Festhalten</span>`, "compose", "quick-link")}${link(`${icon("history")}<span>Meine Geschichte</span>`, "history", "quick-link")}</div>
 <section class="section"><div class="section-heading"><h2>${active.length ? "Was dich begleitet" : "Dein erster Weg"}</h2>${link("Mein Weg", "paths")}</div>${
   active.length
     ? active
         .slice(0, 3)
         .map((p) =>
           row(
             p.title,
             p.why || category(p.category).label,
             "path/" + encodeURIComponent(p.id),
           ),
         )
         .join("")
     : `<p>Vielleicht Geduld, Vertrauen oder eine offene Frage. Dein Weg darf klein anfangen.</p>${button("Einen Weg beginnen", "new-path", {}, "text-button")}`
 }</section>
 <div class="manifesto"><span>${icon("leaf")}</span><p>FaithPath misst nicht deinen Glauben.<br><strong>FaithPath hilft dir, deine Entwicklung zu erkennen.</strong></p></div>`, "today", returning ? "home-page today-variant-b returning-home" : "home-page today-variant-b first-home");
}
function undoNotice(text, restore) {
  notify(text);
  const token = Symbol(); ui.undo = { token, restore, expires: Date.now() + 8000 };
  const toast = $("#toast"); toast.innerHTML = `${e(text)} · ${button("Rückgängig", "undo-core", {}, "text-button")}`;
  clearTimeout(notify.timer);
  notify.timer = setTimeout(() => { if (ui.undo?.token === token) ui.undo = null; toast.classList.remove("visible"); }, 8000);
}
function verseHighlight(v, ref) { return s().highlights.slice().reverse().find(h => normBook(h.book) === ref.book && +h.chapter === +ref.chapter && (h.translation || "otb") === ref.translation && v >= h.from && v <= (h.to || h.from)); }
function readerVerse(v, ref) {
  const h = verseHighlight(v[0], ref);
  return `<button type="button" class="verse ${h ? "marked highlight-" + highlightColor(h) : ""} ${ref.from && v[0] >= ref.from && v[0] <= (ref.to || ref.from) ? "in-passage" : ""}" data-action="verse" data-v="${v[0]}" aria-pressed="false" aria-label="Vers ${v[0]}: ${e(v[1])}${h ? " · Markiert: " + HIGHLIGHT_COLORS[highlightColor(h)] : ""}"><sup>${v[0]}</sup><span>${e(v[1])}${h ? '<span class="sr-only"> · Markiert</span>' : ""}</span></button>` + verseContext(v[0],ref);
}
function refreshHighlights() {
  if (!ui.reader || !$(".reader-page")) return;
  $$(".verse-context").forEach(el=>el.remove());
  for (const el of $$(".verse")) {
    const n = +el.dataset.v, h = verseHighlight(n, ui.reader.ref);
    el.classList.remove("marked", ...Object.keys(HIGHLIGHT_COLORS).map(c => "highlight-" + c));
    if (h) el.classList.add("marked", "highlight-" + highlightColor(h));
    el.insertAdjacentHTML("afterend",verseContext(n,ui.reader.ref));
    el.setAttribute("aria-label", `Vers ${n}: ${ui.reader.vs.find(v => v[0] === n)?.[1] || ""}${h ? " · Markiert: " + HIGHLIGHT_COLORS[highlightColor(h)] : ""}`);
  }
}
function markNotes(h) { return bibleNotes(s(),h); }
function markPaths(h) { return s().paths.filter(p => p.links.some(l => l.ref && overlapsRef(l.ref, h))); }
function colorPalette(args) {
  const ref = args.ref || s().highlights.find(h => h.id === args.id);
  if (!ref) return;
  const existing = args.id ? s().highlights.filter(h => h.id === args.id) : s().highlights.filter(h => overlapsRef(h, ref));
  const colors = new Set(existing.map(highlightColor));
  modal("Markierung gestalten", `<p class="meta">${e(refLabel(ref))}</p><div class="highlight-palette" role="listbox" aria-label="Markierungsfarbe">${Object.entries(HIGHLIGHT_COLORS).map(([c,label]) => `<button type="button" class="color-choice highlight-${c}" role="option" aria-selected="${colors.size === 1 && colors.has(c)}" data-action="paint-highlight" data-color="${c}" data-ref="${e(JSON.stringify(ref))}" data-id="${e(args.id || "")}" tabindex="${(colors.size===1 ? colors.has(c) : c==='olive') ? 0 : -1}" data-active="${colors.size === 1 && colors.has(c)}"><span class="color-dot" aria-hidden="true">${colors.size === 1 && colors.has(c) ? "✓" : ""}</span><span>${label}</span></button>`).join("")}</div><p class="meta">Zum Wiederfinden – ohne Bewertung.</p>${args.id ? button("Markierung entfernen", "remove-mark", {id:args.id}, "text-button danger-text") : existing.length ? button("Markierung entfernen", "remove-selected-highlight", {ref:JSON.stringify(ref)}, "text-button danger-text") : ""}`);
}
function safeReading() {
  const x=readingContext(s());if(!x)return null;
  try {return {...x,ref:validRef(x.ref,ui.refs)};}catch{return null;}
}
function continuityPairHTML(pair) {
  return `<article class="continuity-pair" data-pair-kind="${e(pair.kind)}"><span class="overline">Damals → Heute</span><div class="continuity-before"><span class="meta">Damals · ${date(pair.before.date)}</span><blockquote>${e(pair.before.text)}</blockquote></div><div class="continuity-after"><span class="meta">Heute · ${date(pair.after.date)}</span><blockquote>${e(pair.after.text)}</blockquote></div>${storyConnections(pair.before)}${link(pair.review ? "Rückblick öffnen" : "Gedanken ansehen",pair.after.route,"text-link")}</article>`;
}
function verseContext(n,ref) {
  const h=verseHighlight(n,ref);if(!h||n!==+h.from)return "";
  const c=highlightContext(s(),h),p=c.paths[0],j=c.notes[0];if(!p&&!j)return "";
  return `<aside class="verse-context continuity-strip" data-verse-context="${n}" aria-label="Dein Kontext zu dieser Stelle">${p ? `<p>Mit deinem Weg ${link('„'+e(p.title)+'“',"path/"+encodeURIComponent(p.id))} verbunden.</p>` : ""}${j ? `<p>${link("Dazu hast du etwas festgehalten.",j.route)}</p>` : ""}</aside>`;
}
function pathContinuityHTML(pid) {
  const c=pathContext(s(),pid);if(!c)return "";
  return `<section class="path-continuity continuity-strip" aria-label="Zu diesem Weg"><span class="overline">Zu diesem Weg</span>${c.reference ? `<p><span class="meta">${c.reading ? "Zuletzt gelesen" : "Verbundene Bibelstelle"}</span>${link(e(refLabel(c.reading?.ref || c.reference)),readRoute(c.reading?.ref || c.reference))}</p>` : ""}${c.thought ? `<p><span class="meta">Zuletzt festgehalten</span>${link(e(c.thought.text),c.thought.route)}</p>` : ""}${c.review ? `<p><span class="meta">Letzter Rückblick · ${date(c.review.date)}</span>${link(e(c.review.text),c.review.route)}</p>` : ""}</section>`;
}
function guidance() {
  shell(
    `${back("Heute", "today")}${heading("Orientierung", "Was beschäftigt dich?", "Diese Bibeltexte können dir helfen, über deine Situation nachzudenken. Du brauchst kein Vorwissen.")}${!hasPersonalHistory() ? `<aside class="beginner-entry continuity-strip">${row("Neu im Glauben","Du brauchst kein Vorwissen.","guide/start")}</aside>` : ""}<div class="topic-intro">${LIFE_TOPICS.filter(t=>["angst","wut","entscheidung","familie"].includes(t.id)).map((t,i)=>`<a class="topic-anchor topic-anchor-${i}" href="#topic/${e(t.id)}"><span class="topic-line" aria-hidden="true">${icon("leaf")}</span><h2>${e(t.title)}</h2><p>${e(t.sub)}</p></a>`).join("")}</div><details class="all-topics"><summary>Alle Themen</summary><div class="topic-grid">${LIFE_TOPICS.map(t=>row(t.title,t.sub,"topic/"+t.id)).join("")}</div></details><section class="section"><div class="section-heading"><h2>Lieber begleitet anfangen?</h2></div>${row("Geführte Wege", "Lesen, verstehen, ausprobieren und zurückblicken.", "plans")}${BEGINNER_GUIDES.map((g) => row(g.title, `${g.days.length} Abschnitte · in deinem Tempo`, "guide/" + g.id)).join("")}</section>`,
    "today", "guidance-page depth-page",
  );
}
function topic(id) {
  const t = LIFE_TOPICS.find((t) => t.id === id);
  if (!t) return notFound();
  shell(
    `${back("Orientierung", "guidance")}${heading("Was beschäftigt dich?", t.title, t.sub)}<p class="intro-note">Keine fertige Antwort auf dein Leben. Ein paar Texte, bei denen du anfangen kannst.</p><div class="passage-list">${t.refs.map((r, i) => `<article><span class="passage-number">0${i + 1}</span><div><h2>${e(r.label)}</h2><p>${e(r.context)}</p>${link(`Lesen & nachdenken ${icon("arrow")}`, readRoute(r, "topic/" + t.id + "/" + i), "text-link")}</div></article>`).join("")}</div>`,
  );
}
function planInfo(kind, pid) {
  return (kind === "guide" ? BEGINNER_GUIDES : GUIDED_PLANS).find(
    (p) => p.id === pid,
  );
}
function planRef(p, i) {
  const d = p.days[i];
  return { book: normBook(d[1]), chapter: d[2], from: d[3], to: d[4] };
}
function planProgress(kind, pid) {
  return s().guidedPlans[kind === "guide" ? "guide:" + pid : pid] || {};
}
function plans() {
  const teaser=(p,kind)=>{const progress=planProgress(kind,p.id),last=Object.keys(progress).filter(k=>progress[k]).map(Number).sort((a,b)=>b-a)[0];return `<article class="guided-teaser"><span class="overline">${kind==="guide" ? "Begleitet beginnen" : "In deinem Tempo"}</span><h2>${link(e(p.title.replace(/^\d+ Tage – /,"")),kind+"/"+p.id)}</h2>${p.sub ? `<p>${e(p.sub)}</p>` : ""}<div class="guided-structure"><span>${p.days.length} Abschnitte</span>${last != null && p.days[last] ? `<span>Zuletzt: ${e(p.days[last].title || p.days[last][0] || "Abschnitt " + (last+1))}</span>` : ""}</div>${link(last != null ? "Weiter begleiten lassen" : "Weg ansehen",kind+"/"+p.id,"text-link")}</article>`;};
  shell(`${back("Heute","today")}${heading("Geführte Wege","Ein Thema, das dich begleitet.","Lesen. Verstehen. Ausprobieren. In deinem Tempo.")}<div class="guided-teasers">${(hasPersonalHistory() ? [...GUIDED_PLANS.map(p=>teaser(p,"plan")),...BEGINNER_GUIDES.map(p=>teaser(p,"guide"))] : [...BEGINNER_GUIDES.map(p=>teaser(p,"guide")),...GUIDED_PLANS.map(p=>teaser(p,"plan"))]).join("")}</div>`,"today","plans-page depth-page");
}
function plan(kind, pid) {
  const p = planInfo(kind, pid);
  if (!p) return notFound();
  const pr = planProgress(kind, pid),
    n = Object.values(pr).filter(Boolean).length;
  shell(
    `${back("Geführte Wege", "plans")}${heading("Geführter Weg", p.title.replace(/^\d+ Tage – /, ""), p.sub || "Ein ruhiger Einstieg. Du gehst Abschnitt für Abschnitt.")}<p class="meta">${n} von ${p.days.length} Abschnitten festgehalten · dein Tempo</p><ol class="plan-sections">${p.days.map((d, i) => `<li><span class="section-number">${pr[i] ? icon("check") : String(i + 1).padStart(2, "0")}</span><div><h2>${e(d[0])}</h2><p>${e(d[d.length - 1])}</p><div class="actions">${link(pr[i] ? "Noch einmal ansehen" : "Lesen & reflektieren", readRoute(planRef(p, i), `${kind}/${pid}/${i}`))}${button(pr[i] ? "Wieder öffnen" : "Gelesen markieren", "plan-toggle", { kind, id: pid, day: i }, "text-button")}</div></div></li>`).join("")}</ol>`,
  );
}
function bible() {
  const reading=safeReading();
  shell(`${heading("Lesen","Die Bibel. Raum zum Verstehen.","Lies in deinem Tempo. Tippe auf einen Vers, um ihn zu markieren oder einen Gedanken festzuhalten.")}${reading ? `<section class="continue-reading continuity-strip"><span class="overline">Weiterlesen</span><span class="meta">Zuletzt gelesen${reading.at ? ' · '+date(reading.at) : ''}</span><h2>${e(refLabel(reading.ref))}</h2>${link("Weiterlesen",readRoute(reading.ref),"text-link")}</section>` : ""}<div class="segmented" aria-label="Bibelbereiche">${link("Lesen","bible","active")}${link("Entdecken","discover")}${link("Markierungen","marks")}</div><div class="field"><label for="book-search">Buch finden</label><input type="search" id="book-search" data-input="books" placeholder="Zum Beispiel Römer" autocomplete="off"></div><div class="book-columns" id="book-list">${bookList()}</div>`,"bible","bible-page depth-page");
}
function bookList(query = "") {
  return [ui.books.slice(0, 39), ui.books.slice(39)]
    .map(
      (books, i) =>
        `<section><h2 class="overline">${i ? "Neues" : "Altes"} Testament</h2>${books
          .filter((b) =>
            (b.name + " " + b.code).toLowerCase().includes(query.toLowerCase()),
          )
          .map((b) =>
            row(b.name, `${b.chapters} Kapitel`, "chapters/" + b.code),
          )
          .join("")}</section>`,
    )
    .join("");
}
function chapters(code) {
  const b = ui.books.find((b) => b.code === code);
  if (!b) return notFound();
  shell(
    `${back("Bibel", "bible")}${heading("Kapitel wählen", b.name)}<div class="chapter-grid">${Array.from({ length: b.chapters }, (_, i) => link(String(i + 1), readRoute({ book: code, chapter: i + 1 }), "chapter-link")).join("")}</div>`,
    "bible",
  );
}
async function getBook(code, tr) {
  const key = tr + ":" + code;
  if (!ui.cache.has(key))
    ui.cache.set(
      key,
      fetch(`data/bibles/${tr}/${code}.json`)
        .then((r) => {
          if (!r.ok)
            throw new Error(
              "Der Bibeltext konnte nicht geladen werden. Sobald du wieder online bist, versuche es erneut.",
            );
          return r.json();
        })
        .catch((err) => {
          ui.cache.delete(key);
          throw err;
        }),
    );
  return ui.cache.get(key);
}
function contextOf(origin) {
  const [kind, pid, i] = origin.split("/");
  if (kind === "topic") {
    const t = LIFE_TOPICS.find((t) => t.id === pid),
      r = t?.refs[+i];
    if (r)
      return {
        title: t.title,
        context: r.context,
        question: r.question,
        category: t.category,
        origin,
      };
  }
  if (["guide", "plan"].includes(kind)) {
    const p = planInfo(kind, pid),
      d = p?.days[+i];
    if (d) {
      const matching = LIFE_TOPICS.flatMap((t) => t.refs).find(
        (r) =>
          normBook(r.book) === normBook(d[1]) &&
          r.chapter === d[2] &&
          r.from === d[3],
      );
      return {
        title: d[0],
        context:
          kind === "guide"
            ? d[5]
            : matching?.context ||
              "Lies den Abschnitt zunächst im Zusammenhang. Achte darauf, wer spricht und an wen sich der Text richtet.",
        question: d.at(-1),
        origin,
        planId: pid,
        planKind: kind,
        day: +i,
      };
    }
  }
  if (kind === "merged-story") {
    const x=runtimeModel.stories.get(pid);
    if(x)return {title:x.title,context:x.ref,question:x.reflection,storyId:x.story_id,origin};
  }
  if (kind === "story") {
    const x = ui.stories.find((x) => String(x.id) === pid);
    if (x)
      return {
        title: x.title,
        context: x.desc,
        question: x.reflection,
        storyId: x.id,
        origin,
      };
  }
  return null;
}
async function reader(parts, params, token) {
  const [_, code, chapter, tr0] = parts,
    tr = TRANSLATIONS[tr0] ? tr0 : s().translation;
  let ref = validRef(
    {
      book: code,
      chapter: +chapter,
      from: params.has("from") ? +params.get("from") : null,
      to: params.has("to") ? +params.get("to") : null,
      translation: tr,
    },
    ui.refs,
  );
  const b = await getBook(ref.book, tr);
  if (ui.token !== token) return;
  const vs = b.chapters[ref.chapter - 1];
  const origin = params.get("origin") || "",
    ctx = contextOf(origin);
  ui.reader = { ref, book: b, vs, origin, context: ctx };
  ui.selection = new Set();
  if (!store.error)
    try {
      change((d) => {
        d.reading = { ...ref };
        const last = d.events.find((x) => x.kind === "reading");
        if (
          !last ||
          last.ref?.book !== code ||
          last.ref?.chapter !== +chapter ||
          Date.now() - time(last.at) > 86400000
        )
          d.events.unshift({
            id: id(),
            kind: "reading",
            at: now(),
            text: refLabel(ref),
            ref,
            route: readRoute(ref),
          });
      });
    } catch (err) {
      notify(err.message, true);
    }
  shell(
    `<div class="reader-top">${back(origin ? "Zurück" : "Bibel", origin ? origin.split("/").slice(0, 2).join("/") : "bible")}<label class="sr-only" for="translation">Übersetzung</label><select id="translation" data-change="translation">${Object.entries(
      TRANSLATIONS,
    )
      .map(
        ([k, v]) =>
          `<option value="${k}" ${k === tr ? "selected" : ""}>${e(v.label)}</option>`,
      )
      .join(
        "",
      )}</select></div><div class="reader-selectors"><div><label for="reader-book">Buch</label><select id="reader-book" data-change="reader-book">${ui.books.map((x) => `<option value="${x.code}" ${x.code === code ? "selected" : ""}>${e(x.name)}</option>`).join("")}</select></div><div><label for="reader-chapter">Kapitel</label><select id="reader-chapter" data-change="reader-chapter">${b.chapters.map((_, i) => `<option value="${i + 1}" ${i + 1 === +chapter ? "selected" : ""}>${i + 1}</option>`).join("")}</select></div></div>
 ${heading(ctx ? "Lesen & verstehen" : "Bibel", b.name + " " + ref.chapter)}${ctx ? `<aside class="context"><span class="overline">Im Zusammenhang</span><p>${e(ctx.context)}</p><span class="meta">Im Fokus: ${e(refLabel(ref))}. Das ganze Kapitel bleibt lesbar.</span>${ref.from ? button("Zum Abschnitt", "focus-passage", {}, "text-button") : ""}</aside>` : ""}<aside class="reader-reflection-entry" aria-label="Deinen Gedanken festhalten"><span>Etwas bleibt bei dir?</span>${button("Gedanken festhalten", "reflect-reader", {}, "text-button")}</aside><div class="reading-text" id="verses">${vs.map(v => readerVerse(v, ref)).join("")}</div>
 ${readerChapterQuestions(ref, origin)}<div class="chapter-nav">${ref.chapter > 1 ? link("← Vorheriges Kapitel", readRoute({ book: code, chapter: ref.chapter - 1, translation: tr })) : ""}${ref.chapter < b.chapters.length ? link("Nächstes Kapitel →", readRoute({ book: code, chapter: ref.chapter + 1, translation: tr })) : ""}</div>
 <section class="reflection-invite"><span class="overline">Was bleibt bei dir?</span><h2>${e(ctx?.question || "Was berührt dich in diesem Text?")}</h2><p>Ein Satz genügt. Du kannst daraus später einen Weg machen.</p>${button("Meinen Gedanken festhalten", "reflect-reader", {}, "button primary")}</section><small class="translation-credit">${e(TRANSLATIONS[tr].name)} · ${tr === "otb" ? "CC BY-SA 4.0" : "gemeinfrei"} · ${link("Textquelle", "licenses")}</small><div id="selection-bar"></div>`,
    "bible",
    "reader-page",
  );
}
function readerChapterQuestions(ref, origin) {
  const unit = chapterUnit(ui.chapterCatalog, ref.book, ref.chapter);
  if (!unit) return "";
  return `<section class="reader-chapter-questions" data-unit-id="${unit.id}" aria-labelledby="chapter-questions-title"><span class="overline">Kapitel abgeschlossen</span><h2 id="chapter-questions-title">${unit.questions.length} Fragen zu diesem Kapitel</h2><p>Prüfe dein Verständnis des gelesenen Textes.</p>${s().quiz[unit.id]?.done ? '<p class="meta">Fragen zu diesem Kapitel bereits angesehen.</p>' : ""}<div class="chapter-questions-actions">${link("Fragen starten", chapterQuizRoute(unit, readRoute(ref, origin)), "button primary")}${button("Später", "skip-chapter-quiz", {}, "text-button")}</div></section>`;
}
function chapterCollection(bookCode) {
  const code = bookCode ? normBook(bookCode) : "";
  const book = ui.books.find(book => book.code === code);
  const units = code ? ui.chapterCatalog.byBook.get(code) : null;
  if (code && (!book || !units)) return notFound();
  const collectionRow = (title, sub, route, data) => row(title, sub, route).replace('<a ', `<a ${data} `);
  const rows = code ? units.map(unit => collectionRow(`Kapitel ${unit.chapter + 1}`, `${unit.questions.length} Fragen${s().quiz[unit.id]?.done ? " · angesehen" : ""}`, chapterQuizRoute(unit, `chapter-quizzes/${code}`), `data-chapter-unit="${unit.id}"`)).join("") : ui.books.filter(book => ui.chapterCatalog.byBook.has(book.code)).map(book => {
    const units = ui.chapterCatalog.byBook.get(book.code), count = units.reduce((n, unit) => n + unit.questions.length, 0);
    return collectionRow(book.name, `${units.length} Kapitel`, `chapter-quizzes/${book.code}`, `data-chapter-book="${book.code}" data-chapters="${units.length}" data-questions="${count}"`);
  }).join("");
  shell(`${back(code ? "Kapitelfragen" : "Entdecken", code ? "chapter-quizzes" : "discover")}${heading("Kapitelfragen", code ? book.name : "Buch für Buch verstehen.", code ? "Fragen zum gelesenen Kapitel. In deinem Tempo." : "Wähle ein Buch und dann ein Kapitel.")}<div class="chapter-quiz-collection">${rows}</div>`, "bible", "chapter-questions-page depth-page");
}
function chapterQuizComplete(unit, navigation) {
  const amount = unit.questions.length === 5 ? "fünf" : unit.questions.length;
  shell(`${back("Zurück", navigation.backRoute)}<section class="chapter-quiz-complete">${heading("Kapitelfragen abgeschlossen", `Fragen zu ${unit.ref}`, `Du hast die ${amount} Fragen zu ${unit.ref} angesehen.`)}<div class="chapter-questions-actions">${link("Zurück zum Kapitel", navigation.readerRoute, "button primary")}${navigation.nextReaderRoute ? link("Nächstes Kapitel lesen", navigation.nextReaderRoute, "button quiet") : ""}${link("Zur Sammlung", navigation.collectionRoute, "text-link")}</div>${button("Gedanken festhalten", "reflect-story", {id:unit.id}, "text-button")}</section>`, "bible", "chapter-questions-page depth-page");
}
function selection() {
  const a = [...ui.selection].sort((a, b) => a - b);
  if (!a.length) return null;
  if (a.some((n, i) => i && n !== a[i - 1] + 1))
    throw new Error("Bitte wähle zusammenhängende Verse aus.");
  return { ...ui.reader.ref, from: a[0], to: a.at(-1), label: "" };
}
function selectionBar() {
  const container = $("#selection-bar");
  if (!container) return;
  $$(".verse").forEach((el) => {
    el.setAttribute("aria-pressed", String(ui.selection.has(+el.dataset.v)));
  });
  if (ui.selection.size) $(`[data-v="${Math.max(...ui.selection)}"]`)?.after(container);
  container.innerHTML = ui.selection.size
    ? `<div class="selection-bar" role="region" aria-label="Versaktionen"><span>${ui.selection.size} ${ui.selection.size === 1 ? "Vers" : "Verse"} ausgewählt</span><div>${button("Markieren", "mark", {}, "select-action")}${button("Notiz", "reflect-reader", {}, "select-action")}${button("Mit Weg verbinden", "connect-reader", {}, "select-action")}${button("Kopieren", "copy", {}, "select-action")}${button(icon("close") + '<span class="sr-only">Auswahl aufheben</span>', "clear-selection", {}, "icon-button")}</div></div>`
    : "";
}
function currentRef() {
  const ref = selection() || ui.reader.ref;
  return { ...ref, label: refLabel(ref) };
}
function scriptureNote(h, detail = false) {
  const notes = markNotes(h), paths = markPaths(h),context=highlightContext(s(),h);
  return `<article class="scripture-note highlight-${highlightColor(h)}"><div class="note-meta"><span class="color-label">${e(HIGHLIGHT_COLORS[highlightColor(h)])}</span><time>${date(h.at)}</time></div><h2>${link(e(refLabel(h)), readRoute(h,"marks"), "scripture-reference")}</h2><blockquote>${e(h.snippet || "")}</blockquote>${detail ? notes.map(j => `<p class="personal-note">${link(e(j.text), j.route)}</p>`).join("") : ""}${context.paths.length || context.notes.length || context.review ? '<div class="mark-continuity">' : ""}${detail ? paths.map(p=>`<p>Teil von: ${link(e(p.title),"path/"+encodeURIComponent(p.id))}</p>`).join("") : context.paths[0] ? `<p>Teil von: ${link(e(context.paths[0].title),"path/"+encodeURIComponent(context.paths[0].id))}</p>` : ""}${context.notes[0] || context.review ? `<p>${context.notes[0] ? link("Gedanke vorhanden",context.notes[0].route) : ""}${context.notes[0] && context.review ? " · " : ""}${context.review ? link("Später reflektiert",context.review.route) : ""}</p>` : ""}${context.paths.length || context.notes.length || context.review ? "</div>" : ""}${!detail ? '<details class="note-edit"><summary>Stelle bearbeiten</summary>' : ""}<div class="note-actions">${button("Farbe ändern","highlight-color",{id:h.id},"text-button")}${button(notes.length ? "Notiz bearbeiten" : "Notiz hinzufügen","highlight-note",{id:h.id},"text-button")}${button("Mit Weg verbinden","connect-ref",{ref:JSON.stringify(h)},"text-button")}${button("Markierung entfernen","remove-mark",{id:h.id},"text-button danger-text")}</div>${!detail ? "</details>" : ""}${!detail ? link("Stelle ansehen","mark/"+encodeURIComponent(h.id),"text-link") : ""}</article>`;
}
function marks() {
  const all = s().highlights, data = all.filter(h => (!ui.markColor || highlightColor(h) === ui.markColor) && (!ui.markBook || normBook(h.book) === ui.markBook) && (!ui.markContext || (ui.markContext === "note" ? markNotes(h).length : markPaths(h).length)));
  shell(`${heading("Deine Bibel", "Markierungen", "Stellen, die Teil deiner Geschichte geworden sind.")}<div class="segmented">${link("Lesen","bible")}${link("Entdecken","discover")}${link("Markierungen","marks","active")}</div>${all.length ? `<details class="mark-filters" ${ui.markColor || ui.markBook || ui.markContext ? "open" : ""}><summary>Markierungen filtern · ${data.length}</summary>${select("Farbe","mark-color",[["","Alle Farben"],...Object.entries(HIGHLIGHT_COLORS)],ui.markColor).replace('name="mark-color"','name="mark-color" data-change="mark-color"')}${select("Buch","mark-book",[["","Alle Bücher"],...ui.books.filter(b=>all.some(h=>normBook(h.book)===b.code)).map(b=>[b.code,b.name])],ui.markBook).replace('name="mark-book"','name="mark-book" data-change="mark-book"')}${select("Verbindung","mark-context",[["","Alle"],["note","Mit Notiz"],["path","Mit Weg verbunden"]],ui.markContext).replace('name="mark-context"','name="mark-context" data-change="mark-context"')}</details>` : ""}${data.length ? `<div class="scripture-notes">${data.slice().sort((a,b)=>time(b.at)-time(a.at)).map(h=>scriptureNote(h)).join("")}</div>` : empty(all.length ? "Keine Stelle für diesen Filter." : "Was dich anspricht, darf bleiben.",all.length ? "Wähle eine andere Farbe, ein Buch oder eine Verbindung." : "Ein Vers, ein Gedanke, eine persönliche Verbindung.",all.length ? button("Alle Markierungen","reset-mark-filters",{},"button primary") : link("Bibel öffnen","bible","button primary"))}`,"bible","marks-page depth-page");
}
function markDetail(id) {
  const h = s().highlights.find(h=>h.id===id); if (!h) return notFound();
  shell(`${back("Markierungen","marks")}${heading("Deine Bibel",refLabel(h))}${scriptureNote(h,true)}`,"bible","marks-page depth-page");
}
function discover() {
  shell(
    `${heading("Entdecken", "Verstehen, was du liest.", "Geschichten und Fragen, die dich zurück zum Text führen. Ohne Punkte oder Ranglisten.")}<div class="segmented">${link("Lesen", "bible")}${link("Entdecken", "discover", "active")}${link("Markierungen", "marks")}</div><p class="chapter-collection-entry">${link("Kapitelübungen", "chapter-quizzes", "text-link")}</p>${!ui.storySearch && !ui.storyBook && ui.storyKind==="alle" ? `<section class="discover-editorial"><span class="overline">Eine Geschichte zum Anfang</span>${runtimeModel.flow.stories.slice(0,3).map((x,i)=>`<article class="${i ? "editorial-small" : "editorial-lead"}"><h2>${link(e(x.title),"merged-story/"+x.story_id)}</h2><p>${e(x.ref)}</p>${link("Lesen & verstehen","merged-story/"+x.story_id,"text-link")}</article>`).join("")}</section><details class="discover-topics"><summary>Nach einem Thema beginnen</summary>${LIFE_TOPICS.map(t=>row(t.title,t.sub,"topic/"+t.id)).join("")}</details>` : ""}<div class="field"><label for="story-search">Geschichte, Thema oder Bibelstelle suchen</label><input id="story-search" type="search" data-input="stories" value="${e(ui.storySearch)}" placeholder="Zum Beispiel Vergebung"></div><div class="filter-pair"><div class="field"><label for="story-book">Buch</label><select id="story-book" data-change="story-book"><option value="">Alle Bücher</option>${ui.books
      .filter((b) => discoveryItems().some(x=>normBook(x.references?.[0]?.book || x.book)===b.code))
      .map(
        (b) =>
          `<option value="${b.code}" ${ui.storyBook === b.code ? "selected" : ""}>${e(b.name)}</option>`,
      )
      .join(
        "",
      )}</select></div><div class="field"><label for="story-kind">Inhalte</label><select id="story-kind" data-change="story-kind"><option value="alle">Alle Einheiten</option><option value="geschichte" ${ui.storyKind === "geschichte" ? "selected" : ""}>Geschichten</option><option value="kapitel" ${ui.storyKind === "kapitel" ? "selected" : ""}>Kapitelübungen</option></select></div></div><div id="story-results">${storyResults()}</div>${link("So sind die Inhalte geprüft", "content-status")}`,
    "bible", "discover-page depth-page",
  );
}
function quizIndex() {
  shell(`${heading("Quiz", "Verständnisfragen zum Bibeltext.")}<div class="list">${discoveryItems().map(x => row(x.title, `${x.ref} · ${x.flow_items?.length || x.questions.length} Fragen`, x.story_id ? "merged-story/"+x.story_id : "quiz/" + x.id)).join("")}</div>`, "bible");
}
function storyResults() {
  const query=ui.storySearch.toLocaleLowerCase("de-DE");
  const items=discoveryItems().filter(x=>(!ui.storyBook || normBook(x.references?.[0]?.book || x.book)===ui.storyBook) && (ui.storyKind==="alle" || (x.kind==="chapter-quiz") === (ui.storyKind==="kapitel")) && [x.title,x.desc,x.ref,x.reflection].join(" ").toLocaleLowerCase("de-DE").includes(query));
  return items.length ? `<p class="meta" aria-live="polite">${items.length} ${ui.storyKind==="geschichte" ? "Geschichten" : ui.storyKind==="kapitel" ? "Kapitelübungen" : "Einheiten"}</p>${items.map(x=>row(x.title,`${x.ref} · ${x.flow_items?.length || x.questions.length} Fragen`,x.story_id ? "merged-story/"+x.story_id : "story/"+x.id,x.kind==="chapter-quiz" ? "Kapitelübung" : "Geschichte")).join("")}` : empty("Hier haben wir noch keinen Treffer.","Versuche ein anderes Wort oder ein anderes Buch.",button("Alle Einheiten ansehen","reset-discover",{},"button primary"));
}
function statusFor(x) {
  return x.verification?.status === "verse-checked"
    ? "Vorhandener Prüfvermerk: gegen Luther 1912 geprüft"
    : x.kind === "chapter-quiz"
      ? (x.questions.every(q=>runtimeModel.index.question_index.find(row=>row.faithpath_id===q.faithpath_id)?.final_qa_status==="APPROVED") ? "Im finalen Fragen-Prüfkatalog vom 30.09.2026 freigegeben" : "Textbasierte Übung · redaktionell noch zu prüfen")
      : "Bestandsinhalt · Prüfvermerk fehlt";
}
function story(id) {
  const x = ui.stories.find((x) => String(x.id) === id);
  if (!x) return notFound();
  const canonical=canonicalStoryForLegacy(x);
  if(canonical)return mergedStory(canonical.story_id);
  const ref = validRef(
    {
      book: x.book,
      chapter: x.chapter + 1,
      from: x.from,
      to: x.to,
      translation: x.kind === "chapter-quiz" ? "l1912" : s().translation,
      label: x.ref,
    },
    ui.refs,
  );
  shell(
    `${back("Entdecken", "discover")}${heading(x.ref, x.title, x.desc)}<p class="content-note">${e(statusFor(x))}</p>${s().quiz[x.id]?.done ? `<p class="meta">Fragen angesehen am ${date(s().quiz[x.id].done)}.</p>` : ""}<div class="actions">${link("Abschnitt lesen", readRoute(ref, "story/" + x.id), "button primary")}${button("Verständnisfragen", "quiz", { id: x.id }, "button quiet")}</div><section class="reflection-invite"><span class="overline">Deine Reflexion</span><h2>${e(x.reflection)}</h2>${button("Gedanken festhalten", "reflect-story", { id: x.id }, "button primary")}<p class="meta">Deine Reflexion wird nicht bewertet.</p></section>`,
    "bible",
  );
}
function quiz() {
  const { story: x, index, answer, navigation } = ui.quiz,
    q = x.questions[index];
  shell(
    `${back(navigation?.backRoute.startsWith("read/") ? "Zurück zum Kapitel" : navigation?.backRoute.startsWith("chapter-quizzes/") ? "Zur Kapitelliste" : "Zur Geschichte", navigation?.backRoute || "story/" + x.id)}<div class="quiz-head"><span class="overline">${x.kind === "chapter-quiz" ? "Fragen zu diesem Kapitel" : "Verständnisfragen"}</span><span>Frage ${index + 1} von ${x.questions.length}</span></div><h1 class="quiz-title" tabindex="-1" data-question-id="${e(q.faithpath_id)}">${e(q.q)}</h1><p class="meta">${e(x.ref)}${x.kind === "chapter-quiz" ? " · Grundlage: Luther 1912" : ""}</p><div class="answers">${q.a.map((a, i) => `<button type="button" data-action="answer" data-answer="${i}" ${answer != null ? "disabled" : ""} class="answer ${answer != null && i === q.c ? "correct" : answer === i ? "selected-wrong" : ""}"><span>${String.fromCharCode(65 + i)}</span><span>${e(a)}${answer != null && i === q.c ? "<small>Richtige Antwort</small>" : answer === i ? "<small>Deine Antwort</small>" : ""}</span></button>`).join("")}</div>${answer != null ? `<section class="explanation" role="status" tabindex="-1"><strong>${answer === q.c ? "Ja, das steht im Text." : "Schau noch einmal auf den Zusammenhang."}</strong><p>${e(q.x)}</p><span class="meta">${e(q.ref || q.p)}</span></section>${button(index === x.questions.length - 1 ? "Kapitel abschließen" : "Nächste Frage", "next-question", {}, "button primary")}` : ""}`,
    "bible",
  );
}
function paths() {
  const data = s().paths.filter((p) => !!p.archived === ui.archive);
  shell(
    `${heading("Mein Weg", "Was dich über Zeit begleitet.", "Bibelstellen, Gedanken und kleine Schritte. Deine Geschichte bleibt zusammen.")}<div class="actions">${data.length ? button("Weg beginnen", "new-path", {}, "button primary") : ""}${button(ui.archive ? "Aktive Wege" : "Archiv", "toggle-archive", {}, "button quiet")}</div>${data.length ? `<div class="path-list">${data.map((p, i) => `<article><span class="path-index">${icon("leaf")}</span><div>${link(e(p.title), "path/" + encodeURIComponent(p.id), "path-title")}<p>${e(p.why || category(p.category).label)}</p><small>Seit ${date(p.started)}${p.milestones.length ? " · Entwicklung festgehalten" : ""}</small></div></article>`).join("")}</div>` : empty(ui.archive ? "Noch keine archivierten Wege." : "Dein Weg darf klein anfangen.", ui.archive ? "Ruhende Wege behalten ihre ganze Geschichte." : "Vielleicht möchtest du geduldiger zuhören oder einer offenen Frage Raum geben.", ui.archive ? button("Aktive Wege ansehen", "toggle-archive", {}, "button primary") : button("Deinen Weg beginnen", "new-path", {}, "button primary"))}<section class="section">${row("Dein Olivenbaum", "Die Entwicklung, die du selbst festgehalten hast.", "tree")}${row("Geführte Wege", "Eine ruhige Begleitung für deinen Anfang.", "plans")}${row("Deine ganze Geschichte", "Bibelstellen, Gedanken und Entwicklungen.", "history")}</section>`,
    "paths",
    "paths-page depth-page",
  );
}
function path(pid) {
  const p=s().paths.find(p=>p.id===pid);if(!p)return notFound();
  const entries=timeline(s(),pid), open=p.steps.filter(x=>!x.done), thoughts=s().journal.filter(j=>j.pathIds?.includes(pid)).slice().sort((a,b)=>time(b.date)-time(a.date));
  const renderToken=ui.token;
  shell(`${back("Meine Wege","paths")}<div class="path-titlebar">${heading(category(p.category).label,p.title,p.why)}<details class="path-options"><summary aria-label="Weg verwalten">${icon("more")}<span class="sr-only">Weg verwalten</span></summary><div class="path-context">${button("Weg bearbeiten","edit-path",{id:pid},"text-button")}${button(p.archived ? "Weg wieder aufnehmen" : "Archivieren","archive-path",{id:pid},"text-button")}${button("Weg löschen","delete-path",{id:pid},"text-button danger-text")}</div></details></div><p class="meta">Begonnen am ${date(p.started)}${p.archived ? " · archiviert" : ""}</p>
  <section class="next-step"><div class="section-heading"><span class="overline">Als Nächstes</span>${open.length ? button(icon("plus")+'<span class="sr-only">Schritt hinzufügen</span>',"step",{id:pid},"icon-button") : ""}</div>${open.length ? open.slice(0,1).map((x,i)=>`<div class="path-step ${i===0 ? "current-path-step" : ""}"><label class="step-row"><input type="checkbox" data-change="step-done" data-path="${e(pid)}" data-id="${e(x.id)}"><span>${e(x.text)}</span></label><div class="step-actions">${button("Bearbeiten","edit-step",{path:pid,id:x.id},"text-button")}${i ? button("Als Nächstes","current-step",{path:pid,id:x.id},"text-button") : ""}</div></div>`).join("") : `<h2>Ein kleiner nächster Schritt</h2><p>Was könntest du im Alltag ausprobieren?</p>${button("Schritt hinzufügen","step",{id:pid},"text-button")}`}<small>Ein ausprobierter Schritt ist noch keine bestätigte Entwicklung.</small></section>
  ${pathContext(s(),pid)?.step && pathContext(s(),pid)?.reference ? `<p class="step-reference meta">Zu diesem Weg: ${link(e(refLabel(pathContext(s(),pid).reference)),readRoute(pathContext(s(),pid).reference))}</p>` : ""}
  <div class="actions path-main-actions">${button("Gedanken festhalten","reflect-path",{id:pid},"button primary")}${button("Zurückblicken","review-path",{id:pid},"text-button")}</div>
  ${pathContinuityHTML(pid)}
  ${open.length>1 ? `<section class="further-steps section"><h2>Weitere Schritte</h2>${open.slice(1).map(x=>`<div class="path-step"><label class="step-row"><input type="checkbox" data-change="step-done" data-path="${e(pid)}" data-id="${e(x.id)}"><span>${e(x.text)}</span></label><div class="step-actions">${button("Bearbeiten","edit-step",{path:pid,id:x.id},"text-button")}${button("Als Nächstes","current-step",{path:pid,id:x.id},"text-button")}</div></div>`).join("")}</section>` : ""}
  ${thoughts.length > 1 ? `<section class="path-thoughts section"><span class="overline">Was dich begleitet</span><h2>Frühere Gedanken</h2>${thoughts.slice(1,3).map(j=>`<blockquote>${link(e(j.text),"entry/"+encodeURIComponent(j.id))}<small>${date(j.date)}</small></blockquote>`).join("")}</section>` : ""}
  ${p.links.some(l=>l.ref) ? `<section class="path-scriptures section"><h2>Bibelstellen auf deinem Weg</h2>${p.links.filter(l=>l.ref).map(l=>{const h=s().highlights.find(h=>overlapsRef(h,l.ref)),j=s().journal.find(j=>j.ref && overlapsRef(j.ref,l.ref) && j.pathIds?.includes(pid));return `<article>${link(e(l.label || refLabel(l.ref)),readRoute(l.ref),"scripture-reference")}<blockquote data-path-quote="${e(JSON.stringify(l.ref))}">${e(h?.snippet || "")}</blockquote>${j ? `<span class="overline">Warum diese Stelle dazugehört</span><p>${e(j.text)}</p>` : ""}</article>`;}).join("")}</section>` : ""}
  ${p.steps.some(x=>x.done) ? `<details class="past-steps section"><summary>Ausprobierte Schritte (${p.steps.filter(x=>x.done).length})</summary>${p.steps.filter(x=>x.done).map(x=>`<label class="step-row"><input type="checkbox" checked data-change="step-done" data-path="${e(pid)}" data-id="${e(x.id)}"><span>${e(x.text)}</span></label>`).join("")}</details>` : ""}
  <section class="section path-story"><span class="overline">Von damals bis heute</span><h2>Die Geschichte dieses Weges</h2>${timelineHTML(entries,ui.historyLimit)}${entries.length>ui.historyLimit ? button("Weitere Momente","more-history",{path:pid},"button quiet") : ""}</section>`,"paths","path-page depth-page");
  for (const quote of $$("[data-path-quote]")) {
    if (quote.textContent) continue;
    const ref=JSON.parse(quote.dataset.pathQuote);
    getBook(normBook(ref.book),ref.translation || s().translation).then(book=>{
      if(ui.token!==renderToken || !quote.isConnected)return;
      const words=book.chapters[+ref.chapter-1].filter(v=>!ref.from || (v[0]>=ref.from && v[0]<=(ref.to || ref.from))).slice(0,3).map(v=>v[1]).join(" ");
      quote.textContent=words.length>340 ? words.slice(0,340)+" …" : words;
    }).catch(()=>{ if(quote.isConnected)quote.remove(); });
  }
}
function tree() {
  const lvl = treeLevel(s());
  shell(
    `${back("Mein Weg", "paths")}${heading("Dein Olivenbaum", stageNames[lvl], "Dieses Bild steht für Entwicklung, die du selbst dokumentiert hast. Es sagt nichts darüber aus, wie gut dein Glaube ist.")}<figure class="tree-figure"><img src="trees/tree-stage-${lvl + 1}.webp" alt="${e(stageNames[lvl])}" width="700" height="700"><figcaption>Ruhende Wege und schwierige Zeiten nehmen deiner Geschichte nichts weg.</figcaption></figure><section class="section"><h2>Was hinter dem Baum steht</h2>${timelineHTML(timeline(s()).filter((x) => x.kind === "Entwicklung festgehalten")) || "<p>Wenn du später selbst eine Entwicklung bestätigst, wird sie hier sichtbar.</p>"}<details><summary>Wie sich das Bild verändert</summary><p>Die sieben vorhandenen Bilder folgen der Anzahl deiner festgehaltenen Entwicklungen: 0, 1, 2, 3–4, 5–6, 7–9 und ab 10. Das ist eine symbolische Darstellung, keine Messung deines Glaubens. Einzelne Äste sind noch nicht bestimmten Wegen zugeordnet.</p></details></section>`,
    "paths",
  );
}
function journal() {
  const hasEntries = s().journal.length > 0;
  const existingCategories=[...new Set(s().journal.map(j=>j.subtype||j.type).filter(x=>x&&x!=="Journal"))];
  const filters=["Alle",...existingCategories,...(s().journal.some(j=>j.type === "Journal")&&!existingCategories.includes("Gedanken")?["Gedanken"]:[]),...(s().journal.some(j=>j.pathIds?.some(id=>s().paths.some(p=>p.id===id)))?["Mit Weg"]:[]),...(s().journal.some(j=>j.ref)?["Mit Bibelstelle"]:[])];
  shell(`<div class="heading-with-action">${heading("Journal", "Festhalten, was bleibt.", "Deine Gedanken dürfen sich verändern. Hier kannst du zu ihnen zurückkehren.")}${hasEntries ? button(icon("plus") + '<span class="sr-only">Neuer Eintrag</span>', "new-entry", {}, "icon-button") : ""}</div>${hasEntries ? `<div class="journal-tools"><details ${ui.search ? "open" : ""}><summary>${icon("search")}Suchen</summary><div class="field"><label for="journal-search">In deinen Einträgen suchen</label><input id="journal-search" type="search" data-input="journal" placeholder="Gedanke oder Bibelstelle" value="${e(ui.search)}"></div></details><details ${ui.filter !== "Alle" ? "open" : ""}><summary>Filter${ui.filter !== "Alle" ? " · "+e(ui.filter) : ""}</summary><div class="filters" aria-label="Einträge filtern">${filters.map(f=>button(e(f),"journal-filter",{filter:f},"filter "+(ui.filter===f?"active":""))).join("")}</div></details></div>` : ""}<div id="journal-results">${journalResults()}</div>`,"journal", "journal-page depth-page editorial-page");
}
function journalResults() {
  const items=s().journal.filter(j=>(ui.filter === "Alle" || [j.type,j.subtype].includes(ui.filter) || (ui.filter === "Gedanken" && j.type === "Journal") || (ui.filter === "Mit Weg" && j.pathIds?.some(id=>s().paths.some(p=>p.id===id))) || (ui.filter === "Mit Bibelstelle" && j.ref)) && journalMatches(j,ui.search,ui.books,s().paths)).sort((a,b)=>(time(b.date)||0)-(time(a.date)||0));
  if(!items.length)return empty(s().journal.length ? "Kein passender Eintrag." : "Was möchtest du festhalten?",s().journal.length ? "Versuche einen anderen Suchbegriff oder wähle einen anderen Filter." : "Ein Satz, eine offene Frage oder etwas, das dich berührt hat. Hier bleibt es Teil deiner Geschichte.",button("Gedanken festhalten","new-entry",{},"button primary"));
  const months=new Map();for(const j of items.slice(0,ui.journalLimit)){const month=time(j.date)==null ? "Datum unbekannt" : new Date(j.date).toLocaleDateString("de-DE",{month:"long",year:"numeric"});if(!months.has(month))months.set(month,[]);months.get(month).push(j);}
  return `<p class="meta journal-result-count" aria-live="polite">${items.length} Einträge</p><div class="journal-pages">${[...months].map(([month,entries])=>`<section class="journal-month"><h2 class="overline">${e(month)}</h2>${entries.map(j=>{const paths=(j.pathIds||[]).map(id=>s().paths.find(p=>p.id===id)).filter(Boolean);return `<article class="journal-page-entry"><time>${time(j.date)==null?"Datum unbekannt":new Date(j.date).toLocaleDateString("de-DE",{day:"numeric",month:"long"})}</time><span class="overline">${e(j.subtype||j.type||"Gedanke")}</span><h3>${link(e(j.text.length>220?j.text.slice(0,217)+"…":j.text),"entry/"+encodeURIComponent(j.id))}</h3><div class="journal-context">${paths.length ? link("Mit Weg „"+e(paths[0].title)+"“ verbunden","path/"+encodeURIComponent(paths[0].id),"context-label") : ""}${j.ref ? link(e(refLabel(j.ref)),readRoute(j.ref),"context-label") : ""}</div></article>`;}).join("")}</section>`).join("")}</div>${items.length>ui.journalLimit?button("Weitere Einträge","more-journal",{},"button quiet"):""}`;
}
function entry(id, kind = "entry") {
  const x=(kind === "reflection"?s().reflections:kind === "review"?allReviews(s()):s().journal).find(j=>j.id===id);if(!x)return notFound();
  const later=reviewsFor(s(),x,kind === "reflection"?"reflection":"journal")[0],previous=ui.continuitySaved===x.id?previousThought(s(),x):null;
  shell(`${back("Journal","journal")}<header class="entry-heading"><div><span class="overline">${e(x.subtype||x.type||(kind === "review"?"Rückblick":"Reflexion"))}</span><h1 tabindex="-1">${date(x.date)}</h1></div>${kind === "entry" ? `<details class="entry-options"><summary aria-label="Journaleintrag verwalten">${icon("more")}<span class="sr-only">Journaleintrag verwalten</span></summary><div class="entry-context-menu">${button("Bearbeiten","edit-entry",{id},"text-button")}${button("Weg verbinden / ändern","journal-path",{id},"text-button")}${isBibleNote(x)?button("Notiz löschen","delete-note",{id,kind:"journal"},"text-button danger-text"):""}${button("Journaleintrag löschen","delete-journal",{id},"text-button danger-text")}</div></details>` : ""}</header><div class="entry-text preserve">${e(x.text)}</div><div class="entry-connections">${(x.pathIds||[]).map(pid=>{const p=s().paths.find(p=>p.id===pid);return p?`<p>Teil deines Weges: ${link(e(p.title),"path/"+encodeURIComponent(pid))}</p>`:"";}).join("")}${x.ref?`<p>Verbunden mit ${link(e(refLabel(x.ref)),readRoute(x.ref,"journal"))}</p>`:""}${later?`<p>Später darauf zurückgeblickt · ${link("Rückblick ansehen",later.route)}</p>`:""}</div>${previous?`<aside class="continuity-strip previous-thought-prompt"><p>Dazu hast du schon einmal etwas festgehalten.</p>${link("Früheren Gedanken ansehen",previous.route,"text-link")}</aside>`:""}${kind === "reflection"&&isBibleNote(x)?button("Notiz bearbeiten","edit-note",{id,kind:"reflection"},"button quiet"):""}${kind === "reflection"&&isBibleNote(x)?`<div class="note-delete-row">${button("Notiz löschen","delete-note",{id,kind:"reflection"},"text-button danger-text")}</div>`:""}`,"journal","journal-detail editorial-page");
}
function storyTimeline(items,limit) {
  const groups=new Map();for(const x of items.slice(0,limit)) {const d=new Date(x.at),key=d.toLocaleDateString("de-DE",{month:"long",year:"numeric"});if(!groups.has(key))groups.set(key,[]);groups.get(key).push(x);}
  return [...groups].map(([month,moments])=>`<section class="story-month"><h2 class="overline">${e(month)}</h2>${timelineHTML(moments,limit)}</section>`).join("");
}
function reflectionPairs() {
  return reviewPairs(s()).slice(0,2).map(continuityPairHTML).join("");
}
function history() {
  const items = timeline(s());
  shell(
    `${back("Heute", "today")}${heading("Deine Glaubensgeschichte", "Damals wichtig. Heute Teil von dir.", "Bibelstellen, Gedanken, Wege und Rückblicke — in ihrem Zusammenhang.")}<div class="segmented">${link("Meine Geschichte", "history", "active")}${link("Offene Rückblicke", "reviews")}</div>${reflectionPairs()}${items.length ? storyTimeline(items, ui.historyLimit) : empty("Deine Geschichte beginnt mit einem Moment.", "Wenn du einen Gedanken oder eine Entwicklung festhältst, findest du ihn hier wieder.", link("Einen Anfang finden", "guidance", "button primary"))}${items.length > ui.historyLimit ? button("Weitere Momente", "more-history", {}, "button quiet") : ""}`,
    "paths", "history-page depth-page",
  );
}
function reviews() {
  const pending = gaps(s()),completed=allReviews(s()),pairs=reviewPairs(s()).filter(p=>p.review);
  shell(
    `${back("Heute", "today")}${heading("Rückblicke", "Was ist daraus geworden?", "Du musst nichts nachholen. Vielleicht möchtest du einen früheren Gedanken noch einmal ansehen.")}<div class="segmented">${link("Meine Geschichte", "history")}${link("Offene Rückblicke", "reviews", "active")}</div>${completed.length ? `<section class="completed-reviews" aria-label="Deine Rückblicke">${completed.slice(0,5).map(r=>{const pair=pairs.find(p=>p.review.id===r.id);return pair ? continuityPairHTML(pair) : `<article class="continuity-strip"><span class="meta">${date(r.date)}</span><blockquote>${e(r.text)}</blockquote>${link("Rückblick öffnen",r.route,"text-link")}</article>`;}).join("")}</section>` : ""}${pending.length ? pending.map((g) => `<article class="review-row"><span class="overline">${date(g.at)} · vor ${g.age} Tagen</span><h2>${e(g.title)}</h2><p class="clamp">${e(g.detail)}</p>${button("Rückblick beginnen", "gap", { key: g.key }, "text-button")}</article>`).join("") : completed.length ? `<p class="meta">Gerade ist kein weiterer Rückblick offen.</p>` : empty("Gerade ist nichts offen.", "Wenn ein Gedanke etwas zurückliegt, findest du hier eine Einladung zum Zurückblicken.", link("Meine Wege", "paths", "button primary"))}<p class="meta">Erinnerungen erscheinen beim Öffnen der App. Es werden keine Push-Nachrichten verschickt.</p>`,
    "paths", "reviews-page depth-page",
  );
}
function more() {
  const section=new URLSearchParams(location.hash.split("?")[1]||"").get("section");
  if(section === "data")return shell(`${back("Mehr","more")}${heading("Einstellungen & Daten","Daten & Backup")}<section class="section"><h2>Deine Daten sichern</h2><p>Deine FaithPath-Daten bleiben auf diesem Gerät. Es gibt keine automatische Gerätesynchronisation. Exportiere regelmäßig ein Backup, wenn du deine Einträge zusätzlich sichern möchtest. Ein Import stellt den Stand der Backup-Datei wieder her und ersetzt die aktuell angezeigten Daten.</p><div class="actions">${button("Backup exportieren", "export", {}, "button primary")}${button("Backup importieren", "import", {}, "button quiet")}</div><input id="import-file" type="file" accept=".json,application/json" hidden>${!store.error && deviceStorage.getItem(KEYS.restore) ? button("Stand vor dem letzten Import wiederherstellen", "undo-import", {}, "text-button") : ""}</section>`,"more","settings-page utility-page");
  if(section === "settings")return shell(`${back("Mehr","more")}${heading("Einstellungen & Daten","Einstellungen")}<section class="section"><h2>Offline & auf dem iPhone</h2><p id="offline-state" role="status">${ui.offline ? "Beide Bibeln und die App sind für dieses Gerät offline bereit." : "Offline-Vorbereitung läuft, solange diese Seite online geöffnet ist."}</p>${button("Offline-Status prüfen", "offline-check", {}, "text-button")}<p>Auf dem iPhone: In Safari „Teilen“ öffnen, dann „Zum Home-Bildschirm“ wählen. Zum ersten Einrichten online bleiben, bis oben „offline bereit“ steht.</p></section><section class="section"><h2>Privat auf deinem Gerät</h2><p>Keine Werbung, keine Tracking-SDKs, kein KI-Chat. Persönliche Texte werden nicht an FaithPath übertragen. Sie sind lokal gespeichert und nicht zusätzlich verschlüsselt. Der Hosting-Anbieter verarbeitet beim Laden technische Verbindungsdaten.</p>${link("Bibeltexte & Lizenzen", "licenses")}${button("Einführung ansehen", "onboard", {}, "text-button")}</section><div class="list">${row("Bibeltexte & Lizenzen","","licenses")}${row("Inhalte & Prüfstatus","","content-status")}</div><small class="build-id">FaithPath V4 · ${BUILD}</small>`,"more","settings-page utility-page");
  const menuRow=(title,desc,route,ic="arrow",featured=false)=>link(`${icon(ic)}<span><strong>${e(title)}</strong>${desc?`<small>${e(desc)}</small>`:""}</span>${icon("arrow")}`,route,"more-row"+(featured?" more-featured":""));
  shell(`${heading("Mehr","Raum für deine Geschichte.")}<section class="more-group" aria-labelledby="more-personal"><h2 id="more-personal" class="overline">Persönlich</h2>${menuRow("Meine Geschichte","Dein persönlicher Weg im Verlauf.","history","leaf",true)}${menuRow("Rückblicke","Auf frühere Gedanken zurückschauen.","reviews","history")}${menuRow("Markierungen","Deine gespeicherten Bibelstellen.","marks","book")}</section><section class="more-group" aria-labelledby="more-discover"><h2 id="more-discover" class="overline">Entdecken</h2>${menuRow("Was beschäftigt dich?","","guidance","leaf")}${menuRow("Geführte Wege","Eine ruhige Begleitung.","plans","path")}${menuRow("Entdecken & Quiz","Geschichten, Kapitel und Verständnisfragen.","discover","book")}</section><section class="more-group utility-group" aria-labelledby="more-utility"><h2 id="more-utility" class="overline">Einstellungen & Daten</h2>${menuRow("Einstellungen","","more?section=settings","more")}${menuRow("Daten & Backup","","more?section=data","lock")}</section>`,"more","more-page");
}
function contentStatus() {
  shell(`${back("Mehr","more")}${heading("Transparent bleiben","Inhalte & Prüfstatus","Ein technischer Referenztest ist keine theologische Qualitätsprüfung.")}<dl class="status-list"><div><dt>Bibeltexte offline</dt><dd>OTB Deutsch und Luther 1912, je 66 Bücher.</dd></div><div><dt>Geschichten</dt><dd>436 gemeinsame Geschichten · 2.314 Nachlese-Fragen und 260 FaithPath-Storyfragen · 2.479 Fragen im geprüften gemeinsamen Ablauf.</dd></div><div><dt>Kapitelübungen</dt><dd>260 Kapitelübungen / 1.300 Fragen bleiben ein eigener Bestand.</dd></div><div><dt>Dokumentierte Freigabe</dt><dd>Der finale FaithPath-Fragen-Prüfkatalog vom 30.09.2026 gibt FP-0001 bis FP-1560 frei: 1.560 von 1.560 Fragen, keine offenen Prüffälle. Geprüft wurden Bibelstelle, Aussage, Antwortoptionen, richtige Antwort, Textqualität und Dubletten.</dd></div><div><dt>Umfang des Nachweises</dt><dd>Die vorhandene Katalogfreigabe wird übernommen. Dieser Build enthält keine neue redaktionelle oder theologische Prüfung.</dd></div><div><dt>Gemeinsamer Ablauf</dt><dd>Die bestehende geprüfte Zuordnung und Dublettenregel bleiben unverändert. Nachlese-Antworten bleiben Antworten zum Aufdecken; FaithPath-Fragen behalten ihre Antwortauswahl.</dd></div></dl>`,"more");
}
function licenses() {
  shell(
    `${back("Mehr", "more")}${heading("Textquellen", "Bibeltexte & Lizenzen")}<section class="section"><h2>Open Translation Bible Deutsch</h2><p>Quelle: OpenTranslationBible / open-bible. Creative Commons Attribution-ShareAlike 4.0 International. Der mitgelieferte Text bleibt unverändert.</p><a href="https://github.com/OpenTranslationBible/open-bible">Quellprojekt</a> · <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a></section><section class="section"><h2>Lutherbibel 1912</h2><p>Gemeinfreier Text. Im Ausgangsprojekt von eBible.org (deu1912) bezogen. Unverändert erhalten.</p><a href="https://ebible.org/deu1912/">Textquelle</a></section>`,
    "more",
  );
}
function notFound() {
  shell(
    `${heading("Nicht gefunden", "Dieser Moment ist nicht verfügbar.", "Vielleicht wurde der Eintrag entfernt oder die Adresse ist unvollständig.")}${link("Zur Startseite", "today", "button primary")}`,
  );
}

const input = (label, name, value = "", placeholder = "", type = "text") =>
  `<div class="field"><label for="f-${name}">${e(label)}</label><input id="f-${name}" name="${name}" type="${type}" value="${e(value)}" placeholder="${e(placeholder)}"></div>`;
const textarea = (label, name, value = "", placeholder = "") =>
  `<div class="field"><label for="f-${name}">${e(label)}</label><textarea id="f-${name}" name="${name}" rows="5" placeholder="${e(placeholder)}">${e(value)}</textarea></div>`;
const select = (label, name, opts, value = "") =>
  `<div class="field"><label for="f-${name}">${e(label)}</label><select id="f-${name}" name="${name}">${opts.map(([v, t]) => `<option value="${e(v)}" ${String(v) === String(value) ? "selected" : ""}>${e(t)}</option>`).join("")}</select></div>`;
const pathOptions = () => [
  ["", "Noch keinem Weg zuordnen"],
  ...s()
    .paths.filter((p) => !p.archived)
    .map((p) => [p.id, p.title]),
];
function modal(title, content, form = null, values = null) {
  const d = $("#dialog");
  d.classList.toggle("core-dialog", ["path", "step", "note", "entry"].includes(form?.type) || ["Markierung gestalten", "Markierung entfernen?", "Weg wirklich löschen?", "Notiz wirklich löschen?"].includes(title));
  ui.dialogRoute = location.hash.slice(1);
  ui.form = form;
  d.innerHTML = `<div class="dialog-top"><h2 id="dialog-title" aria-label="${e(title)}">${e(title).replace("Journaleintrag", "Journal<wbr>eintrag")}</h2>${button(icon("close") + '<span class="sr-only">Schließen</span>', "close", {}, "icon-button")}</div>${content}`;
  if (values)
    for (const [k, v] of Object.entries(values)) {
      const el = d.querySelector(`[name="${CSS.escape(k)}"]`);
      if (el) {
        if (el.type === "checkbox") el.checked = !!v;
        else el.value = v;
      }
    }
  if (!d.open) d.showModal();
  d.style.scrollPaddingTop=($(".dialog-top",d).getBoundingClientRect().height+32)+"px";
  document.body.classList.add("modal-open");
  // Focus once while opening; a later timer must not override keyboard navigation.
  ($("input:not([type=checkbox]),textarea,select",d) || $(".color-choice[tabindex=\"0\"]",d) || $("button",d))?.focus();
}
function finishForm() {
  try {
    localStorage.removeItem(KEYS.draft);
  } catch {}
  ui.form = null;
  $("#dialog").close();
  document.body.classList.remove("modal-open");
}
function closeModal() {
  const journalFocus=ui.journalDeletion;
  ui.noteDeletion=null;
  ui.journalDeletion=null;
  ui.form = null;
  $("#dialog").close();
  document.body.classList.remove("modal-open");
  if(journalFocus)$(".entry-options summary")?.focus();
}
function snapshotForm() {
  const values = {};
  for (const el of $$("#dialog [name]"))
    values[el.name] = el.type === "checkbox" ? el.checked : el.value;
  return values;
}
function persistDraft() {
  if (!ui.form) return;
  try {
    if(journalRecoveryError||localStorage.getItem(JOURNAL_WRITE_KEY))throw new Error("Journal-Speichervorgang noch offen");
    localStorage.setItem(
      KEYS.draft,
      JSON.stringify({ ...ui.form, values: snapshotForm(), saved: now() }),
    );
  } catch {
    notify("Dein Entwurf kann gerade nicht zwischengespeichert werden.", true);
  }
}
function openForm(type, args = {}, restored = null) {
  let title = "",
    body = "",
    cta = "Speichern",
    values = {};
  if(type === "journal-path") {
    const old=s().journal.find(j=>j.id===args.id);if(!old)throw new Error("Dieser Eintrag ist nicht mehr vorhanden.");
    title="Weg verbinden / ändern";body=`<p class="meta">Die ausgewählte Zuordnung ersetzt die bisherigen Wegzuordnungen dieses Eintrags. Bibelstellen auf deinen Wegen bleiben erhalten.</p>`+select("Persönlicher Weg","pathId",[["","Noch keinem Weg zuordnen"],...s().paths.map(p=>[p.id,p.title+(p.archived?" · archiviert":"")])],old.pathIds?.[0]||"");
  }
  if(type === "note") {
    const old=s().reflections.find(x=>x.id===args.id);if(!isBibleNote(old))throw new Error("Diese Bibelnotiz ist nicht mehr vorhanden.");
    title="Notiz bearbeiten";body=`<p class="meta">${e(refLabel(old.ref))}</p>${textarea("Dein Gedanke","text",old.text)}`;
  }
  if (type === "entry") {
    const old = args.id ? s().journal.find((j) => j.id === args.id) : null;
    values = {
      text: old?.text || "",
      kind: old?.subtype || old?.type || args.kind || "Gedanken",
      pathId: old?.pathIds?.[0] || args.pathId || "",
    };
    title = old
      ? "Gedanken bearbeiten"
      : args.ref
        ? "Was bleibt dir?"
        : "Einen Moment festhalten";
    body = `${args.ref ? `<p class="meta">${e(refLabel(args.ref))}</p>` : ""}${args.question ? `<p class="writing-prompt">${e(args.question)}</p>` : ""}${textarea("Dein Gedanke", "text", values.text, "Ein Satz kann ein Anfang sein …")}${select(
      "Art des Eintrags",
      "kind",
      [
        "Gedanken",
        "Bibel",
        "Reflexion",
        "Predigt",
        "Gebet",
        "Dankbarkeit",
        "Ziele",
      ].map((x) => [x, x]),
      values.kind,
    )}${select("Persönlicher Weg (optional)", "pathId", pathOptions(), values.pathId)}${args.planId ? `<label class="checkbox-row"><input type="checkbox" name="planDone" checked> Diesen Abschnitt als festgehalten markieren</label>` : ""}`;
    cta = "Gedanken speichern";
  } else if (type === "path") {
    const old = args.id ? s().paths.find((p) => p.id === args.id) : null;
    title = old ? "Deinen Weg bearbeiten" : "Ein persönlicher Weg";
    body = `<p>Woran möchtest du dranbleiben? Ein Thema, das dich wirklich beschäftigt.</p>${input("Name deines Weges", "title", old?.title || args.title || "", "Zum Beispiel: In Ruhe zuhören")}${select(
      "Bereich",
      "category",
      PATH_CATEGORIES.map((c) => [c.id, c.label]),
      old?.category || args.category || "sonstiges",
    )}${textarea("Warum ist dir das wichtig? (optional)", "why", old?.why || "")}${
      !old
        ? `${input("Ein kleiner Schritt (optional)", "step", "", "Zum Beispiel: Im nächsten Gespräch ausreden lassen")}${select(
            "Zum ersten Rückblick einladen",
            "days",
            [
              ["7", "In einer Woche"],
              ["21", "In drei Wochen"],
              ["42", "In sechs Wochen"],
            ],
            "21",
          )}`
        : ""
    }${old?.steps.find(x=>!x.done) ? textarea("Offener nächster Schritt", "currentStep", old.steps.find(x=>!x.done).text) : ""}`;
    cta = old ? "Änderungen speichern" : "Weg beginnen";
  } else if (type === "step") {
    const p = s().paths.find((p) => p.id === args.pathId);
    if (!p) return;
    const oldStep = args.stepId ? p.steps.find(x=>x.id===args.stepId && !x.done) : null;
    if (args.stepId && !oldStep) throw new Error("Bereits ausprobierte Schritte werden nicht überschrieben.");
    title = oldStep ? "Schritt bearbeiten" : "Ein kleiner nächster Schritt";
    const suggestions = category(p.category).steps.filter(
      (t) => !p.steps.some((x) => x.text === t),
    );
    body = `<p>Was wäre für „${e(p.title)}“ gerade machbar?</p>${suggestions.length ? `<details><summary>Ein paar Anregungen</summary><div class="suggestions">${suggestions.map((text) => button(e(text), "use-suggestion", { text }, "suggestion")).join("")}</div></details>` : ""}${textarea("Dein Schritt", "text", oldStep?.text || "", "Beschreibe eine konkrete, kleine Handlung.")}<p class="meta">Du probierst etwas aus. Ob daraus Entwicklung entsteht, hältst du später selbst fest.</p>`;
    cta = oldStep ? "Änderungen speichern" : "Schritt festhalten";
  } else if (type === "review") {
    const g = args.gap,
      p = args.pathId ? s().paths.find((p) => p.id === args.pathId) : null;
    title = "Was ist daraus geworden?";
    body = `<p class="writing-prompt">${e(g?.title || p?.title || "Dein früherer Gedanke")}</p>${g ? `<blockquote class="previous-thought">${e(g.detail)}</blockquote><p class="meta">Festgehalten am ${date(g.at)}.</p>` : ""}${select(
      "Wo stehst du gerade?",
      "status",
      [
        ["thought", "Ich möchte einen Gedanken festhalten"],
        ["changed", "Etwas hat sich verändert"],
        ["working", "Ich arbeite noch daran"],
        ["unchanged", "Es hat sich nichts verändert"],
        ["notnow", "Im Moment nicht"],
      ],
      "thought",
    )}${textarea("Was möchtest du dazu festhalten?", "text", "", "Was war damals — und wie siehst du es heute?")}<label class="checkbox-row" id="confirm-development" hidden><input type="checkbox" name="development"> Das ist für mich eine echte Entwicklung.</label>${select(
      "Wann möchtest du wieder hinsehen?",
      "days",
      [
        ["0", "Vorerst nicht erinnern"],
        ["14", "In zwei Wochen"],
        ["42", "In sechs Wochen"],
      ],
      "0",
    )}<p class="meta">Alles darf so sein, wie es gerade ist. Dein bisheriger Weg bleibt bestehen.</p>`;
    cta = "Rückblick speichern";
  }
  if (!body) return;
  const existingNote=type === "entry" ? s().journal.find(x=>x.id===args.id) : type === "note" ? s().reflections.find(x=>x.id===args.id) : null;
  const deletion=isBibleNote(existingNote) ? `<div class="note-delete-row">${button("Notiz löschen","delete-note",{id:args.id,kind:type === "note" ? "reflection" : "journal"},"text-button danger-text")}</div>` : "";
  modal(
    title,
    `<form id="editor-form"><div id="form-error" role="alert" tabindex="-1"></div>${body}<button class="button primary full" type="submit">${cta}</button>${deletion}</form>`,
    { type, args },
    restored,
  );
  if (type === "review") updateDevelopment();
}
function updateDevelopment() {
  const wrap = $("#confirm-development");
  if (wrap) {
    wrap.hidden = $("[name=status]", $("#dialog"))?.value !== "changed";
    if (wrap.hidden) $("[name=development]", $("#dialog")).checked = false;
  }
}
function connectSheet(args) {
  const ps = s().paths.filter((p) => !p.archived);
  modal(
    "Soll daraus ein Weg werden?",
    `<p>Verbinde diesen Gedanken mit etwas, das dich weiter begleitet.</p><div class="list">${ps.map((p) => button(`<span><strong>${e(p.title)}</strong></span>${icon("arrow")}`, "attach", { path: p.id, args: JSON.stringify(args) }, "list-row")).join("")}</div>${button("Einen neuen Weg beginnen", "path-from", { args: JSON.stringify(args) }, "button primary full")}${button("Für jetzt reicht der Gedanke", "close", {}, "text-button full")}`,
  );
}
function addRef(data, pathId, ref) {
  const p = data.paths.find((p) => p.id === pathId);
  if (!p) throw new Error("Dieser Weg ist nicht mehr vorhanden.");
  if (!p.links.some((l) => sameRef(l.ref, ref)))
    p.links.push({
      id: id(),
      kind: "verse",
      label: refLabel(ref),
      ref,
      date: now(),
    });
}
async function submitForm() {
  if (!ui.form) return;
  const { type, args } = ui.form,
    v = snapshotForm(),
    at = now();
  if(type === "journal-path") {
    change(data=>setJournalPath(data,args.id,v.pathId));finishForm();go("entry/"+encodeURIComponent(args.id));notify(v.pathId?"Mit deinem Weg verbunden":"Wegzuordnung entfernt");return;
  }
  if(type === "note") {
    const text=v.text.trim();if(!text)throw new Error("Schreibe einen Gedanken, bevor du ihn speicherst.");
    change(data=>{const r=data.reflections.find(x=>x.id===args.id);if(!isBibleNote(r))throw new Error("Diese Notiz wurde inzwischen entfernt.");
      const j=data.journal.find(j=>j.reflectionId===r.id&&sameRef(j.ref,r.ref)&&j.text===r.text);r.text=text;r.updatedAt=at;if(j){j.text=text;j.updatedAt=at;}});
    finishForm();go("reflection/"+encodeURIComponent(args.id));notify("Deine Notiz ist gespeichert.");return;
  }
  if (type === "entry") {
    const text = v.text.trim();
    if (!text)
      throw new Error("Schreibe einen Gedanken, bevor du ihn speicherst.");
    const jid = args.id || id(),
      rid = id();
    let chosen = v.pathId;
    change((d) => {
      const old = args.id ? d.journal.find((j) => j.id === args.id) : null;
      if (args.id && !old)
        throw new Error("Dieser Eintrag wurde inzwischen entfernt.");
      if (old) {
        old.text = text;
        old.subtype = v.kind;
        old.updatedAt = at;
        const r = d.reflections.find((r) => r.id === old.reflectionId);
        if (r) {
          r.text = text;
          r.updatedAt = at;
        }
      } else {
        const entry = {
          id: jid,
          type: args.ref
            ? "Bibel"
            : v.kind === "Predigt"
              ? "Predigt"
              : "Journal",
          subtype: v.kind,
          text,
          date: at,
          ref: args.ref || null,
          pathIds: [],
          reflectionId: rid,
          storyId: args.storyId || null,
        };
        d.journal.unshift(entry);
        d.reflections.unshift({
          id: rid,
          text,
          date: at,
          label: args.ref ? refLabel(args.ref) : v.kind,
          ref: args.ref || null,
          pathIds: [],
          storyId: args.storyId || null,
        });
      }
      if (chosen) attach(d, chosen, jid);
      if (args.planId && v.planDone) {
        const key =
          args.planKind === "guide" ? "guide:" + args.planId : args.planId;
        d.guidedPlans[key] ??= {};
        d.guidedPlans[key][args.day] = true;
      }
    });
    finishForm();
    ui.continuitySaved = args.id ? null : jid;
    go("entry/" + encodeURIComponent(jid));
    notify("Dein Gedanke ist gespeichert.");
    if (!chosen && !args.id)
      connectSheet({
        entryId: jid,
        title: args.suggestTitle,
        category: args.category,
      });
  } else if (type === "path") {
    const title = v.title.trim();
    if (!title) throw new Error("Gib deinem Weg einen Namen.");
    const pid = args.id || id();
    change((d) => {
      let p = d.paths.find((p) => p.id === pid);
      if (args.id && !p)
        throw new Error("Dieser Weg ist nicht mehr vorhanden.");
      if (p) {
        p.title = title;
        p.why = v.why.trim();
        p.category = v.category;
        const step=p.steps.find(x=>!x.done);
        if(step && v.currentStep != null && v.currentStep.replace(/\r\n/g,"\n")!==step.text.replace(/\r\n/g,"\n")) { if(!v.currentStep.trim())throw new Error("Beschreibe den offenen Schritt.");step.text=v.currentStep.trim(); }
      } else {
        p = {
          id: pid,
          title,
          why: v.why.trim(),
          category: v.category,
          started: at,
          lastReview: null,
          steps: [],
          links: [],
          milestones: [],
          reviews: [],
          archived: false,
        };
        if (v.step?.trim())
          p.steps.push({
            id: id(),
            text: v.step.trim(),
            done: false,
            createdAt: at,
          });
        d.paths.unshift(p);
        d.reminderSnoozes["path:" + pid] = new Date(
          Date.now() + Number(v.days || 21) * 86400000,
        ).toISOString();
      }
      if (args.entryId) attach(d, pid, args.entryId);
      if (args.ref) addRef(d, pid, args.ref);
    });
    finishForm();
    go("path/" + encodeURIComponent(pid));
    notify(args.id ? "Weg aktualisiert." : "Dein Weg hat begonnen.");
  } else if (type === "step") {
    if (!v.text.trim()) throw new Error("Beschreibe deinen nächsten Schritt.");
    change((d) => {
      const p = d.paths.find((p) => p.id === args.pathId);
      if (!p) throw new Error("Dieser Weg fehlt.");
      if (args.stepId) {
        const step=p.steps.find(x=>x.id===args.stepId && !x.done);if(!step)throw new Error("Bereits ausprobierte Schritte werden nicht überschrieben.");step.text=v.text.trim();
      } else p.steps.push({id:id(),text:v.text.trim(),done:false,createdAt:at});
    });
    finishForm();
    go("path/" + encodeURIComponent(args.pathId));
    notify("Schritt festgehalten.");
  } else if (type === "review") {
    const status = v.status,
      confirmed = status === "changed" && v.development;
    let text = v.text.trim();
    if (["changed", "thought"].includes(status) && !text)
      throw new Error(
        status === "changed"
          ? "Beschreibe kurz, was sich verändert hat."
          : "Schreibe den Gedanken auf, den du festhalten möchtest.",
      );
    text ||= {
      working: "Ich arbeite noch daran.",
      unchanged: "Es hat sich nichts verändert.",
      notnow: "Im Moment nicht.",
    }[status];
    const key = args.gap?.key || "path:" + args.pathId,
      pid = args.pathId || args.gap?.pathId,
      reviewId = id();
    change((d) => {
      const review = {
        id: reviewId,
        date: at,
        text,
        status,
        confirmedDevelopment: !!confirmed,
        sourceKey: key,
        ref: args.gap?.ref || null,
      };
      if (pid) {
        const p = d.paths.find((p) => p.id === pid);
        if (!p) throw new Error("Der Weg fehlt.");
        p.reviews.push(review);
        p.lastReview = at;
        if (confirmed)
          p.milestones.push({ id: id(), date: at, text, reviewId });
      } else d.reviews.unshift(review);
      delete d.reminderSnoozes[key];
      delete d.dismissedGaps[key];
      if (+v.days)
        d.reminderSnoozes[key] = new Date(
          Date.now() + Number(v.days) * 86400000,
        ).toISOString();
      else d.dismissedGaps[key] = at;
    });
    finishForm();
    go(pid ? "path/" + encodeURIComponent(pid) : "history");
    notify(
      confirmed
        ? "Deine Entwicklung ist festgehalten."
        : "Dein Rückblick ist gespeichert.",
    );
  }
}
function openGap(key) {
  const g = gaps(s()).find((g) => g.key === key);
  if (!g) return;
  modal(
    "Ein Gedanke von damals",
    `<span class="overline">${date(g.at)}</span><h3>${e(g.title)}</h3><blockquote class="previous-thought">${e(g.detail)}</blockquote><p>Was ist daraus geworden? Es gibt nichts zu bestehen.</p>${button("Jetzt zurückblicken", "review-gap", { key }, "button primary full")}<div class="actions">${button("In zwei Wochen erinnern", "snooze", { key, days: 14 }, "button quiet")}${button("Im Moment nicht", "dismiss-gap", { key }, "text-button")}</div>${g.ref ? link("Den Bibeltext wieder lesen", readRoute(g.ref), "text-link") : ""}`,
  );
}
function download(object, name) {
  const a = document.createElement("a"),
    url = URL.createObjectURL(
      new Blob([JSON.stringify(object, null, 2)], { type: "application/json" }),
    );
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}
function importRefs(next) {
  const refs = [
    ...next.highlights,
    ...next.journal.map((x) => x.ref),
    ...next.reflections.map((x) => x.ref),
    ...next.paths.flatMap((p) => p.links.map((x) => x.ref)),
    next.reading,
  ].filter(Boolean);
  for (const r of refs) validRef(r, ui.refs);
  return next;
}
async function importFile(file) {
  if (!file) return;
  if (file.size > 20 * 1024 * 1024)
    throw new Error(
      "Diese Datei ist zu groß. Unterstützt werden Backups bis 20 MB.",
    );
  const next = importRefs(store.prepareImport(JSON.parse(await file.text())));
  ui.import = next;
  modal(
    "Backup wiederherstellen?",
    `<p>Die Datei enthält ${next.paths.length} Wege, ${next.journal.length} Einträge und ${next.highlights.length} Markierungen.</p><p>Der aktuelle Stand wird vorher auf diesem Gerät gesichert. Das Backup ersetzt anschließend die angezeigten Daten.</p>${button("Backup wiederherstellen", "confirm-import", {}, "button primary full")}${button("Abbrechen", "close", {}, "button quiet full")}`,
  );
}
function onboarding(step = 0) {
  const pages = [
    [
      "Du musst nicht wissen, wo du anfangen sollst.",
      "Beginne bei einer Situation — oder direkt in der Bibel.",
    ],
    [
      "Ein Gedanke kann dich weiter begleiten.",
      "Verstehe den Text. Halte fest, was dich berührt. Probiere einen kleinen Schritt.",
    ],
    [
      "Und später: Was ist daraus geworden?",
      "FaithPath bringt frühere Gedanken zurück. Du hältst selbst fest, was sich verändert hat.",
    ],
  ];
  const [title, text] = pages[step];
  modal(
    "Willkommen bei FaithPath",
    `<div class="onboarding-art">${step === 1 ? `<ol class="onboarding-flow"><li>Bibel oder Situation</li><li>Dein Gedanke</li><li>Ein kleiner Schritt</li><li>Später zurückblicken</li></ol>` : `<img src="trees/tree-stage-${step === 0 ? 2 : 5}.webp" alt="Olivenbaum als Bild deiner persönlichen Geschichte" width="400" height="300">`}</div><span class="overline">${step + 1} von 3</span><h3 class="onboarding-title">${e(title)}</h3><p>${e(text)}</p><p class="meta">FaithPath misst nicht deinen Glauben.</p><div class="actions">${button(step === 2 ? "Meinen Anfang finden" : "Weiter", "onboard-next", { step }, "button primary")}${button("Direkt zur Bibel", "onboard-skip", {}, "text-button")}</div>`,
  );
}
async function offlineStatus() {
  if (!("serviceWorker" in navigator)) return false;
  const reg = await navigator.serviceWorker.getRegistration();
  if (
    !reg?.active ||
    reg.active.state !== "activated" ||
    !navigator.serviceWorker.controller
  )
    return false;
  const info = await new Promise((resolve) => {
    const channel = new MessageChannel(),
      timer = setTimeout(() => resolve(null), 2000);
    channel.port1.onmessage = (e) => {
      clearTimeout(timer);
      resolve(e.data);
    };
    reg.active.postMessage({ type: "STATUS" }, [channel.port2]);
  });
  ui.offline = !!info?.ready && info.build === BUILD;
  if ($("#offline-state"))
    $("#offline-state").textContent = ui.offline
      ? "Beide Bibeln und die App sind für dieses Gerät offline bereit."
      : "Noch nicht offline bereit. Bleibe online und lade die App bei Bedarf neu.";
  return ui.offline;
}
async function pwa() {
  if (!("serviceWorker" in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.register("./sw.js", {
      updateViaCache: "none",
    });
    const check = () => {
      if (reg.waiting && navigator.serviceWorker.controller) {
        ui.waiting = reg.waiting;
        if (!$(".update-notice"))
          $(".page")?.insertAdjacentHTML(
            "afterbegin",
            `<aside class="update-notice" role="status">Eine neue Version ist bereit. ${button("Jetzt aktualisieren", "update", {}, "text-button")}</aside>`,
          );
      }
    };
    check();
    reg.addEventListener("updatefound", () =>
      reg.installing?.addEventListener("statechange", () => {
        setTimeout(check, 0);
        offlineStatus();
      }),
    );
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (ui.updating) location.reload();
      else {
        ui.waiting = null;
        $(".update-notice")?.remove();
        offlineStatus();
      }
    });
    await navigator.serviceWorker.ready;
    await offlineStatus();
    window.addEventListener("focus", () => {
      reg.update().catch(() => {});
      offlineStatus();
    });
  } catch {
    notify(
      "Offline-Vorbereitung konnte nicht abgeschlossen werden. Du kannst die App online weiter nutzen.",
      true,
    );
  }
}
function cancelNoteDeletion() {
  const pending=ui.noteDeletion;ui.noteDeletion=null;
  if(pending?.form)openForm(pending.form.type,pending.form.args,pending.values);else closeModal();
}
function confirmNoteDeletion(kind,id) {
  const note=(kind === "journal" ? s().journal : s().reflections).find(x=>x.id===id);
  if(!isBibleNote(note))throw new Error("Diese Bibelnotiz ist nicht mehr vorhanden.");
  ui.noteDeletion={kind,id,form:ui.form,values:ui.form ? snapshotForm() : null};
  modal("Notiz wirklich löschen?",`<div id="form-error" role="alert" tabindex="-1"></div><p>Die Notiz wird entfernt. Deine Bibelmarkierung und andere Verknüpfungen bleiben erhalten.</p><p class="meta">Der zugehörige Journalgedanke bleibt in deiner Geschichte erhalten.</p><div class="actions">${button("Abbrechen","cancel-note-delete",{},"button quiet")}${button("Notiz löschen","confirm-note-delete",{},"button danger")}</div>`);
  const title=$("#dialog-title");title.tabIndex=-1;title.focus({preventScroll:true});$("#dialog").scrollTop=0;
}
function confirmJournalDeletion(id) {
  const x=s().journal.find(j=>j.id===id);if(!x)throw new Error("Dieser Eintrag ist nicht mehr vorhanden.");
  ui.journalDeletion={id};
  const paths=(x.pathIds||[]).map(pid=>s().paths.find(p=>p.id===pid)).filter(Boolean);
  const reviews=reviewsFor(s(),x);
  modal("Journaleintrag wirklich löschen?",`<div id="form-error" role="alert" tabindex="-1"></div><p>Dieser Eintrag wird dauerhaft aus deinem Journal entfernt.</p>${paths.length?`<p class="meta">Dieser Eintrag ist mit deinem Weg „${e(paths[0].title)}“ verbunden.</p>`:""}${reviews.length?`<p class="meta">Zu diesem Eintrag existiert ein Rückblick. Sein Text bleibt erhalten; die Verbindung zum Eintrag wird entfernt.</p>`:""}<p class="meta">Deine Wege, Schritte, Bibelmarkierungen und unabhängigen Rückblicke bleiben erhalten.</p><div class="actions">${button("Abbrechen","close",{},"button quiet")}${button("Journaleintrag löschen","confirm-journal-delete",{},"button danger")}</div>`);
  const title=$("#dialog-title");title.tabIndex=-1;title.focus({preventScroll:true});$("#dialog").scrollTop=0;
}
async function action(a, d, el) {
  el?.closest(".path-options,.entry-options")?.removeAttribute("open");
  if(a === "journal-path"){openForm("journal-path",{id:d.id});return;}
  if(a === "delete-journal"){confirmJournalDeletion(d.id);return;}
  if(a === "confirm-journal-delete") {
    const pending=ui.journalDeletion;if(!pending)throw new Error("Bitte öffne die Löschbestätigung erneut.");
    let draft=null;const snapshot=await journalTransaction(store,localStorage,data=>deleteJournalEntry(data,pending.id),(snapshot,raw)=>{if(journalDraftMatches(JSON.parse(raw||"null"),snapshot)){draft=raw;return null;}return raw;});
    ui.journalDeletion=null;closeModal();ui.continuitySaved=null;go("journal");
    undoNotice("Journaleintrag gelöscht",()=>journalTransaction(store,localStorage,data=>restoreJournalEntry(data,snapshot),(_,raw)=>{if(draft&&raw&&raw!==draft)throw new Error("Ein neuerer Entwurf bleibt erhalten. Rückgängig würde ihn überschreiben.");return draft||raw;}));return;
  }
  if(a === "dismiss-status"){$("#toast").classList.remove("visible");return;}
  if(a === "edit-note"){openForm("note",{id:d.id});return;}
  if(a === "delete-note"){confirmNoteDeletion(d.kind,d.id);return;}
  if(a === "cancel-note-delete"){cancelNoteDeletion();return;}
  if(a === "confirm-note-delete") {
    const pending=ui.noteDeletion;if(!pending)throw new Error("Bitte öffne die Löschbestätigung erneut.");
    let snapshot;change(data=>snapshot=deleteBibleNote(data,pending.kind,pending.id,now()));
    try{const draft=JSON.parse(localStorage.getItem(KEYS.draft)||"null");if(snapshot.some(n=>n.id===draft?.args?.id && (n.kind === "journal" ? draft.type === "entry" : draft.type === "note")))localStorage.removeItem(KEYS.draft);}catch{}
    ui.noteDeletion=null;closeModal();await render();
    undoNotice("Notiz gelöscht",()=>change(data=>restoreBibleNote(data,snapshot)));return;
  }
  if (a === "close") {
    if(ui.noteDeletion){cancelNoteDeletion();return;}
    closeModal();
    return;
  }
  if (a === "plan-toggle") {
    change((data) => {
      const key = d.kind === "guide" ? "guide:" + d.id : d.id;
      data.guidedPlans[key] ??= {};
      data.guidedPlans[key][d.day] = !data.guidedPlans[key][d.day];
    });
    plan(d.kind, d.id);
    return;
  }
  if (a === "new-entry") {
    openForm("entry");
    return;
  }
  if (a === "new-path") {
    openForm("path");
    return;
  }
  if (a === "edit-path") {
    openForm("path", { id: d.id });
    return;
  }
  if (a === "edit-entry") {
    openForm("entry", { id: d.id });
    return;
  }
  if (a === "reflect-path") {
    openForm("entry", { pathId: d.id, kind: "Reflexion" });
    return;
  }
  if (a === "step") {
    openForm("step", { pathId: d.id });
    return;
  }
  if (a === "use-suggestion") {
    $("[name=text]", $("#dialog")).value = d.text;
    persistDraft();
    return;
  }
  if (a === "resume") {
    const x = JSON.parse(localStorage.getItem(KEYS.draft) || "null");
    if (x) openForm(x.type, x.args, x.values);
    return;
  }
  if (a === "focus-passage") {
    const v = $(`[data-v="${ui.reader.ref.from}"]`);
    v?.scrollIntoView({
      block: "start",
      behavior: matchMedia("(prefers-reduced-motion:reduce)").matches
        ? "instant"
        : "smooth",
    });
    v?.focus({ preventScroll: true });
    return;
  }
  if (a === "verse") {
    const v = +d.v;
    ui.selection.has(v) ? ui.selection.delete(v) : ui.selection.add(v);
    selectionBar();
    return;
  }
  if (a === "clear-selection") {
    ui.selection.clear();
    selectionBar();
    return;
  }
  if (a === "undo-core") {
    const undo = ui.undo;
    if (!undo || Date.now() > undo.expires) { notify("Die Zeit zum Rückgängigmachen ist vorbei."); return; }
    try{await undo.restore();}catch(error){notify(error.message,true);$("#toast").insertAdjacentHTML("beforeend",button("Rückgängig","undo-core",{},"text-button"));return;}
    ui.undo = null; notify("Wiederhergestellt"); render(); return;
  }
  if (a === "mark") { const ref = selection(); if (ref) colorPalette({ref}); return; }
  if (a === "highlight-color") { colorPalette({id:d.id}); return; }
  if (a === "paint-highlight") {
    const ref = validRef(JSON.parse(d.ref),ui.refs);
    change(data => {
      if (d.id) { const h=data.highlights.find(h=>h.id===d.id); if (!h) throw new Error("Diese Markierung fehlt."); h.color=d.color; }
      else paintRange(data,ref,d.color,ui.reader.vs,id,now());
    });
    closeModal();
    if ($(".reader-page")) { refreshHighlights(); selectionBar(); } else render();
    notify("Markierung geändert"); return;
  }
  if (a === "highlight-note") {
    const h=s().highlights.find(h=>h.id===d.id); if (!h) return;
    const note=markNotes(h)[0];openForm(note?.kind === "reflection" ? "note" : "entry",note ? {id:note.id} : {ref:h,kind:"Reflexion"});return;
  }
  if (a === "reset-discover") { ui.storySearch="";ui.storyBook="";ui.storyKind="alle";discover();return; }
  if (a === "reset-mark-filters") { ui.markColor="";ui.markBook="";ui.markContext="";marks();return; }
  if (a === "edit-step") { openForm("step",{pathId:d.path,stepId:d.id});return; }
  if (a === "current-step") {
    change(data=>{ const p=data.paths.find(p=>p.id===d.path), i=p.steps.findIndex(x=>x.id===d.id && !x.done);if(i<0)throw new Error("Dieser offene Schritt fehlt.");p.steps.unshift(...p.steps.splice(i,1)); });path(d.path);notify("Als Nächstes ausgewählt");return;
  }
  if (a === "reflect-reader") {
    const ctx = ui.reader.context || {};
    openForm("entry", {
      ref: currentRef(),
      kind: "Reflexion",
      question: ctx.question,
      ...ctx,
      suggestTitle: ctx.title,
    });
    return;
  }
  if (a === "reflect-story") {
    const x = ui.stories.find((x) => String(x.id) === d.id) || runtimeModel.stories.get(d.id);
    if (!x) return;
    openForm("entry", {
      ref: validRef(
        {...(x.references?.[0] || {book:x.book,chapter:x.chapter+1,from:x.from,to:x.to}),label:x.ref,translation:x.kind==="chapter-quiz" ? "l1912" : s().translation},
        ui.refs,
      ),
      kind: "Reflexion",
      question: x.reflection,
      storyId: x.story_id || x.id,
      suggestTitle: x.title,
    });
    return;
  }
  if (a === "connect-reader") {
    connectSheet({ ref: currentRef() });
    return;
  }
  if (a === "connect-entry") {
    connectSheet({ entryId: d.id });
    return;
  }
  if (a === "connect-ref") {
    connectSheet({ ref: validRef(JSON.parse(d.ref), ui.refs) });
    return;
  }
  if (a === "path-from") {
    openForm("path", JSON.parse(d.args));
    return;
  }
  if (a === "attach") {
    const args = JSON.parse(d.args);
    change((data) => {
      if (args.entryId) attach(data, d.path, args.entryId);
      if (args.ref) addRef(data, d.path, args.ref);
    });
    closeModal();
    go("path/" + encodeURIComponent(d.path));
    notify("Teil deines Weges.");
    return;
  }
  if (a === "copy") {
    const r = currentRef(),
      text =
        refLabel(r) +
        "\n" +
        ui.reader.vs
          .filter((v) => !r.from || (v[0] >= r.from && v[0] <= r.to))
          .map((v) => v[0] + " " + v[1])
          .join("\n") +
        "\n" +
        TRANSLATIONS[r.translation].name;
    try {
      await navigator.clipboard.writeText(text);
      notify("Bibeltext kopiert.");
    } catch {
      modal(
        "Bibeltext kopieren",
        textarea("Text zum Kopieren", "copyText", text) +
          "<p>Markiere den Text und wähle „Kopieren“.</p>",
      );
    }
    return;
  }
  if (a === "remove-selected-highlight") {
    modal("Markierung entfernen?", `<p>${e(refLabel(JSON.parse(d.ref)))}</p><p>Nur die ausgewählten Verse werden entfernt. Notizen und verbundene Wege bleiben erhalten.</p>${button("Markierung entfernen","confirm-remove-mark",{ref:d.ref},"button quiet")}`);return;
  }
  if (a === "remove-mark") {
    modal(
      "Markierung entfernen?",
      `<p>Notizen und verbundene Wege bleiben erhalten.</p>${button("Markierung entfernen", "confirm-remove-mark", { id: d.id }, "button quiet")}`,
    );
    return;
  }
  if (a === "confirm-remove-mark") {
    const before=structuredClone(s().highlights);
    change(data=>{if(d.ref)clearRange(data,validRef(JSON.parse(d.ref),ui.refs),ui.reader.vs,id);else data.highlights=data.highlights.filter(h=>h.id!==d.id);});
    const after=JSON.stringify(s().highlights);
    closeModal();if($(".reader-page")){refreshHighlights();selectionBar();}else go("marks");
    undoNotice("Markierung entfernt",()=>change(data=>{if(JSON.stringify(data.highlights)!==after)throw new Error("Die Markierungen wurden inzwischen geändert. Rückgängig ist nicht mehr sicher.");data.highlights=before;}));return;
  }
  if (a === "skip-chapter-quiz") {
    $(".reader-chapter-questions")?.remove();
    $(".chapter-nav a")?.focus();
    return;
  }
  if (a === "quiz") {
    const x = ui.stories.find((x) => String(x.id) === d.id);
    if (!x) return;
    const canonical=canonicalStoryForLegacy(x);
    if(canonical){go("question/"+canonical.flow_items[0].primary_question_id);return;}
    ui.quiz = { story: x, index: 0, answer: null };
    go(chapterQuizRoute(x, "story/" + x.id));
    return;
  }
  if (a === "answer") {
    if (ui.quiz.answer != null) return;
    ui.quiz.answer = +d.answer;
    quiz();
    $(".explanation")?.focus();
    return;
  }
  if (a === "next-question") {
    if (!ui.quiz || ui.quiz.answer == null) return;
    if (ui.quiz.index < ui.quiz.story.questions.length - 1) {
      ui.quiz.index++;
      ui.quiz.answer = null;
      quiz();
      $("h1")?.focus();
    } else {
      const x = ui.quiz.story;
      change((data) => (data.quiz[x.id] = { ...data.quiz[x.id], done: now() }));
      const route = chapterQuizRoute(x, ui.quiz.returnRoute);
      go(route + (route.includes("?") ? "&" : "?") + "complete=1");
    }
    return;
  }
  if (a === "review-path") {
    openForm("review", { pathId: d.id });
    return;
  }
  if (a === "gap") {
    openGap(d.key);
    return;
  }
  if (a === "review-gap") {
    const g = gaps(s()).find((g) => g.key === d.key);
    if (g) openForm("review", { gap: g, pathId: g.pathId });
    return;
  }
  if (a === "snooze" || a === "dismiss-gap") {
    change((data) => {
      if (a === "snooze") {
        data.reminderSnoozes[d.key] = new Date(
          Date.now() + +d.days * 86400000,
        ).toISOString();
        delete data.dismissedGaps[d.key];
      } else data.dismissedGaps[d.key] = now();
    });
    closeModal();
    render();
    notify(
      a === "snooze"
        ? "In zwei Wochen erscheint der Gedanke wieder."
        : "Für jetzt beiseitegelegt.",
    );
    return;
  }
  if (a === "toggle-archive") {
    ui.archive = !ui.archive;
    paths();
    return;
  }
  if (a === "archive-path") {
    change((data) => {
      const p = data.paths.find((p) => p.id === d.id);
      p.archived = !p.archived;
    });
    path(d.id);
    notify(s().paths.find(p=>p.id===d.id).archived ? "Weg archiviert" : "Weg wieder aufgenommen");
    return;
  }
  if (a === "delete-path") {
    modal(
      "Weg wirklich löschen?",
      `<p><strong>${e(s().paths.find(p=>p.id===d.id)?.title)}</strong></p><p>Der Weg, seine Schritte und Wegzuordnungen werden entfernt. Journalgedanken und Bibelmarkierungen bleiben. Rückblicke und dokumentierte Entwicklung bleiben in deiner Geschichte erhalten.</p>${button("Abbrechen", "close", {}, "button quiet")}<div class="actions">${button("Lieber archivieren", "archive-and-close", { id: d.id }, "button primary")}${button("Weg endgültig löschen", "confirm-delete", { id: d.id }, "button quiet danger-text")}</div>`,
    );
    return;
  }
  if (a === "archive-and-close") {
    change((data) => {
      data.paths.find((p) => p.id === d.id).archived = true;
    });
    closeModal();
    go("paths");
    return;
  }
  if (a === "confirm-delete") {
    const before=structuredClone(s());change(data=>detachPath(data,d.id));const after=JSON.stringify(s());
    closeModal();go("paths");
    undoNotice("Weg gelöscht",()=>change(data=>{if(JSON.stringify(data)!==after)throw new Error("Seit dem Löschen wurde etwas gespeichert. Rückgängig würde diese Daten überschreiben und ist deshalb nicht möglich.");for(const key of Object.keys(data))delete data[key];Object.assign(data,before);}));return;
  }
  if (a === "journal-filter") {
    ui.filter = d.filter;
    ui.journalLimit = 40;
    journal();
    return;
  }
  if (a === "more-journal") {
    ui.journalLimit += 40;
    $("#journal-results").innerHTML = journalResults();
    return;
  }
  if (a === "more-history") {
    ui.historyLimit += 40;
    d.path ? path(d.path) : history();
    return;
  }
  if (a === "export") {
    download(
      store.backup(),
      "FaithPath-Backup-" + now().slice(0, 10) + ".json",
    );
    return;
  }
  if (a === "raw-backup") {
    download(
      store.rawBackup(),
      "FaithPath-Originaldaten-" + now().slice(0, 10) + ".json",
    );
    return;
  }
  if (a === "import") {
    $("#import-file").click();
    return;
  }
  if (a === "confirm-import") {
    if (!ui.import) return;
    store.restore(ui.import);
    ui.import = null;
    finishForm();
    go("more?section=data");
    notify("Backup wiederhergestellt.");
    return;
  }
  if (a === "undo-import") {
    const old = JSON.parse(localStorage.getItem(KEYS.restore) || "null");
    if (!old) throw new Error("Kein früherer Stand gefunden.");
    const restored = old.raw
      ? JSON.parse(old.raw)
      : { paths: [], journal: [], highlights: [] };
    ui.import = store.prepareImport({
      data: restored,
      guidedPlans: JSON.parse(old.guidedPlansRaw || "{}"),
    });
    modal(
      "Früheren Stand wiederherstellen?",
      `<p>Der Stand vor dem letzten Import wird wieder sichtbar. Der jetzige Stand wird dabei erneut gesichert.</p>${button("Früheren Stand wiederherstellen", "confirm-import", {}, "button primary")}`,
    );
    return;
  }
  if (a === "onboard") {
    onboarding();
    return;
  }
  if (a === "onboard-next") {
    if (+d.step < 2) onboarding(+d.step + 1);
    else {
      localStorage.setItem(KEYS.onboard, "done");
      closeModal();
      go("guidance");
    }
    return;
  }
  if (a === "onboard-skip") {
    localStorage.setItem(KEYS.onboard, "done");
    closeModal();
    go("bible");
    return;
  }
  if (a === "offline-check") {
    notify(
      (await offlineStatus())
        ? "Offline bereit."
        : "Noch nicht vollständig offline vorbereitet.",
    );
    return;
  }
  if (a === "update") {
    if ($("#dialog").open) {
      notify("Speichere oder schließe zuerst deinen Entwurf.");
      return;
    }
    const reg = await navigator.serviceWorker.getRegistration(),
      waiting = reg?.waiting;
    if (!waiting) {
      ui.waiting = null;
      $(".update-notice")?.remove();
      notify("Deine Version ist aktuell.");
      return;
    }
    ui.updating = true;
    waiting.postMessage({ type: "SKIP_WAITING" });
    return;
  }
}
async function render() {
  const token = ++ui.token;
  try {
    const route = location.hash.slice(1) || "today",
      [name, query = ""] = route.split("?"),
      parts = name.split("/").map(decodeURIComponent),
      [kind, key] = parts;
    const previousRoute = ui.route;
    ui.route = route;
    if (kind === "merged-story") mergedStory(key);
    else if (kind === "question") sourceQuestion(key);
    else if (kind === "today") home();
    else if (kind === "guidance") guidance();
    else if (kind === "topic") topic(key);
    else if (kind === "bible") bible();
    else if (kind === "chapters") chapters(key);
    else if (kind === "chapter-quizzes") chapterCollection(key);
    else if (kind === "read") {
      shell(
        `${heading("Bibel", "Der Text wird geöffnet.")}<p role="status">Ein Moment …</p>`,
        "bible",
        "reader-page",
      );
      await reader(parts, new URLSearchParams(query), token);
    } else if (kind === "marks") marks();
    else if (kind === "mark") markDetail(key);
    else if (kind === "discover") discover();
    else if (kind === "story") story(key);
    else if (kind === "quizzes") quizIndex();
    else if (kind === "quiz") {
      const x = ui.stories.find((x) => String(x.id) === key);
      if (!x) return notFound();
      const canonical=canonicalStoryForLegacy(x);
      if(canonical){go("question/"+canonical.flow_items[0].primary_question_id);return;}
      const params = new URLSearchParams(query), returnRoute = params.get("return") || "";
      if (!ui.quiz || String(ui.quiz.story.id) !== key || previousRoute.split("?")[0] !== name || ui.quiz.returnRoute !== returnRoute)
        ui.quiz = {story:x, index:0, answer:null, returnRoute};
      ui.quiz.navigation = chapterQuizNavigation(x, ui.books, s().translation, returnRoute);
      if (params.get("complete") === "1" && s().quiz[x.id]?.done) chapterQuizComplete(x, ui.quiz.navigation);
      else quiz();
    } else if (kind === "paths") paths();
    else if (kind === "path") path(key);
    else if (kind === "tree") tree();
    else if (kind === "plans") plans();
    else if (kind === "plan" || kind === "guide") plan(kind, key);
    else if (kind === "journal") journal();
    else if (["entry", "reflection", "review"].includes(kind)) entry(key, kind);
    else if (kind === "history") history();
    else if (kind === "reviews") reviews();
    else if (kind === "more") more();
    else if (kind === "content-status") contentStatus();
    else if (kind === "licenses") licenses();
    else if (kind === "compose") {
      journal();
      let draft;
      try {
        draft = JSON.parse(localStorage.getItem(KEYS.draft));
      } catch {}
      if (draft?.type && draft.values)
        openForm(draft.type, draft.args, draft.values);
      else openForm("entry");
    } else notFound();
    if (token !== ui.token) return;
    window.scrollTo({ top: 0, behavior: "instant" });
    $("h1")?.focus({ preventScroll: true });
  } catch (err) {
    if (token === ui.token)
      shell(
        `${back("Heute", "today")}${heading("Das hat nicht geklappt", "Dieser Inhalt ist gerade nicht verfügbar.", err.message)}${button("Erneut versuchen", "retry", {}, "button primary")}`,
      );
  }
}
document.addEventListener("focusin",event=>{
  const tab=event.target.closest?.(".segmented a");if(!tab)return;
  const container=tab.parentElement,box=container.getBoundingClientRect(),r=tab.getBoundingClientRect();
  if(r.right>box.right)container.scrollLeft+=r.right-box.right+2;
  else if(r.left<box.left)container.scrollLeft+=r.left-box.left-2;
});
document.addEventListener("keydown", event => {
  if(event.target.matches?.(".color-choice") && ["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Home","End"].includes(event.key)) {
    const options=$$(".color-choice"),i=options.indexOf(event.target),delta=["ArrowLeft","ArrowUp"].includes(event.key)?-1:1;
    event.preventDefault();const next=event.key==="Home"?0:event.key==="End"?options.length-1:(i+delta+options.length)%options.length;options.forEach((option,k)=>option.tabIndex=k===next?0:-1);options[next]?.focus();
  }
  if (event.key === "Escape") document.querySelector(".path-options[open],.entry-options[open]")?.removeAttribute("open");
});
document.addEventListener("click", (ev) => {
  if (ev.target.closest(".skip-link")) {
    ev.preventDefault();
    const main = $("#main");
    if (main) {
      main.tabIndex = -1;
      main.focus();
    }
    return;
  }
  const target = ev.target.closest("[data-action]");
  if (target) {
    if (target.dataset.action === "retry") {
      render();
      return;
    }
    Promise.resolve(
      action(target.dataset.action, target.dataset, target),
    ).catch(showError);
  }
  const anchor = ev.target.closest('a[href^="#"]');
  if (anchor && $("#dialog").open) closeModal();
});
document.addEventListener("submit", (ev) => {
  if (ev.target.id === "editor-form") {
    ev.preventDefault();
    submitForm().catch(showError);
  }
});
document.addEventListener("input", (ev) => {
  const el = ev.target;
  if (el.closest("#editor-form")) persistDraft();
  if (el.dataset.input === "books")
    $("#book-list").innerHTML = bookList(el.value);
  if (el.dataset.input === "journal") {
    ui.search = el.value;
    ui.journalLimit = 40;
    $("#journal-results").innerHTML = journalResults();
  }
  if (el.dataset.input === "stories") {
    ui.storySearch = el.value;
    $("#story-results").innerHTML = storyResults();
  }
});
document.addEventListener("change", (ev) => {
  const el = ev.target;
  try {
    if (el.name === "status") updateDevelopment();
    if (el.closest("#editor-form")) persistDraft();
    if (el.id === "import-file") {
      importFile(el.files[0]).catch((err) =>
        notify("Import abgebrochen: " + err.message, true),
      );
      el.value = "";
      return;
    }
    const c = el.dataset.change;
    if (c?.startsWith("mark-")) { ui[{"mark-color":"markColor","mark-book":"markBook","mark-context":"markContext"}[c]]=el.value;marks();return; }
    if (c === "translation") {
      const ref = validRef(
        { ...ui.reader.ref, translation: el.value },
        ui.refs,
      );
      change((data) => (data.translation = el.value));
      go(readRoute(ref, ui.reader.origin));
    } else if (c === "reader-book")
      go(
        readRoute({
          book: el.value,
          chapter: 1,
          translation: ui.reader.ref.translation,
        }),
      );
    else if (c === "reader-chapter")
      go(
        readRoute({
          book: ui.reader.ref.book,
          chapter: +el.value,
          translation: ui.reader.ref.translation,
        }),
      );
    else if (c === "step-done") {
      change((data) => {
        const p = data.paths.find((p) => p.id === el.dataset.path),
          step = p.steps.find((x) => x.id === el.dataset.id);
        step.done = el.checked;
        step.completedAt = el.checked ? now() : null;
      });
      path(el.dataset.path);
    } else if (c === "story-book") {
      ui.storyBook = el.value;
      $("#story-results").innerHTML = storyResults();
    } else if (c === "story-kind") {
      ui.storyKind = el.value;
      $("#story-results").innerHTML = storyResults();
    }
  } catch (err) {
    showError(err);
    if (el.type === "checkbox") el.checked = !el.checked;
  }
});
$("#dialog").addEventListener("cancel",ev=>{if(ui.noteDeletion){ev.preventDefault();cancelNoteDeletion();}else if(ui.journalDeletion){ev.preventDefault();closeModal();}});
$("#dialog").addEventListener("close", () => {
  if (!$("#dialog").open) {
    ui.form = null;
    document.body.classList.remove("modal-open");
  }
});
window.addEventListener("hashchange", () => {
  if ($("#dialog").open && ui.dialogRoute !== location.hash.slice(1))
    closeModal();
  render();
});
window.addEventListener("online", () => offlineStatus());
window.addEventListener("offline", () =>
  notify("Du bist offline. Bereits vorbereitete Inhalte bleiben verfügbar."),
);
window.addEventListener("storage", (ev) => {
  if (ev.key === KEYS.main)
    notify(
      "Dein Datenstand wurde in einem anderen Tab geändert. Bitte lade diese Seite neu, bevor du weiterschreibst.",
      true,
    );
});
async function init() {
  try {
    runtimeModel = await loadRuntimeModel(CONTENT_BASE);
    ui.books = runtimeModel.books;
    ui.stories = runtimeModel.units;
    ui.chapterCatalog = createChapterCatalog(ui.stories, ui.books);
    ui.refs = runtimeModel.refs;
    await render();
    if(journalRecoveryError)notify(journalRecoveryError.message,true);
    pwa();
    if (
      !store.error &&
      !localStorage.getItem(KEYS.onboard) &&
      !localStorage.getItem(KEYS.legacyOnboard)
    )
      onboarding();
  } catch (err) {
    shell(
      `${heading("FaithPath", "Die App konnte nicht starten.", err.message)}${button("Erneut versuchen", "reload", {}, "button primary")}`,
    );
  }
}
document.addEventListener("click", (ev) => {
  if (ev.target.closest("[data-action=reload]")) location.reload();
});
init();

function mergedStory(id) {
  const x=runtimeModel.stories.get(id);if(!x)return notFound();
  const ref=validRef({...x.references[0],translation:s().translation},ui.refs);
  shell(`${back("Entdecken","discover")}${heading(x.ref,x.title)}<div class="actions">${link("Abschnitt lesen",readRoute(ref,"merged-story/"+id),"button primary")}${link("Fragen zur Geschichte","question/"+x.flow_items[0].primary_question_id,"button quiet")}</div><section data-story-id="${e(id)}" class="section"><h2>Fragen zur Geschichte</h2>${x.flow_items.map((item,index)=>{const q=runtimeModel.fp.get(item.primary_question_id)?.question || runtimeModel.n.get(item.primary_question_id);return row(q.q,`Frage ${index+1} von ${x.flow_items.length}`,"question/"+item.primary_question_id);}).join("")}</section><section class="reflection-invite"><span class="overline">Deine Reflexion</span><h2>${e(x.reflection)}</h2>${button("Gedanken festhalten","reflect-story",{id:x.story_id},"button primary")}<p class="meta">Deine Reflexion wird nicht bewertet.</p></section>`,"bible","merged-story-page depth-page");
}
function sourceQuestion(id) {
  const fp=runtimeModel.fp.get(id),nq=runtimeModel.n.get(id);if(!fp&&!nq)return notFound();
  const q=fp?.question || nq, mapping=runtimeModel.flow.mapping_links.find(l=>l.FP_ID===id);
  const storyId=mapping?.Story_ID || nq?.source_story_id,st=storyId?runtimeModel.stories.get(storyId):null;
  const index=st?.flow_items.findIndex(item=>item.source_question_ids.includes(id)) ?? -1;
  const result=fp&&Number.isInteger(ui.sourceAnswer)&&ui.sourceAnswerId===id?ui.sourceAnswer:null;
  const previous=index>0 ? st.flow_items[index-1].primary_question_id:null,next=st&&index>=0&&index<st.flow_items.length-1 ? st.flow_items[index+1].primary_question_id:null;
  shell(`${back("Zur Geschichte",st?"merged-story/"+storyId:"story/"+fp.unit.id)}${st&&index>=0?`<div class="quiz-head"><span class="overline">Fragen zur Geschichte</span><span>Frage ${index+1} von ${st.flow_items.length}</span></div>`:""}${heading(q.ref,q.q)}<span class="sr-only" data-question-id="${e(id)}">${e(id)}</span>${fp?`<div class="answers">${q.a.map((a,i)=>`<button type="button" data-action="source-answer" data-id="${e(id)}" data-answer="${i}" ${result!==null?"disabled":""} class="answer${result!==null&&i===q.c?" correct":result===i?" selected-wrong":""}"><span>${String.fromCharCode(65+i)}</span><span>${e(a)}${result!==null&&i===q.c?"<small>Richtige Antwort</small>":result===i?"<small>Deine Antwort</small>":""}</span></button>`).join("")}</div>${result!==null?`<section class="explanation" role="status"><strong>${result===q.c?"Ja, das steht im Text.":"Schau noch einmal auf den Zusammenhang."}</strong><p>${e(q.x)}</p></section>`:""}`:`<details class="source-answer"><summary>Antwort ansehen</summary><p data-n-answer>${e(q.answer)}</p></details>`}${st?`<nav class="question-flow-nav" aria-label="Fragen zur Geschichte">${previous?link("Vorherige Frage","question/"+previous,"button quiet"):""}${next?link("Nächste Frage","question/"+next,"button quiet"):link("Zur persönlichen Reflexion","merged-story/"+storyId,"button quiet")}</nav>`:""}`,"bible","merged-question-page depth-page");
}
document.addEventListener("click",ev=>{
  const target=ev.target.closest('[data-action="source-answer"]');if(!target || target.disabled)return;
  ui.sourceAnswerId=target.dataset.id;ui.sourceAnswer=Number(target.dataset.answer);sourceQuestion(target.dataset.id);
  const feedback=$(".explanation");if(feedback){feedback.tabIndex=-1;feedback.focus();}
});
