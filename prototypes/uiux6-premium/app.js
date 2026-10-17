/* Isolated Phase6A.2 controller. All demo state is memory-only. */
(() => {
  "use strict";
  const M = PremiumModel,
    C = PremiumContent,
    U = PremiumUI,
    { E, icon, button, go: link, reference, date } = U,
    V = PremiumViews;
  const allowed = [
    "today",
    "reader",
    "journal",
    "paths",
    "path",
    "entry",
    "editor",
    "review",
    "tree",
    "archive",
    "journey",
    "discover",
    "story",
    "quiz",
    "collection",
    "topic",
    "guided",
    "onboarding",
    "settings",
    "reminders",
    "backup",
    "states",
  ];
  const params = new URLSearchParams(location.search);
  let s = M.initial(params.get("scenario") || "returning");
  if (["light", "atmospheric", "paper", "night"].includes(params.get("theme")))
    s.theme = params.get("theme");
  const ui = {
    screen: allowed.includes(params.get("screen"))
      ? params.get("screen")
      : "today",
    pathId: "p-listen",
    entryId: params.get("scenario") === "long" ? "j-long" : "j-now",
    reviewId: "r-listen",
    unitId: "story:NS-0297",
    topicId: C.themes[0].id,
    guidedId: C.guided[0].id,
    pathLimit: 6,
    journalLimit: 12,
    journalSearch: false,
    journalQuery: "",
    journalFilter: "all",
    discoveryQuery: "",
    discoveryKind: "all",
    discoveryLimit: 12,
    treeExample: 0,
    swordVariant: "seal",
    stateKind: "empty",
    editorReturn: "journal",
    backup: null,
    backupLoading: false,
    undo: null,
  };
  if (params.get("book"))
    setReader(params.get("book"), Number(params.get("chapter")) || 1, 0, false);
  if (params.has("reading")) {
    const n = Math.max(0, Math.min(1189, Number(params.get("reading")) || 0));
    s.explored = C.bibleIndex
      .flatMap((b) =>
        Array.from({ length: b.chapters }, (_, i) => ({
          book: b.code,
          chapter: i + 1,
        })),
      )
      .slice(0, n);
  }
  let navObserver = null,
    dialogOpener = null,
    backupToken = 0;
  const scrolls = new Map(),
    dialog = document.querySelector("#dialog");
  const ctx = () => ({ s, ui, M, C, U });
  function header() {
    return `<header class="app-header"><button class="brand" data-go="today" aria-label="FaithPath Heute"><img src="assets/art/brand-sprig.svg" width="28" height="28" alt=""><span>FaithPath<span class="brand-dot">.</span></span></button><div><span class="study-badge">Designstudie</span>${button(icon("settings"), "open-settings", {}, "icon-button")}</div></header>`;
  }
  function nav() {
    const selected = [
      "reader",
      "discover",
      "journey",
      "story",
      "quiz",
      "collection",
      "topic",
      "guided",
    ].includes(ui.screen)
      ? "reader"
      : ["paths", "path", "tree", "archive", "review"].includes(ui.screen)
        ? "paths"
        : ["entry", "editor", "journal", "reminders"].includes(ui.screen)
          ? "journal"
          : "today";
    return `<nav class="primary-nav" aria-label="Hauptbereiche">${[
      ["today", "Heute", "home"],
      ["reader", "Bibel", "bible"],
      ["paths", "Mein Weg", "paths"],
      ["journal", "Journal", "journal"],
    ]
      .map(
        ([screen, label, name]) =>
          `<button data-go="${screen}" ${selected === screen ? 'aria-current="page"' : ""}>${icon(name)}<span>${label}</span></button>`,
      )
      .join("")}</nav>`;
  }
  function render({ focus = false } = {}) {
    const liveStatus = document.querySelector("#status");
    document.documentElement.dataset.theme = s.theme;
    document.body.classList.toggle(
      "verse-active",
      ui.screen === "reader" && s.reader.selected.length > 0,
    );
    document.body.classList.toggle(
      "reading-focus",
      s.reader.focus && ui.screen === "reader",
    );
    document.body.classList.toggle("writing-mode", ui.screen === "editor");
    document.title =
      "FaithPath · " +
      ({
        reader: "Bibel",
        journal: "Journal",
        paths: "Mein Weg",
        today: "Heute",
      }[ui.screen] || "Verbunden");
    document.querySelector("#app").innerHTML =
      `<div class="app-shell">${ui.screen === "editor" ? "" : header()}<main id="main" tabindex="-1" class="screen screen-${ui.screen}">${(V[ui.screen] || V.today)(ctx())}</main>${ui.screen === "editor" || ui.screen === "onboarding" ? "" : nav()}</div>`;
    if (liveStatus) document.querySelector("#main").before(liveStatus);
    if (focus) document.querySelector("#main").focus({ preventScroll: true });
    if (ui.screen === "editor") resizeEditor();
    navObserver?.disconnect();
    const navEl = document.querySelector(".primary-nav");
    if (navEl && innerWidth < 1050) {
      navObserver = new ResizeObserver(() =>
        document.documentElement.style.setProperty(
          "--nav-height",
          navEl.getBoundingClientRect().height + "px",
        ),
      );
      navObserver.observe(navEl);
    }
  }
  function normalizeBook(book) {
    return (
      C.bookAliases[String(book).toLowerCase()] ||
      C.bookAliases[String(book)] ||
      String(book).toUpperCase()
    );
  }
  function setReader(book, chapter, verse = 0, announce = true, translation) {
    book = normalizeBook(book || s.reader.book);
    chapter = Number(chapter) || s.reader.chapter;
    const tr =
      translation && C.bibles[translation] ? translation : s.reader.translation;
    if (!C.bibles[tr][book]?.[chapter]) {
      if (announce)
        modal(
          "Dieser Text gehört zur vollständigen App.",
          `<p>Die Designstudie enthält 70 originale Kapitel pro Übersetzung. Dieser Abschnitt ist in der unveränderten FaithPath-App zugänglich.</p><p>Die mitgelieferten Themen und geführten Wege sind vollständig lesbar.</p>${button("Zurück zur Vorschau", "close", {}, "primary")}`,
        );
      return false;
    }
    s.reader.book = book;
    s.reader.chapter = chapter;
    s.reader.translation = tr;
    s.reader.selected =
      verse && C.bibles[tr][book][chapter].some((v) => v[0] === Number(verse))
        ? [Number(verse)]
        : [];
    return true;
  }
  function navigate(screen, data = {}, push = true) {
    if (!allowed.includes(screen)) return;
    document.querySelector("#status")?.classList.remove("visible");
    const previous = ui.screen;
    scrolls.set(previous, scrollY);
    if (previous === "backup" && screen !== "backup") {
      invalidateBackup();
      ui.backupLoading = false;
    }
    if (screen === "reader" && (data.book || data.chapter)) {
      if (
        !setReader(
          data.book || s.reader.book,
          data.chapter || s.reader.chapter,
          data.verse || 0,
          true,
          data.translation,
        )
      )
        return;
    }
    if (data.id) {
      if (screen === "path") ui.pathId = data.id;
      if (screen === "entry") ui.entryId = data.id;
      if (screen === "review") ui.reviewId = data.id;
    }
    if (data.unit) ui.unitId = data.unit;
    if (screen === "editor") {
      if (!s.draft) M.createDraft(s);
      if (previous !== "editor") ui.editorReturn = previous;
    }
    if (dialog.open) closeDialog();
    ui.screen = screen;
    if (push) history.pushState({ screen }, "", "#" + screen);
    render({ focus: true });
    const target =
      screen === "reader" && s.reader.selected.length
        ? document.querySelector(`[data-verse="${s.reader.selected[0]}"]`)
        : null;
    if (target) target.scrollIntoView({ block: "center" });
    else scrollTo(0, scrolls.get(screen) || 0);
  }
  function modal(title, body) {
    if (
      !dialog.open &&
      !dialog.contains(document.activeElement) &&
      document.activeElement !== document.body
    )
      dialogOpener = document.activeElement;
    document.querySelector("#dialog-body").innerHTML =
      `<div class="dialog-header"><h2 id="dialog-title">${E(title)}</h2>${button(icon("close"), "close", {}, "icon-button")}</div>${body}`;
    if (!dialog.open) dialog.showModal();
  }
  function closeDialog() {
    dialog.close();
    if (dialogOpener?.isConnected) dialogOpener.focus();
  }
  dialog.addEventListener("close", () => {
    if (dialogOpener?.isConnected) dialogOpener.focus();
  });
  function notify(message, undo = false) {
    const target = document.querySelector("#status");
    target.innerHTML = `<span>${E(message)}</span>${undo ? button("Rückgängig", "undo-delete", {}, "text-button") : ""}${button(icon("close"), "dismiss-status", {}, "icon-button")}`;
    target.classList.add("visible");
  }
  function startDraft(options = {}, returnTo = ui.screen) {
    M.createDraft(s, options);
    ui.editorReturn = returnTo;
    navigate("editor");
    ui.editorReturn = returnTo;
  }
  function activeRef() {
    return {
      book: s.reader.book,
      chapter: s.reader.chapter,
      ...(s.reader.selected.length
        ? { from: s.reader.selected[0], to: s.reader.selected[0] }
        : {}),
      translation: s.reader.translation,
    };
  }
  function resizeEditor() {
    const t = document.querySelector("#note-text");
    if (t) {
      t.style.height = "auto";
      t.style.height = Math.max(300, t.scrollHeight + 4) + "px";
    }
  }
  function renderDock() {
    document.querySelectorAll("[data-verse]").forEach((el) => {
      const n = Number(el.dataset.verse),
        selected = s.reader.selected.includes(n),
        color =
          s.reader.highlights[
            `${s.reader.translation}:${s.reader.book}:${s.reader.chapter}:${n}`
          ];
      el.className = `verse ${selected ? "selected" : ""} ${color ? "marked mark-" + color : ""}`;
      el.setAttribute("aria-pressed", String(selected));
    });
    document.querySelector("#verse-dock").innerHTML = V.verseDock(ctx());
    document.body.classList.toggle(
      "verse-active",
      s.reader.selected.length > 0,
    );
  }
  function unitRef(unit) {
    return {
      book: unit.book,
      chapter: unit.chapter,
      from: unit.source?.references?.[0]?.from || 1,
      ...(unit.source?.references?.[0]?.to
        ? { to: unit.source.references[0].to }
        : {}),
      translation: s.reader.translation,
    };
  }
  function quizStart(id) {
    if (!C.units[id]) return;
    ui.unitId = id;
    M.startQuiz(s, id);
    navigate("quiz");
  }
  function invalidateBackup() {
    backupToken++;
    ui.restoreCandidate = null;
    if (dialog.open && dialog.querySelector('[data-action="restore-backup"]'))
      closeDialog();
  }
  function inspectBackup(text) {
    invalidateBackup();
    ui.backup = PremiumBackup.check(text, C);
    ui.backupLoading = false;
    render();
    document
      .querySelector("#backup-result")
      ?.scrollIntoView({ block: "nearest" });
  }
  const actions = {
    close: closeDialog,
    "dismiss-status": () =>
      document.querySelector("#status").classList.remove("visible"),
    "open-settings": () => navigate("settings"),
    focus: () => {
      s.reader.focus = !s.reader.focus;
      const y = scrollY;
      render();
      scrollTo(0, y);
      document
        .querySelector(
          s.reader.focus
            ? '.focus-bar [data-action="focus"]'
            : '.reader-toolbar [data-action="focus"]',
        )
        ?.focus({ preventScroll: true });
    },
    "clear-verse": () => {
      const n = s.reader.selected[0];
      s.reader.selected = [];
      renderDock();
      document
        .querySelector(`[data-verse="${n}"]`)
        ?.focus({ preventScroll: true });
    },
    mark: (b) => {
      const n = s.reader.selected[0],
        key = `${s.reader.translation}:${s.reader.book}:${s.reader.chapter}:${n}`;
      if (s.reader.highlights[key] === b.dataset.color)
        delete s.reader.highlights[key];
      else s.reader.highlights[key] = b.dataset.color;
      renderDock();
      document.querySelector("#status").classList.remove("visible");
      document
        .querySelector(`[data-action="mark"][data-color="${b.dataset.color}"]`)
        ?.focus({ preventScroll: true });
    },
    "note-reader": () =>
      startDraft({ ref: activeRef(), pathIds: [] }, "reader"),
    "chapter-picker": () =>
      modal(
        "Wo möchtest du lesen?",
        `<form id="chapter-form"><label>Bibelbuch<select id="book-choice">${C.books.map((b) => `<option value="${b.code}" ${b.code === s.reader.book ? "selected" : ""}>${E(b.name)}</option>`).join("")}</select></label><label>Kapitel<select id="chapter-choice">${Object.keys(
          C.bibles[s.reader.translation][s.reader.book],
        )
          .map(
            (n) =>
              `<option value="${n}" ${Number(n) === s.reader.chapter ? "selected" : ""}>${n}</option>`,
          )
          .join(
            "",
          )}</select></label><p class="caption">Originaltexte der mitgelieferten Kapitel. Der vollständige Bibelbestand bleibt in der bestehenden App erhalten.</p><button type="submit" class="primary">Diesen Text lesen ${icon("arrow")}</button></form>`,
      ),
    translation: () =>
      modal(
        "In deinen Worten lesen",
        `<div class="option-stack">${[
          ["otb", "OTB Deutsch", "Zeitgemäße, textnahe Übersetzung"],
          ["l1912", "Luther 1912", "Vertraute historische Sprache"],
        ]
          .map(([id, name, sub]) =>
            button(
              `<strong>${name}</strong><span>${sub}</span>${s.reader.translation === id ? icon("check") : ""}`,
              "choose-translation",
              { translation: id },
              "option-row",
            ),
          )
          .join(
            "",
          )}</div><p class="caption">Originale lokale Bibeltexte, keine KI-Zusammenfassung.</p>`,
      ),
    "choose-translation": (b) => {
      s.reader.translation = b.dataset.translation;
      s.reader.selected = [];
      closeDialog();
      render();
    },
    "reader-type": () =>
      modal(
        "Dein Leseraum",
        `<p>Die Worte sollen Raum bekommen.</p><div class="type-controls" role="group" aria-label="Schriftgröße">${button("A−", "font-size", { size: Math.max(0.9, s.reader.fontScale - 0.1) }, "secondary")}${button("A+", "font-size", { size: Math.min(1.5, s.reader.fontScale + 0.1) }, "secondary")}</div><div class="option-stack">${[
          ["light", "Hell"],
          ["atmospheric", "Atmosphärisch"],
          ["paper", "Papier"],
          ["night", "Nacht"],
        ]
          .map(([id, label]) =>
            button(
              label + (s.theme === id ? " " + icon("check") : ""),
              "theme",
              { theme: id },
              "option-row",
            ),
          )
          .join("")}</div>`,
      ),
    "font-size": (b) => {
      s.reader.fontScale = Math.round(Number(b.dataset.size) * 10) / 10;
      closeDialog();
      render();
      notify("Leseschrift angepasst.");
    },
    "next-chapter": () => {
      const chapters = Object.keys(
          C.bibles[s.reader.translation][s.reader.book],
        ).map(Number),
        at = chapters.indexOf(s.reader.chapter);
      if (at < chapters.length - 1) {
        s.reader.chapter = chapters[at + 1];
        s.reader.selected = [];
        scrolls.delete("reader");
        render();
        scrollTo(0, 0);
      } else
        modal(
          "Du bist am Ende dieser Auswahl.",
          `<p>Du kannst einen anderen Text wählen oder einen Gedanken festhalten.</p>${button("Einen anderen Text wählen", "chapter-picker", {}, "primary")}`,
        );
    },
    explore: () => {
      const added = M.exploreChapter(s, {
        book: s.reader.book,
        chapter: s.reader.chapter,
      });
      const y = scrollY;
      render();
      scrollTo(0, y);
      notify(
        added
          ? "Kapitel erkundet. Es ist jetzt Teil deiner Bibelreise."
          : "Dieses Kapitel gehört bereits zu deiner Bibelreise.",
      );
    },
    journey: () => navigate("journey"),
    "sword-variant": (b) => {
      ui.swordVariant = b.dataset.variant;
      render();
    },
    "journal-search": () => {
      ui.journalSearch = !ui.journalSearch;
      render();
      document.querySelector("#journal-query")?.focus();
    },
    "reset-journal": () => {
      ui.journalQuery = "";
      ui.journalFilter = "all";
      render();
    },
    "more-journal": () => {
      ui.journalLimit += 12;
      render();
    },
    "editor-back": () =>
      navigate(ui.editorReturn === "editor" ? "journal" : ui.editorReturn),
    "discard-draft": () =>
      modal(
        "Diesen Entwurf verwerfen?",
        `<p>Die ungespeicherten Demoworte werden verworfen. Bereits festgehaltene Einträge bleiben erhalten.</p>${button("Entwurf behalten", "close", {}, "secondary")}${button("Entwurf wirklich verwerfen", "discard-confirm", {}, "danger-button")}`,
      ),
    "discard-confirm": () => {
      M.discardDraft(s);
      closeDialog();
      navigate(ui.editorReturn || "journal");
    },
    "edit-note": (b) => {
      const d = M.editDraft(s, b.dataset.id);
      if (d) startDraft({}, "entry");
    },
    "entry-options": (b) =>
      modal(
        "Dein Gedanke",
        `${button(icon("journal") + " Eintrag bearbeiten", "edit-note", { id: b.dataset.id }, "option-row")}${button(icon("bell") + " Später erinnern", "remind-note", { id: b.dataset.id }, "option-row")}${button(icon("trash") + " Eintrag löschen", "ask-delete", { id: b.dataset.id }, "option-row danger-text")}`,
      ),
    "ask-delete": (b) =>
      modal(
        "Eintrag löschen?",
        `<p>Dieser Gedanke und seine aktiven Wegverknüpfungen werden aus der Demo entfernt. Der damalige Wortlaut in vorhandenen Rückblicken bleibt erhalten.</p>${button("Gedanken behalten", "close", {}, "secondary")}${button("Eintrag löschen", "delete-note", { id: b.dataset.id }, "danger-button")}`,
      ),
    "delete-note": (b) => {
      ui.undo = M.deleteNote(s, b.dataset.id);
      closeDialog();
      navigate("journal");
      notify("Der Gedanke wurde aus der Demo entfernt.", !!ui.undo);
    },
    "undo-delete": () => {
      if (ui.undo && M.undoDelete(s, ui.undo)) {
        ui.undo = null;
        render();
        notify("Dein Gedanke ist mit seinen Verbindungen wieder da.");
      }
    },
    "remind-note": (b) =>
      modal(
        "Wann möchtest du zurückkommen?",
        `<p>Eine freiwillige Erinnerung an diesen Gedanken. Innerhalb dieser Demo, ohne Systembenachrichtigung.</p><form id="reminder-form" data-id="${E(b.dataset.id)}"><label>Datum<input type="date" id="reminder-date" value="2026-10-24" min="2026-10-17" required></label><button class="primary" type="submit">Erinnerung wählen ${icon("bell")}</button></form>`,
      ),
    "remove-reminder": (b) => {
      s.reminders = s.reminders.filter((r) => r.id !== b.dataset.id);
      render();
      notify("Erinnerung entfernt.");
    },
    "new-path": () =>
      modal(
        "Ein Weg darf klein beginnen.",
        `<form id="path-form"><label>Was beschäftigt dich?<input id="path-title" required maxlength="120" placeholder="Zum Beispiel: Geduld im Alltag"></label><label>Warum ist dir das wichtig?<textarea id="path-why" rows="3" maxlength="1000"></textarea></label><button type="submit" class="primary">Meinen Weg beginnen ${icon("arrow")}</button></form>`,
      ),
    "more-paths": () => {
      ui.pathLimit += 6;
      render();
    },
    "path-options": (b) => {
      const p = s.paths.find((p) => p.id === b.dataset.id);
      if (!p) return;
      modal(
        "Dein persönlicher Weg",
        `${p.archived ? button(icon("paths") + " Wieder aufnehmen", "restore-path", { id: p.id }, "option-row") : button(icon("archive") + " Diesen Weg ruhen lassen", "archive-path", { id: p.id }, "option-row")}${button(icon("journal") + " Gedanken verbinden", "note-path", { id: p.id }, "option-row")}`,
      );
    },
    "archive-path": (b) =>
      modal(
        "Diesen Weg ruhen lassen?",
        `<p>Schritte, Gedanken und Rückblicke bleiben erhalten. Du findest den Weg im Archiv und kannst ihn wieder aufnehmen.</p>${button("Bei diesem Weg bleiben", "close", {}, "secondary")}${button("Weg archivieren", "archive-confirm", { id: b.dataset.id }, "primary")}`,
      ),
    "archive-confirm": (b) => {
      M.archivePath(s, b.dataset.id, true);
      closeDialog();
      navigate("archive");
      notify("Dein Weg ruht im Archiv.");
    },
    "restore-path": (b) => {
      M.archivePath(s, b.dataset.id, false);
      closeDialog();
      navigate("path", { id: b.dataset.id });
      notify("Dein Weg ist wieder bei deinen aktiven Wegen.");
    },
    "toggle-step": (b) => {
      M.toggleStep(s, b.dataset.id, b.dataset.step);
      const y = scrollY;
      render();
      scrollTo(0, y);
      notify("Schritt angepasst. Dein Olivenbaum bleibt unverändert.");
    },
    "add-step": (b) =>
      modal(
        "Ein kleiner nächster Schritt",
        `<form id="step-form" data-id="${E(b.dataset.id)}"><label>Was möchtest du versuchen?<textarea id="step-text" rows="3" maxlength="1000" required></textarea></label><button type="submit" class="primary">Schritt festhalten ${icon("check")}</button></form>`,
      ),
    "edit-step": (b) => {
      const p = s.paths.find((p) => p.id === b.dataset.id),
        step = p?.steps.find((x) => x.id === b.dataset.step);
      if (step)
        modal(
          "Deinen Schritt bearbeiten",
          `<form id="step-form" data-id="${E(p.id)}" data-step="${E(step.id)}"><label>Dein nächster Schritt<textarea id="step-text" rows="3" maxlength="1000" required>${E(step.text)}</textarea></label><button type="submit" class="primary">Änderung festhalten ${icon("check")}</button></form>`,
        );
    },
    "note-path": (b) => startDraft({ pathIds: [b.dataset.id] }, "path"),
    "confirm-development": (b) =>
      modal(
        "Was hat sich für dich entwickelt?",
        `<p>Nur du kannst sagen, ob du eine persönliche Entwicklung wahrnimmst. Ein erledigter Schritt allein ist keine Entwicklung.</p><form id="development-form" data-id="${E(b.dataset.id)}"><label>Deine ausdrücklich bestätigte Entwicklung<textarea id="development-text" required maxlength="1000" rows="4"></textarea></label><label class="checkbox-label"><input id="development-check" type="checkbox" required> Das ist meine eigene Einschätzung.</label><p class="caption">Die Vorschau bewahrt diesen Gedanken. Sie führt keine neuen Baumregeln ein.</p><button type="submit" class="primary">So möchte ich es festhalten ${icon("leaf")}</button></form>`,
      ),
    "review-note": (b) => {
      const r = s.reviews.find((r) => r.id === b.dataset.id);
      if (!r) return;
      const source = s.journal.find((n) => n.id === r.sourceId);
      startDraft(
        {
          sourceId: r.sourceId,
          sourceSnapshot: r.sourceSnapshot,
          pathIds: source?.pathIds || [],
        },
        "review",
      );
    },
    "tree-example": (b) => {
      ui.treeExample = Number(b.dataset.stage);
      const y = scrollY;
      render();
      document.querySelector(".prototype-examples").open = true;
      scrollTo(0, y);
    },
    "discovery-filter": (b) => {
      ui.discoveryKind = b.dataset.kind;
      ui.discoveryLimit = 12;
      render();
    },
    "reset-discovery": () => {
      ui.discoveryQuery = "";
      ui.discoveryKind = "all";
      render();
    },
    "more-discovery": () => {
      ui.discoveryLimit += 12;
      render();
    },
    "open-content": (b) => {
      const id = b.dataset.id,
        kind = b.dataset.kind;
      if (kind === "theme") {
        ui.topicId = id;
        navigate("topic");
      } else if (kind === "guided") {
        ui.guidedId = id;
        navigate("guided");
      } else {
        const key = `${kind}:${id}`;
        if (C.units[key]) navigate("story", { unit: key });
        else {
          const item = C.catalog.find((x) => x.id === id && x.kind === kind);
          modal(
            item?.title || "Ein vorhandener Inhalt",
            `<p class="reference-label">${E(item?.ref || "")}</p><p>Dieser Originalinhalt bleibt vollständig in FaithPath erhalten. Die Premium-Studie zeigt drei komplette Geschichten und ein Kapitelquiz interaktiv.</p><span class="draft-status">Weitere Detailansicht · Entwurfszustand</span>${link("Eine vollständige Beispielgeschichte erleben " + icon("arrow"), "story", { unit: "story:NS-0297" }, "primary")}`,
          );
        }
      }
    },
    "start-quiz": (b) => quizStart(b.dataset.unit),
    answer: (b) => {
      M.answerQuiz(s, s.quiz.index, Number(b.dataset.choice));
      const y = scrollY;
      render();
      scrollTo(0, y);
      document
        .querySelector(".answer-explanation")
        ?.scrollIntoView({ block: "nearest" });
    },
    "next-question": () => {
      const u = C.units[s.quiz.unitId];
      M.advanceQuiz(s, u.questions.length);
      render();
      scrollTo(0, 0);
    },
    "skip-question": () => {
      const u = C.units[s.quiz.unitId];
      M.answerQuiz(s, s.quiz.index, "skipped");
      M.advanceQuiz(s, u.questions.length);
      render();
      scrollTo(0, 0);
    },
    "reflect-unit": (b) => {
      const u = C.units[b.dataset.unit];
      if (u)
        startDraft(
          {
            ref: unitRef(u),
            origin: { kind: u.kind, id: u.id, title: u.title },
            pathIds: [],
          },
          "story",
        );
    },
    "note-topic": (b) => {
      const t = C.themes.find((t) => t.id === b.dataset.id),
        r = t.refs[Number(b.dataset.index)];
      startDraft(
        {
          ref: {
            book: normalizeBook(r.book),
            chapter: r.chapter,
            from: r.from,
            to: r.to,
            translation: s.reader.translation,
          },
        },
        "topic",
      );
    },
    theme: (b) => {
      const theme = b.dataset.theme;
      if (!["light", "atmospheric", "paper", "night"].includes(theme)) return;
      s.theme = theme;
      closeDialog();
      const y = scrollY;
      render();
      scrollTo(0, y);
    },
    "export-backup": () => {
      const data = JSON.stringify(M.makeBackup(s), null, 2),
        url = URL.createObjectURL(
          new Blob([data], { type: "application/json" }),
        ),
        a = document.createElement("a");
      a.href = url;
      a.download = "FaithPath-Premium-SYNTHETISCHE-Demo.json";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      notify("Demo-Sicherung erstellt. Keine Daten der echten App.");
    },
    "sample-backup": () => inspectBackup(JSON.stringify(M.makeBackup(s))),
    "bad-backup": () => inspectBackup('{"schema":"faithpath","version":999}'),
    "confirm-restore": () => {
      if (!ui.backup?.ok) return;
      ui.restoreCandidate = structuredClone(ui.backup.data);
      ui.restoreToken = backupToken;
      modal(
        "Diese Demodaten ersetzen?",
        `<p>Die geprüfte Sicherung ersetzt ${s.journal.length} Gedanken, ${s.paths.length} Wege und ihre Verknüpfungen in dieser geöffneten Demo.</p><p>Die echte FaithPath-App und ihre persönlichen Daten bleiben unberührt. Das ist eine separate synthetische Sicherung.</p>${button("Abbrechen", "close", {}, "secondary")}${button("Demodaten ausdrücklich wiederherstellen", "restore-backup", {}, "primary")}`,
      );
    },
    "restore-backup": () => {
      if (!ui.restoreCandidate || ui.restoreToken !== backupToken) {
        closeDialog();
        notify(
          "Die Vorschau hat sich geändert. Bitte prüfe die Sicherung erneut.",
        );
        return;
      }
      const result = M.restoreBackup(s, {
        ok: true,
        data: ui.restoreCandidate,
      });
      closeDialog();
      if (result.ok) {
        ui.backup = null;
        ui.restoreCandidate = null;
        ui.undo = null;
        render();
        notify("Geprüfte Demodaten wiederhergestellt.");
      } else notify(result.error);
    },
    about: () =>
      modal(
        "FaithPath · Verbunden",
        `<p>Eine eigenständige Premium-Designstudie 6A.2. Alle persönlichen Inhalte sind synthetisch. Demoeingaben bleiben nur während dieser Sitzung erhalten.</p><p>Bibeltext, Fragen und Quellreferenzen stammen unverändert aus dem vorhandenen Bestand. Neue Vektorzeichnungen und lokale OFL-Schriften ersetzen die ungeklärte Fotorechtekette.</p><p>Die Studie ist keine installierte PWA und führt keine Migration durch. Noch keine Integration oder Veröffentlichung.</p><a class="text-button" href="index.html" target="_top">Zur Designgalerie ${icon("arrow")}</a>`,
      ),
    "state-example": (b) => {
      ui.stateKind = b.dataset.kind;
      render();
    },
    "retry-state": () => {
      ui.stateKind = "loading";
      render();
      setTimeout(() => {
        if (ui.screen === "states") {
          ui.stateKind = "success";
          render();
        }
      }, 500);
    },
  };
  function onVerse(el) {
    const n = Number(el.dataset.verse);
    s.reader.selected = s.reader.selected.includes(n) ? [] : [n];
    renderDock();
  }
  document.addEventListener("click", (e) => {
    const verse = e.target.closest("[data-verse]");
    if (verse) {
      onVerse(verse);
      return;
    }
    const b = e.target.closest("button");
    if (!b || b.disabled) return;
    if (b.dataset.go) {
      navigate(b.dataset.go, b.dataset);
      return;
    }
    const action = actions[b.dataset.action];
    if (action) action(b);
  });
  document.addEventListener("keydown", (e) => {
    if (e.target.matches("[data-verse]") && ["Enter", " "].includes(e.key)) {
      e.preventDefault();
      onVerse(e.target);
    }
    if (e.key === "Escape" && !dialog.open && s.reader.focus) {
      s.reader.focus = false;
      render();
    }
  });
  document.addEventListener("input", (e) => {
    const t = e.target;
    if (t.id === "note-text") {
      s.draft.text = t.value;
      resizeEditor();
    }
    if (t.id === "note-title") s.draft.title = t.value;
    if (t.id === "journal-query") {
      ui.journalQuery = t.value;
      document.querySelector("#journal-results").innerHTML =
        V.journalResults(ctx());
    }
    if (t.id === "discovery-query") {
      ui.discoveryQuery = t.value;
      ui.discoveryLimit = 12;
      document.querySelector("#discovery-curated").hidden =
        !!t.value || ui.discoveryKind !== "all";
      document.querySelector("#discovery-results").innerHTML = V.results(ctx());
    }
  });
  document.addEventListener("change", async (e) => {
    const t = e.target;
    if (t.id === "note-path") s.draft.pathIds = t.value ? [t.value] : [];
    if (t.id === "journal-filter") {
      ui.journalFilter = t.value;
      document.querySelector("#journal-results").innerHTML =
        V.journalResults(ctx());
    }
    if (t.id === "book-choice") {
      document.querySelector("#chapter-choice").innerHTML = Object.keys(
        C.bibles[s.reader.translation][t.value],
      )
        .map((n) => `<option value="${n}">${n}</option>`)
        .join("");
    }
    if (t.id === "backup-file" && t.files[0]) {
      invalidateBackup();
      const token = backupToken;
      ui.backup = null;
      ui.backupLoading = true;
      const file = t.files[0];
      render();
      if (file.size > 2_000_000) {
        inspectBackup("");
        return;
      }
      try {
        const text = await file.text();
        if (token !== backupToken || ui.screen !== "backup") return;
        inspectBackup(text);
      } catch {
        if (token === backupToken && ui.screen === "backup") {
          ui.backupLoading = false;
          ui.backup = {
            ok: false,
            error:
              "Die Datei konnte nicht gelesen werden. Deine Demodaten bleiben erhalten.",
          };
          render();
        }
      }
    }
  });
  document.addEventListener("submit", (e) => {
    const form = e.target;
    e.preventDefault();
    if (form.id === "editor-form") {
      const result = M.saveDraft(s, {
        text: document.querySelector("#note-text").value,
        title: document.querySelector("#note-title").value,
        pathIds: s.draft.pathIds,
      });
      if (result.ok) {
        navigate("entry", { id: result.entry.id });
        notify("Dein Gedanke ist festgehalten.");
      } else document.querySelector("#editor-error").textContent = result.error;
    }
    if (form.id === "chapter-form") {
      const book = document.querySelector("#book-choice").value,
        chapter = Number(document.querySelector("#chapter-choice").value);
      closeDialog();
      navigate("reader", { book, chapter });
      scrollTo(0, 0);
    }
    if (form.id === "path-form") {
      const title = document.querySelector("#path-title").value.trim();
      if (!title) return;
      const id = "demo-path-" + Date.now();
      s.paths.push({
        id,
        title,
        why: document.querySelector("#path-why").value.trim(),
        started: "2026-10-17T09:00:00.000Z",
        archived: false,
        steps: [],
        links: [],
        milestones: [],
      });
      closeDialog();
      navigate("path", { id });
      notify("Ein neuer persönlicher Weg ist begonnen.");
    }
    if (form.id === "step-form") {
      const text = document.querySelector("#step-text").value;
      form.dataset.step
        ? M.editStep(s, form.dataset.id, form.dataset.step, text)
        : M.addStep(s, form.dataset.id, text);
      closeDialog();
      render();
      notify("Dein Schritt ist festgehalten.");
    }
    if (form.id === "development-form") {
      const result = M.confirmDevelopment(
        s,
        form.dataset.id,
        document.querySelector("#development-text").value,
      );
      if (result.ok) {
        closeDialog();
        render();
        notify(
          "Deine eigene Entwicklung ist festgehalten. Keine automatische Stufenänderung in der Studie.",
        );
      }
    }
    if (form.id === "reminder-form") {
      const sourceId = form.dataset.id,
        at = document.querySelector("#reminder-date").value;
      s.reminders = s.reminders.filter((r) => r.sourceId !== sourceId);
      s.reminders.push({
        id: "demo-reminder-" + Date.now(),
        sourceId,
        at: at + "T09:00:00.000Z",
      });
      closeDialog();
      navigate("reminders");
      notify("Freiwillige Demo-Erinnerung gewählt.");
    }
  });
  window.addEventListener("popstate", (e) => {
    const screen = e.state?.screen || location.hash.slice(1) || "today";
    if (allowed.includes(screen)) navigate(screen, {}, false);
  });
  window.PremiumDemo = {
    getState: () => structuredClone(s),
    getUI: () => structuredClone(ui),
    open: (screen, data = {}) => navigate(screen, data),
  };
  if (ui.screen === "editor") M.createDraft(s);
  if (ui.screen === "quiz" && !s.quiz) M.startQuiz(s, ui.unitId);
  render();
})();
