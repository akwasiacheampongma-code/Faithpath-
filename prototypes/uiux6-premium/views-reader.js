(() => {
  const { E, icon, button, go, reference, title } = PremiumUI;
  function reader({ s, ui, C }) {
    const r = s.reader,
      verses = C.bibles[r.translation][r.book][r.chapter],
      book = C.books.find((b) => b.code === r.book),
      unit = C.units[`chapter:${r.book}:${r.chapter}`],
      explored = s.explored.some(
        (x) => x.book === r.book && x.chapter === r.chapter,
      );
    const groups = [];
    for (let i = 0; i < verses.length; i += 5)
      groups.push(verses.slice(i, i + 5));
    return `<div class="reader-topline">${go(icon("compass") + " Entdecken", "discover")}${button(icon("sword") + " Bibelreise", "journey")}</div><div class="reader-toolbar"><button class="chapter-picker" data-action="chapter-picker">${icon("bible")}<span>${E(book.name)} ${r.chapter}</span><span aria-hidden="true">⌄</span></button><div><button class="translation-picker" data-action="translation">${r.translation === "otb" ? "OTB" : "Luther 1912"}<span aria-hidden="true">⌄</span></button>${button("Aa", "reader-type", {}, "icon-button")}${button(icon("focus"), "focus", {}, "icon-button")}</div></div>${r.focus ? `<div class="focus-bar"><span>${E(reference(r))} · ${r.translation === "otb" ? "OTB" : "Luther 1912"}</span>${button(icon("close") + " Lesemodus beenden", "focus", {}, "text-button")}</div>` : ""}<article class="reader-book" style="--reading-size:${r.fontScale * 1.25}rem"><header class="reader-opening"><p class="eyebrow">${r.book === "PSA" ? "Ein Psalm zum Lesen und Verweilen" : r.book === "JHN" ? "Das Evangelium nach Johannes" : r.book === "EPH" ? "Der Brief an die Epheser" : "Bibel lesen"}</p><h1>${E(book.name)} <em>${r.chapter}</em></h1><span class="opening-line" aria-hidden="true"></span></header><div class="bible-text" role="group" aria-label="${E(reference(r))}">${groups
      .map(
        (group) =>
          `<p>${group
            .map(([n, text]) => {
              const color =
                r.highlights[`${r.translation}:${r.book}:${r.chapter}:${n}`];
              return `<span class="verse ${r.selected.includes(n) ? "selected" : ""} ${color ? "marked mark-" + color : ""}" role="button" tabindex="0" aria-pressed="${r.selected.includes(n)}" aria-label="Vers ${n}: ${E(text)}" data-verse="${n}"><sup aria-hidden="true">${n}</sup><span>${E(text)}</span></span>`;
            })
            .join(" ")}</p>`,
      )
      .join(
        "",
      )}</div><footer class="chapter-ending"><div class="ending-ornament">${icon("leaf")}</div><p class="eyebrow">Am Ende dieses Kapitels</p><h2>Was bleibt bei dir?</h2><p>Du kannst den Gedanken festhalten – oder einfach weiterlesen.</p><div class="ending-actions">${button(icon("journal") + " Einen Gedanken festhalten", "note-reader", {}, "primary")}${unit ? button(icon("question") + " Was hast du verstanden?", "start-quiz", { unit: `chapter:${r.book}:${r.chapter}` }, "secondary") : `<span class="caption">Zu diesem Demokapitel wird kein ungeprüftes Quiz ergänzt.</span>`}${button("Weiterlesen " + icon("arrow"), "next-chapter", {}, "text-button")}</div><div class="explore-action">${explored ? `<span class="explored-label">${icon("check")} Kapitel erkundet</span><p>Dieses Kapitel ist Teil deiner dokumentierten Bibelreise.</p>${go("Deine Bibelreise ansehen " + icon("arrow"), "journey")}` : button("Kapitel als erkundet festhalten " + icon("check"), "explore", {}, "text-button")}<p class="caption">Erst deine Bestätigung zählt. Öffnen allein verändert nichts.</p></div></footer><p class="bible-source">${r.translation === "otb" ? "Open Translation Bible · CC BY-SA 4.0" : "Luther 1912 · gemeinfrei"} · <a href="assets/licenses/${r.translation === "otb" ? "OTB-LICENSE.txt" : "LUTHER1912-NOTICE.txt"}">Quelle & Lizenz</a></p></article><div id="verse-dock">${verseDock({ s })}</div>`;
  }
  function verseDock({ s }) {
    const r = s.reader;
    if (!r.selected.length) return "";
    const n = r.selected[0];
    return `<aside class="verse-dock" aria-label="Aktionen für Vers ${n}"><div class="dock-label"><strong>${E(reference({ ...r, from: n }))}</strong>${button(icon("close"), "clear-verse", {}, "icon-button")}</div><div class="dock-actions"><div class="mark-colors" role="group" aria-label="Markierungsfarbe">${[
      ["sage", "Salbei"],
      ["gold", "Sand"],
      ["rose", "Rosé"],
      ["blue", "Blau"],
    ]
      .map(
        ([id, label]) =>
          `<button class="color-dot ${id}" data-action="mark" data-color="${id}" aria-label="${label} markieren" aria-pressed="${r.highlights[`${r.translation}:${r.book}:${r.chapter}:${n}`] === id}"><span></span></button>`,
      )
      .join(
        "",
      )}</div>${button(icon("journal") + " Notiz", "note-reader", {}, "small-button")}</div></aside>`;
  }
  function journey({ s, ui, C }) {
    const count = s.explored.length,
      shown = ui.swordVariant || "seal",
      quote = C.bibles[s.reader.translation].EPH[6].find((v) => v[0] === 17)[1],
      groups = new Map();
    s.explored.forEach((r) =>
      groups.set(r.book, (groups.get(r.book) || 0) + 1),
    );
    return `<div class="subnav">${go(icon("back") + " Zur Bibel", "reader")}</div>${title("Deine Bibelreise", "Worte, die<br>dich begleiten.")}<section class="journey-exhibit ${shown === "vertical" ? "vertical" : ""}"><img class="sword-art" src="assets/art/sword-${shown === "vertical" ? "vertical" : "seal"}.svg" alt="${shown === "vertical" ? "Stilisiertes Schwert des Geistes" : "Buch und Schwert als Lesesiegel"} – Symbol der Beschäftigung mit Gottes Wort" width="240" height="${shown === "vertical" ? 400 : 240}"><div><p class="journey-count">${count.toLocaleString("de-DE")}</p><h2>${count === 1 ? "Kapitel erkundet" : "Kapitel erkundet"}</h2><p>Von 1.189 Kapiteln.<br>Deine dokumentierten Lesemomente.</p></div></section><div class="segmented" role="group" aria-label="Symbolvarianten vergleichen">${button("Buch & Schwert", "sword-variant", { variant: "seal" }, shown === "seal" ? "active" : "")}${button("Schwert", "sword-variant", { variant: "vertical" }, shown === "vertical" ? "active" : "")}</div><p class="journey-principle">Dein Lesefortschritt misst weder deinen Glauben noch deine Nähe zu Gott.</p>${go("Bei Johannes 15 weiterlesen " + icon("arrow"), "reader", { book: "JHN", chapter: 15 }, "primary")}<section class="explored-books"><h2>Dein bisheriger Weg im Wort</h2>${groups.size ? [...groups].map(([book, n]) => `<div class="book-progress"><span>${E(C.bibleIndex?.find((b) => b.code === book)?.name || book)}</span><span>${n} ${n === 1 ? "Kapitel" : "Kapitel"}</span></div>`).join("") : '<p class="intro">Hier darf dein erstes Kapitel stehen. Nimm dir Zeit zum Lesen.</p>'}</section><details class="scripture-background"><summary>Warum ein Schwert?</summary><h2>Das Schwert des Geistes</h2><p>Gottes Wort kann Orientierung im Alltag geben. Das Schwert ist ein biblisches Bild dafür – kein Aufruf zu Gewalt gegen Menschen.</p><blockquote>${E(quote)}</blockquote><p class="caption">Epheser 6,17 · ${s.reader.translation === "otb" ? "OTB Deutsch" : "Luther 1912"}</p></details>`;
  }
  Object.assign(PremiumViews, { reader, verseDock, journey });
})();
