(() => {
  const {
    E,
    icon,
    button,
    go,
    art,
    reference,
    date,
    title,
    empty,
    refButton,
    pathChip,
    stageNames,
  } = PremiumUI;
  function today({ s, C }) {
    const p = s.paths.find((p) => !p.archived),
      next = p?.steps.find((x) => !x.done),
      last = s.journal[0],
      verse = C.bibles.otb.PSA[23].find((v) => v[0] === 1)[1];
    return `<div class="date-line"><span>Samstag, 17. Oktober</span><span>Ein Moment für dich</span></div><section class="today-intro"><div><p class="eyebrow">Deine persönliche Glaubensgeschichte</p><h1>Glaube lebt<br>im Alltag.</h1><p>Ein Wort. Ein Gedanke.<br>Ein nächster Schritt.</p></div>${art(s.stage, "today-tree")}</section>${p ? `<section class="next-step"><div class="section-label"><span class="dot"></span>Was dich gerade begleitet</div><h2>${E(p.title)}</h2><p>${E(next?.text || "Nimm dir Zeit, auf diesen Weg zurückzublicken.")}</p>${go("Bei meinem Weg weitergehen " + icon("arrow"), "path", { id: p.id }, "primary")}</section>` : `<section class="next-step"><p class="eyebrow">Dein Anfang darf klein sein</p><h2>Was beschäftigt dich?</h2><p>Du kannst lesen, eine Frage mitbringen oder einfach einen Gedanken festhalten.</p>${go("Orientierung finden " + icon("arrow"), "discover", {}, "primary")}</section>`}<div class="today-pair">${go(`<span class="book-tile">${icon("bible")}</span><span><small>Weiterlesen</small><strong>${E(reference(s.reader))}</strong><span>Bei deinem letzten Text bleiben.</span></span>${icon("chevron")}`, "reader", { book: s.reader.book, chapter: s.reader.chapter, translation: s.reader.translation }, "reading-link")}${go(`<span class="book-tile light">${icon("journal")}</span><span><small>${last ? "Dein letzter Gedanke" : "Ein Gedanke für heute"}</small><strong>${last ? E(last.title) : "Was möchtest du festhalten?"}</strong><span>${last ? date(last.at) : "Hier ist Raum für deine Worte."}</span></span>${icon("chevron")}`, last ? "entry" : "editor", last ? { id: last.id } : {}, "reading-link")}</div><section class="daily-word"><p class="eyebrow">Ein Wort zum Mitnehmen</p><blockquote>${E(verse)}</blockquote>${refButton({ book: "PSA", chapter: 23, from: 1, translation: "otb" })}</section><section class="discovery-invite"><div>${icon("compass")}<p class="eyebrow">Nicht allein mit deinen Fragen</p><h2>Was bewegt dich?</h2></div>${go("Etwas entdecken " + icon("arrow"), "discover")}</section>`;
  }
  function paths({ s, ui }) {
    const active = s.paths.filter((x) => !x.archived),
      archived = s.paths.filter((x) => x.archived);
    return (
      title("Mein Weg", "Deine Geschichte.<br>In deinem Tempo.") +
      `<section class="tree-ribbon">${art(s.stage)}<div><strong>Was in deinem Leben Wurzeln schlägt.</strong><p>Gedanken, kleine Schritte und deine eigenen Rückblicke.</p>${go("Deinen Olivenbaum ansehen " + icon("arrow"), "tree")}</div></section><div class="section-heading"><h2>Was dich begleitet</h2>${button(icon("plus") + " Weg beginnen", "new-path", {}, "small-button")}</div>${
        active.length
          ? `<div class="path-list">${active
              .slice(0, ui.pathLimit)
              .map((p) => {
                const step = p.steps.find((x) => !x.done);
                return go(
                  `<span class="path-line-mark">${icon("paths")}</span><span><small>Seit ${date(p.started)}</small><strong>${E(p.title)}</strong><span>${E(step?.text || "Ein guter Moment für einen Rückblick.")}</span></span>${icon("arrow")}`,
                  "path",
                  { id: p.id },
                  "path-card",
                );
              })
              .join(
                "",
              )}</div>${active.length > ui.pathLimit ? button("Weitere Wege anzeigen", "more-paths", {}, "secondary") : ""}`
          : empty(
              "Ein Weg beginnt mit dem, was dich bewegt.",
              "Du brauchst kein fertiges Ziel. Ein ehrlicher Gedanke reicht.",
              button("Einen Weg beginnen", "new-path", {}, "primary"),
            )
      }<div class="quiet-links">${go(icon("archive") + `Archivierte Wege${archived.length ? " · " + archived.length : ""}`, "archive")}${go(icon("clock") + "Damals und heute", "review")}</div>`
    );
  }
  function path({ s, ui }) {
    const p = s.paths.find((p) => p.id === ui.pathId) || s.paths[0];
    if (!p)
      return empty(
        "Dein erster Weg ist noch offen.",
        "Beginne dort, wo du gerade stehst.",
        go("Zur Wegübersicht", "paths", {}, "primary"),
      );
    const notes = s.journal.filter((n) => n.pathIds.includes(p.id)),
      r = s.reviews.find(
        (r) => notes.some((n) => n.id === r.sourceId) || r.pathId === p.id,
      );
    const connectedRef = notes.find((n) => n.ref)?.ref;
    return `<div class="subnav">${go(icon("back") + " Mein Weg", "paths")}${button(icon("more"), "path-options", { id: p.id }, "icon-button")}</div>${title(p.archived ? "Archivierter Weg" : "Dein persönlicher Weg", E(p.title), E(p.why))}<section class="step-section"><p class="eyebrow">Dein nächster Schritt</p>${p.steps.map((step) => `<div class="step-row"><button class="step-check ${step.done ? "checked" : ""}" data-action="toggle-step" data-id="${E(p.id)}" data-step="${E(step.id)}" aria-pressed="${step.done}" aria-label="${step.done ? "Wieder öffnen" : "Als getan festhalten"}: ${E(step.text)}">${step.done ? icon("check") : ""}</button><span>${E(step.text)}</span>${button(icon("journal"), "edit-step", { id: p.id, step: step.id }, "icon-button")}</div>`).join("")}${button(icon("plus") + " Einen kleinen Schritt ergänzen", "add-step", { id: p.id }, "text-button")}</section>${connectedRef ? `<section class="connected-scripture"><p class="eyebrow">Ein Wort auf diesem Weg</p><h2>${E(reference(connectedRef))}</h2>${refButton(connectedRef)}</section>` : ""}<section class="personal-timeline"><div class="section-heading"><h2>Was du festgehalten hast</h2>${button(icon("plus"), "note-path", { id: p.id }, "icon-button")}</div>${notes.length ? notes.map((n) => `<div class="timeline-item"><span class="timeline-point"></span><p class="date">${date(n.at)}</p><blockquote>${E(n.text)}</blockquote>${go("Gedanken öffnen " + icon("arrow"), "entry", { id: n.id })}</div>`).join("") : empty("Hier darf etwas bleiben.", "Ein Gedanke aus dem Text oder aus deinem Alltag.", button("Gedanken verbinden", "note-path", { id: p.id }, "primary"))}</section>${r ? `<section class="review-teaser"><p class="eyebrow">Damals und heute</p><h2>Vielleicht siehst du<br>heute etwas anders.</h2><p>Deine früheren Worte bleiben erhalten. Du entscheidest, was sie heute für dich bedeuten.</p>${go("In Ruhe zurückblicken " + icon("arrow"), "review", { id: r.id })}</section>` : ""}${button(icon("leaf") + " Eine Entwicklung ausdrücklich festhalten", "confirm-development", { id: p.id }, "secondary")}`;
  }
  function review({ s, ui }) {
    const r = s.reviews.find((x) => x.id === ui.reviewId) || s.reviews[0],
      source = r && s.journal.find((n) => n.id === r.sourceId);
    if (!r)
      return (
        title("Rückblick", "Damals. Und heute.") +
        empty(
          "Deine Worte dürfen Zeit bekommen.",
          "Sobald du etwas festgehalten hast, kannst du später darauf zurückblicken.",
          go("Zum Journal", "journal", {}, "primary"),
        )
      );
    return `<div class="subnav">${go(icon("back") + " Zurück zum Weg", "paths")}</div>${title("Dein eigener Rückblick", "Zwei Momente.<br>Deine Worte.")}<p class="intro">Hier steht, was du damals festgehalten hast – und was du später dazu geschrieben hast.</p><div class="review-pair"><article><div class="section-label">Damals · ${date(r.sourceSnapshot.at)}</div><blockquote>${E(r.sourceSnapshot.text)}</blockquote><span class="source-note">Unverändertes Original im Rückblick</span></article><span class="review-connector" aria-hidden="true">${icon("leaf")}</span><article><div class="section-label">Später · ${date(r.at)}</div><blockquote>${E(r.text)}</blockquote><span class="source-note">Von dir festgehalten · keine automatische Bewertung</span></article></div>${source ? go("Heutigen Stand des Originaleintrags öffnen " + icon("arrow"), "entry", { id: source.id }) : '<p class="notice">Der Originaleintrag wurde gelöscht. Sein damaliger Wortlaut bleibt in diesem Rückblick erhalten.</p>'}${button("Was denke ich heute darüber? " + icon("journal"), "review-note", { id: r.id }, "primary")}`;
  }
  function tree({ s, ui }) {
    return `<div class="subnav">${go(icon("back") + " Mein Weg", "paths")}</div>${title("Dein Olivenbaum", "Eine Geschichte,<br>die Wurzeln hat.")}<section class="tree-exhibit">${art(ui.treeExample || s.stage)}<p class="tree-stage-name">${E(stageNames[(ui.treeExample || s.stage) - 1])}</p><p>Ein Bild deiner selbst festgehaltenen Entwicklung.<br>Kein Maß für deinen Glauben.</p></section><div class="tree-explanation"><h2>Wachstum lässt sich nicht erledigen.</h2><p>Ein abgeschlossener Schritt macht deinen Baum nicht automatisch größer. Nur Entwicklungen, die du ausdrücklich selbst festhältst, gehören zu deiner Geschichte.</p>${go("Zu deinem persönlichen Weg " + icon("arrow"), "paths")}</div><details class="prototype-examples"><summary>Sieben Gestaltungen vergleichen · Designvorschau</summary><div class="tree-variants">${stageNames.map((name, i) => button(`${art(i + 1)}<span>${E(name)}</span>`, "tree-example", { stage: i + 1 }, `tree-variant ${(ui.treeExample || s.stage) === i + 1 ? "active" : ""}`)).join("")}</div><p class="caption">Neue eigene Vektorzeichnungen, keine neuen Stufenregeln. Der Vergleich verändert keine Entwicklung.</p></details>`;
  }
  function archive({ s }) {
    const archived = s.paths.filter((p) => p.archived);
    return `<div class="subnav">${go(icon("back") + " Mein Weg", "paths")}</div>${title("Wegarchiv", "Manches darf ruhen.", "Deine Gedanken und Verbindungen bleiben erhalten.")} ${archived.length ? archived.map((p) => `<article class="archive-card"><span class="eyebrow">Archiviert</span><h2>${E(p.title)}</h2><p>${E(p.why)}</p><div class="actions">${go("Weg öffnen", "path", { id: p.id })}${button("Wieder aufnehmen " + icon("arrow"), "restore-path", { id: p.id }, "small-button")}</div></article>`).join("") : empty("Hier ruht noch kein Weg.", "Du kannst einen Weg archivieren und später wieder aufnehmen.", go("Zu deinen Wegen", "paths", {}, "primary"))}`;
  }
  Object.assign(PremiumViews, { today, paths, path, review, tree, archive });
})();
