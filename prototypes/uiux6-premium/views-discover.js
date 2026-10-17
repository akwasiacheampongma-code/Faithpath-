(() => {
  const { E, icon, button, go, reference, date, title, empty, refButton } =
    PremiumUI;
  function results({ ui, C }) {
    const q = ui.discoveryQuery.trim().toLocaleLowerCase("de"),
      kind = ui.discoveryKind;
    let items =
      kind === "themes"
        ? C.themes.map((t) => ({ ...t, kind: "theme", ref: t.sub }))
        : kind === "guided"
          ? C.guided.map((g) => ({ ...g, kind: "guided", ref: g.sub }))
          : C.catalog.filter((x) => kind === "all" || x.kind === kind);
    items = items.filter((x) =>
      [x.title, x.ref, x.sub].join(" ").toLocaleLowerCase("de").includes(q),
    );
    if (!items.length)
      return empty(
        "Noch kein passender Text.",
        "Probiere ein anderes Wort oder entdecke die vorhandenen Themen.",
        button("Suche zurücksetzen", "reset-discovery", {}, "text-button"),
      );
    return `<p class="result-count" role="status">${items.length} ${items.length === 1 ? "Inhalt" : "Inhalte"} · ${Math.min(items.length, ui.discoveryLimit)} angezeigt</p><div class="discovery-results">${items
      .slice(0, ui.discoveryLimit)
      .map(
        (x) =>
          `<button class="discovery-row" data-action="open-content" data-id="${E(x.id)}" data-kind="${E(x.kind)}"><span class="content-symbol ${x.kind}">${icon(x.kind === "theme" ? "compass" : x.kind === "guided" ? "paths" : x.kind === "chapter" ? "question" : "bible")}</span><span><small>${{ story: "Geschichte", chapter: "Kapitelübung", theme: "Lebensthema", guided: "Geführter Weg" }[x.kind]}</small><strong>${E(x.title)}</strong><span>${E(x.ref)}</span></span>${icon("chevron")}</button>`,
      )
      .join(
        "",
      )}</div>${items.length > ui.discoveryLimit ? button("Weitere Inhalte anzeigen", "more-discovery", {}, "secondary") : ""}`;
  }
  function discover(ctx) {
    const { s, ui, C } = ctx,
      q = s.quiz && C.units[s.quiz.unitId],
      showCurated = !ui.discoveryQuery && ui.discoveryKind === "all";
    return (
      title(
        "Entdecken",
        "Vom Leben<br>zurück zum Wort.",
        "Ein Text für deine Fragen. Ein neuer Blick auf Vertrautes.",
      ) +
      `<label class="search-field discovery-search">${icon("search")}<span class="sr">In Geschichten, Themen und Wegen suchen</span><input type="search" id="discovery-query" value="${E(ui.discoveryQuery)}" placeholder="Was beschäftigt dich gerade?"></label><div class="filter-row" role="group" aria-label="Inhalte filtern">${[
        ["all", "Für dich"],
        ["story", "Geschichten"],
        ["chapter", "Kapitelübungen"],
        ["themes", "Themen"],
        ["guided", "Geführte Wege"],
      ]
        .map(
          ([id, label]) =>
            `<button data-action="discovery-filter" data-kind="${id}" aria-pressed="${ui.discoveryKind === id}">${label}</button>`,
        )
        .join(
          "",
        )}</div><div id="discovery-curated" ${showCurated ? "" : "hidden"}>${q && !s.quiz.complete ? `<section class="resume-quiz"><p class="eyebrow">Hier kannst du weitergehen</p><h2>${E(q.title)}</h2><p>Frage ${s.quiz.index + 1} von ${q.questions.length}. In dieser Sitzung erhalten.</p>${go("Fragenfolge fortsetzen " + icon("arrow"), "quiz", {}, "text-button")}</section>` : ""}<section class="featured-story"><div class="story-illustration" aria-hidden="true"><span class="vine-line"></span><img src="assets/art/brand-sprig.svg" alt="" width="240" height="240"></div><div><p class="eyebrow">Eine Geschichte zum Verweilen</p><h2>Der rechte<br>Weinstock</h2><p>Johannes 15,1–13</p>${go("Die Geschichte entdecken " + icon("arrow"), "story", { unit: "story:NS-0297" }, "text-button")}</div></section><section class="topic-starts"><div class="section-heading"><h2>Mitten im Leben</h2>${button("Alle Themen", "discovery-filter", { kind: "themes" }, "text-button")}</div><div class="topic-grid">${C.themes
        .slice(0, 4)
        .map((t, i) =>
          button(
            `<span class="topic-glyph" aria-hidden="true">${["◌", "⌁", "↗", "∿"][i]}</span><strong>${E(t.title)}</strong><span>${E(t.sub)}</span>`,
            "open-content",
            { kind: "theme", id: t.id },
            "topic-tile",
          ),
        )
        .join(
          "",
        )}</div></section></div><div id="discovery-results">${results(ctx)}</div>`
    );
  }
  function story({ ui, C }) {
    const u = C.units[ui.unitId] || C.units["story:NS-0297"];
    return `<div class="subnav">${go(icon("back") + " Entdecken", "discover")}${go(icon("bookmark") + " Sammlung", "collection", {}, "text-button")}</div><section class="story-opening"><span class="story-opening-mark">${icon("leaf")}</span><p class="eyebrow">${u.kind === "chapter" ? "Kapitelübung" : "Biblische Geschichte"}</p><h1>${E(u.title)}</h1><p>${E(u.ref)}</p></section><div class="story-route"><span>Lesen</span><span aria-hidden="true">—</span><span>Verstehen</span><span aria-hidden="true">—</span><span>Reflektieren</span></div><p class="intro">Lies den Bibeltext in Ruhe. Die Fragen helfen dir beim Verstehen; dein eigener Gedanke darf daraus wachsen.</p>${go("Zum Bibeltext " + icon("bible"), "reader", { book: u.book, chapter: u.chapter }, "primary")}${button(`${u.questions.length} Fragen ansehen ` + icon("arrow"), "start-quiz", { unit: ui.unitId || "story:NS-0297" }, "secondary")}<section class="reflection-intro"><p class="eyebrow">Raum für deinen Gedanken</p><blockquote>${E(u.reflection)}</blockquote>${button("Gedanken festhalten " + icon("journal"), "reflect-unit", { unit: ui.unitId || "story:NS-0297" }, "text-button")}<p class="caption">Freiwillig. Ohne richtige oder falsche Antwort.</p></section>`;
  }
  function quiz({ s, C }) {
    const qstate = s.quiz,
      u = qstate && C.units[qstate.unitId];
    if (!u)
      return empty(
        "Verstehen beginnt beim Lesen.",
        "Wähle eine Geschichte oder eine Kapitelübung.",
        go("Etwas entdecken", "discover", {}, "primary"),
      );
    if (qstate.complete)
      return `<div class="subnav">${go(icon("back") + " Zur Geschichte", "story", { unit: qstate.unitId })}</div><section class="quiz-complete"><span class="complete-ornament">${icon("leaf")}</span><p class="eyebrow">Du hast den Text betrachtet</p><h1>Was möchtest du<br>mitnehmen?</h1><p>Vielleicht ist ein Wort geblieben. Vielleicht auch eine Frage.</p><blockquote>${E(u.reflection)}</blockquote>${button("Meinen Gedanken festhalten " + icon("journal"), "reflect-unit", { unit: qstate.unitId }, "primary")}${go("Zum Bibeltext zurück", "reader", { book: u.book, chapter: u.chapter }, "text-button")}</section>`;
    const n = qstate.index,
      q = u.questions[n],
      chosen = qstate.answers[n],
      answered = chosen !== undefined;
    return `<div class="quiz-top">${go(icon("back") + " Später fortsetzen", "discover")}<span>${n + 1} von ${u.questions.length}</span></div><div class="quiz-progress" aria-hidden="true"><span style="width:${((n + 1) / u.questions.length) * 100}%"></span></div><p class="eyebrow quiz-reference">${E(u.ref)} · Verstehen</p><h1 class="quiz-question">${E(q.q)}</h1><div class="answer-list" role="group" aria-label="Vier Antwortmöglichkeiten">${q.a.map((a, i) => `<button class="answer ${answered && i === q.c ? "correct" : ""} ${answered && i === chosen && chosen !== q.c ? "chosen" : ""}" data-action="answer" data-choice="${i}" ${answered ? "disabled" : ""}><span class="answer-letter">${answered && i === q.c ? icon("check") : ["A", "B", "C", "D"][i]}</span><span>${E(a)}${answered && i === chosen ? "<small>Deine Auswahl</small>" : ""}${answered && i === q.c ? "<small>Passt zum Bibeltext</small>" : ""}</span></button>`).join("")}</div>${answered ? `<section class="answer-explanation" role="status"><p class="eyebrow">${chosen === q.c ? "Im Text wiedergefunden" : "Ein zweiter Blick in den Text"}</p><p>${E(q.x || q.answer)}</p><span class="reference-label">${E(q.ref)}</span>${go("Im Bibeltext nachlesen " + icon("arrow"), "reader", { book: u.book, chapter: u.chapter }, "text-button")}</section>${button((n === u.questions.length - 1 ? "Zur persönlichen Reflexion" : "Weiter zur nächsten Frage") + " " + icon("arrow"), "next-question", {}, "primary")}` : `<p class="quiz-gentle-note">Es geht ums Verstehen. Nimm dir die Zeit, die du brauchst.</p>${button("Diese Frage überspringen", "skip-question", {}, "text-button")}`}`;
  }
  function collection({ C, s }) {
    return `<div class="subnav">${go(icon("back") + " Entdecken", "discover")}</div>${title("Deine Fragensammlung", "Verstehen darf wachsen.", "Keine Punkte. Keine Eile. Zurück zum Text.")}<div class="collection-intro"><span>${icon("bible")}</span><div><h2>Kapitelübungen im Neuen Testament</h2><p>1.300 bestehende Fragen in der App. In dieser Studie: Johannes 15 mit fünf unveränderten Fragen.</p></div></div>${button("Johannes 15 · fünf Fragen " + icon("arrow"), "start-quiz", { unit: "chapter:JHN:15" }, "primary")}<h2 class="section-title">Geschichten zum Vertiefen</h2>${Object.entries(
      C.units,
    )
      .filter(([, u]) => u.kind === "story")
      .map(([key, u]) =>
        go(
          `<span><small>${E(u.ref)}</small><strong>${E(u.title)}</strong><span>${u.questions.length} Fragen</span></span>${icon("arrow")}`,
          "story",
          { unit: key },
          "collection-row",
        ),
      )
      .join(
        "",
      )}<p class="caption">Fragen und Reihenfolge stammen aus dem aktiven freigegebenen Bestand. Der Fortschritt dieser Vorschau bleibt nur in dieser Sitzung erhalten.</p>`;
  }
  function topic({ ui, C }) {
    const t = C.themes.find((t) => t.id === ui.topicId) || C.themes[0];
    return `<div class="subnav">${go(icon("back") + " Entdecken", "discover")}</div>${title("Was dich beschäftigt", E(t.title), E(t.sub))}<div class="topic-passages">${t.refs.map((r, i) => `<article><p class="eyebrow">Ein Blick in den Text</p><h2>${E(r.label)}</h2><p>${E(r.context)}</p>${go("Bibeltext lesen " + icon("bible"), "reader", { book: r.book, chapter: r.chapter, verse: r.from }, "text-button")}<blockquote>${E(r.question)}</blockquote>${button("Gedanken festhalten", "note-topic", { id: t.id, index: i }, "text-button")}</article>`).join("")}</div>`;
  }
  function guided({ ui, C }) {
    const g = C.guided.find((g) => g.id === ui.guidedId) || C.guided[0];
    return `<div class="subnav">${go(icon("back") + " Entdecken", "discover")}</div>${title("Ein geführter Weg", E(g.title), E(g.sub))}<p class="caption">Eine Einladung, kein Tageszwang. Du bestimmst das Tempo.</p><div class="guided-days">${g.days.map((d, i) => `<article><span class="guided-day-number">${i + 1}</span><div><p class="eyebrow">Ein nächster Blick</p><h2>${E(d[0])}</h2><p>${E(d[5])}</p>${go("Den Text lesen " + icon("arrow"), "reader", { book: d[1], chapter: d[2], verse: d[3] }, "text-button")}</div></article>`).join("")}</div>`;
  }
  Object.assign(PremiumViews, {
    discover,
    results,
    story,
    quiz,
    collection,
    topic,
    guided,
  });
})();
