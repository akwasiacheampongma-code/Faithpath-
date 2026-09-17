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
const deviceStorage = {
  getItem: (k) => window.localStorage.getItem(k),
  setItem: (k, v) => window.localStorage.setItem(k, v),
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
  `<button type="button" class="${cls}" data-action="${action}" ${attrs(values)}>${label}</button>`;
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
  t.textContent = text;
  t.className = error ? "toast error visible" : "toast visible";
  clearTimeout(notify.timer);
  notify.timer = setTimeout(() => t.classList.remove("visible"), 4500);
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
  $("#app").innerHTML =
    `<header class="topbar"><a class="wordmark" href="#today" aria-label="FaithPath Startseite">${icon("leaf")}FaithPath<span class="brand-dot">.</span></a><div class="top-right"><span class="offline-label">${!navigator.onLine ? "Offline" : ui.offline ? "Auf diesem Gerät" : ""}</span>${link(icon("more") + '<span class="sr-only">Mehr und Einstellungen</span>', "more", "icon-button")}</div></header><nav class="primary-nav" aria-label="Hauptnavigation">${[
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
      )}</nav><div class="page ${cls}">${ui.waiting ? `<aside class="update-notice" role="status">Eine neue Version ist bereit. ${button("Jetzt aktualisieren", "update", {}, "text-button")}</aside>` : ""}${store.error ? `<aside class="error-notice" role="alert"><strong>Deine gespeicherten Daten brauchen Aufmerksamkeit.</strong><p>${e(store.error.message)} Der Originalstand bleibt erhalten.</p>${button("Originaldaten sichern", "raw-backup", {}, "text-button")}${link("Backup wiederherstellen", "more")}</aside>` : ""}<main id="main">${body}</main><footer class="page-footer">Deine persönliche Glaubensgeschichte.</footer></div>`;
  document.title = `FaithPath · ${$("h1")?.textContent || "Deine persönliche Glaubensgeschichte"}`;
}
function timelineHTML(items, limit = 40) {
  return items.length
    ? `<ol class="timeline">${items
        .slice(0, limit)
        .map(
          (x) =>
            `<li><time datetime="${e(x.at)}">${e(shortDate(x.at))}<span>${time(x.at) != null ? new Date(x.at).getFullYear() : ""}</span></time><div class="timeline-content"><span class="overline">${e(x.kind)}</span>${x.route ? link(e(x.title), x.route, "timeline-title") : x.ref ? link(e(x.title), readRoute(x.ref), "timeline-title") : `<p class="preserve">${e(x.title)}</p>`}${x.pathId ? `<small>${e(s().paths.find((p) => p.id === x.pathId)?.title || "")}</small>` : ""}</div></li>`,
        )
        .join("")}</ol>`
    : "";
}
function home() {
  const data = s(),
    pending = gaps(data),
    active = data.paths.filter((p) => !p.archived),
    lvl = treeLevel(data),
    latest = timeline(data)[0];
  let draft = null;
  try {
    draft = JSON.parse(localStorage.getItem(KEYS.draft));
  } catch {}
  shell(`<div class="home-intro"><div>${heading("Ein Moment für dich", "Was bewegt dich gerade?", "Du musst nicht wissen, wo du anfangen sollst.")}<div class="home-start">${link(`Ich brauche Orientierung ${icon("arrow")}`, "guidance", "button primary")}${link(`${icon("book")} Direkt zur Bibel`, "bible", "button quiet")}</div></div><div class="home-art"><img src="trees/tree-stage-${lvl + 1}.webp" alt="Olivenbaum: ${e(stageNames[lvl])}" width="500" height="500"><span>${e(stageNames[lvl])}</span></div></div>
 ${draft?.values ? `<aside class="draft-strip"><span>Ein Gedanke wartet noch auf dich.</span>${button("Entwurf fortsetzen", "resume", {}, "text-button")}</aside>` : ""}
 ${pending.length ? `<section class="revisit"><span class="overline">Damals & heute · ${date(pending[0].at)}</span><h2>Was ist daraus geworden?</h2><p>${e(pending[0].title)}</p><blockquote>${e(pending[0].detail)}</blockquote><div class="actions">${button("In Ruhe zurückblicken", "gap", { key: pending[0].key }, "button primary")}${link(pending.length > 1 ? `${pending.length} offene Rückblicke` : "Alle Rückblicke", "reviews")}</div></section>` : `<section class="home-note"><span class="overline">Glaube im Alltag</span><h2>Ein Gedanke. Ein Schritt.<br>Und später ein neuer Blick.</h2><p>Verbinde, was dich beschäftigt, mit deinem persönlichen Weg. FaithPath erinnert dich später daran.</p></section>`}
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
 <div class="manifesto"><span>${icon("leaf")}</span><p>FaithPath misst nicht deinen Glauben.<br><strong>FaithPath hilft dir, deine Entwicklung zu erkennen.</strong></p></div>`);
}
function guidance() {
  shell(
    `${back("Heute", "today")}${heading("Orientierung", "Was beschäftigt dich?", "Diese Bibeltexte können dir helfen, über deine Situation nachzudenken. Du brauchst kein Vorwissen.")}<div class="topic-grid">${LIFE_TOPICS.map((t) => row(t.title, t.sub, "topic/" + t.id)).join("")}</div><section class="section"><div class="section-heading"><h2>Lieber begleitet anfangen?</h2></div>${row("Geführte Wege", "Lesen, verstehen, ausprobieren und zurückblicken.", "plans")}${BEGINNER_GUIDES.map((g) => row(g.title, `${g.days.length} Abschnitte · in deinem Tempo`, "guide/" + g.id)).join("")}</section>`,
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
  shell(
    `${back("Heute", "today")}${heading("Geführte Wege", "Ein Thema, das dich begleitet.", "Lesen. Verstehen. Etwas ausprobieren. Und später sehen, was geblieben ist. In deinem Tempo.")}<div class="list">${GUIDED_PLANS.map(
      (p) => {
        const n = Object.values(planProgress("plan", p.id)).filter(
          Boolean,
        ).length;
        return row(
          p.title.replace(/^\d+ Tage – /, ""),
          `${p.days.length} Abschnitte${n ? " · " + n + " festgehalten" : ""} · ${p.sub}`,
          "plan/" + p.id,
        );
      },
    ).join(
      "",
    )}${BEGINNER_GUIDES.map((p) => row(p.title, `${p.days.length} Abschnitte · begleitet beginnen`, "guide/" + p.id)).join("")}</div>`,
  );
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
  shell(
    `${heading("Lesen", "Die Bibel. Raum zum Verstehen.", "Lies in deinem Tempo. Tippe auf einen Vers, um ihn zu markieren oder einen Gedanken festzuhalten.")}<div class="segmented" aria-label="Bibelbereiche">${link("Lesen", "bible", "active")}${link("Entdecken", "discover")}${link("Markierungen", "marks")}</div>${s().reading ? row("Weiterlesen", refLabel(s().reading), readRoute(s().reading), "Deine letzte Stelle") : ""}<div class="field"><label for="book-search">Buch finden</label><input type="search" id="book-search" data-input="books" placeholder="Zum Beispiel Römer" autocomplete="off"></div><div class="book-columns" id="book-list">${bookList()}</div>`,
    "bible",
  );
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
 ${heading(ctx ? "Lesen & verstehen" : "Bibel", b.name + " " + ref.chapter)}${ctx ? `<aside class="context"><span class="overline">Im Zusammenhang</span><p>${e(ctx.context)}</p><span class="meta">Im Fokus: ${e(refLabel(ref))}. Das ganze Kapitel bleibt lesbar.</span>${ref.from ? button("Zum Abschnitt", "focus-passage", {}, "text-button") : ""}</aside>` : ""}<div class="reading-text" id="verses">${vs.map((v) => `<button type="button" class="verse ${s().highlights.some((h) => normBook(h.book) === code && +h.chapter === +chapter && (h.translation || "otb") === tr && v[0] >= h.from && v[0] <= h.to) ? "marked" : ""} ${ref.from && v[0] >= ref.from && v[0] <= (ref.to || ref.from) ? "in-passage" : ""}" data-action="verse" data-v="${v[0]}" aria-pressed="false" aria-label="Vers ${v[0]}: ${e(v[1])}"><sup>${v[0]}</sup><span>${e(v[1])}</span></button>`).join("")}</div>
 <div class="chapter-nav">${ref.chapter > 1 ? link("← Vorheriges Kapitel", readRoute({ book: code, chapter: ref.chapter - 1, translation: tr })) : ""}${ref.chapter < b.chapters.length ? link("Nächstes Kapitel →", readRoute({ book: code, chapter: ref.chapter + 1, translation: tr })) : ""}</div>
 <section class="reflection-invite"><span class="overline">Was bleibt bei dir?</span><h2>${e(ctx?.question || "Was berührt dich in diesem Text?")}</h2><p>Ein Satz genügt. Du kannst daraus später einen Weg machen.</p>${button("Meinen Gedanken festhalten", "reflect-reader", {}, "button primary")}</section><small class="translation-credit">${e(TRANSLATIONS[tr].name)} · ${tr === "otb" ? "CC BY-SA 4.0" : "gemeinfrei"} · ${link("Textquelle", "licenses")}</small><div id="selection-bar"></div>`,
    "bible",
    "reader-page",
  );
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
  container.innerHTML = ui.selection.size
    ? `<div class="selection-bar" role="region" aria-label="Versaktionen"><span>${ui.selection.size} ${ui.selection.size === 1 ? "Vers" : "Verse"} ausgewählt</span><div>${button("Markieren", "mark", {}, "select-action")}${button("Notiz", "reflect-reader", {}, "select-action")}${button("Mit Weg", "connect-reader", {}, "select-action")}${button("Kopieren", "copy", {}, "select-action")}${button(icon("close") + '<span class="sr-only">Auswahl aufheben</span>', "clear-selection", {}, "icon-button")}</div></div>`
    : "";
}
function currentRef() {
  const ref = selection() || ui.reader.ref;
  return { ...ref, label: refLabel(ref) };
}
function marks() {
  const data = s().highlights;
  shell(
    `${heading("Deine Bibel", "Markierungen", "Stellen, zu denen du zurückkehren möchtest.")}<div class="segmented">${link("Lesen", "bible")}${link("Entdecken", "discover")}${link("Markierungen", "marks", "active")}</div>${
      data.length
        ? data
            .slice()
            .sort((a, b) => time(b.at) - time(a.at))
            .map((h) =>
              row(
                h.label || refLabel(h),
                `${date(h.at)} · ${TRANSLATIONS[h.translation || "otb"].label}`,
                "mark/" + encodeURIComponent(h.id),
              ),
            )
            .join("")
        : empty(
            "Was dich anspricht, darf bleiben.",
            "Tippe beim Lesen auf einen Vers und wähle „Markieren“.",
            link("Bibel öffnen", "bible", "button primary"),
          )
    }`,
    "bible",
  );
}
function markDetail(id) {
  const h = s().highlights.find((h) => h.id === id);
  if (!h) return notFound();
  shell(
    `${back("Markierungen", "marks")}${heading("Markiert am " + date(h.at), h.label || refLabel(h))}<blockquote class="scripture-quote">${e(h.snippet)}</blockquote><div class="actions">${link("Bibeltext öffnen", readRoute(h, "marks"), "button primary")}${button("Mit Weg verbinden", "connect-ref", { ref: JSON.stringify(h) }, "button quiet")}</div><section class="section">${button("Markierung entfernen", "remove-mark", { id }, "text-button danger-text")}</section>`,
    "bible",
  );
}
function discover() {
  shell(
    `${heading("Entdecken", "Verstehen, was du liest.", "Geschichten und Fragen, die dich zurück zum Text führen. Ohne Punkte oder Ranglisten.")}<div class="segmented">${link("Lesen", "bible")}${link("Entdecken", "discover", "active")}${link("Markierungen", "marks")}</div><div class="field"><label for="story-search">Geschichte, Thema oder Bibelstelle suchen</label><input id="story-search" type="search" data-input="stories" value="${e(ui.storySearch)}" placeholder="Zum Beispiel Vergebung"></div><div class="filter-pair"><div class="field"><label for="story-book">Buch</label><select id="story-book" data-change="story-book"><option value="">Alle Bücher</option>${ui.books
      .filter((b) => ui.stories.some((s) => s.book === b.code))
      .map(
        (b) =>
          `<option value="${b.code}" ${ui.storyBook === b.code ? "selected" : ""}>${e(b.name)}</option>`,
      )
      .join(
        "",
      )}</select></div><div class="field"><label for="story-kind">Inhalte</label><select id="story-kind" data-change="story-kind"><option value="alle">Alle Einheiten</option><option value="geschichte" ${ui.storyKind === "geschichte" ? "selected" : ""}>Geschichten</option><option value="kapitel" ${ui.storyKind === "kapitel" ? "selected" : ""}>Kapitelübungen</option></select></div></div><div id="story-results">${storyResults()}</div>${link("So sind die Inhalte geprüft", "content-status")}`,
    "bible",
  );
}
function storyResults() {
  const q = ui.storySearch.toLowerCase(),
    items = ui.stories.filter(
      (x) =>
        (!ui.storyBook || x.book === ui.storyBook) &&
        (ui.storyKind === "alle" ||
          (x.kind === "chapter-quiz") === (ui.storyKind === "kapitel")) &&
        [x.title, x.desc, x.ref, x.reflection]
          .join(" ")
          .toLowerCase()
          .includes(q),
    );
  return items.length
    ? `<p class="meta" aria-live="polite">${items.length} Einheiten</p>${items.map((x) => row(x.title, `${x.ref} · ${x.questions.length} Fragen`, "story/" + x.id)).join("")}`
    : empty(
        "Hier haben wir noch keinen Treffer.",
        "Versuche ein anderes Wort oder ein anderes Buch.",
      );
}
function statusFor(x) {
  return x.verification?.status === "verse-checked"
    ? "Vorhandener Prüfvermerk: gegen Luther 1912 geprüft"
    : x.kind === "chapter-quiz"
      ? "Textbasierte Übung · redaktionell noch zu prüfen"
      : "Bestandsinhalt · Prüfvermerk fehlt";
}
function story(id) {
  const x = ui.stories.find((x) => String(x.id) === id);
  if (!x) return notFound();
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
  const { story: x, index, answer } = ui.quiz,
    q = x.questions[index];
  shell(
    `${back("Zur Geschichte", "story/" + x.id)}<div class="quiz-head"><span class="overline">Verständnisfragen</span><span>Frage ${index + 1} von ${x.questions.length}</span></div><h1 class="quiz-title" tabindex="-1">${e(q.q)}</h1><p class="meta">${e(x.ref)}${x.kind === "chapter-quiz" ? " · Grundlage: Luther 1912" : ""}</p><div class="answers">${q.a.map((a, i) => `<button type="button" data-action="answer" data-answer="${i}" ${answer != null ? "disabled" : ""} class="answer ${answer != null && i === q.c ? "correct" : answer === i ? "selected-wrong" : ""}"><span>${String.fromCharCode(65 + i)}</span><span>${e(a)}${answer != null && i === q.c ? "<small>Richtige Antwort</small>" : answer === i ? "<small>Deine Antwort</small>" : ""}</span></button>`).join("")}</div>${answer != null ? `<section class="explanation" role="status"><strong>${answer === q.c ? "Ja, das steht im Text." : "Schau noch einmal auf den Zusammenhang."}</strong><p>${e(q.x)}</p><span class="meta">${e(q.ref || q.p)}</span></section>${button(index === x.questions.length - 1 ? "Zur persönlichen Reflexion" : "Nächste Frage", "next-question", {}, "button primary")}` : ""}`,
    "bible",
  );
}
function paths() {
  const data = s().paths.filter((p) => !!p.archived === ui.archive);
  shell(
    `${heading("Mein Weg", "Was dich über Zeit begleitet.", "Bibelstellen, Gedanken und kleine Schritte. Deine Geschichte bleibt zusammen.")}<div class="actions">${button("Weg beginnen", "new-path", {}, "button primary")}${button(ui.archive ? "Aktive Wege" : "Archiv", "toggle-archive", {}, "button quiet")}</div>${data.length ? `<div class="path-list">${data.map((p, i) => `<article><span class="path-index">${String(i + 1).padStart(2, "0")}</span><div>${link(e(p.title), "path/" + encodeURIComponent(p.id), "path-title")}<p>${e(p.why || category(p.category).label)}</p><small>Seit ${date(p.started)}${p.milestones.length ? " · Entwicklung festgehalten" : ""}</small></div></article>`).join("")}</div>` : empty(ui.archive ? "Noch keine archivierten Wege." : "Dein Weg darf klein anfangen.", ui.archive ? "Ruhende Wege behalten ihre ganze Geschichte." : "Vielleicht möchtest du geduldiger zuhören oder einer offenen Frage Raum geben.")}<section class="section">${row("Dein Olivenbaum", "Die Entwicklung, die du selbst festgehalten hast.", "tree")}${row("Geführte Wege", "Eine ruhige Begleitung für deinen Anfang.", "plans")}${row("Deine ganze Geschichte", "Bibelstellen, Gedanken und Entwicklungen.", "history")}</section>`,
    "paths",
  );
}
function path(pid) {
  const p = s().paths.find((p) => p.id === pid);
  if (!p) return notFound();
  const entries = timeline(s(), pid);
  shell(
    `${back("Meine Wege", "paths")}${heading(category(p.category).label, p.title, p.why)}<p class="meta">Begonnen am ${date(p.started)}${p.archived ? " · archiviert" : ""}</p><div class="actions">${button("Gedanken festhalten", "reflect-path", { id: pid }, "button primary")}${button("Zurückblicken", "review-path", { id: pid }, "button quiet")}</div><section class="next-step"><div class="section-heading"><h2>Ein kleiner nächster Schritt</h2>${button(icon("plus") + '<span class="sr-only">Schritt hinzufügen</span>', "step", { id: pid }, "icon-button")}</div>${
      p.steps.some((x) => !x.done)
        ? p.steps
            .filter((x) => !x.done)
            .map(
              (x) =>
                `<label class="step-row"><input type="checkbox" data-change="step-done" data-path="${e(pid)}" data-id="${e(x.id)}"><span>${e(x.text)}</span></label>`,
            )
            .join("")
        : "<p>Was könntest du im Alltag ausprobieren? Du entscheidest, was gerade machbar ist.</p>"
    }${
      p.steps.some((x) => x.done)
        ? `<details><summary>Ausprobierte Schritte (${p.steps.filter((x) => x.done).length})</summary>${p.steps
            .filter((x) => x.done)
            .map(
              (x) =>
                `<label class="step-row"><input type="checkbox" checked data-change="step-done" data-path="${e(pid)}" data-id="${e(x.id)}"><span>${e(x.text)}</span></label>`,
            )
            .join("")}</details>`
        : ""
    }<small>Ein ausprobierter Schritt ist noch keine bestätigte Entwicklung.</small></section><section class="section"><div class="section-heading"><h2>Die Geschichte dieses Weges</h2></div>${timelineHTML(entries, ui.historyLimit)}${entries.length > ui.historyLimit ? button("Weitere Momente", "more-history", { path: pid }, "button quiet") : ""}</section><details class="path-options"><summary>Weg verwalten</summary><div class="actions">${button("Titel & Beschreibung ändern", "edit-path", { id: pid }, "button quiet")}${button(p.archived ? "Weg wieder aufnehmen" : "Weg archivieren", "archive-path", { id: pid }, "button quiet")}${button("Weg löschen", "delete-path", { id: pid }, "text-button danger-text")}</div></details>`,
    "paths",
  );
}
function tree() {
  const lvl = treeLevel(s());
  shell(
    `${back("Mein Weg", "paths")}${heading("Dein Olivenbaum", stageNames[lvl], "Dieses Bild steht für Entwicklung, die du selbst dokumentiert hast. Es sagt nichts darüber aus, wie gut dein Glaube ist.")}<figure class="tree-figure"><img src="trees/tree-stage-${lvl + 1}.webp" alt="${e(stageNames[lvl])}" width="700" height="700"><figcaption>Ruhende Wege und schwierige Zeiten nehmen deiner Geschichte nichts weg.</figcaption></figure><section class="section"><h2>Was hinter dem Baum steht</h2>${timelineHTML(timeline(s()).filter((x) => x.kind === "Entwicklung festgehalten")) || "<p>Wenn du später selbst eine Entwicklung bestätigst, wird sie hier sichtbar.</p>"}<details><summary>Wie sich das Bild verändert</summary><p>Die sieben vorhandenen Bilder folgen der Anzahl deiner festgehaltenen Entwicklungen: 0, 1, 2, 3–4, 5–6, 7–9 und ab 10. Das ist eine symbolische Darstellung, keine Messung deines Glaubens. Einzelne Äste sind noch nicht bestimmten Wegen zugeordnet.</p></details></section>`,
    "paths",
  );
}
function journal() {
  shell(
    `<div class="heading-with-action">${heading("Journal", "Festhalten, was bleibt.", "Deine Gedanken dürfen sich verändern. Hier kannst du zu ihnen zurückkehren.")}${button(icon("plus") + '<span class="sr-only">Neuer Eintrag</span>', "new-entry", {}, "icon-button")}</div><div class="field"><label for="journal-search">In deinen Einträgen suchen</label><input id="journal-search" type="search" data-input="journal" placeholder="Gedanke oder Bibelstelle" value="${e(ui.search)}"></div><div class="filters" aria-label="Einträge filtern">${["Alle", "Gedanken", "Bibel", "Reflexion", "Predigt", "Gebet", "Dankbarkeit", "Ziele"].map((f) => button(e(f), "journal-filter", { filter: f }, "filter " + (ui.filter === f ? "active" : ""))).join("")}</div><div id="journal-results">${journalResults()}</div>`,
    "journal",
  );
}
function journalResults() {
  const items = s()
    .journal.filter(
      (j) =>
        (ui.filter === "Alle" ||
          [j.type, j.subtype].includes(ui.filter) ||
          (ui.filter === "Gedanken" && j.type === "Journal")) &&
        [
          j.text,
          j.ref?.label,
          ...(j.pathIds || []).map(
            (id) => s().paths.find((p) => p.id === id)?.title,
          ),
        ]
          .join(" ")
          .toLowerCase()
          .includes(ui.search.toLowerCase()),
    )
    .sort((a, b) => (time(b.date) || 0) - (time(a.date) || 0));
  return items.length
    ? `<p class="meta" aria-live="polite">${items.length} Einträge</p>${timelineHTML(
        items.map((j) => ({
          at: j.date,
          kind: j.subtype || j.type,
          title: j.text,
          route: "entry/" + encodeURIComponent(j.id),
          pathId: j.pathIds?.[0],
        })),
        ui.journalLimit,
      )}${items.length > ui.journalLimit ? button("Weitere Einträge", "more-journal", {}, "button quiet") : ""}`
    : empty(
        ui.search ? "Kein passender Eintrag." : "Ein Gedanke reicht.",
        "Du kannst frei schreiben, eine Predigtnotiz sammeln oder vom Bibeltext aus reflektieren.",
        button("Etwas festhalten", "new-entry", {}, "button primary"),
      );
}
function entry(id, kind = "entry") {
  const x = (
    kind === "reflection"
      ? s().reflections
      : kind === "review"
        ? s().reviews
        : s().journal
  ).find((j) => j.id === id);
  if (!x) return notFound();
  shell(
    `${back("Journal", "journal")}${heading(x.subtype || x.type || (kind === "review" ? "Rückblick" : "Reflexion"), date(x.date))}<div class="entry-text preserve">${e(x.text)}</div>${x.ref ? row(refLabel(x.ref), TRANSLATIONS[x.ref.translation || "otb"].name, readRoute(x.ref, "journal")) : ""}<div class="entry-paths">${(
      x.pathIds || []
    )
      .map((pid) => {
        const p = s().paths.find((p) => p.id === pid);
        return p
          ? row(p.title, "Teil dieses Weges", "path/" + encodeURIComponent(pid))
          : "";
      })
      .join(
        "",
      )}</div>${kind === "entry" ? `<div class="actions">${button("Mit Weg verbinden", "connect-entry", { id }, "button primary")}${button("Bearbeiten", "edit-entry", { id }, "button quiet")}</div>` : ""}`,
    "journal",
  );
}
function history() {
  const items = timeline(s());
  shell(
    `${back("Heute", "today")}${heading("Deine Glaubensgeschichte", "Damals wichtig. Heute Teil von dir.", "Bibelstellen, Gedanken, Wege und Rückblicke — in ihrem Zusammenhang.")}<div class="segmented">${link("Meine Geschichte", "history", "active")}${link("Offene Rückblicke", "reviews")}</div>${items.length ? timelineHTML(items, ui.historyLimit) : empty("Deine Geschichte beginnt mit einem Moment.", "Wenn du einen Gedanken oder eine Entwicklung festhältst, findest du ihn hier wieder.", link("Einen Anfang finden", "guidance", "button primary"))}${items.length > ui.historyLimit ? button("Weitere Momente", "more-history", {}, "button quiet") : ""}`,
    "paths",
  );
}
function reviews() {
  const pending = gaps(s());
  shell(
    `${back("Heute", "today")}${heading("Rückblicke", "Was ist daraus geworden?", "Du musst nichts nachholen. Vielleicht möchtest du einen früheren Gedanken noch einmal ansehen.")}<div class="segmented">${link("Meine Geschichte", "history")}${link("Offene Rückblicke", "reviews", "active")}</div>${pending.length ? pending.map((g) => `<article class="review-row"><span class="overline">${date(g.at)} · vor ${g.age} Tagen</span><h2>${e(g.title)}</h2><p class="clamp">${e(g.detail)}</p>${button("Zurückblicken", "gap", { key: g.key }, "text-button")}</article>`).join("") : empty("Gerade ist nichts offen.", "Wenn ein Gedanke etwas zurückliegt, kannst du ihm hier wieder begegnen. Du kannst auch jederzeit in einem Weg selbst zurückblicken.", link("Meine Wege", "paths", "button quiet"))}<p class="meta">Erinnerungen erscheinen beim Öffnen der App. Es werden keine Push-Nachrichten verschickt.</p>`,
    "paths",
  );
}
function more() {
  shell(
    `${heading("Mehr", "Deine Daten. Deine Entscheidung.")}<div class="list">${row("Meine Geschichte", "Frühere Gedanken und ihre Entwicklung.", "history")}${row("Geführte Wege", "Eine ruhige Begleitung.", "plans")}${row("Entdecken & Verständnisfragen", "Geschichten, Kapitel und Reflexion.", "discover")}${row("Markierungen", "Deine gespeicherten Bibelstellen.", "marks")}${row("Inhalte & Prüfstatus", "Was vorhanden ist und was noch geprüft werden muss.", "content-status")}</div><section class="section"><h2>Deine Daten sichern</h2><p>Deine persönlichen Einträge bleiben in diesem Browser. Ein Backup schützt sie, wenn du das Gerät wechselst oder Browserdaten löschst.</p><div class="actions">${button("Backup exportieren", "export", {}, "button primary")}${button("Backup importieren", "import", {}, "button quiet")}</div><input id="import-file" type="file" accept=".json,application/json" hidden>${!store.error && deviceStorage.getItem(KEYS.restore) ? button("Stand vor dem letzten Import wiederherstellen", "undo-import", {}, "text-button") : ""}</section><section class="section"><h2>Offline & auf dem iPhone</h2><p id="offline-state" role="status">${ui.offline ? "Beide Bibeln und die App sind für dieses Gerät offline bereit." : "Offline-Vorbereitung läuft, solange diese Seite online geöffnet ist."}</p>${button("Offline-Status prüfen", "offline-check", {}, "text-button")}<p>Auf dem iPhone: In Safari „Teilen“ öffnen, dann „Zum Home-Bildschirm“ wählen. Zum ersten Einrichten online bleiben, bis oben „offline bereit“ steht.</p></section><section class="section"><h2>Privat auf deinem Gerät</h2><p>Keine Werbung, keine Tracking-SDKs, kein KI-Chat. Persönliche Texte werden nicht an FaithPath übertragen. Sie sind lokal gespeichert und nicht zusätzlich verschlüsselt. Der Hosting-Anbieter verarbeitet beim Laden technische Verbindungsdaten.</p>${link("Bibeltexte & Lizenzen", "licenses")}${button("Einführung ansehen", "onboard", {}, "text-button")}</section><small class="build-id">FaithPath V4 · ${BUILD}</small>`,
    "more",
  );
}
function contentStatus() {
  shell(
    `${back("Mehr", "more")}${heading("Transparent bleiben", "Inhalte & Prüfstatus", "Alle vorhandenen Fragen bleiben erhalten. Ein technischer Referenztest ist keine theologische Qualitätsprüfung.")}<dl class="status-list"><div><dt>Bibeltexte offline</dt><dd>OTB Deutsch und Luther 1912, je 66 Bücher.</dd></div><div><dt>Bestand</dt><dd>312 Einheiten · 1.560 Fragen · 312 Reflexionsfragen · 27 NT-Bücher.</dd></div><div><dt>Vorhandener Prüfvermerk</dt><dd>20 Einheiten / 100 Fragen: im Ausgangsprojekt gegen Luther 1912 geprüft markiert. Der Vermerk wird übernommen.</dd></div><div><dt>Noch redaktionell zu prüfen</dt><dd>260 Kapitelübungen / 1.300 textbasiert erzeugte Fragen.</dd></div><div><dt>Prüfvermerk fehlt</dt><dd>32 bestehende Einheiten / 160 Fragen. Nicht als verifiziert bezeichnet.</dd></div><div><dt>Neu in dieser Version</dt><dd>Keine neuen Quizfragen. Bibelreferenzen technisch gegen beide enthaltenen Übersetzungen geprüft.</dd></div></dl><p>Die Lesetexte sind vollständig. Der Geschichtenkatalog deckt nicht jedes Buch des Alten Testaments ab.</p>`,
    "more",
  );
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
  ui.dialogRoute = location.hash.slice(1);
  ui.form = form;
  d.innerHTML = `<div class="dialog-top"><h2 id="dialog-title">${e(title)}</h2>${button(icon("close") + '<span class="sr-only">Schließen</span>', "close", {}, "icon-button")}</div>${content}`;
  if (values)
    for (const [k, v] of Object.entries(values)) {
      const el = d.querySelector(`[name="${CSS.escape(k)}"]`);
      if (el) {
        if (el.type === "checkbox") el.checked = !!v;
        else el.value = v;
      }
    }
  if (!d.open) d.showModal();
  document.body.classList.add("modal-open");
  setTimeout(
    () =>
      (
        $("input:not([type=checkbox]),textarea,select", d) || $("button", d)
      )?.focus(),
    50,
  );
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
  ui.form = null;
  $("#dialog").close();
  document.body.classList.remove("modal-open");
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
    }`;
    cta = old ? "Änderungen speichern" : "Weg beginnen";
  } else if (type === "step") {
    const p = s().paths.find((p) => p.id === args.pathId);
    if (!p) return;
    title = "Ein kleiner nächster Schritt";
    const suggestions = category(p.category).steps.filter(
      (t) => !p.steps.some((x) => x.text === t),
    );
    body = `<p>Was wäre für „${e(p.title)}“ gerade machbar?</p>${suggestions.length ? `<details><summary>Ein paar Anregungen</summary><div class="suggestions">${suggestions.map((text) => button(e(text), "use-suggestion", { text }, "suggestion")).join("")}</div></details>` : ""}${textarea("Dein Schritt", "text", "", "Beschreibe eine konkrete, kleine Handlung.")}<p class="meta">Du probierst etwas aus. Ob daraus Entwicklung entsteht, hältst du später selbst fest.</p>`;
    cta = "Schritt festhalten";
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
  modal(
    title,
    `<form id="editor-form"><div id="form-error" role="alert" tabindex="-1"></div>${body}<button class="button primary full" type="submit">${cta}</button></form>`,
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
      p.steps.push({
        id: id(),
        text: v.text.trim(),
        done: false,
        createdAt: at,
      });
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
async function action(a, d, el) {
  if (a === "close") {
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
  if (a === "mark") {
    const r = selection();
    if (!r) return;
    r.label = refLabel(r);
    if (s().highlights.some((h) => sameRef(h, r))) {
      notify("Diese Stelle ist bereits markiert.");
      return;
    }
    change((data) =>
      data.highlights.push({
        ...r,
        id: id(),
        at: now(),
        snippet: ui.reader.vs
          .filter((v) => v[0] >= r.from && v[0] <= r.to)
          .map((v) => v[1])
          .join(" "),
      }),
    );
    for (const v of ui.selection) $(`[data-v="${v}"]`)?.classList.add("marked");
    notify("Markierung gespeichert.");
    return;
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
    const x = ui.stories.find((x) => String(x.id) === d.id);
    if (!x) return;
    openForm("entry", {
      ref: validRef(
        {
          book: x.book,
          chapter: x.chapter + 1,
          from: x.from,
          to: x.to,
          label: x.ref,
          translation: x.kind === "chapter-quiz" ? "l1912" : s().translation,
        },
        ui.refs,
      ),
      kind: "Reflexion",
      question: x.reflection,
      storyId: x.id,
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
  if (a === "remove-mark") {
    modal(
      "Markierung entfernen?",
      `<p>Notizen und verbundene Wege bleiben erhalten.</p>${button("Markierung entfernen", "confirm-remove-mark", { id: d.id }, "button quiet")}`,
    );
    return;
  }
  if (a === "confirm-remove-mark") {
    change((data) => {
      data.highlights = data.highlights.filter((h) => h.id !== d.id);
    });
    closeModal();
    go("marks");
    return;
  }
  if (a === "quiz") {
    const x = ui.stories.find((x) => String(x.id) === d.id);
    if (!x) return;
    ui.quiz = { story: x, index: 0, answer: null };
    go("quiz/" + d.id);
    return;
  }
  if (a === "answer") {
    if (ui.quiz.answer != null) return;
    ui.quiz.answer = +d.answer;
    quiz();
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
      go("story/" + x.id);
      notify("Was möchtest du aus dem Text mitnehmen?");
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
    return;
  }
  if (a === "delete-path") {
    modal(
      "Diesen Weg löschen?",
      `<p>Dieser Weg einschließlich seiner Rückblicke und Entwicklungen wird entfernt. Deine Journaltexte und Markierungen bleiben erhalten. Du kannst den Weg stattdessen archivieren.</p><div class="actions">${button("Lieber archivieren", "archive-and-close", { id: d.id }, "button primary")}${button("Weg endgültig löschen", "confirm-delete", { id: d.id }, "button quiet danger-text")}</div>`,
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
    change((data) => {
      data.paths = data.paths.filter((p) => p.id !== d.id);
      for (const item of [...data.journal, ...data.reflections])
        if (item.pathIds)
          item.pathIds = item.pathIds.filter((pid) => pid !== d.id);
      delete data.reminderSnoozes["path:" + d.id];
      delete data.dismissedGaps["path:" + d.id];
    });
    closeModal();
    go("paths");
    return;
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
    go("more");
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
    ui.route = route;
    if (kind === "today") home();
    else if (kind === "guidance") guidance();
    else if (kind === "topic") topic(key);
    else if (kind === "bible") bible();
    else if (kind === "chapters") chapters(key);
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
    else if (kind === "quiz") {
      if (!ui.quiz || String(ui.quiz.story.id) !== key) {
        const x = ui.stories.find((x) => String(x.id) === key);
        if (!x) return notFound();
        ui.quiz = { story: x, index: 0, answer: null };
      }
      quiz();
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
    [ui.books, ui.stories, ui.refs] = await Promise.all(
      ["index.json", "stories.json", "reference-index.json"].map((file) =>
        fetch(new URL(file, CONTENT_BASE)).then((r) => {
          if (!r.ok)
            throw new Error(
              "Eine benötigte Datei fehlt. Bitte lade die Seite online neu.",
            );
          return r.json();
        }),
      ),
    );
    await render();
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
