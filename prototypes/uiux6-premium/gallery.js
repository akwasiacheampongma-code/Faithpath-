(() => {
  const q = (id) => document.querySelector("#" + id),
    oldMap = {
      today: "today",
      reader: "bible",
      paths: "path",
      path: "path",
      journal: "journal",
      discover: "discover",
    },
    names = { A: "Lebensbaum", B: "Wort & Stille", C: "Lebensseiten" };
  function url() {
    const p = new URLSearchParams({
      screen: q("screen").value,
      theme: q("theme").value,
      scenario: q("scenario").value,
    });
    if (q("screen").value === "journey" && q("reading").value)
      p.set("reading", q("reading").value);
    return "view.html?" + p;
  }
  function render() {
    const screen = q("screen").value,
      width = Number(q("size").value),
      height = { 320: 568, 390: 844, 430: 932, 1100: 900 }[width],
      compare = q("compare").checked,
      d = q("reference").value;
    document
      .querySelectorAll("[data-screen]")
      .forEach((b) =>
        b.setAttribute("aria-pressed", String(b.dataset.screen === screen)),
      );
    q("reading-label").hidden = screen !== "journey";
    q("reference-label").hidden = !compare;
    q("frames").classList.toggle("comparing", compare);
    const premium = `<div class="preview-unit"><div class="frame-label"><strong>6A.2 · Verbunden</strong><a href="${url()}" target="_blank" rel="noopener">Öffnen ↗</a></div><div class="device-shell"><iframe title="FaithPath Premium-Prototyp" width="${width}" height="${height}" src="${url()}"></iframe></div></div>`;
    let reference = "";
    if (compare) {
      let content;
      if (screen === "editor")
        content = `<img class="reference-image" src="screenshots/before-${d}-editor.png" width="390" height="844" alt="Originale 6A-Browseraufnahme des Schreibdialogs, Hell, 390 × 844">`;
      else if (oldMap[screen])
        content = `<iframe title="Unveränderte Phase6A Referenz ${names[d]}" width="${width}" height="${height}" src="../uiux6/view.html?direction=${d}&screen=${oldMap[screen]}&theme=${q("theme").value}"></iframe>`;
      else
        content =
          '<div class="reference-notice">Für diesen Bereich gab es in Phase 6A keine eigene bedienbare Detailansicht. Die neue Studie macht diesen Ablauf erstmals sichtbar.</div>';
      reference = `<div class="preview-unit"><div class="frame-label"><strong>6A · ${names[d]}</strong><span>${screen === "editor" ? "Originalaufnahme · Hell · 390 × 844" : "Unveränderte Referenz"}</span></div><div class="device-shell">${content}</div></div>`;
    }
    q("frames").innerHTML = reference + premium;
    q("open").href = url();
  }
  document.querySelectorAll("[data-screen]").forEach((b) =>
    b.addEventListener("click", () => {
      q("screen").value = b.dataset.screen;
      render();
    }),
  );
  document
    .querySelectorAll("select,input")
    .forEach((el) => el.addEventListener("change", render));
  render();
})();
