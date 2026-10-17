(() => {
  const { E, icon, button, go, reference, date, title, empty } = PremiumUI;
  const themes = [
    ["light", "Hell", "Klar und ruhig"],
    ["atmospheric", "Atmosphärisch", "Tiefes Grün"],
    ["paper", "Papier", "Warm und sanft"],
    ["night", "Nacht", "Gedämpftes Licht"],
  ];
  function settings({ s }) {
    return (
      title("Mehr", "So, wie es zu dir passt.") +
      `<section class="settings-group"><h2>Dein Leseraum</h2><div class="theme-grid" role="group" aria-label="Darstellung wählen">${themes.map(([id, label, sub]) => `<button class="theme-tile theme-${id}" data-action="theme" data-theme="${id}" aria-pressed="${s.theme === id}"><span class="theme-sample"><i></i><i></i><i></i></span><strong>${label}</strong><small>${sub}</small>${s.theme === id ? icon("check") : ""}</button>`).join("")}</div></section><section class="settings-group"><h2>Deine Geschichte</h2>${go(icon("clock") + " Rückblicke " + icon("chevron"), "review", {}, "settings-row")}${go(icon("archive") + " Archivierte Wege " + icon("chevron"), "archive", {}, "settings-row")}${go(icon("bell") + " Freiwillige Erinnerungen " + icon("chevron"), "reminders", {}, "settings-row")}${go(icon("bookmark") + " Fragensammlung " + icon("chevron"), "collection", {}, "settings-row")}</section><section class="settings-group"><h2>Gut aufgehoben</h2>${go(icon("shield") + " Sicherung & Wiederherstellung " + icon("chevron"), "backup", {}, "settings-row")}${button(icon("question") + " Über diese Designstudie " + icon("chevron"), "about", {}, "settings-row")}${go(icon("compass") + " Ersten Einstieg ansehen " + icon("chevron"), "onboarding", {}, "settings-row")}</section><p class="privacy-note">${icon("shield")} Deine Gedanken gehören dir. In dieser Studie sind alle Daten synthetisch; die bestehende App bleibt unberührt.</p>`
    );
  }
  function onboarding() {
    return `<section class="onboarding"><div class="onboarding-art"><img src="assets/art/brand-sprig.svg" alt="Ein Olivenzweig als Zeichen von Begleitung" width="240" height="240"></div><p class="eyebrow">Willkommen bei FaithPath</p><h1>Dein Glaube.<br>Dein Leben.<br>Dein Weg.</h1><p>Entdecke Gottes Wort. Halte fest, was dich bewegt. Erkenne mit der Zeit deine eigene Geschichte.</p><div class="onboarding-choices">${go(`<span>${icon("compass")}<strong>Ich brauche Orientierung</strong><small>Mit einer Frage aus deinem Leben beginnen.</small></span>${icon("arrow")}`, "discover", {}, "onboarding-choice")}${go(`<span>${icon("bible")}<strong>Direkt zur Bibel</strong><small>Lesen, markieren und Gedanken festhalten.</small></span>${icon("arrow")}`, "reader", {}, "onboarding-choice")}</div><p class="caption">Ohne Anmeldung. Ohne Glaubensbewertung.<br>Du entscheidest, was du festhalten möchtest.</p>${go("Erst einmal umsehen", "today", {}, "text-button")}</section>`;
  }
  function reminders({ s }) {
    return `<div class="subnav">${go(icon("back") + " Mehr", "settings")}</div>${title("Freiwillige Erinnerungen", "Eine Einladung,<br>kein Muss.", "Du entscheidest, ob und wann ein Gedanke wieder bei dir anklopfen darf.")}<div class="reminder-note">${icon("bell")}<p>Diese Designstudie zeigt Erinnerungen innerhalb der Demo. Sie sendet keine Systembenachrichtigungen.</p></div>${
      s.reminders.length
        ? s.reminders
            .map((r) => {
              const n = s.journal.find((n) => n.id === r.sourceId);
              return `<article class="reminder-card"><p class="eyebrow">${date(r.at, { day: "numeric", month: "long", year: "numeric" })}</p><h2>${E(n?.title || r.text || "Ein persönlicher Gedanke")}</h2><div class="actions">${n ? go("Gedanken öffnen", "entry", { id: n.id }) : ""}${button("Erinnerung entfernen", "remove-reminder", { id: r.id }, "text-button")}</div></article>`;
            })
            .join("")
        : empty(
            "Du hast gerade keine Erinnerung gewählt.",
            "Beim Lesen eines Journaleintrags kannst du dich freiwillig später daran erinnern lassen.",
            go("Zum Journal", "journal", {}, "primary"),
          )
    }<p class="caption">Keine Pflicht, keine Streaks, kein schlechtes Gewissen. Erinnerungen lassen sich jederzeit entfernen.</p>`;
  }
  function backup({ s, ui }) {
    const v = ui.backup?.ok && ui.backup.data;
    return `<div class="subnav">${go(icon("back") + " Mehr", "settings")}</div>${title("Deine Worte sind kostbar", "Gut aufgehoben.", "Eine ruhige Sicherung. Ein klarer Blick, bevor etwas ersetzt wird.")}<p class="prototype-notice">Interaktive Sicherungsstudie mit synthetischen Daten. Keine echten FaithPath-Backups verwenden.</p><section class="backup-export"><span class="backup-emblem">${icon("shield")}</span><div><h2>Eine Sicherung mitnehmen</h2><p>Gedanken, Wege und ihre Verbindungen zusammen bewahren.</p><span class="backup-counts">${s.journal.length} Gedanken · ${s.paths.length} Wege · ${s.reviews.length} Rückblicke</span></div>${button("Demo-Sicherung herunterladen " + icon("download"), "export-backup", {}, "primary")}</section><section class="backup-import"><h2>Eine Sicherung prüfen</h2><p>Erst die Datei prüfen. Dann die Vorschau ansehen. Erst nach deiner ausdrücklichen Bestätigung werden Demodaten ersetzt.</p><label class="file-picker">${icon("upload")}<span>Demo-Datei auswählen</span><input type="file" id="backup-file" accept="application/json,.json"></label>${button("Mit gültiger Beispieldatei ausprobieren", "sample-backup", {}, "text-button")}${button("Fehlerfall ansehen", "bad-backup", {}, "text-button")}<div id="backup-result" aria-live="polite">${ui.backupLoading ? '<div class="loading-line"><span></span> Datei wird geprüft …</div>' : v ? `<article class="backup-preview"><p class="eyebrow">Datei geprüft · Vorschau</p><h3>Das ist in deiner Sicherung.</h3><dl><div><dt>Gedanken</dt><dd>${v.journal.length}</dd></div><div><dt>Wege</dt><dd>${v.paths.length}</dd></div><div><dt>Rückblicke</dt><dd>${v.reviews.length}</dd></div></dl><p>Nur die synthetischen Daten dieser geöffneten Demo werden ersetzt. Die echte App wird nicht angesprochen.</p>${button("Wiederherstellung besprechen " + icon("arrow"), "confirm-restore", {}, "primary")}</article>` : ui.backup && !ui.backup.ok ? `<div class="error-state" role="alert"><h3>Diese Datei passt hier nicht.</h3><p>${E(ui.backup.error)}</p><p>Deine vorhandenen Demodaten wurden nicht verändert.</p></div>` : ""}</div></section>`;
  }
  function states({ ui }) {
    const kind = ui.stateKind;
    return (
      title("Zustandsstudie", "Auch die leisen<br>Momente zählen.") +
      `<p class="prototype-notice">Explizite Designbeispiele, keine Meldungen über echte Nutzerdaten.</p><div class="filter-row" role="group" aria-label="Zustand wählen">${[
        ["empty", "Leer"],
        ["loading", "Laden"],
        ["error", "Fehler"],
        ["success", "Erfolg"],
      ]
        .map(([id, label]) =>
          button(
            label,
            "state-example",
            { kind: id },
            kind === id ? "active" : "",
          ),
        )
        .join(
          "",
        )}</div>${kind === "empty" ? empty("Hier ist Raum für deinen ersten Gedanken.", "Ein Wort, eine Frage, ein Gebet – du musst nichts Besonderes schreiben.", go("Gedanken festhalten", "editor", {}, "primary")) : kind === "loading" ? '<div class="skeleton-card" aria-busy="true" aria-label="Ein Inhalt wird geladen"><span></span><span></span><span></span><p>Ein Moment. Dein Text wird vorbereitet.</p></div>' : kind === "error" ? `<section class="error-state"><span>${icon("question")}</span><h2>Das hat gerade nicht geklappt.</h2><p>Deine Eingaben bleiben erhalten. Du kannst es noch einmal versuchen.</p>${button("Erneut versuchen", "retry-state", {}, "primary")}</section>` : `<section class="success-state"><span>${icon("check")}</span><h2>Dein Gedanke ist festgehalten.</h2><p>Er darf hier bleiben. Du kannst später darauf zurückkommen.</p>${go("Zum Journal", "journal", {}, "primary")}</section>`}`
    );
  }
  Object.assign(PremiumViews, {
    settings,
    onboarding,
    reminders,
    backup,
    states,
  });
})();
