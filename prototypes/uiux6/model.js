/* Pure, synthetic prototype state. Deliberately no persistent storage. */
(function (root) {
  const themes = ["light", "atmospheric", "paper", "night"],
    screens = ["today", "bible", "path", "journal", "discover"];
  const escape = (x) =>
    String(x).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  function route(query) {
    const p = new URLSearchParams(query),
      direction = ["A", "B", "C"].includes(p.get("direction"))
        ? p.get("direction")
        : "A";
    return {
      direction,
      screen: screens.includes(p.get("screen")) ? p.get("screen") : "today",
      theme: themes.includes(p.get("theme"))
        ? p.get("theme")
        : direction === "B"
          ? "atmospheric"
          : direction === "C"
            ? "paper"
            : "light",
      stage: Math.max(1, Math.min(7, Math.round(Number(p.get("stage")) || 5))),
    };
  }
  function initial() {
    return {
      stage: 5,
      chapter: 15,
      translation: "otb",
      selected: 0,
      highlight: {},
      stepDone: false,
      confirmedDevelopment: false,
      draft: "",
      query: "",
      journal: [
        {
          id: "demo-now",
          title: "Erst zuhören.",
          text: "Ich muss nicht sofort eine Antwort haben. Morgen möchte ich erst zuhören und dann reagieren.",
          date: "16. Oktober 2026",
          ref: { chapter: 15, verse: 5, translation: "otb" },
          path: true,
        },
        {
          id: "demo-before",
          title: "Vertrauen braucht Raum.",
          text: "Ich möchte lernen, auch mitten im Alltag bei Jesus zu bleiben.",
          date: "9. Oktober 2026",
          ref: { chapter: 15, verse: 4, translation: "otb" },
          path: true,
        },
        {
          id: "demo-prayer",
          title: "Ein stiller Moment.",
          text: "Heute bin ich dankbar für ein gutes Gespräch. Nicht alles muss schon geklärt sein.",
          date: "7. Oktober 2026",
          path: false,
        },
      ],
    };
  }
  function saveNote(state, { text, ref, path = false }) {
    text = String(text).trim();
    if (!text) throw Error("Bitte einen Gedanken eingeben.");
    const note = {
      id: "demo-note-" + (state.journal.length + 1),
      title: text.split(/[.!?\n]/)[0].slice(0, 85),
      text,
      date: "17. Oktober 2026",
      ...(ref ? { ref: { ...ref } } : {}),
      path,
    };
    state.journal.unshift(note);
    return note;
  }
  function search(s, q) {
    q = q.toLocaleLowerCase("de");
    return s.journal.filter((n) =>
      [
        n.text,
        n.title,
        n.ref ? "Johannes " + n.ref.chapter : "",
        n.path ? "In Ruhe zuhören" : "",
      ]
        .join(" ")
        .toLocaleLowerCase("de")
        .includes(q),
    );
  }
  root.FaithPathModel = {
    escape,
    route,
    initial,
    saveNote,
    search,
    completeStep: (s) => {
      s.stepDone = !s.stepDone;
    },
  };
})(globalThis);
