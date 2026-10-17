(() => {
  const {
    E,
    icon,
    button,
    go,
    reference,
    date,
    title,
    empty,
    refButton,
    pathChip,
  } = PremiumUI;
  function journalResults({ s, ui, M }) {
    const entries = M.searchJournal(s, ui.journalQuery, ui.journalFilter);
    let month = "";
    return entries.length
      ? entries
          .slice(0, ui.journalLimit)
          .map((n, i) => {
            const m = date(n.at, { month: "long", year: "numeric" }),
              label = m !== month ? `<h2 class="month-heading">${m}</h2>` : "";
            month = m;
            return `${label}<article class="journal-entry ${i === 0 ? "latest" : ""}"><div class="entry-calendar"><strong>${date(n.at, { day: "2-digit" })}</strong><span>${date(n.at, { weekday: "short" })}</span></div><div><p class="date">${n.updatedAt ? "Bearbeitet · " + date(n.updatedAt) : date(n.at, { weekday: "long" })}</p>${go(`<h3>${E(n.title)}</h3><p>${E(n.text)}</p>`, "entry", { id: n.id }, "entry-open")}<div class="entry-links">${n.ref ? refButton(n.ref) : ""}${n.pathIds
              .map((id) => s.paths.find((p) => p.id === id))
              .filter(Boolean)
              .map(pathChip)
              .join("")}</div></div></article>`;
          })
          .join("") +
          (entries.length > ui.journalLimit
            ? button(
                "Ältere Gedanken anzeigen",
                "more-journal",
                {},
                "secondary",
              )
            : "")
      : empty(
          ui.journalQuery
            ? "Kein Gedanke zu diesem Wort."
            : "Dein Journal wartet auf deine Worte.",
          ui.journalQuery
            ? "Versuche ein anderes Wort oder hebe den Filter auf."
            : "Du musst nichts Besonderes schreiben. Was beschäftigt dich gerade?",
          ui.journalQuery
            ? button("Suche zurücksetzen", "reset-journal", {}, "text-button")
            : go(
                "Einen ersten Gedanken festhalten " + icon("journal"),
                "editor",
                {},
                "primary",
              ),
        );
  }
  function journal(ctx) {
    const { s, ui } = ctx;
    return `<div class="journal-title"><div><p class="eyebrow">Dein Journal</p><h1>Was bleibt.</h1></div><div>${button(icon("search"), "journal-search", {}, "icon-button")}${go(icon("bell"), "reminders", {}, "icon-button")}</div></div><p class="journal-intro">Ein Raum für deine Worte. Auch für die unfertigen.</p>${go(`<span><small>17. Oktober · Dein Gedanke für heute</small><strong>${s.draft?.text ? "Deinen Entwurf weiterführen" : "Was möchtest du dir merken?"}</strong></span>${icon("journal")}`, "editor", {}, "journal-compose")} ${ui.journalSearch ? `<div class="journal-search"><label class="search-field">${icon("search")}<span class="sr">In Gedanken suchen</span><input type="search" id="journal-query" placeholder="Gedanke, Weg oder Bibelstelle" value="${E(ui.journalQuery)}"></label><label>Zeigen<select id="journal-filter"><option value="all">Alle Gedanken</option><option value="bible" ${ui.journalFilter === "bible" ? "selected" : ""}>Mit Bibelstelle</option><option value="linked" ${ui.journalFilter === "linked" ? "selected" : ""}>Mit persönlichem Weg</option></select></label></div>` : ""}<div id="journal-results" aria-live="polite">${journalResults(ctx)}</div>`;
  }
  function editor({ s, ui }) {
    const d = s.draft || { text: "", title: "", pathIds: [] };
    return `<form id="editor-form" class="writing-room"><header class="editor-header">${button(icon("back") + " Zurück", "editor-back", {}, "text-button")}<button type="submit" class="small-button">Festhalten ${icon("check")}</button></header><p class="writing-date">${d.entryId ? "Gedanken bearbeiten" : "Samstag, 17. Oktober 2026"}</p>${d.sourceSnapshot ? `<aside class="original-thought"><p class="eyebrow">Dein damaliger Gedanke · ${date(d.sourceSnapshot.at)}</p><p>${E(d.sourceSnapshot.text)}</p></aside>` : ""}${d.ref ? `<div class="writing-reference">${refButton(d.ref)}<span>Bleibt mit diesem Text verbunden.</span></div>` : ""}${d.origin ? `<p class="origin-label">Aus ${E(d.origin.title)}</p>` : ""}<label class="sr" for="note-title">Titel des Gedankens, freiwillig</label><input id="note-title" class="writing-title" maxlength="180" placeholder="Ein Gedanke …" value="${E(d.title || "")}"><label class="sr" for="note-text">Dein persönlicher Gedanke</label><textarea id="note-text" class="writing-text" maxlength="16000" placeholder="Hier ist Raum für das, was dich bewegt. Du musst es noch nicht zu Ende gedacht haben." rows="10">${E(d.text || "")}</textarea><div class="writing-connections"><label>${icon("paths")} Mit einem Weg verbinden<select id="note-path"><option value="">Ohne Wegverknüpfung</option>${s.paths.map((p) => `<option value="${E(p.id)}" ${d.pathIds.includes(p.id) ? "selected" : ""}>${E(p.title)}${p.archived ? " · archiviert" : ""}</option>`).join("")}</select></label><p class="caption">Synthetische Vorschau: Dein Entwurf bleibt während dieser Sitzung erhalten. Neuladen setzt die Demo zurück.</p>${button("Entwurf verwerfen", "discard-draft", {}, "quiet-button")}</div><p id="editor-error" class="form-error" role="alert"></p></form>`;
  }
  function entry({ s, ui }) {
    const n = s.journal.find((x) => x.id === ui.entryId) || s.journal[0];
    if (!n)
      return empty(
        "Dieser Gedanke ist nicht mehr hier.",
        "Du kannst ihn direkt nach dem Löschen wiederherstellen oder einen neuen festhalten.",
        go("Zum Journal", "journal", {}, "primary"),
      );
    const sourceReviews = s.reviews.filter((r) => r.sourceId === n.id);
    return `<div class="subnav">${go(icon("back") + " Journal", "journal")}${button(icon("more"), "entry-options", { id: n.id }, "icon-button")}</div><article class="entry-detail"><p class="date">${date(n.at, { day: "numeric", month: "long", year: "numeric" })}</p><h1>${E(n.title)}</h1>${n.updatedAt ? `<p class="caption">Bearbeitet am ${date(n.updatedAt)}</p>` : ""}<div class="entry-body">${E(n.text)}</div><div class="entry-links">${n.ref ? refButton(n.ref) : ""}${n.pathIds
      .map((id) => s.paths.find((p) => p.id === id))
      .filter(Boolean)
      .map(pathChip)
      .join(
        "",
      )}</div>${n.origin ? `<p class="caption">Aus „${E(n.origin.title)}“ · ${E(n.origin.id)}</p>` : ""}</article><div class="entry-bottom-actions">${button(icon("journal") + " Bearbeiten", "edit-note", { id: n.id }, "secondary")}${button(icon("bell") + " Später erinnern", "remind-note", { id: n.id }, "text-button")}</div>${sourceReviews.length ? `<section class="related-review"><p class="eyebrow">Dieser Gedanke hat eine Geschichte</p><h2>Damals und später.</h2><p>Dein damaliger Wortlaut bleibt im Rückblick erhalten, auch wenn du diesen Eintrag bearbeitest.</p>${go("Rückblick öffnen " + icon("arrow"), "review", { id: sourceReviews[0].id })}</section>` : ""}`;
  }
  Object.assign(PremiumViews, { journal, journalResults, editor, entry });
})();
