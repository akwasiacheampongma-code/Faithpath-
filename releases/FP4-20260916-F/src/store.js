// The original keys remain readable. Migration never discards unknown fields.
export const KEYS = Object.freeze({
  main: "faithpath.v1.rebuild",
  plans: "faithpath.guidedPlans.v1",
  onboard: "faithpath.onboarding.v4",
  legacyOnboard: "faithpath.onboarding.v3",
  migration: "faithpath.backup.pre-v5",
  restore: "faithpath.backup.before-import",
  draft: "faithpath.draft.v4",
});
export const id = () =>
  globalThis.crypto?.randomUUID?.() ||
  `fp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
export const now = () => new Date().toISOString();
const object = (x) => !!x && typeof x === "object" && !Array.isArray(x);
const clone = (x) => JSON.parse(JSON.stringify(x));
export const empty = () => ({
  version: 5,
  translation: "otb",
  paths: [],
  journal: [],
  highlights: [],
  reflections: [],
  quiz: {},
  events: [],
  reading: null,
  reminderSnoozes: {},
  dismissedGaps: {},
  reviews: [],
  guidedPlans: {},
  settings: {},
});
const arrays = [
  "paths",
  "journal",
  "highlights",
  "reflections",
  "events",
  "reviews",
];
export function validateShape(raw, strict = false) {
  if (!object(raw)) throw new Error("Das ist kein FaithPath-Datenstand.");
  if (raw.version > 5)
    throw new Error("Dieses Backup benötigt eine neuere FaithPath-Version.");
  for (const k of arrays) {
    if (raw[k] != null && !Array.isArray(raw[k]))
      throw new Error(`Ungültiger Bereich: ${k}.`);
    if ((raw[k] || []).some((x) => !object(x)))
      throw new Error(`Beschädigter Eintrag in ${k}.`);
  }
  if (
    strict &&
    !["paths", "journal", "highlights"].every((k) => Array.isArray(raw[k]))
  )
    throw new Error("Die erforderlichen FaithPath-Bereiche fehlen.");
  for (const p of raw.paths || []) {
    if (typeof p.title !== "string" || !p.title.trim())
      throw new Error("Ein Weg hat keinen gültigen Titel.");
    for (const k of ["steps", "milestones", "reviews", "links"])
      if (
        p[k] != null &&
        (!Array.isArray(p[k]) || p[k].some((x) => !object(x)))
      )
        throw new Error(`Ungültige ${k} im Weg.`);
    for (const k of ["steps", "milestones", "reviews"])
      for (const x of p[k] || [])
        if (typeof x.text !== "string")
          throw new Error("Ein Weg enthält beschädigten Text.");
  }
  for (const k of ["journal", "reflections"])
    for (const x of raw[k] || [])
      if (typeof x.text !== "string")
        throw new Error("Ein Eintrag enthält beschädigten Text.");
  for (const k of [
    "quiz",
    "reminderSnoozes",
    "dismissedGaps",
    "guidedPlans",
    "settings",
  ])
    if (raw[k] != null && !object(raw[k]))
      throw new Error(`Ungültiger Bereich: ${k}.`);
  for (const [plan, days] of Object.entries(raw.guidedPlans || {}))
    if (
      !object(days) ||
      Object.values(days).some((v) => typeof v !== "boolean")
    )
      throw new Error("Ungültiger Planfortschritt.");
  // Reject prototype-bearing input. All user strings are escaped by the view layer.
  const scan = (x) => {
    if (!x || typeof x !== "object") return;
    for (const k of Object.keys(x)) {
      if (["__proto__", "constructor", "prototype"].includes(k))
        throw new Error("Unsichere Importdatei.");
      scan(x[k]);
    }
  };
  scan(raw);
  for (const k of arrays) {
    const used = new Set();
    for (const x of raw[k] || []) {
      if (x.id != null && used.has(String(x.id)))
        throw new Error(`Doppelte ID in ${k}.`);
      if (x.id != null) used.add(String(x.id));
    }
  }
  return raw;
}
export function migrate(raw, legacyPlans = {}) {
  validateShape(raw);
  if (!object(legacyPlans))
    throw new Error("Der gespeicherte Planfortschritt ist beschädigt.");
  const s = { ...empty(), ...clone(raw), version: 5 };
  for (const k of ["quiz", "reminderSnoozes", "dismissedGaps", "settings"])
    s[k] ??= {};
  for (const k of arrays)
    s[k] = (s[k] || []).map((x) => ({ ...x, id: String(x.id || id()) }));
  s.guidedPlans = object(raw.guidedPlans)
    ? clone(raw.guidedPlans)
    : clone(legacyPlans);
  s.paths = s.paths.map((p) => ({
    ...p,
    steps: (p.steps || []).map((x) => ({ ...x, id: String(x.id || id()) })),
    milestones: (p.milestones || []).map((x) => ({
      ...x,
      id: String(x.id || id()),
    })),
    reviews: (p.reviews || []).map((x) => ({ ...x, id: String(x.id || id()) })),
    links: (p.links || []).map((x) => ({ ...x, id: String(x.id || id()) })),
  }));
  // Link only exact legacy mirrors, never infer a connection from similar prose.
  for (const j of s.journal) {
    if (j.reflectionId) continue;
    const rs = s.reflections.filter(
      (r) =>
        r.text === j.text &&
        r.date === j.date &&
        ((!r.ref && !j.ref) || JSON.stringify(r.ref) === JSON.stringify(j.ref)),
    );
    if (rs.length === 1) j.reflectionId = rs[0].id;
  }
  for (const p of s.paths)
    for (const l of p.links) {
      if (!l.reflectionId) continue;
      const r = s.reflections.find((x) => x.id === l.reflectionId);
      if (r) {
        r.pathIds = [...new Set([...(r.pathIds || []), p.id])];
        const j = s.journal.find((x) => x.reflectionId === r.id);
        if (j) j.pathIds = [...new Set([...(j.pathIds || []), p.id])];
      }
    }
  validateShape(s);
  return s;
}
export function createStore(storage) {
  let state = empty(),
    error = null,
    last = null;
  try {
    last = storage.getItem(KEYS.main);
    const raw = last ? JSON.parse(last) : {};
    const plansRaw = storage.getItem(KEYS.plans),
      plans = raw.guidedPlans ? {} : plansRaw ? JSON.parse(plansRaw) : {};
    state = migrate(raw, plans);
    if (last && raw.version !== 5) {
      if (!storage.getItem(KEYS.migration))
        storage.setItem(
          KEYS.migration,
          JSON.stringify({ raw: last, guidedPlansRaw: plansRaw, saved: now() }),
        );
      const serialized = JSON.stringify(state);
      storage.setItem(KEYS.main, serialized);
      last = serialized;
    }
  } catch (e) {
    error = e;
  }
  return {
    get state() {
      return state;
    },
    get error() {
      return error;
    },
    transact(change) {
      if (error)
        throw new Error(
          "Deine Daten konnten nicht sicher geladen werden. Bitte sichere zuerst den Originalstand.",
        );
      if (storage.getItem(KEYS.main) !== last)
        throw new Error(
          "Deine Daten wurden in einem anderen Tab geändert. Bitte lade FaithPath neu.",
        );
      const next = clone(state);
      change(next);
      validateShape(next);
      const serialized = JSON.stringify(next);
      try {
        storage.setItem(KEYS.main, serialized);
      } catch {
        throw new Error(
          "Nicht gespeichert: Der Gerätespeicher ist nicht verfügbar oder voll. Bitte exportiere ein Backup.",
        );
      }
      state = next;
      last = serialized;
      return state;
    },
    backup() {
      return {
        app: "FaithPath",
        version: 4,
        schemaVersion: 5,
        exported: now(),
        data: clone(state),
        guidedPlans: clone(state.guidedPlans),
      };
    },
    prepareImport(input) {
      if (!object(input) || (input.app && input.app !== "FaithPath"))
        throw new Error("Kein FaithPath-Backup.");
      const raw = input.data || input;
      validateShape(raw, true);
      return migrate(raw, input.guidedPlans || {});
    },
    restore(next) {
      validateShape(next, true);
      if (storage.getItem(KEYS.main) !== last)
        throw new Error("Daten wurden inzwischen geändert. Bitte neu laden.");
      storage.setItem(
        KEYS.restore,
        JSON.stringify({
          raw: last,
          guidedPlansRaw: storage.getItem(KEYS.plans),
          saved: now(),
        }),
      );
      const serialized = JSON.stringify(next);
      storage.setItem(KEYS.main, serialized);
      state = clone(next);
      last = serialized;
      error = null;
    },
    rawBackup() {
      return {
        app: "FaithPath-Recovery",
        main: storage.getItem(KEYS.main),
        guidedPlans: storage.getItem(KEYS.plans),
        migration: storage.getItem(KEYS.migration),
        beforeImport: storage.getItem(KEYS.restore),
      };
    },
  };
}
