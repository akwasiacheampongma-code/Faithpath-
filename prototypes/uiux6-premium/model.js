/* Synthetic, memory-only prototype model. No production store or schema is used. */
(function (root) {
  "use strict";

  const SCHEMA = "faithpath-premium-demo";
  const SCENARIOS = ["returning", "empty", "many", "long", "archived"];
  const DATA_KEYS = [
    "scenario",
    "stage",
    "theme",
    "journal",
    "paths",
    "reviews",
    "reader",
    "quiz",
    "reminders",
    "explored",
  ];
  const THEMES = ["light", "night", "paper", "atmospheric"];
  const CHAPTERS = {
    GEN: 50,
    EXO: 40,
    LEV: 27,
    NUM: 36,
    DEU: 34,
    JOS: 24,
    JDG: 21,
    RUT: 4,
    "1SA": 31,
    "2SA": 24,
    "1KI": 22,
    "2KI": 25,
    "1CH": 29,
    "2CH": 36,
    EZR: 10,
    NEH: 13,
    EST: 10,
    JOB: 42,
    PSA: 150,
    PRO: 31,
    ECC: 12,
    SNG: 8,
    ISA: 66,
    JER: 52,
    LAM: 5,
    EZK: 48,
    DAN: 12,
    HOS: 14,
    JOL: 3,
    AMO: 9,
    OBA: 1,
    JON: 4,
    MIC: 7,
    NAM: 3,
    HAB: 3,
    ZEP: 3,
    HAG: 2,
    ZEC: 14,
    MAL: 4,
    MAT: 28,
    MRK: 16,
    LUK: 24,
    JHN: 21,
    ACT: 28,
    ROM: 16,
    "1CO": 16,
    "2CO": 13,
    GAL: 6,
    EPH: 6,
    PHP: 4,
    COL: 4,
    "1TH": 5,
    "2TH": 3,
    "1TI": 6,
    "2TI": 4,
    TIT: 3,
    PHM: 1,
    HEB: 13,
    JAS: 5,
    "1PE": 5,
    "2PE": 3,
    "1JN": 5,
    "2JN": 1,
    "3JN": 1,
    JUD: 1,
    REV: 22,
  };
  const BOOK_NAMES = {
    JHN: "Johannes John",
    PSA: "Psalmen Psalm",
    LUK: "Lukas Luke",
    MAT: "Matthäus Matthew",
    MRK: "Markus Mark",
    ROM: "Römer Romans",
  };
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const own = (object, key) =>
    Object.prototype.hasOwnProperty.call(object, key);
  const escape = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (character) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[character],
    );
  let idCounter = 0;
  let clockCounter = 0;
  const stamp = () =>
    new Date(Date.UTC(2026, 9, 17, 10, 0, ++clockCounter)).toISOString();
  const fail = (message) => {
    throw new Error(message);
  };

  function allIds(state) {
    return new Set([
      ...state.journal.map((entry) => entry.id),
      ...state.reviews.map((review) => review.id),
      ...state.reminders.map((reminder) => reminder.id),
      ...state.paths.flatMap((path) => [
        path.id,
        ...path.steps.map((step) => step.id),
        ...path.milestones.map((milestone) => milestone.id),
      ]),
    ]);
  }

  function nextId(state, kind) {
    const taken = allIds(state);
    let id;
    do {
      id = "demo-" + kind + "-" + ++idCounter;
    } while (taken.has(id));
    return id;
  }

  function snapshot(entry) {
    return {
      text: entry.text,
      at: entry.updatedAt || entry.at,
      title: entry.title,
    };
  }

  function hasDraftWords(draft) {
    return (
      draft &&
      (String(draft.text || "").trim() || String(draft.title || "").trim())
    );
  }

  function initial(scenario = "returning") {
    if (!SCENARIOS.includes(scenario)) scenario = "returning";
    const state = {
      scenario,
      stage: 4,
      theme: "light",
      journal: [
        {
          id: "j-now",
          title: "Erst zuhören.",
          text: "Ich muss nicht sofort eine Antwort haben. Morgen möchte ich erst zuhören und dann reagieren.",
          at: "2026-10-16T08:00:00.000Z",
          ref: { book: "JHN", chapter: 15, from: 5, to: 5, translation: "otb" },
          pathIds: ["p-listen"],
        },
        {
          id: "j-before",
          title: "Vertrauen braucht Raum.",
          text: "Ich möchte lernen, auch mitten im Alltag bei Jesus zu bleiben.",
          at: "2026-10-09T08:00:00.000Z",
          ref: { book: "JHN", chapter: 15, from: 4, to: 4, translation: "otb" },
          pathIds: ["p-listen"],
        },
        {
          id: "j-prayer",
          title: "Ein stiller Moment.",
          text: "Heute bin ich dankbar für ein gutes Gespräch. Nicht alles muss schon geklärt sein.",
          at: "2026-10-07T18:00:00.000Z",
          pathIds: [],
        },
      ],
      paths: [
        {
          id: "p-listen",
          title: "In Ruhe zuhören",
          why: "Ich möchte Menschen mit mehr Ruhe begegnen und nicht gleich eine Antwort bereithalten.",
          started: "2026-10-09T08:00:00.000Z",
          archived: false,
          steps: [
            {
              id: "s-pause",
              text: "Vor meiner Antwort einen Atemzug warten.",
              done: false,
            },
            {
              id: "s-listen",
              text: "Bei einem Gespräch bewusst nachfragen.",
              done: false,
            },
          ],
          links: [{ journalId: "j-before" }, { journalId: "j-now" }],
          milestones: [],
        },
      ],
      reviews: [],
      draft: null,
      reader: {
        book: "JHN",
        chapter: 15,
        translation: "otb",
        selected: [],
        highlights: {},
        focus: false,
        fontScale: 1,
      },
      quiz: null,
      reminders: [],
      explored: [
        { book: "JHN", chapter: 3 },
        { book: "JHN", chapter: 15 },
      ],
      notice: "",
    };
    state.reviews.push({
      id: "r-listen",
      sourceId: "j-before",
      sourceSnapshot: snapshot(state.journal[1]),
      text: state.journal[0].text,
      at: state.journal[0].at,
      confirmedDevelopment: false,
      pathId: "p-listen",
    });
    if (scenario === "empty") {
      state.stage = 1;
      state.journal = [];
      state.paths = [];
      state.reviews = [];
      state.explored = [];
    } else if (scenario === "many") {
      for (let index = 1; index < 20; index++) {
        state.paths.push({
          id: "p-many-" + index,
          title: "Ein kleiner Weg " + (index + 1),
          why: "Ein eigener Raum für das, was mich im Alltag beschäftigt.",
          started: "2026-10-09T08:00:00.000Z",
          archived: false,
          steps: [
            {
              id: "s-many-" + index,
              text: "Einen kleinen Schritt bewusst versuchen.",
              done: false,
            },
          ],
          links: [],
          milestones: [],
        });
      }
      for (let index = 3; index < 40; index++) {
        const path = state.paths[index % state.paths.length];
        const entry = {
          id: "j-many-" + index,
          title: "Ein Gedanke aus meinem Alltag " + (index + 1),
          text:
            "Heute nehme ich mir Zeit, um hinzuhören. Auch eine offene Frage darf hier ihren Platz haben. Gedanke " +
            (index + 1) +
            ".",
          at: "2026-10-16T08:00:00.000Z",
          pathIds: [path.id],
        };
        state.journal.push(entry);
        path.links.push({ journalId: entry.id });
      }
    } else if (scenario === "long") {
      const paragraph =
        "Manchmal brauche ich mehr als ein paar Worte. Ich halte fest, was offen ist, was mir Mut macht und wo ich noch keine Antwort habe. Ich darf mir dafür Zeit nehmen.\n\n";
      state.journal = [
        {
          id: "j-long",
          title: "Ein langer Gedanke darf Raum haben.",
          text: paragraph.repeat(80),
          at: "2026-10-16T08:00:00.000Z",
          pathIds: ["p-listen"],
        },
      ];
      state.paths[0].links = [{ journalId: "j-long" }];
      state.reviews = [];
    } else if (scenario === "archived") {
      state.paths[0].archived = true;
    }
    return state;
  }

  function createDraft(
    state,
    {
      ref = null,
      pathIds = [],
      sourceId = null,
      sourceSnapshot = null,
      origin = null,
    } = {},
  ) {
    if (hasDraftWords(state.draft)) return state.draft;
    const source =
      sourceId && state.journal.find((entry) => entry.id === sourceId);
    const captured = sourceSnapshot
      ? clone(sourceSnapshot)
      : source
        ? snapshot(source)
        : null;
    state.draft = {
      text: "",
      title: "",
      ref: ref ? clone(ref) : null,
      pathIds: [...new Set(pathIds)],
      ...(sourceId ? { sourceId } : {}),
      ...(captured ? { sourceSnapshot: captured } : {}),
      ...(origin ? { origin: clone(origin) } : {}),
    };
    return state.draft;
  }

  function editDraft(state, id) {
    const entry = state.journal.find((item) => item.id === id);
    if (!entry) return null;
    if (hasDraftWords(state.draft)) return state.draft;
    state.draft = {
      entryId: entry.id,
      title: entry.title,
      text: entry.text,
      ref: entry.ref ? clone(entry.ref) : null,
      pathIds: [...entry.pathIds],
      ...(entry.origin ? { origin: clone(entry.origin) } : {}),
    };
    return state.draft;
  }

  function discardDraft(state) {
    state.draft = null;
  }

  function syncLinks(state, entry) {
    for (const path of state.paths) {
      const linked = entry.pathIds.includes(path.id);
      path.links = path.links.filter((link) => link.journalId !== entry.id);
      if (linked) path.links.push({ journalId: entry.id });
    }
  }

  function saveDraft(state, options = {}) {
    const draft = state.draft;
    if (!draft) return { ok: false, error: "Es ist kein Entwurf geöffnet." };
    try {
      const text = own(options, "text") ? options.text : draft.text;
      string(text, 16000, "Gedanke");
      const clean = text.trim();
      if (!clean) fail("Bitte einen Gedanken eingeben.");
      const proposedTitle = own(options, "title") ? options.title : draft.title;
      string(proposedTitle, 180, "Titel", true);
      const title =
        proposedTitle.trim() ||
        clean
          .split(/[.!?\n]/)[0]
          .trim()
          .slice(0, 180) ||
        clean.slice(0, 180);
      const pathIds = own(options, "pathIds") ? options.pathIds : draft.pathIds;
      list(pathIds, 100, "Wege");
      distinct(pathIds, "Verbundene Wege");
      if (pathIds.some((id) => !state.paths.some((path) => path.id === id)))
        fail("Ein verbundener Weg ist nicht mehr vorhanden.");
      if (draft.ref) reference(draft.ref);
      if (draft.origin) origin(draft.origin);
      if (draft.sourceId && !draft.sourceSnapshot)
        fail("Der damalige Gedanke ist nicht mehr verfügbar.");
      const previous =
        draft.entryId &&
        state.journal.find((entry) => entry.id === draft.entryId);
      if (draft.entryId && !previous)
        fail("Der bearbeitete Gedanke ist nicht mehr vorhanden.");
      const at = stamp();
      const entry = {
        id: previous ? previous.id : nextId(state, "note"),
        title,
        text: clean,
        at: previous ? previous.at : at,
        ...(previous ? { updatedAt: at } : {}),
        ...(draft.ref ? { ref: clone(draft.ref) } : {}),
        pathIds: [...pathIds],
        ...(draft.origin ? { origin: clone(draft.origin) } : {}),
      };
      if (previous)
        state.journal.splice(state.journal.indexOf(previous), 1, entry);
      else state.journal.unshift(entry);
      syncLinks(state, entry);
      if (!previous && draft.sourceId) {
        state.reviews.push({
          id: nextId(state, "review"),
          sourceId: draft.sourceId,
          sourceSnapshot: clone(draft.sourceSnapshot),
          text: clean,
          at,
          confirmedDevelopment: false,
          ...(pathIds[0] ? { pathId: pathIds[0] } : {}),
          ...(!state.journal.some((item) => item.id === draft.sourceId)
            ? { sourceMissing: true }
            : {}),
        });
      }
      state.draft = null;
      return { ok: true, entry };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  function deleteNote(state, id) {
    const index = state.journal.findIndex((entry) => entry.id === id);
    if (index < 0) return null;
    const payload = {
      entry: clone(state.journal[index]),
      index,
      links: [],
      reminders: [],
      reviews: [],
      draft: null,
    };
    for (const path of state.paths) {
      path.links.forEach((link, position) => {
        if (link.journalId === id)
          payload.links.push({
            pathId: path.id,
            index: position,
            link: clone(link),
          });
      });
      path.links = path.links.filter((link) => link.journalId !== id);
    }
    state.reminders.forEach((reminder, position) => {
      if (reminder.sourceId === id)
        payload.reminders.push({ index: position, reminder: clone(reminder) });
    });
    state.reminders = state.reminders.filter(
      (reminder) => reminder.sourceId !== id,
    );
    for (const review of state.reviews.filter((item) => item.sourceId === id)) {
      payload.reviews.push({
        id: review.id,
        hadFlag: own(review, "sourceMissing"),
        value: review.sourceMissing,
      });
      review.sourceMissing = true;
    }
    if (state.draft?.entryId === id) {
      payload.draft = clone(state.draft);
      state.draft = null;
    }
    state.journal.splice(index, 1);
    return payload;
  }

  function undoDelete(state, payload) {
    if (
      !payload?.entry ||
      state.journal.some((entry) => entry.id === payload.entry.id)
    )
      return false;
    const entry = clone(payload.entry);
    entry.pathIds = entry.pathIds.filter((id) =>
      state.paths.some((path) => path.id === id),
    );
    state.journal.splice(
      Math.min(payload.index, state.journal.length),
      0,
      entry,
    );
    for (const saved of payload.links) {
      const path = state.paths.find((item) => item.id === saved.pathId);
      if (path && !path.links.some((link) => link.journalId === entry.id))
        path.links.splice(saved.index, 0, clone(saved.link));
    }
    for (const saved of payload.reminders) {
      if (
        !state.reminders.some((reminder) => reminder.id === saved.reminder.id)
      )
        state.reminders.splice(saved.index, 0, clone(saved.reminder));
    }
    for (const saved of payload.reviews) {
      const review = state.reviews.find(
        (item) => item.id === saved.id && item.sourceId === entry.id,
      );
      if (review) {
        if (saved.hadFlag) review.sourceMissing = saved.value;
        else delete review.sourceMissing;
      }
    }
    for (const review of state.reviews) {
      if (
        review.sourceId === entry.id &&
        !payload.reviews.some((saved) => saved.id === review.id)
      )
        delete review.sourceMissing;
    }
    if (payload.draft && !state.draft) state.draft = clone(payload.draft);
    return true;
  }

  function searchJournal(state, query = "", filter = "all") {
    const needle = String(query).trim().toLocaleLowerCase("de");
    return state.journal.filter((entry) => {
      if (filter === "linked" && !entry.pathIds.length) return false;
      if (filter === "bible" && !entry.ref) return false;
      const bible = entry.ref
        ? [
            entry.ref.book,
            BOOK_NAMES[entry.ref.book] || entry.ref.book,
            entry.ref.chapter,
            entry.ref.translation,
          ].join(" ")
        : "";
      const fullBible = entry.ref
        ? (BOOK_NAMES[entry.ref.book] || entry.ref.book)
            .split(" ")
            .map((name) => name + " " + entry.ref.chapter)
            .join(" ")
        : "";
      const paths = state.paths
        .filter((path) => entry.pathIds.includes(path.id))
        .map((path) => path.title + " " + path.why)
        .join(" ");
      return [
        entry.title,
        entry.text,
        bible,
        fullBible,
        paths,
        entry.origin?.title || "",
      ]
        .join(" ")
        .toLocaleLowerCase("de")
        .includes(needle);
    });
  }

  function findStep(state, pathId, stepId) {
    return state.paths
      .find((path) => path.id === pathId)
      ?.steps.find((step) => step.id === stepId);
  }
  function toggleStep(state, pathId, stepId) {
    const step = findStep(state, pathId, stepId);
    if (!step) return false;
    step.done = !step.done;
    return true;
  }
  function archivePath(state, id, value) {
    const path = state.paths.find((item) => item.id === id);
    if (!path || typeof value !== "boolean") return false;
    path.archived = value;
    return true;
  }
  function addStep(state, pathId, text) {
    const path = state.paths.find((item) => item.id === pathId);
    if (
      !path ||
      typeof text !== "string" ||
      !text.trim() ||
      text.length > 2000 ||
      path.steps.length >= 100
    )
      return null;
    const step = { id: nextId(state, "step"), text: text.trim(), done: false };
    path.steps.push(step);
    return step;
  }
  function editStep(state, pathId, stepId, text) {
    const step = findStep(state, pathId, stepId);
    if (!step || typeof text !== "string" || !text.trim() || text.length > 2000)
      return false;
    step.text = text.trim();
    return true;
  }

  function confirmDevelopment(state, pathId, text) {
    const path = state.paths.find((item) => item.id === pathId);
    if (!path)
      return { ok: false, error: "Dieser Weg ist nicht mehr vorhanden." };
    if (typeof text !== "string" || !text.trim() || text.length > 16000)
      return {
        ok: false,
        error: "Bitte beschreibe deine persönliche Entwicklung.",
      };
    const milestone = {
      id: nextId(state, "milestone"),
      text: text.trim(),
      at: stamp(),
    };
    path.milestones.push(milestone);
    // The existing seven production thresholds are 0, 1, 2, 3–4, 5–6, 7–9, >=10.
    // This isolated stage-four study has no authentic production history. Its stage
    // stays an explicit visual example, even here; never infer faith from activity.
    return { ok: true, milestone };
  }

  function validChapter(value) {
    return (
      value &&
      own(CHAPTERS, value.book) &&
      Number.isInteger(value.chapter) &&
      value.chapter >= 1 &&
      value.chapter <= CHAPTERS[value.book]
    );
  }
  function exploreChapter(state, chapter) {
    if (!validChapter(chapter)) return false;
    if (
      state.explored.some(
        (item) =>
          item.book === chapter.book && item.chapter === chapter.chapter,
      )
    )
      return false;
    state.explored.push({ book: chapter.book, chapter: chapter.chapter });
    return true;
  }

  function startQuiz(state, unitId) {
    if (typeof unitId !== "string" || !unitId.trim() || unitId.length > 180)
      return null;
    if (state.quiz?.unitId === unitId) return state.quiz;
    state.quiz = { unitId, index: 0, answers: {}, complete: false };
    return state.quiz;
  }
  function validQuizChoice(choice) {
    return (
      choice === "skipped" ||
      (Number.isInteger(choice) && choice >= 0 && choice <= 3)
    );
  }
  function answerQuiz(state, index, choice) {
    const quiz = state.quiz;
    if (
      !quiz ||
      quiz.complete ||
      index !== quiz.index ||
      !validQuizChoice(choice)
    )
      return false;
    quiz.answers[index] = choice;
    return true;
  }
  function advanceQuiz(state, total) {
    const quiz = state.quiz;
    if (
      !quiz ||
      quiz.complete ||
      !Number.isInteger(total) ||
      total < 1 ||
      total > 100 ||
      !own(quiz.answers, quiz.index)
    )
      return false;
    if (quiz.index < total - 1) quiz.index++;
    else quiz.complete = true;
    return true;
  }

  // The following validator accepts this prototype's own projection only. It does
  // not interpret, migrate, merge, or write an installed FaithPath backup.
  function object(value, required, optional = []) {
    if (!value || typeof value !== "object" || Array.isArray(value))
      fail("Ein Objekt fehlt oder hat einen falschen Typ.");
    if (required.some((key) => !own(value, key)))
      fail("Pflichtfelder fehlen in der Demo-Sicherung.");
    if (
      Object.keys(value).some(
        (key) => !required.includes(key) && !optional.includes(key),
      )
    )
      fail("Die Demo-Sicherung enthält unbekannte Felder.");
  }
  function string(value, max, label, empty = false) {
    if (
      typeof value !== "string" ||
      value.length > max ||
      (!empty && !value.trim())
    )
      fail(label + " hat einen ungültigen Inhalt oder ist zu lang.");
  }
  function integer(value, min, max, label) {
    if (!Number.isInteger(value) || value < min || value > max)
      fail(label + " liegt außerhalb des erlaubten Bereichs.");
  }
  function boolean(value) {
    if (typeof value !== "boolean") fail("Ein Wahrheitswert ist ungültig.");
  }
  function list(value, max, label) {
    if (!Array.isArray(value) || value.length > max)
      fail(label + " ist keine gültige Liste.");
  }
  function distinct(values, label) {
    if (new Set(values).size !== values.length)
      fail(label + " enthält doppelte Werte.");
  }
  function identifier(value) {
    if (
      typeof value !== "string" ||
      !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,99}$/.test(value)
    )
      fail("Eine Kennung ist ungültig.");
  }
  function timestamp(value) {
    if (
      typeof value !== "string" ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) ||
      !Number.isFinite(Date.parse(value)) ||
      new Date(value).toISOString() !== value
    )
      fail("Eine Zeitangabe ist ungültig.");
  }
  function translation(value) {
    if (!["otb", "l1912"].includes(value))
      fail("Eine Übersetzung ist ungültig.");
  }
  function chapter(value) {
    object(value, ["book", "chapter"]);
    if (!validChapter(value))
      fail("Die Bibelstelle enthält ein ungültiges Buch oder Kapitel.");
  }
  function reference(value) {
    object(value, ["book", "chapter", "translation"], ["from", "to"]);
    if (!validChapter(value))
      fail("Die Bibelstelle enthält ein ungültiges Buch oder Kapitel.");
    translation(value.translation);
    if (own(value, "from")) integer(value.from, 1, 176, "Vers");
    if (own(value, "to")) {
      integer(value.to, 1, 176, "Vers");
      if (!own(value, "from") || value.to < value.from)
        fail("Der Versbereich ist ungültig.");
    }
  }
  function origin(value) {
    object(value, ["kind", "id", "title"]);
    if (!["story", "chapter"].includes(value.kind))
      fail("Der ursprüngliche Kontext ist ungültig.");
    string(value.id, 180, "Ursprüngliche Kennung");
    string(value.title, 200, "Ursprünglicher Titel");
  }

  function validateData(data) {
    object(data, DATA_KEYS);
    if (!SCENARIOS.includes(data.scenario) || !THEMES.includes(data.theme))
      fail("Das Demo-Szenario oder Thema ist ungültig.");
    integer(data.stage, 1, 7, "Baumbeispiel");
    list(data.journal, 500, "Gedanken");
    list(data.paths, 100, "Wege");
    list(data.reviews, 500, "Rückblicke");
    list(data.reminders, 500, "Erinnerungen");
    list(data.explored, 2000, "Bibelreise");
    const ids = new Set();
    const register = (id) => {
      identifier(id);
      if (ids.has(id)) fail("Eine Kennung kommt mehrfach vor.");
      ids.add(id);
    };
    for (const entry of data.journal) {
      object(
        entry,
        ["id", "title", "text", "at", "pathIds"],
        ["updatedAt", "ref", "origin"],
      );
      register(entry.id);
      string(entry.title, 180, "Titel");
      string(entry.text, 16000, "Gedanke");
      timestamp(entry.at);
      if (own(entry, "updatedAt")) timestamp(entry.updatedAt);
      if (own(entry, "ref") && entry.ref !== null) reference(entry.ref);
      if (own(entry, "origin")) origin(entry.origin);
      list(entry.pathIds, 100, "Verbundene Wege");
      entry.pathIds.forEach(identifier);
      distinct(entry.pathIds, "Verbundene Wege");
    }
    for (const path of data.paths) {
      object(path, [
        "id",
        "title",
        "why",
        "started",
        "archived",
        "steps",
        "links",
        "milestones",
      ]);
      register(path.id);
      string(path.title, 180, "Weg-Titel");
      string(path.why, 2000, "Weg-Beschreibung", true);
      timestamp(path.started);
      boolean(path.archived);
      list(path.steps, 100, "Schritte");
      list(path.links, 500, "Verbindungen");
      list(path.milestones, 500, "Entwicklungen");
      for (const step of path.steps) {
        object(step, ["id", "text", "done"]);
        register(step.id);
        string(step.text, 2000, "Schritt");
        boolean(step.done);
      }
      for (const milestone of path.milestones) {
        object(milestone, ["id", "text", "at"]);
        register(milestone.id);
        string(milestone.text, 16000, "Entwicklung");
        timestamp(milestone.at);
      }
      for (const link of path.links) {
        object(link, ["journalId"]);
        identifier(link.journalId);
      }
      distinct(
        path.links.map((link) => link.journalId),
        "Weg-Verbindungen",
      );
    }
    const notes = new Map(data.journal.map((entry) => [entry.id, entry]));
    const paths = new Map(data.paths.map((path) => [path.id, path]));
    for (const entry of data.journal)
      if (entry.pathIds.some((id) => !paths.has(id)))
        fail("Ein Gedanke verweist auf einen fehlenden Weg.");
    for (const path of data.paths) {
      if (
        path.links.some(
          (link) =>
            !notes.has(link.journalId) ||
            !notes.get(link.journalId).pathIds.includes(path.id),
        )
      )
        fail(
          "Ein Weg verweist auf einen fehlenden oder unverbundenen Gedanken.",
        );
    }
    for (const review of data.reviews) {
      object(
        review,
        [
          "id",
          "sourceId",
          "sourceSnapshot",
          "text",
          "at",
          "confirmedDevelopment",
        ],
        ["pathId", "sourceMissing"],
      );
      register(review.id);
      identifier(review.sourceId);
      string(review.text, 16000, "Rückblick");
      timestamp(review.at);
      boolean(review.confirmedDevelopment);
      object(review.sourceSnapshot, ["text", "title", "at"]);
      string(
        review.sourceSnapshot.text,
        16000,
        "Damals festgehaltener Gedanke",
      );
      string(review.sourceSnapshot.title, 180, "Damals festgehaltener Titel");
      timestamp(review.sourceSnapshot.at);
      if (own(review, "sourceMissing")) boolean(review.sourceMissing);
      if (!notes.has(review.sourceId) && review.sourceMissing !== true)
        fail("Einem Rückblick fehlt sein damaliger Gedanke.");
      if (notes.has(review.sourceId) && review.sourceMissing === true)
        fail("Ein vorhandener Gedanke ist fälschlich als gelöscht markiert.");
      if (own(review, "pathId") && !paths.has(review.pathId))
        fail("Ein Rückblick verweist auf einen fehlenden Weg.");
    }
    const reminderSources = new Set([
      ...notes.keys(),
      ...paths.keys(),
      ...data.reviews.map((review) => review.id),
    ]);
    for (const reminder of data.reminders) {
      object(reminder, ["id", "sourceId", "at"], ["text"]);
      register(reminder.id);
      identifier(reminder.sourceId);
      timestamp(reminder.at);
      if (!reminderSources.has(reminder.sourceId))
        fail("Eine Erinnerung verweist auf einen fehlenden Eintrag.");
      if (own(reminder, "text"))
        string(reminder.text, 2000, "Erinnerung", true);
    }
    data.explored.forEach(chapter);
    distinct(
      data.explored.map((item) => item.book + ":" + item.chapter),
      "Bibelreise",
    );
    validateReader(data.reader);
    if (data.quiz !== null) {
      object(data.quiz, ["unitId", "index", "answers", "complete"]);
      string(data.quiz.unitId, 180, "Quiz-Einheit");
      integer(data.quiz.index, 0, 99, "Quiz-Frage");
      boolean(data.quiz.complete);
      if (
        !data.quiz.answers ||
        typeof data.quiz.answers !== "object" ||
        Array.isArray(data.quiz.answers)
      )
        fail("Die Quiz-Antworten sind ungültig.");
      const keys = Object.keys(data.quiz.answers);
      if (keys.length > 100) fail("Zu viele Quiz-Antworten.");
      for (const key of keys) {
        if (!/^(0|[1-9]\d?)$/.test(key) || Number(key) > data.quiz.index)
          fail("Eine Quiz-Frage ist ungültig.");
        if (!validQuizChoice(data.quiz.answers[key]))
          fail("Eine Quiz-Antwort ist ungültig.");
      }
    }
  }

  function validateReader(reader) {
    object(reader, [
      "book",
      "chapter",
      "translation",
      "selected",
      "highlights",
      "focus",
      "fontScale",
    ]);
    if (!validChapter(reader)) fail("Das geöffnete Kapitel ist ungültig.");
    translation(reader.translation);
    boolean(reader.focus);
    if (
      typeof reader.fontScale !== "number" ||
      !Number.isFinite(reader.fontScale) ||
      reader.fontScale < 0.8 ||
      reader.fontScale > 2
    )
      fail("Die Schriftgröße ist ungültig.");
    list(reader.selected, 176, "Ausgewählte Verse");
    reader.selected.forEach((verse) =>
      integer(verse, 1, 176, "Ausgewählter Vers"),
    );
    distinct(reader.selected, "Ausgewählte Verse");
    if (
      !reader.highlights ||
      typeof reader.highlights !== "object" ||
      Array.isArray(reader.highlights)
    )
      fail("Die Markierungen sind ungültig.");
    const highlights = Object.entries(reader.highlights);
    if (highlights.length > 5000) fail("Zu viele Markierungen.");
    for (const [key, color] of highlights) {
      const parts = key.split(":");
      if (parts.length !== 3 && parts.length !== 4)
        fail("Eine Markierung hat keine gültige Bibelstelle.");
      if (parts.length === 4) translation(parts.shift());
      if (
        !validChapter({ book: parts[0], chapter: Number(parts[1]) }) ||
        !/^\d{1,3}$/.test(parts[1]) ||
        !/^\d{1,3}$/.test(parts[2])
      )
        fail("Eine Markierung verweist auf eine ungültige Bibelstelle.");
      integer(Number(parts[2]), 1, 176, "Markierter Vers");
      if (!["sage", "gold", "rose", "blue"].includes(color))
        fail("Eine Markierungsfarbe ist ungültig.");
    }
  }

  function makeBackup(state) {
    const data = {};
    for (const key of DATA_KEYS) data[key] = clone(state[key]);
    return { schema: SCHEMA, version: 1, data };
  }

  function validateBackup(text) {
    try {
      if (typeof text !== "string" || text.length > 2 * 1024 * 1024)
        fail("Die Demo-Sicherung ist leer oder zu groß.");
      const envelope = JSON.parse(text);
      object(envelope, ["schema", "version", "data"]);
      if (envelope.schema !== SCHEMA || envelope.version !== 1)
        fail(
          "Bitte eine FaithPath-Premium-Demo-Sicherung der Version 1 wählen.",
        );
      validateData(envelope.data);
      return { ok: true, data: clone(envelope.data) };
    } catch (error) {
      return {
        ok: false,
        error:
          error instanceof SyntaxError
            ? "Diese Datei enthält kein gültiges JSON."
            : error.message,
      };
    }
  }

  function restoreBackup(state, validated) {
    try {
      const envelope =
        validated?.ok === true
          ? { schema: SCHEMA, version: 1, data: validated.data }
          : validated;
      const checked = validateBackup(JSON.stringify(envelope));
      if (!checked.ok) return checked;
      const replacement = clone(checked.data);
      for (const key of DATA_KEYS) state[key] = replacement[key];
      state.draft = null;
      state.notice = "";
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: "Die Demo-Sicherung konnte nicht übernommen werden.",
      };
    }
  }

  root.PremiumModel = {
    escape,
    initial,
    createDraft,
    saveDraft,
    editDraft,
    discardDraft,
    deleteNote,
    undoDelete,
    searchJournal,
    toggleStep,
    archivePath,
    addStep,
    editStep,
    confirmDevelopment,
    exploreChapter,
    startQuiz,
    answerQuiz,
    advanceQuiz,
    makeBackup,
    validateBackup,
    restoreBackup,
  };
})(globalThis);
