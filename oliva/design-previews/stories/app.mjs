import { APP_ORIGIN, filterStories, readerURL, feedback, validateSample } from "./model.mjs";

// An isolated design study. No OLIVA storage, authentication API, analytics,
// service worker, score, reading completion or tree action is invoked here.
const root = document.getElementById("root");
const memories = new Map();
let catalog, lastStory, query = "", testament = "Alle", kind = "Alle";
const paths = {
  leaf: ["M5 19C2 8 9 3 21 3c0 12-5 18-16 16Z", "M3 22 16 8M9 15V9M9 15h6"],
  book: ["M12 5C8 2 4 3 2 4v15c4-2 7-1 10 1 3-2 6-3 10-1V4c-4-2-7-1-10 1Z", "M12 5v15"],
  home: ["m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"],
  path: ["M17 3c-15 0 8 7-7 11s-4 7 0 7"],
  bookmark: ["M6 3h12v19l-6-4-6 4Z"],
  back: ["M20 12H4m6-6-6 6 6 6"],
  next: ["M4 12h16m-6-6 6 6-6 6"],
  chevron: ["m9 5 7 7-7 7"],
  search: ["M16 16l5 5", "M17 10A7 7 0 1 1 3 10a7 7 0 0 1 14 0"],
  moon: ["M21 14A9 9 0 0 1 10 3a9 9 0 1 0 11 11Z"],
  sun: ["M12 1v3m0 16v3M1 12h3m16 0h3M4.2 4.2l2.1 2.1m11.4 11.4 2.1 2.1M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1", "M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0"],
  info: ["M12 11v6m0-10v.1", "M22 12A10 10 0 1 1 2 12a10 10 0 0 1 20 0"],
  external: ["M14 3h7v7m0-7L10 14M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5"],
  pen: ["m4 16-1 5 5-1L21 7l-4-4L4 16Zm10-10 4 4"],
};
function el(tag, attributes = {}, ...children) {
  const node = document.createElement(tag);
  for (const child of children.flat(Infinity)) {
    if (child !== null && child !== undefined && child !== false)
      node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  for (const [name, value] of Object.entries(attributes)) {
    if (typeof value === "function" && name.startsWith("on")) node.addEventListener(name.slice(2), value);
    else if (name === "value") node.value = value;
    else if (value !== null && value !== undefined && value !== false)
      node.setAttribute(name === "className" ? "class" : name, value === true ? "" : String(value));
  }
  return node;
}
function icon(name, className = "") {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  if (className) svg.setAttribute("class", className);
  for (const d of paths[name]) {
    const path = document.createElementNS(svg.namespaceURI, "path");
    path.setAttribute("d", d);
    svg.append(path);
  }
  return svg;
}
function button(text, onClick, tone = "primary", iconName) {
  return el("button", { type: "button", class: "button button-" + tone, onclick: onClick },
    iconName && icon(iconName), text);
}
function external(text, url, tone = "secondary", iconName = "external") {
  return el("a", { href: url, target: "_blank", rel: "noopener noreferrer", class: "button button-" + tone },
    icon(iconName), text, el("span", { class: "sr-only" }, " – öffnet die bestehende OLIVA-App in einem neuen Tab"));
}
function state(story) {
  if (!memories.has(story.id))
    memories.set(story.id, { index: 0, pending: {}, answers: {}, note: "", noteKept: false, step: "lesen" });
  return memories.get(story.id);
}
function go(hash) {
  if (location.hash === hash) render(true);
  else location.hash = hash;
}
function open(story, step = "lesen") {
  go("#geschichte/" + story.id + "/" + step);
}
function art(story, small = false) {
  return el("img", {
    class: small ? "thumb" : "art",
    src: "./assets/" + story.image + (small ? "-640.webp" : "-large.webp"),
    alt: story.id === "NS-0241"
      ? "Künstlerische Interpretation: Maria und Josef bei dem Kind in der Krippe; Hirten im Hintergrund."
      : "Künstlerische Interpretation zum Abschnitt „" + story.title + "“.",
    loading: small ? "lazy" : "eager", decoding: "async", width: small ? "64" : "640", height: small ? "76" : "427",
  });
}
function credit(story) {
  let text = "KI-Illustration · künstlerische Interpretation. Fachfreigabe steht aus.";
  if (story.id === "NS-0006") text += " Gezeigter Moment: 1. Mose 8,6–12.";
  if (story.id === "NS-0052") text += " Gezeigter Moment: 1. Samuel 17,38–45.";
  return el("p", { class: "image-credit" }, text);
}
function shortIntro(story) {
  const intros = {
    "NS-0241": "Ein kleiner Anfang in Bethlehem. Entdecke die Begegnungen, von denen Lukas erzählt.",
    "NS-0073": "Sechs Verse über Begleitung und Vertrauen. Nimm dir einen ruhigen Moment für den Text.",
    "NS-0006": "Noah wartet auf trockenes Land. Eine Taube bringt ein kleines Zeichen dafür, dass sich etwas verändert.",
    "NS-0010": "Abram spricht seine offene Frage aus. Unter den Sternen hört er von einer Zukunft, die er noch nicht sehen kann.",
    "NS-0052": "David probiert Rüstung und Helm aus. Dann legt er sie ab und nimmt Vertrautes mit in eine bedrohliche Begegnung.",
    "NS-0203": "Die Freunde sprechen ihre Angst aus. Lies, wie Markus von dieser Begegnung auf dem See erzählt.",
    "NS-0235": "Die Frauen gehen am Morgen zum Grab. Was sie erleben, weckt Fragen und Furcht.",
  };
  return intros[story.id];
}
function listItem(story) {
  const thumb = story.image ? art(story, true) :
    el("div", { class: "thumb text-thumb", "aria-hidden": "true" }, "23", el("small", {}, "PSALM"));
  return el("a", { class: "list-link", href: "#geschichte/" + story.id + "/lesen" },
    thumb,
    el("div", { class: "list-copy" },
      el("span", { class: "eyebrow", style: "font-size:8px;letter-spacing:1.3px" }, story.kind),
      el("h3", {}, story.title),
      el("p", { class: "small" }, story.referenceLabel + " · " + story.questions.length + " Fragen")),
    icon("chevron", "chevron"));
}
function renderLibrary(main) {
  main.append(el("p", { class: "eyebrow" }, "Bibel entdecken"),
    el("h1", { tabindex: "-1" }, "Ein Text.", el("br"), "Ein neuer Blick."),
    el("p", { class: "intro" }, "Geschichten, Gebete und Gedanken der Bibel. Du brauchst kein Vorwissen."));
  if (lastStory) {
    const story = catalog.stories.find((s) => s.id === lastStory), memo = state(story);
    if (Object.keys(memo.answers).length || memo.note) {
      main.append(el("a", { class: "resume", href: "#geschichte/" + story.id + "/" + memo.step },
        icon("bookmark"),
        el("div", {}, el("strong", {}, "Hier im Entwurf fortsetzen"),
          el("span", { class: "small" }, story.title + " · " + (memo.step === "verstehen" ? "Frage " + (memo.index + 1) : "Dein Gedanke"))),
        icon("chevron")));
    }
  }
  const featured = catalog.stories.find((s) => s.id === "NS-0241");
  const feature = el("div", { id: "entry-feature" },
    el("a", { class: "feature", href: "#geschichte/NS-0241/lesen" },
      art(featured),
      el("div", { class: "feature-body" },
        el("p", { class: "eyebrow", style: "font-size:8px;letter-spacing:1.8px" }, "Eine Begegnung zum Anfang"),
        el("h2", {}, featured.title),
        el("p", { class: "meta" }, icon("book"), featured.referenceLabel),
        el("p", { class: "intro", style: "margin-top:8px" }, "Gott begegnet Menschen mitten im Alltag."),
        el("span", { class: "feature-action" }, "Geschichte entdecken", icon("next")))),
    credit(featured));
  main.append(feature);
  const search = el("input", {
    type: "search", id: "story-search", placeholder: "Titel oder Bibelstelle",
    "aria-label": "In den sieben Vorschauabschnitten suchen", autocomplete: "off", value: query,
    oninput: (event) => { query = event.target.value; updateList(); },
  });
  const scope = el("select", {
    "aria-label": "Bibelbereich", value: testament,
    onchange: (event) => { testament = event.target.value; updateList(); },
  }, el("option", { value: "Alle" }, "Gesamte Bibel"), el("option", { value: "NT" }, "Neues Testament"), el("option", { value: "AT" }, "Altes Testament"));
  main.append(el("div", { class: "filters" },
    el("div", { class: "search-wrap" }, icon("search"), search),
    el("div", { class: "scope" }, scope)));
  const chips = el("div", { class: "chips", role: "group", "aria-label": "Darstellung" });
  for (const [value, label] of [["Alle", "Alle Abschnitte"], ["Bilder", "Mit Bild"], ["Psalmen", "Psalmen & Briefe"]]) {
    chips.append(el("button", {
      type: "button", class: "chip", "data-filter": value, "aria-pressed": String(kind === value),
      onclick: () => { kind = value; updateList(); },
    }, label));
  }
  const count = el("span", { class: "small", role: "status" });
  const list = el("div", { class: "library-list" });
  main.append(chips, el("div", { class: "section-heading" }, el("h2", {}, "Durch die Bibel"), count), list,
    el("p", { class: "small", style: "margin-top:17px;font-size:10px" },
      "Sieben Originaleinheiten als Gestaltungsvorschau. Der spätere Bestand umfasst 436 Einheiten, 2.479 Fragen und 436 Reflexionsimpulse."),
    el("a", { class: "garden-link", href: APP_ORIGIN + "/garten", target: "_blank", rel: "noopener noreferrer" },
      icon("leaf"), el("span", {}, "Jeder Moment darf etwas bewegen.", el("br"), "Deinen OLIVA-Garten ansehen ↗")));
  function updateList() {
    const filtered = filterStories(catalog.stories, query, testament, kind);
    const showFeature = !query.trim() && testament === "Alle" && kind === "Alle";
    feature.hidden = !showFeature;
    count.textContent = filtered.length + (filtered.length === 1 ? " Beispiel" : " Beispiele");
    for (const chip of chips.children) chip.setAttribute("aria-pressed", String(chip.dataset.filter === kind));
    const rows = filtered.filter((story) => !showFeature || story.id !== featured.id);
    list.replaceChildren(...(rows.length ? rows.map(listItem) :
      [el("p", { class: "empty" }, "Hier passt gerade keiner der sieben Vorschauabschnitte. Versuche einen anderen Titel oder die gesamte Bibel.")]));
  }
  updateList();
}
function typeHero(story) {
  return el("div", { class: "type-hero" },
    el("span", { class: "type-number", "aria-hidden": "true" }, "23"),
    el("p", { class: "eyebrow" }, "Ein Psalm für deinen Weg"),
    el("blockquote", {}, story.verses[0].text),
    el("p", { class: "small" }, "Psalm 23,1 · Lutherbibel 1912"));
}
function renderReading(main, story) {
  if (story.image) main.append(el("figure", {}, art(story), el("figcaption", {}, credit(story))));
  else main.append(typeHero(story));
  main.append(el("p", { class: "reading-intro" }, shortIntro(story)),
    el("p", { class: "small", style: "font-size:9px;letter-spacing:.5px" }, "OLIVA-Einstimmung · kein Bibeltext"),
    el("blockquote", { class: "passage" },
      el("p", {}, el("sup", {}, story.verses[story.image ? 0 : 1].n), story.verses[story.image ? 0 : 1].text),
      el("cite", {}, story.referenceLabel + " · Bibeltext: Luther 1912")),
    el("div", { class: "actions" },
      external("Im OLIVA-Bibelreader lesen", readerURL(story.references[0]), "primary", "book"),
      button("Weiter zu den Fragen", () => open(story, "verstehen"), "secondary", "next")),
    el("p", { class: "note-hint" }, "Der Bibelreader öffnet die bestehende OLIVA-App in einem neuen Tab. Diese Vorschau bleibt hier erhalten."));
}
function renderQuestions(main, story) {
  const memo = state(story), q = story.questions[memo.index], saved = memo.answers[q.id];
  const dots = el("div", { class: "dots", "aria-hidden": "true" });
  story.questions.forEach((question, i) =>
    dots.append(el("span", { class: "dot" + (i === memo.index ? " current" : memo.answers[question.id] ? " answered" : "") })));
  const fieldset = el("fieldset", {}, el("legend", { class: "sr-only" }, q.prompt));
  const check = button("Antwort ansehen", () => {
    const choice = memo.pending[q.id];
    memo.answers[q.id] = { choice };
    render(false);
    document.getElementById("answer-feedback")?.focus();
  }, "primary");
  check.disabled = !Number.isInteger(memo.pending[q.id]) || Boolean(saved);
  q.options.forEach((option, i) => {
    const radio = el("input", {
      type: "radio", name: "answer-" + q.id, value: String(i),
      checked: (saved ? saved.choice : memo.pending[q.id]) === i,
      disabled: Boolean(saved),
      onchange: () => { memo.pending[q.id] = i; check.disabled = false; },
    });
    fieldset.append(el("label", { class: "option" }, radio, el("span", {}, option)));
  });
  const card = el("section", { class: "question-card", "aria-labelledby": "question-title" },
    el("div", { class: "question-head" },
      el("p", { class: "question-count" }, "Frage " + (memo.index + 1) + " von " + story.questions.length), dots),
    el("h2", { id: "question-title", tabindex: "-1" }, q.prompt), fieldset);
  if (!saved) card.append(check);
  if (saved) {
    const result = feedback(q, saved.choice);
    const info = el("div", { class: "feedback", id: "answer-feedback", tabindex: "-1", role: "status" },
      el("strong", {}, result.correct ? "Ja, das steht im Text." : "Schau noch einmal in den Text."),
      el("p", { class: "answer" }, result.answer),
      el("p", { class: "small", style: "margin-top:7px" }, "Bibelstelle: " + q.referenceLabel));
    const evidence = el("details", {}, el("summary", {}, "Die Textstelle ansehen"));
    for (const group of result.evidence)
      for (const verse of group.verses)
        evidence.append(el("p", { class: "source-text" }, el("sup", {}, verse.n + " "), verse.text));
    evidence.append(el("p", { class: "small" }, "Lutherbibel 1912"));
    info.append(evidence);
    if (q.explanation) info.append(el("p", { style: "margin-top:12px" }, q.explanation));
    info.append(button("Antwort ändern", () => {
      delete memo.answers[q.id];
      render(false);
      document.querySelector('input[name="answer-' + q.id + '"]:checked')?.focus();
    }, "quiet"));
    card.append(info);
  }
  const next = () => {
    if (memo.index + 1 < story.questions.length) {
      memo.index++;
      render(false);
      document.getElementById("question-title")?.focus();
    }
    else open(story, "gedanken");
  };
  main.append(card,
    el("div", { class: "question-footer" },
      el("button", { type: "button", disabled: memo.index === 0, onclick: () => {
        memo.index--; render(false); document.getElementById("question-title")?.focus();
      } }, "Zurück"),
      el("button", { type: "button", class: "forward", onclick: next },
        saved ? memo.index + 1 === story.questions.length ? "Zu deinem Gedanken →" : "Nächste Frage →" : "Frage überspringen →")),
    el("div", { class: "quiet-line" }),
    el("p", { class: "small" }, "Du darfst nachlesen, deine Antwort ändern oder eine Frage überspringen. Es gibt keine Punkte."),
    external("Im Bibeltext nachlesen", readerURL(q.references[0]), "quiet", "book"));
}
function renderReflection(main, story) {
  const memo = state(story);
  const finish = button("Diesen Moment abschließen", () => open(story, "abschluss"), "secondary", "next");
  finish.hidden = !memo.noteKept;
  const field = el("textarea", {
    id: "thought", rows: "5", placeholder: "Was möchtest du mitnehmen?", value: memo.note,
    "aria-describedby": "thought-hint",
    oninput: (event) => {
      memo.note = event.target.value;
      memo.noteKept = false;
      keep.disabled = !memo.note.trim();
      status.textContent = "";
      finish.hidden = true;
    },
  });
  const status = el("p", { class: "status", role: "status" }, memo.noteKept ? "Dein Gedanke bleibt in dieser Vorschau, solange die Seite geöffnet ist." : "");
  const keep = button("Gedanken in der Vorschau behalten", () => {
    memo.noteKept = true;
    status.textContent = "Dein Gedanke bleibt in dieser Vorschau, solange die Seite geöffnet ist.";
    finish.hidden = false;
  }, "primary", "pen");
  keep.disabled = !memo.note.trim();
  main.append(el("div", { class: "reflection-intro" }, icon("leaf"), el("span", { class: "eyebrow" }, "Ein Moment für dich")),
    el("h2", {}, "Was bleibt bei dir?"),
    el("p", { class: "reflection-prompt" }, story.reflection),
    el("p", { class: "small", style: "margin-bottom:23px" }, "Original-Reflexionsimpuls · FaithPath/Nachlese. Du kannst die Frage auch einfach mitnehmen."),
    el("label", { class: "field-label", for: "thought" }, "Dein eigener Gedanke · freiwillig"),
    field,
    el("p", { class: "note-hint", id: "thought-hint" },
      "Nur in dieser Gestaltungsvorschau, getrennt von deiner Sammlung. Beim Neuladen werden Vorschau-Eingaben verworfen."),
    el("div", { class: "actions" }, keep, button("Ohne Gedanken weiter", () => open(story, "abschluss"), "quiet")),
    status, finish);
}
function renderEnd(main, story) {
  const memo = state(story);
  main.append(el("div", { class: "end" }, icon("leaf"),
    el("p", { class: "eyebrow" }, "In deinem Tempo"),
    el("h2", {}, "Ein Gedanke darf bleiben."),
    el("p", { class: "intro" }, "Du musst nicht alles auf einmal verstehen. Du kannst zu diesem Text zurückkehren, wann immer du möchtest."),
    el("p", { class: "small", style: "margin-top:16px" },
      Object.keys(memo.answers).length + " von " + story.questions.length + " Fragen hier angesehen. Kein Glaubensscore, kein neuer Baumfortschritt."),
    el("div", { class: "actions" },
      button("Zur Bibliothek", () => go("#bibliothek"), "primary", "book"),
      external("Das Bibelbuch entdecken", APP_ORIGIN + "/buch/" + story.references[0].book, "secondary", "external"))));
}
function renderDetail(main, story, step) {
  lastStory = story.id;
  const memo = state(story);
  memo.step = step;
  main.append(el("a", { href: "#bibliothek", class: "back" }, icon("back"), "Bibel entdecken"),
    el("p", { class: "eyebrow" }, story.kind === "Psalm" ? "Psalmen · Gebet & Poesie" : "Eine Geschichte entdecken"),
    el("h1", { class: "detail-title", tabindex: "-1" }, story.title),
    el("p", { class: "meta detail-meta" }, icon("book"), story.referenceLabel + " · " + story.questions.length + " Fragen"));
  const steps = el("nav", { class: "steps", "aria-label": "Schritte dieses Abschnitts" });
  [["lesen", "Lesen"], ["verstehen", "Verstehen"], ["gedanken", "Gedanken"]].forEach(([key, label], i) => {
    steps.append(el("button", {
      type: "button", class: "step", "aria-current": step === key || step === "abschluss" && key === "gedanken" ? "step" : null,
      onclick: () => open(story, key),
    }, el("span", { class: "step-number" }, "0" + (i + 1)), label));
  });
  main.append(steps);
  if (step === "verstehen") renderQuestions(main, story);
  else if (step === "gedanken") renderReflection(main, story);
  else if (step === "abschluss") renderEnd(main, story);
  else renderReading(main, story);
}
function previewDialog() {
  const dialog = el("dialog", { "aria-labelledby": "preview-title" },
    el("p", { class: "eyebrow" }, "OLIVA · Gestaltungsstudie"),
    el("h2", { id: "preview-title" }, "Drei Ansichten. Ein gemeinsamer Weg."),
    el("div", { class: "dialog-links" },
      el("a", { href: "#bibliothek", onclick: () => dialog.close() }, "01 · Die Geschichtenbibliothek"),
      el("a", { href: "#geschichte/NS-0241/lesen", onclick: () => dialog.close() }, "02 · In der Krippe · mit Illustration"),
      el("a", { href: "#geschichte/NS-0073/lesen", onclick: () => dialog.close() }, "03 · Psalm 23 · bewusst ohne Bild")),
    el("p", {}, "Hier sind sieben geprüfte Originaleinheiten mit 36 Originalfragen und sieben Reflexionsimpulsen bedienbar. Titel, Stellen, Antworten und ihre Reihenfolge bleiben erhalten."),
    el("p", {}, "Der freigegebene Zielbestand umfasst 436 Einheiten, 2.479 Fragen und 436 Reflexionsimpulse. Die vollständige Integration beginnt erst nach deiner Freigabe dieser Gestaltung."),
    el("p", {}, "Vorhandene OLIVA-Bilder, Schriften und Farben. Keine neu erzeugten Bilder. Vorschau-Eingaben bleiben nur im Arbeitsspeicher dieser Seite; deine Sammlung und dein Olivenbaum bleiben unverändert."),
    button("Zur Gestaltung zurück", () => dialog.close(), "primary"));
  dialog.addEventListener("close", () => document.getElementById("preview-info")?.focus());
  return dialog;
}
function render(moveFocus = false) {
  const route = location.hash.replace(/^#/, "").split("/");
  const story = route[0] === "geschichte" && catalog.stories.find((s) => s.id === route[1]);
  const step = ["lesen", "verstehen", "gedanken", "abschluss"].includes(route[2]) ? route[2] : "lesen";
  const theme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  const themeButton = el("button", {
    class: "icon-button", type: "button",
    "aria-label": theme === "dark" ? "Hellen Modus aktivieren" : "Dunklen Modus aktivieren",
    onclick: () => {
      const dark = document.documentElement.dataset.theme !== "dark";
      document.documentElement.dataset.theme = dark ? "dark" : "light";
      document.querySelector('meta[name="theme-color"]').content = dark ? "#19251f" : "#f8f7f2";
      themeButton.setAttribute("aria-label", dark ? "Hellen Modus aktivieren" : "Dunklen Modus aktivieren");
      themeButton.replaceChildren(icon(dark ? "sun" : "moon"));
    },
  }, icon(theme === "dark" ? "sun" : "moon"));
  const dialog = previewDialog();
  const header = el("header", { class: "topbar" },
    el("a", { class: "brand", href: "#bibliothek", "aria-label": "OLIVA · Geschichtenbibliothek" },
      icon("leaf"), el("div", {}, el("div", { class: "brand-name" }, "OLIVA"), el("div", { class: "brand-caption" }, "RAUM FÜR DEINEN GLAUBEN"))),
    el("div", { class: "header-actions" }, themeButton,
      el("button", { class: "icon-button", type: "button", id: "preview-info", "aria-label": "Die drei Gestaltungsvorschauen und ihren Umfang ansehen", onclick: () => dialog.showModal() }, icon("info"))));
  const main = el("main", { id: "main", tabindex: "-1" });
  if (route[0] === "geschichte" && !story)
    main.append(el("h1", {}, "Dieser Entwurf ist nicht vorhanden."),
      el("p", { class: "intro" }, "Die Gestaltungsvorschau enthält sieben ausgewählte Originaleinheiten."),
      button("Zur Bibliothek", () => go("#bibliothek")));
  else if (story) renderDetail(main, story, step);
  else renderLibrary(main);
  const nav = el("nav", { class: "bottom-nav", "aria-label": "Hauptnavigation" });
  for (const [label, name, path] of [["Heute", "home", "/"], ["Bibel", "book", "#bibliothek"], ["Wege", "path", "/wege"], ["Mein Garten", "leaf", "/garten"], ["Sammlung", "bookmark", "/sammlung"]]) {
    const isLocal = path.startsWith("#");
    nav.append(el("a", {
      class: "nav-item", href: isLocal ? path : APP_ORIGIN + path,
      "aria-current": isLocal ? "page" : null,
      target: isLocal ? null : "_blank", rel: isLocal ? null : "noopener noreferrer",
      "aria-label": isLocal ? label : label + " in der bestehenden OLIVA-App öffnen – neuer Tab",
    }, icon(name), el("span", {}, label)));
  }
  root.replaceChildren(el("div", { class: "phone" }, header,
    el("button", { class: "preview-label", type: "button", onclick: () => dialog.showModal() }, icon("info"), "Gestaltungsstudie · sieben Originalbeispiele"),
    main, nav), dialog);
  document.title = (story ? story.title : "Bibel entdecken") + " · OLIVA · Gestaltungsstudie";
  if (moveFocus) {
    window.scrollTo({ top: 0, behavior: "instant" });
    (main.querySelector("h1") ?? main).focus({ preventScroll: true });
  }
}
try {
  const response = await fetch("./sample-data.json", { credentials: "same-origin" });
  if (!response.ok) throw new Error("Die Vorschauinhalte konnten nicht geladen werden.");
  catalog = validateSample(await response.json());
  document.documentElement.dataset.theme = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  window.addEventListener("hashchange", () => render(true));
  render();
} catch (error) {
  console.error("OLIVA-Gestaltungsvorschau konnte nicht vorbereitet werden.", error);
  root.replaceChildren(el("main", { class: "loading" },
    el("h1", {}, "Der Entwurf konnte nicht geladen werden."),
    el("p", { class: "intro" }, "Bitte lade die Seite erneut. Deine bestehende OLIVA-App bleibt unverändert erreichbar."),
    external("OLIVA öffnen", APP_ORIGIN, "primary")));
}
