/* Presentation primitives. All user/source text crosses escape() before HTML. */
(() => {
  const E = PremiumModel.escape;
  const paths = {
    leaf: "M4 20C3 7 9 3 21 3c0 12-5 17-17 17ZM4 20 17 7M8 15l-4-3m9-2V4",
    home: "m3 10 9-7 9 7v10h-6v-6H9v6H3Z",
    bible:
      "M12 5v16M12 5C8 2 4 3 2 4v15c4-1 7 0 10 2 3-2 6-3 10-2V4c-2-1-6-2-10 1Z",
    paths: "M5 20c-1-8 14-3 14-10 0-4-4-5-7-5m2-3-3 3 3 3",
    journal: "m4 16 12-12 4 4L8 20H4Zm10-9 3 3",
    arrow: "M4 12h16m-6-6 6 6-6 6",
    back: "M20 12H4m6-6-6 6 6 6",
    close: "m5 5 14 14M19 5 5 19",
    plus: "M12 4v16M4 12h16",
    check: "m4 12 5 5L20 6",
    search: "m16 16 5 5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
    more: "M5 12h.1m6.9 0h.1m6.9 0h.1",
    settings:
      "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-6v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2",
    focus: "M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5",
    bookmark: "M6 3h12v18l-6-4-6 4Z",
    archive: "M3 4h18v5H3Zm2 5v12h14V9M9 13h6",
    clock: "M12 6v6l4 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
    bell: "M5 17h14l-2-4V8a5 5 0 0 0-10 0v5Zm5 3h4",
    shield: "M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6Zm-4 9 3 3 5-5",
    download: "M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5",
    upload: "M12 16V4m-5 5 5-5 5 5M4 16v5h16v-5",
    trash: "M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7",
    compass: "m16 8-3 5-5 3 3-5ZM22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
    sun: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-6v2m0 16v2M2 12h2m16 0h2",
    sword: "m12 2 3 6-2 8 5 2-1 3-5-3-5 3-1-3 5-2-2-8Z",
    question:
      "M9 8a3 3 0 1 1 4 3c-1 1-1 1-1 3m0 4h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
    chevron: "m9 5 7 7-7 7",
  };
  function icon(name) {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name] || paths.leaf}"/></svg>`;
  }
  const attrs = (data) =>
    Object.entries(data || {})
      .map(([k, v]) => `data-${k}="${E(String(v))}"`)
      .join(" ");
  const actionNames = {
    "open-settings": "Mehr und Einstellungen",
    focus: "Konzentrationsmodus",
    close: "Dialog schließen",
    "entry-options": "Optionen für diesen Eintrag",
    "path-options": "Optionen für diesen Weg",
    "edit-step": "Schritt bearbeiten",
    "note-path": "Gedanken mit diesem Weg verbinden",
    "journal-search": "Journal durchsuchen",
    "clear-verse": "Versauswahl schließen",
    "dismiss-status": "Meldung schließen",
  };
  function button(label, action, data = {}, cls = "text-button") {
    const onlyIcon = !label
      .replace(/<svg[\s\S]*?<\/svg>/g, "")
      .replace(/<[^>]*>/g, "")
      .trim();
    const aria = onlyIcon
      ? `aria-label="${E(actionNames[action] || action)}"`
      : "";
    return `<button type="button" class="${cls}" data-action="${action}" ${aria} ${attrs(data)}>${label}</button>`;
  }
  function go(label, screen, data = {}, cls = "text-button") {
    const aria = !label
      .replace(/<svg[\s\S]*?<\/svg>/g, "")
      .replace(/<[^>]*>/g, "")
      .trim()
      ? `aria-label="${E({ reminders: "Erinnerungen", collection: "Fragensammlung", journal: "Journal", reader: "Bibel" }[screen] || screen)}"`
      : "";
    return `<button type="button" class="${cls}" data-go="${screen}" ${aria} ${attrs(data)}>${label}</button>`;
  }
  function art(stage = 4, cls = "") {
    return `<img class="tree-art ${cls}" src="assets/art/tree-${stage}.svg" alt="Olivenbaum als Bild selbst festgehaltener persönlicher Entwicklung" width="480" height="480">`;
  }
  const books = { JHN: "Johannes", PSA: "Psalm", EPH: "Epheser" };
  function reference(ref) {
    if (!ref) return "";
    return `${books[ref.book] || ref.book} ${ref.chapter}${ref.from ? "," + ref.from + (ref.to && ref.to !== ref.from ? "–" + ref.to : "") : ""}`;
  }
  function date(at, options = { day: "numeric", month: "long" }) {
    return new Intl.DateTimeFormat("de-DE", options).format(new Date(at));
  }
  function title(kicker, headline, sub = "") {
    return `<header class="page-title"><p class="eyebrow">${kicker}</p><h1>${headline}</h1>${sub ? `<p class="intro">${sub}</p>` : ""}</header>`;
  }
  function empty(headline, text, action = "") {
    return `<section class="empty-state"><span class="empty-symbol">${icon("leaf")}</span><h2>${headline}</h2><p>${text}</p>${action}</section>`;
  }
  function refButton(ref, cls = "reference-chip") {
    return go(
      icon("bible") + E(reference(ref)),
      "reader",
      {
        book: ref.book,
        chapter: ref.chapter,
        verse: ref.from || "",
        translation: ref.translation || "otb",
      },
      cls,
    );
  }
  function pathChip(path) {
    return go(
      icon("paths") + E(path.title),
      "path",
      { id: path.id },
      "reference-chip",
    );
  }
  const stageNames = [
    "Samen",
    "Keimling",
    "Junger Olivenbaum",
    "Wachsender Olivenbaum",
    "Starker Olivenbaum",
    "Erste Früchte",
    "Fruchttragender Olivenbaum",
  ];
  window.PremiumUI = {
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
  };
  window.PremiumViews = {};
})();
