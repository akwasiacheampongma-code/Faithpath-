(() => {
  let direction = "A";
  const defaults = { A: "light", B: "atmospheric", C: "paper" },
    names = { A: "Lebensbaum", B: "Wort & Stille", C: "Lebensseiten" };
  function url(d) {
    const screen = document.querySelector("#screen").value,
      theme = document.querySelector("#theme").value;
    return `view.html?direction=${d}&screen=${screen}&theme=${theme === "default" ? defaults[d] : theme}`;
  }
  function render() {
    const compare = document.querySelector("#compare").checked,
      size = Number(document.querySelector("#size").value),
      height = { 320: 568, 390: 844, 430: 932, 760: 900 }[size],
      frames = document.querySelector("#frames");
    frames.classList.toggle("comparing", compare);
    frames.innerHTML = (compare ? ["A", "B", "C"] : [direction])
      .map(
        (d) =>
          `<div class="frame-unit"><div class="frame-caption"><span>${d} · ${names[d]}</span><a href="${url(d)}" target="_blank" rel="noopener">Direkt öffnen ↗</a></div><div class="frame-device"><iframe title="${names[d]} · ${document.querySelector("#screen").selectedOptions[0].text}" src="${url(d)}" width="${size}" height="${height}"></iframe></div></div>`,
      )
      .join("");
    document.querySelector("#open").href = url(direction);
  }
  document.querySelectorAll("[data-direction]").forEach((b) =>
    b.addEventListener("click", () => {
      direction = b.dataset.direction;
      document
        .querySelectorAll("[data-direction]")
        .forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      render();
    }),
  );
  document
    .querySelectorAll("select,input")
    .forEach((e) => e.addEventListener("change", render));
  render();
})();
