(() => {
  const q = (id) => document.getElementById(id),
    map = { reader: "bible", paths: "path" },
    names = { A: "Lebensbaum", B: "Wort & Stille", C: "Lebensseiten" };
  function render() {
    const d = q("old").value,
      s = q("area").value;
    q("before").src = `screenshots/before-${d}-${map[s] || s}.png`;
    q("after").src = `screenshots/new-${s}-390.png`;
    q("before-caption").textContent =
      "6A · " + names[d] + " · Hell · 390 × 844";
    q("before-link").href = q("before").src;
    q("after-link").href = q("after").src;
  }
  q("old").onchange = q("area").onchange = render;
  render();
})();
