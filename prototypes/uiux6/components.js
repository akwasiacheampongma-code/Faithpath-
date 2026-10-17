(function (root) {
  const paths = {
    leaf: "M5 19C3 9 7 4 20 3c1 13-4 17-15 16Zm0 0L16 8M9 13l-5-1m8-2 1-5",
    today: "M3 10 12 3l9 7v10h-6v-6H9v6H3Z",
    bible:
      "M12 5v16M12 5C7 2 3 4 2 4v15c4-1 7 0 10 2 3-2 6-3 10-2V4c-1 0-5-2-10 1Z",
    path: "M5 20c0-9 14-3 14-11 0-3-3-4-5-5M11 4h3V1",
    journal: "m4 16 12-12 4 4L8 20H4Zm9-9 4 4",
    arrow: "M4 12h16m-6-6 6 6-6 6",
    back: "M20 12H4m6-6-6 6 6 6",
    search: "M16 16l5 5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
    close: "m5 5 14 14M19 5 5 19",
    plus: "M12 4v16M4 12h16",
    check: "m4 12 5 5L20 6",
    more: "M5 12h.1m6.9 0h.1m6.9 0h.1",
    compass: "m16 8-3 5-5 3 3-5Z M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
    sun: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-6v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2",
    sword: "m12 2 4 6-3 8 5 3-2 2-4-3-4 3-2-2 5-3-3-8Z",
  };
  function icon(name) {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${name === "more" ? '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>' : `<path d="${paths[name] || paths.leaf}"/>`}</svg>`;
  }
  const arrow = () => icon("arrow");
  function link(label, screen, cls = "text-link", chapter = null) {
    return `<button class="${cls}" data-go="${screen}" ${chapter ? `data-read-chapter="${chapter}"` : ""}>${label}${arrow()}</button>`;
  }
  function tree(stage, cls = "") {
    return `<img class="tree ${cls}" src="assets/trees/tree-stage-${stage}.webp" alt="Vorhandene Olivenbaumgrafik ${stage} von 7 – synthetisches Beispiel" width="1086" height="1448">`;
  }
  root.FaithPathUI = { icon, arrow, link, tree };
})(globalThis);
