/* Isolated design study. No application store, migration, service worker or network. */
(() => {
  "use strict";
  const M = FaithPathModel,
    { icon, link, tree } = FaithPathUI,
    E = M.escape,
    config = M.route(location.search),
    s = Object.assign(M.initial(), config);
  const names = { A: "Lebensbaum", B: "Wort & Stille", C: "Lebensseiten" },
    labels = {
      today: "Heute",
      bible: "Bibel",
      path: "Mein Weg",
      journal: "Journal",
      discover: "Entdecken",
    };
  let explored = 7;
  let lastFocus = null,
    noteRef = null,
    questionIndex = 0,
    answered = null,
    discoverQuery = "",
    discoverFilter = "all";
  document.documentElement.dataset.direction = s.direction;
  document.documentElement.dataset.theme = s.theme;
  const stageSelect = () =>
    `<label class="stage-selector">Baumansicht <select id="stage" aria-label="Vorhandene Baumstufe als Beispiel wählen">${Array.from({ length: 7 }, (_, i) => `<option value="${i + 1}" ${s.stage === i + 1 ? "selected" : ""}>${i + 1} von 7 · Beispiel</option>`).join("")}</select></label>`;
  const pathTitle = "In Ruhe zuhören",
    step = "Im nächsten Gespräch ausreden lassen.";
  const chapterName = () =>
    s.chapter === 15
      ? "Bleiben und wachsen"
      : s.chapter === 3
        ? "Ein neuer Anfang"
        : s.chapter === 1
          ? "Das Wort wird Mensch"
          : "Trost und Zuversicht";
  const refText = (r) =>
    `Johannes ${r.chapter}${r.verse ? "," + r.verse : ""} · ${r.translation === "otb" ? "OTB Deutsch" : "Luther 1912"}`;
  function heading(kicker, title, sub = "") {
    return `<div class="page-heading"><p class="eyebrow">${kicker}</p><h1>${title}</h1>${sub ? `<p class="lede">${sub}</p>` : ""}</div>`;
  }
  function nextStep() {
    return `<section class="next-step"><p class="eyebrow">Dein nächster Schritt</p><h2>${pathTitle}</h2><p>${s.stepDone ? "Diesen Schritt hast du als getan festgehalten." : step}</p>${link(s.stepDone ? "Bei deinem Weg bleiben" : "Meinen Schritt ansehen", "path", "primary")}</section>`;
  }
  function readingRow() {
    return `<section class="reading-row"><span class="reading-icon">${icon("bible")}</span><div><p class="eyebrow">Zuletzt gelesen</p><h2>Johannes 15</h2><p>Bei Jesus bleiben.</p></div><button class="icon-button" data-go="bible" data-read-chapter="15" aria-label="Johannes 15 weiterlesen">${icon("arrow")}</button></section>`;
  }
  function thought() {
    return `<section class="thought"><p class="eyebrow">Dein letzter Gedanke · 16. Oktober</p><blockquote>„Ich muss nicht sofort eine Antwort haben.“</blockquote>${link("Wieder aufnehmen", "journal")}</section>`;
  }
  function today() {
    let top;
    if (s.direction === "A")
      top = `${heading("Schön, dass du da bist", "Raum für deinen<br>Glauben.")}<section class="nature-cover">${tree(s.stage)}<div class="cover-caption"><span>Deine Geschichte wächst.</span><span>In deinem Tempo.</span></div></section>${nextStep()}`;
    if (s.direction === "B")
      top = `${heading("Ein Moment für dich", "Hier darfst du<br>ankommen.")}<div class="focus-label"><span></span> Was dich heute begleitet</div>${nextStep()}<section class="focus-tree">${tree(s.stage)}<div><p class="eyebrow">Dein Olivenbaum</p><h2>Was bleibt,<br>darf wachsen.</h2>${link("Meine Geschichte", "path")}</div></section>`;
    if (s.direction === "C")
      top = `<div class="edition-label"><span>DEINE PERSÖNLICHE AUSGABE</span><span>17.10.26</span></div><section class="editorial-cover"><div>${heading("Heute", "Glaube.<br>Leben.<br>Du.")}<p>Ein guter Ort,<br>um weiterzugehen.</p></div>${tree(s.stage)}</section>${nextStep()}`;
    return (
      top +
      readingRow() +
      thought() +
      `<section class="discover-teaser"><p class="eyebrow">Du suchst Orientierung?</p><h2>Was beschäftigt dich?</h2><p>Finde einen Bibeltext, der Raum für deine Fragen lässt.</p>${link("Etwas entdecken", "discover")}</section><p class="quiet-note">Deine Geschichte zählt. Dein Glaube wird hier nicht bewertet.</p>`
    );
  }
  function bible() {
    const verses = FaithPathScripture[s.translation][s.chapter];
    return `<div class="reader-top">${link("Entdecken", "discover")}<button class="icon-button" data-action="sword" aria-label="Bibelreise und Schwert ansehen">${icon("sword")}</button></div><div class="reader-controls"><label>Bibelstelle<select id="chapter">${[1, 3, 15, 16].map((n) => `<option value="${n}" ${s.chapter === n ? "selected" : ""}>Johannes ${n}</option>`).join("")}</select></label><label>Übersetzung<select id="translation"><option value="otb" ${s.translation === "otb" ? "selected" : ""}>OTB Deutsch</option><option value="l1912" ${s.translation === "l1912" ? "selected" : ""}>Luther 1912</option></select></label></div><header class="chapter-title"><p class="eyebrow">Das Evangelium nach Johannes</p><div><span class="chapter-number" aria-hidden="true">${s.chapter}</span><h1>${chapterName()}</h1></div><p class="reader-hint">Vers antippen, um ihn zu markieren oder einen Gedanken festzuhalten.</p></header><article class="scripture" aria-label="Johannes ${s.chapter}">${verses.map(([n, t]) => `<button class="verse ${s.selected === n ? "selected" : ""} ${s.highlight[s.translation + "-" + s.chapter + "-" + n] ? "highlighted" : ""}" data-verse="${n}" aria-pressed="${s.selected === n}"><span class="verse-number">${n}</span><span>${E(t)}</span></button>`).join("")}</article><footer class="chapter-end"><p class="eyebrow">Raum zum Verstehen</p><h2>Was bleibt bei dir?</h2><p>Ein Gedanke reicht. Du kannst auch einfach weiterlesen.</p><button class="primary" data-action="note">${icon("journal")} Gedanken festhalten</button>${link("Geschichte & Fragen entdecken", "discover")}<button class="text-link" data-action="sword">Deine Bibelreise ansehen ${icon("sword")}</button><button class="text-link" data-action="next-chapter">Nächstes Demokapitel ${icon("arrow")}</button><p class="quiet-note">Prototypauswahl: Johannes 1, 3, 15 und 16. Öffnen allein zählt keinen Lesefortschritt.</p></footer><p class="source">${s.translation === "otb" ? "Open Translation Bible · CC BY-SA 4.0" : "Luther 1912 · gemeinfrei"} · <a href="assets/licenses/${s.translation === "otb" ? "OTB-LICENSE.txt" : "LUTHER1912-NOTICE.txt"}">Quellenhinweis</a></p>${s.selected ? `<aside class="verse-tools" aria-label="Aktionen für Vers ${s.selected}"><span>Vers ${s.selected}</span><button data-action="highlight" aria-pressed="${!!s.highlight[s.translation + "-" + s.chapter + "-" + s.selected]}">Markieren</button><button data-action="note">Notiz</button><button class="icon-button" data-action="clear-selection" aria-label="Versauswahl schließen">${icon("close")}</button></aside>` : ""}`;
  }
  function history() {
    return `<section class="history"><p class="eyebrow">Damals und heute</p><h2>Deine Worte. Zwei Momente.</h2><div class="history-pair"><div><span class="date">9. Oktober</span><p>„Ich möchte lernen, auch mitten im Alltag bei Jesus zu bleiben.“</p></div><div><span class="date">16. Oktober</span><p>„Ich muss nicht sofort eine Antwort haben. Morgen möchte ich erst zuhören und dann reagieren.“</p></div></div><p class="quiet-note">Zwei selbst festgehaltene Gedanken zum selben Weg. Keine automatische Bewertung.</p><button class="text-link" data-action="review">In Ruhe zurückblicken ${icon("arrow")}</button></section>`;
  }
  function path() {
    const overview = `<section class="path-panel"><div class="path-meta"><span class="eyebrow">Dein aktueller Weg</span><span>Seit 9. Oktober</span></div><h2>${pathTitle}</h2><p>Ich möchte Menschen aufmerksam begegnen.</p><div class="step-line"><button class="step-toggle ${s.stepDone ? "done" : ""}" data-action="step" aria-pressed="${s.stepDone}" aria-label="Schritt als ${s.stepDone ? "offen" : "getan"} festhalten">${s.stepDone ? icon("check") : icon("plus")}</button><div><p class="eyebrow">${s.stepDone ? "Als getan festgehalten" : "Dein nächster Schritt"}</p><p>${step}</p></div></div><div class="path-actions">${link("Johannes 15 lesen", "bible", "text-link", 15)}<button class="text-link" data-action="note">Gedanken verbinden ${icon("plus")}</button></div></section>`;
    const grove = `<section class="grove"><div><p class="eyebrow">Deine persönliche Geschichte</p><h2>Was du selbst<br>festgehalten hast.</h2><p>Dein Olivenbaum erinnert an ausdrücklich bestätigte Entwicklungen. Ein erledigter Schritt verändert ihn nicht automatisch.</p></div><figure>${tree(s.stage)}<figcaption>Eine der sieben bestehenden Darstellungen. Kein Maß für deinen Glauben.</figcaption></figure>${stageSelect()}</section>`;
    return (
      heading(
        "Mein Weg",
        s.direction === "C"
          ? "Dein Leben.<br>Deine Geschichte."
          : "Was dich<br>weiterträgt.",
      ) +
      (overview + grove) +
      history()
    );
  }
  function journalList(q = "") {
    const notes = M.search(s, q);
    return `<p class="result-count" role="status">${notes.length} ${notes.length === 1 ? "Gedanke" : "Gedanken"}</p>${notes.length ? notes.map((n) => `<button class="entry" data-entry="${E(n.id)}"><span class="date">${n.date}${n.path ? " · In Ruhe zuhören" : ""}</span><h2>${E(n.title)}</h2><p>${E(n.text)}</p>${n.ref ? `<span class="reference">${E(refText(n.ref))}</span>` : ""}${icon("arrow")}</button>`).join("") : '<div class="empty"><h2>Hier ist noch Raum.</h2><p>Keine passenden Gedanken. Probiere ein anderes Wort.</p></div>'}`;
  }
  function journal() {
    return (
      heading(
        "Journal",
        s.direction === "B"
          ? "Was du nicht<br>vergessen möchtest."
          : "Worte für das,<br>was dich bewegt.",
      ) +
      `<button class="compose-launch" data-action="note"><span>${icon("journal")} Einen Gedanken festhalten</span>${icon("plus")}</button><label class="search-box">${icon("search")}<span class="sr">Gedanken durchsuchen</span><input id="journal-search" type="search" placeholder="Gedanke, Weg oder Bibelstelle" value="${E(s.query)}"></label><div id="journal-results">${journalList(s.query)}</div><p class="quiet-note">Diese Beispieldaten bleiben nur bis zum Neuladen in diesem Prototyp. Die echte App wird nicht verändert.</p>`
    );
  }
  function resultList() {
    const items = FaithPathCatalog.stories
      .filter((x) =>
        discoverFilter === "chapters"
          ? x.kind === "chapter"
          : x.kind === "story",
      )
      .filter((x) =>
        (x.title + " " + x.ref + " " + x.desc)
          .toLocaleLowerCase("de")
          .includes(discoverQuery.toLocaleLowerCase("de")),
      );
    if (discoverFilter === "themes")
      return `<p class="result-count">3 Themen · Demonstration</p>${[
        "Vertrauen",
        "Geduld",
        "Neuanfang",
      ]
        .filter((x) => x.toLowerCase().includes(discoverQuery.toLowerCase()))
        .map(
          (x) =>
            `<button class="discovery-result" data-action="theme"><span class="eyebrow">THEMA</span><h2>${x}</h2><p>Ein Einstieg mit Johannes 15</p>${icon("arrow")}</button>`,
        )
        .join("")}`;
    return `<p class="result-count" role="status">${items.length} ${discoverFilter === "chapters" ? "Kapitelübungen" : "Geschichten"} · ${Math.min(12, items.length)} angezeigt</p>${items
      .slice(0, 12)
      .map(
        (x) =>
          `<button class="discovery-result" data-story="${E(x.id)}"><span class="eyebrow">${x.kind === "chapter" ? "Kapitelübung" : "Geschichte"}</span><h2>${E(x.title)}</h2><p>${E(x.ref)}</p>${icon("arrow")}</button>`,
      )
      .join(
        "",
      )}${items.length ? "" : "<p>Keine passende Geschichte. Suche zum Beispiel nach Johannes.</p>"}`;
  }
  function discover() {
    return (
      heading(
        "Entdecken",
        "Eine Frage.<br>Ein neuer Blick.",
        "Von dem, was dich bewegt, zurück zum Bibeltext.",
      ) +
      `<label class="search-box">${icon("search")}<span class="sr">Geschichten durchsuchen</span><input id="discover-search" type="search" placeholder="Geschichte oder Bibelstelle" value="${E(discoverQuery)}"></label><div class="filter-tabs" role="group" aria-label="Inhaltsfilter"><button data-filter="all" aria-pressed="${discoverFilter === "all"}">Geschichten</button><button data-filter="chapters" aria-pressed="${discoverFilter === "chapters"}">Kapitelübungen</button><button data-filter="themes" aria-pressed="${discoverFilter === "themes"}">Themen</button><button data-action="sample-story">Fragen erleben</button></div><div id="discover-results">${resultList()}</div><p class="quiet-note">Aktiver Index: 436 zusammengeführte Geschichten und 260 Kapitelübungen. Die interaktive Fragenstrecke zeigt „Der rechte Weinstock“. Weitere Inhalte bleiben in der bestehenden App erhalten.</p>`
    );
  }
  function render(focus = false) {
    document.title = `FaithPath · ${names[s.direction]} · ${labels[s.screen]}`;
    const views = { today, bible, path, journal, discover };
    document.querySelector("#app").innerHTML =
      `<div class="app-shell"><header class="app-header"><button class="wordmark" data-go="today" aria-label="FaithPath Heute">${icon("leaf")}<span>FaithPath<span class="wordmark-dot">.</span></span></button><div><button class="icon-button" data-action="appearance" aria-label="Darstellung ändern">${icon("sun")}</button><button class="icon-button" data-action="about" aria-label="Über diesen Prototyp">${icon("more")}</button></div></header><main id="content" tabindex="-1" class="screen-${s.screen}">${views[s.screen]()}</main><nav class="bottom-nav" aria-label="Hauptbereiche">${["today", "bible", "path", "journal"].map((k) => `<button data-go="${k}" ${s.screen === k || (k === "bible" && s.screen === "discover") ? 'aria-current="page"' : ""}>${icon(k)}<span>${labels[k]}</span></button>`).join("")}</nav></div>`;
    if (focus)
      document.querySelector("#content").focus({ preventScroll: true });
  }
  function go(screen) {
    s.screen = screen;
    render(true);
    window.scrollTo(0, 0);
  }
  const d = document.querySelector("#dialog");
  function modal(title, body) {
    lastFocus = document.activeElement;
    document.querySelector("#dialog-content").innerHTML =
      `<div class="dialog-head"><h2 id="dialog-title">${E(title)}</h2><button class="icon-button" data-action="close" aria-label="Dialog schließen">${icon("close")}</button></div>${body}`;
    d.showModal();
  }
  function close() {
    d.close();
    if (lastFocus?.isConnected) lastFocus.focus();
  }
  function notify(t) {
    document.querySelector("#announce").textContent = t;
  }
  function compose() {
    if (!s.draft.trim()) {
      s.draftRef =
        s.screen === "bible"
          ? {
              chapter: s.chapter,
              ...(s.selected ? { verse: s.selected } : {}),
              translation: s.translation,
            }
          : null;
      s.draftPath = true;
    }
    noteRef = s.draftRef ? { ...s.draftRef } : null;
    modal(
      "Deinen Gedanken festhalten",
      `<form id="note-form">${noteRef ? `<p class="reference">${refText(noteRef)}</p>` : ""}<label for="note-text">Was möchtest du dir merken?</label><textarea id="note-text" required rows="7" placeholder="Hier darf dein Gedanke beginnen …">${E(s.draft)}</textarea><label class="check-label"><input type="checkbox" id="note-path" ${s.draftPath ? "checked" : ""}> Mit „In Ruhe zuhören“ verbinden</label><p class="quiet-note">Synthetischer Prototyp: nur im Arbeitsspeicher, bis zum Neuladen.</p><button class="primary" type="submit">Gedanken festhalten ${icon("check")}</button></form>`,
    );
  }
  function showSword() {
    modal(
      "Das Schwert des Geistes",
      `${FaithPathSword({ books: [{ chapters: 1189 }], chapters: explored, completedBooks: explored === 1189 ? 66 : 0 }, "demo-sword")}<p class="sword-count">${explored} von 1.189 Kapiteln erkundet</p><p class="quiet-note">Synthetischer Beispielstand. Kein Maß für Glaubensstärke.</p><label class="sword-selector">Darstellung erproben<select id="sword-state">${[0, 1, 7, 100, 1189].map((n) => `<option value="${n}" ${n === explored ? "selected" : ""}>${n} Kapitel · Beispiel</option>`).join("")}</select></label><h3>Gottes Wort begleitet dich.</h3><p>Das Schwert steht für die Beschäftigung mit dem Wort Gottes. Nicht für Gewalt gegen Menschen.</p><blockquote>${E(FaithPathScripture[s.translation].ephesians6_17)}</blockquote><p class="reference">Epheser 6,17 · ${s.translation === "otb" ? "OTB Deutsch" : "Luther 1912"}</p><p class="quiet-note">In dieser Galerie wird kein Lesefortschritt verbucht. Die bestehende Bibelreise und ihre Zählregeln bleiben unverändert.</p>`,
    );
  }
  function quiz() {
    const story = FaithPathCatalog.story,
      q = story.questions[questionIndex];
    if (!q) {
      modal(
        "Was bedeutet das für dich?",
        `<p>${E(story.reflection)}</p><p>Deine Reflexion ist freiwillig. Sie hat kein Richtig oder Falsch.</p><button class="primary" data-action="reflect">Gedanken festhalten</button><button class="text-link" data-action="sample-story">Zur Geschichte ${icon("back")}</button>`,
      );
      return;
    }
    modal(
      "Verstehen, was du liest",
      `<p class="eyebrow">Johannes 15 · Frage ${questionIndex + 1} von ${story.questions.length}</p><h3>${E(q.q)}</h3><div class="answers">${q.a.map((a, i) => `<button data-answer="${i}" ${answered !== null ? "disabled" : ""} class="${answered !== null && i === q.c ? "correct" : ""}">${E(a)}${answered !== null && i === q.c ? icon("check") : ""}</button>`).join("")}</div>${answered !== null ? `<div class="explanation"><p>${answered === q.c ? "Das passt zum Bibeltext." : "Schau noch einmal in den Text."}</p><p>${E(q.x || q.answer)}</p><span class="reference">${E(q.ref)}</span></div><button class="primary" data-action="next-question">${questionIndex === story.questions.length - 1 ? "Zur Reflexion" : "Nächste Frage"} ${icon("arrow")}</button>` : ""}`,
    );
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.go) {
      if (b.dataset.readChapter) {
        s.chapter = Number(b.dataset.readChapter);
        s.selected = 0;
      }
      if (d.open) close();
      go(b.dataset.go);
      return;
    }
    if (b.dataset.verse) {
      s.selected = Number(b.dataset.verse);
      const y = scrollY;
      render();
      scrollTo(0, y);
      document
        .querySelector(`[data-verse="${s.selected}"]`)
        .focus({ preventScroll: true });
      return;
    }
    if (b.dataset.entry) {
      const n = s.journal.find((n) => n.id === b.dataset.entry);
      modal(
        n.title,
        `<p class="date">${n.date}</p><p class="note-body">${E(n.text)}</p>${n.ref ? `<button class="text-link" data-action="entry-bible" data-chapter="${n.ref.chapter}" data-tr="${n.ref.translation}" data-v="${n.ref.verse}">${refText(n.ref)} ${icon("arrow")}</button>` : ""}${n.path ? link("Zum verbundenen Weg", "path") : ""}`,
      );
      return;
    }
    if (b.dataset.filter) {
      discoverFilter = b.dataset.filter;
      render();
      return;
    }
    if (b.dataset.story) {
      const st = FaithPathCatalog.stories.find(
        (x) => String(x.id) === b.dataset.story,
      );
      modal(
        st.title,
        `<p class="reference">${E(st.ref)}</p><p>${E(st.desc || "Lies den zugehörigen Bibeltext und nimm dir Raum zum Verstehen.")}</p>${st.id === "NS-0297" ? '<button class="primary" data-action="story-bible">Bibeltext lesen</button><button class="text-link" data-action="start-quiz">Fragen ansehen</button>' : '<p class="quiet-note">Dieser Katalogeintrag ist original. Die vollständig bedienbare Beispielgeschichte des Prototyps ist „Der rechte Weinstock“ (Johannes 15).</p><button class="primary" data-action="sample-story">Beispielgeschichte öffnen</button>'}`,
      );
      return;
    }
    const a = b.dataset.action;
    if (!a) return;
    if (a === "close") close();
    if (a === "note") compose();
    if (a === "step") {
      M.completeStep(s);
      render();
      notify(
        s.stepDone
          ? "Schritt als getan festgehalten. Dein Baum bleibt unverändert."
          : "Schritt wieder geöffnet.",
      );
    }
    if (a === "highlight") {
      const k = s.translation + "-" + s.chapter + "-" + s.selected;
      s.highlight[k] = !s.highlight[k];
      const y = scrollY;
      render();
      scrollTo(0, y);
      document.querySelector('[data-action="highlight"]').focus();
    }
    if (a === "clear-selection") {
      s.selected = 0;
      const y = scrollY;
      render();
      scrollTo(0, y);
    }
    if (a === "next-chapter") {
      const chapters = [1, 3, 15, 16];
      s.chapter = chapters[(chapters.indexOf(s.chapter) + 1) % 4];
      s.selected = 0;
      go("bible");
    }
    if (a === "about")
      modal(
        "Ein Blick auf FaithPath von morgen",
        `<p><strong>${names[s.direction]}</strong> · isolierte Designstudie 6A.</p><p>Alle persönlichen Inhalte sind synthetisch. Nichts wird in deiner FaithPath-App gespeichert. Beim Neuladen werden Demoeingaben zurückgesetzt.</p><p>Vier Bibelkapitel, zwei Übersetzungen, der originale Geschichtenindex und eine vollständige Fragenstrecke zeigen die Richtung. Backup, echte Erinnerungen und der vollständige Inhaltsumfang bleiben Aufgabe der unveränderten App und späteren Integration.</p><a class="text-link" href="index.html" target="_top">Zur Vergleichsgalerie ${icon("arrow")}</a>`,
      );
    if (a === "appearance")
      modal(
        "Dein Leseraum",
        `<p>Alle vier bisherigen Themes bleiben als Gestaltungssystem erhalten.</p><div class="theme-options">${[
          ["light", "Hell"],
          ["atmospheric", "Atmosphärisch"],
          ["paper", "Papier"],
          ["night", "Nacht"],
        ]
          .map(
            ([k, n]) =>
              `<button data-theme="${k}" aria-pressed="${s.theme === k}">${n}</button>`,
          )
          .join("")}</div>`,
      );
    if (a === "review")
      modal(
        "Damals und heute",
        history() +
          `<button class="primary" data-action="note">Einen heutigen Gedanken festhalten</button>`,
      );
    if (a === "sword") showSword();
    if (a === "theme") {
      close();
      s.chapter = 15;
      go("bible");
    }
    if (a === "sample-story") {
      const st = FaithPathCatalog.story;
      modal(
        st.title,
        `<p class="reference">${E(st.ref)}</p><p>${E(st.desc || "Lies den zugehörigen Bibeltext und nimm dir Raum zum Verstehen.")}</p><button class="primary" data-action="story-bible">Bibeltext lesen ${icon("bible")}</button><button class="text-link" data-action="start-quiz">Verständnisfragen ansehen ${icon("arrow")}</button>`,
      );
    }
    if (a === "story-bible") {
      close();
      s.chapter = 15;
      go("bible");
    }
    if (a === "entry-bible") {
      close();
      s.chapter = Number(b.dataset.chapter);
      s.translation = b.dataset.tr;
      s.selected = Number(b.dataset.v);
      go("bible");
      document
        .querySelector(`[data-verse="${s.selected}"]`)
        ?.scrollIntoView({ block: "center" });
    }
    if (a === "start-quiz") {
      questionIndex = 0;
      answered = null;
      d.close();
      quiz();
    }
    if (b.dataset.answer !== undefined) {
      answered = Number(b.dataset.answer);
      d.close();
      quiz();
    }
    if (a === "next-question") {
      questionIndex++;
      answered = null;
      d.close();
      quiz();
    }
    if (a === "reflect") {
      close();
      compose();
    }
  });
  // Answer buttons intentionally use a separate handler: no data-action needed.
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-answer]");
    if (b && !b.disabled) {
      answered = Number(b.dataset.answer);
      d.close();
      quiz();
    }
    const t = e.target.closest("button[data-theme]");
    if (t) {
      s.theme = t.dataset.theme;
      document.documentElement.dataset.theme = s.theme;
      close();
      notify("Darstellung geändert.");
    }
  });
  document.addEventListener("change", (e) => {
    if (e.target.id === "sword-state") {
      explored = Number(e.target.value);
      showSword();
      document.querySelector("#sword-state").focus();
    }
    if (e.target.id === "note-path") s.draftPath = e.target.checked;
    if (e.target.id === "chapter" || e.target.id === "translation") {
      s[e.target.id] =
        e.target.id === "chapter" ? Number(e.target.value) : e.target.value;
      s.selected = 0;
      render();
      document.querySelector("#" + e.target.id).focus();
    }
    if (e.target.id === "stage") {
      s.stage = Number(e.target.value);
      render();
      document.querySelector("#stage").focus();
    }
  });
  document.addEventListener("input", (e) => {
    if (e.target.id === "note-text") s.draft = e.target.value;
    if (e.target.id === "journal-search") {
      s.query = e.target.value;
      document.querySelector("#journal-results").innerHTML = journalList(
        s.query,
      );
    }
    if (e.target.id === "discover-search") {
      discoverQuery = e.target.value;
      document.querySelector("#discover-results").innerHTML = resultList();
    }
  });
  document.addEventListener("submit", (e) => {
    if (e.target.id !== "note-form") return;
    e.preventDefault();
    M.saveNote(s, {
      text: document.querySelector("#note-text").value,
      ref: noteRef,
      path: document.querySelector("#note-path").checked,
    });
    s.draft = "";
    s.draftRef = null;
    s.draftPath = true;
    close();
    go("journal");
    notify("Dein Beispielgedanke ist im Journal. Nur für diese Sitzung.");
  });
  d.addEventListener("close", () => {
    if (lastFocus?.isConnected) lastFocus.focus();
  });
  render();
})();
