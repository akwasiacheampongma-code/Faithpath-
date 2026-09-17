import { BOOK_ALIASES } from "./content.js";
export const normBook = (b) =>
  BOOK_ALIASES[String(b || "").toLowerCase()] || String(b || "").toUpperCase();
export const time = (d) =>
  Number.isFinite(Date.parse(d)) ? Date.parse(d) : null;
export const sameRef = (a, b) =>
  !!a &&
  !!b &&
  normBook(a.book) === normBook(b.book) &&
  +a.chapter === +b.chapter &&
  +(a.from || 0) === +(b.from || 0) &&
  +(a.to || a.from || 0) === +(b.to || b.from || 0) &&
  (a.translation || "otb") === (b.translation || "otb");
export function validRef(ref, index) {
  if (!ref) return null;
  const code = normBook(ref.book),
    tr = ref.translation || "otb",
    b = index?.[tr]?.[code];
  if (!b || !Number.isInteger(+ref.chapter) || !b[+ref.chapter - 1])
    throw new Error("Diese Bibelstelle ist nicht vorhanden.");
  const nums = b[+ref.chapter - 1],
    from = ref.from == null ? null : +ref.from;
  // Historic 999 means whole chapter; translate only this documented sentinel.
  const to = ref.to === 999 ? nums.at(-1) : ref.to == null ? from : +ref.to;
  if (
    (from != null && !nums.includes(from)) ||
    (to != null && !nums.includes(to)) ||
    (from != null && to < from)
  )
    throw new Error(
      "Dieser Versbereich ist in der gewählten Übersetzung nicht vorhanden.",
    );
  return {
    ...ref,
    book: code,
    chapter: +ref.chapter,
    from,
    to,
    translation: tr,
  };
}
export function timeline(s, pathId = null) {
  const refRoute = (r) =>
    "read/" +
    normBook(r.book) +
    "/" +
    r.chapter +
    "/" +
    (r.translation || "otb") +
    "?" +
    new URLSearchParams(r.from ? { from: r.from, to: r.to || r.from } : {});
  const items = [],
    push = (x) => {
      if (time(x.at) != null) items.push(x);
    };
  for (const p of s.paths.filter((p) => !pathId || p.id === pathId)) {
    push({
      id: "p:" + p.id,
      at: p.started,
      kind: "Weg begonnen",
      title: p.title,
      pathId: p.id,
      route: "path/" + encodeURIComponent(p.id),
    });
    for (const l of p.links || [])
      push({
        id: "l:" + l.id,
        at: l.date,
        kind:
          l.kind === "reflection"
            ? "Gedanke verbunden"
            : "Bibelstelle verbunden",
        title: l.label || "Bibelstelle",
        pathId: p.id,
        ref: l.ref,
        route: l.journalId
          ? "entry/" + encodeURIComponent(l.journalId)
          : l.reflectionId
            ? "reflection/" + encodeURIComponent(l.reflectionId)
            : l.ref
              ? refRoute(l.ref)
              : "path/" + encodeURIComponent(p.id),
      });
    for (const x of p.steps || [])
      if (x.createdAt)
        push({
          id: "s:" + x.id,
          at: x.createdAt,
          kind: "Schritt vorgenommen",
          title: x.text,
          pathId: p.id,
          route: "path/" + encodeURIComponent(p.id),
        });
    for (const r of p.reviews || []) {
      const milestone = (p.milestones || []).find(
        (m) =>
          m.reviewId === r.id ||
          (m.text === r.text && Math.abs(time(m.date) - time(r.date)) < 5000),
      );
      push({
        id: "pr:" + r.id,
        at: r.date,
        kind: milestone ? "Entwicklung festgehalten" : "Rückblick",
        title: r.text,
        pathId: p.id,
        route: "path/" + encodeURIComponent(p.id),
      });
    }
    for (const m of p.milestones || [])
      if (
        !(p.reviews || []).some(
          (r) =>
            m.reviewId === r.id ||
            (m.text === r.text && Math.abs(time(m.date) - time(r.date)) < 5000),
        )
      )
        push({
          id: "m:" + m.id,
          at: m.date,
          kind: "Entwicklung festgehalten",
          title: m.text,
          pathId: p.id,
          route: "path/" + encodeURIComponent(p.id),
        });
  }
  for (const j of s.journal)
    if (!pathId || j.pathIds?.includes(pathId))
      push({
        id: "j:" + j.id,
        at: j.date,
        kind: j.subtype || j.type || "Gedanke",
        title: j.text,
        pathId: j.pathIds?.[0],
        ref: j.ref,
        route: "entry/" + encodeURIComponent(j.id),
      });
  for (const r of s.reflections)
    if (
      !s.journal.some(
        (j) =>
          j.reflectionId === r.id || (j.text === r.text && j.date === r.date),
      ) &&
      (!pathId || r.pathIds?.includes(pathId))
    )
      push({
        id: "r:" + r.id,
        at: r.date,
        kind: "Reflexion",
        title: r.text,
        ref: r.ref,
        pathId: r.pathIds?.[0],
        route: "reflection/" + encodeURIComponent(r.id),
      });
  if (!pathId) {
    for (const h of s.highlights)
      push({
        id: "h:" + h.id,
        at: h.at,
        kind: "Vers markiert",
        title: h.label,
        ref: h,
        route: "mark/" + encodeURIComponent(h.id),
      });
    for (const r of s.reviews || [])
      push({
        id: "gr:" + r.id,
        at: r.date,
        kind: r.confirmedDevelopment ? "Entwicklung festgehalten" : "Rückblick",
        title: r.text,
        route: "review/" + encodeURIComponent(r.id),
      });
    for (const e of s.events)
      if (e.kind === "reading")
        push({
          id: "e:" + e.id,
          at: e.at,
          kind: "Bibel geöffnet",
          title: e.text,
          ref: e.ref,
          route: e.route,
        });
  }
  return items.sort((a, b) => time(b.at) - time(a.at));
}
export function gaps(s, now = Date.now()) {
  const result = [],
    day = 86400000;
  const candidate = (key, at, item, delay) => {
    const start = time(at);
    if (start == null || start > now) return;
    const reviews = (s.reviews || []).filter((r) => r.sourceKey === key),
      latest = reviews
        .map((r) => time(r.date))
        .filter(Boolean)
        .sort((a, b) => b - a)[0];
    const dismissed = time(s.dismissedGaps?.[key]);
    if (dismissed && dismissed >= start) return;
    const snooze = time(s.reminderSnoozes?.[key]);
    const base = Math.max(start, latest || 0);
    const due = snooze && snooze > base ? snooze : base + delay * day;
    if (due > now) return;
    result.push({
      ...item,
      key,
      at,
      age: Math.max(0, Math.floor((now - start) / day)),
      due,
    });
  };
  const linkedRefs = s.paths
    .filter((p) => !p.archived)
    .flatMap((p) => p.links || []);
  for (const p of s.paths.filter((p) => !p.archived)) {
    const entries = s.journal.filter((j) => j.pathIds?.includes(p.id));
    const activity = [
      p.started,
      p.lastReview,
      ...(p.links || []).map((l) => l.date),
      ...(p.reviews || []).map((r) => r.date),
      ...(p.milestones || []).map((m) => m.date),
      ...entries.flatMap((j) => [j.date, j.updatedAt]),
      ...(p.steps || []).flatMap((x) => [x.createdAt, x.completedAt]),
    ]
      .filter((x) => time(x) != null)
      .sort((a, b) => time(b) - time(a));
    const last = activity[0] || p.started,
      step = [...(p.steps || [])].reverse().find((x) => !x.done);
    const link = [...(p.links || [])].sort(
      (a, b) => (time(b.date) || 0) - (time(a.date) || 0),
    )[0];
    candidate(
      "path:" + p.id,
      last,
      {
        type: "path",
        id: p.id,
        title: p.title,
        detail: step
          ? `Du wolltest ausprobieren: „${step.text}“`
          : link
            ? `Dich hat ${link.label || "diese Bibelstelle"} begleitet.`
            : p.why || "Ein persönlicher Weg, den du begonnen hast.",
        ref: link?.ref,
        pathId: p.id,
      },
      21,
    );
  }
  for (const h of s.highlights) {
    if (linkedRefs.some((l) => sameRef(l.ref, h))) continue;
    if (s.journal.some((j) => sameRef(j.ref, h) && time(j.date) >= time(h.at)))
      continue;
    if (
      s.reflections.some(
        (r) =>
          (r.highlightId === h.id || sameRef(r.ref, h)) &&
          time(r.date) >= time(h.at),
      )
    )
      continue;
    candidate(
      "highlight:" + h.id,
      h.at,
      {
        type: "highlight",
        id: h.id,
        title: h.label || "Deine Markierung",
        detail: h.snippet || "Diese Stelle war dir wichtig.",
        ref: h,
      },
      35,
    );
  }
  for (const j of s.journal) {
    if (j.pathIds?.length || j.subtype === "Rückblick") continue;
    candidate(
      "journal:" + j.id,
      j.updatedAt || j.date,
      {
        type: "journal",
        id: j.id,
        title: j.ref?.label || j.subtype || j.type || "Dein Gedanke",
        detail: j.text,
        ref: j.ref,
      },
      35,
    );
  }
  for (const r of s.reflections) {
    if (
      r.pathIds?.length ||
      s.journal.some(
        (j) =>
          j.reflectionId === r.id || (j.text === r.text && j.date === r.date),
      )
    )
      continue;
    candidate(
      "reflection:" + r.id,
      r.updatedAt || r.date,
      {
        type: "reflection",
        id: r.id,
        title: r.label || "Deine Reflexion",
        detail: r.text,
        ref: r.ref,
      },
      35,
    );
  }
  return result.sort((a, b) => a.due - b.due);
}
export function developmentCount(s) {
  return (
    s.paths.reduce((n, p) => n + (p.milestones?.length || 0), 0) +
    (s.reviews || []).filter((r) => r.confirmedDevelopment && !r.pathId).length
  );
}
export function treeLevel(s) {
  const n = developmentCount(s);
  return n === 0
    ? 0
    : n === 1
      ? 1
      : n === 2
        ? 2
        : n <= 4
          ? 3
          : n <= 6
            ? 4
            : n <= 9
              ? 5
              : 6;
}
export function attach(s, pathId, entryId) {
  const p = s.paths.find((p) => p.id === pathId),
    j = s.journal.find((j) => j.id === entryId);
  if (!p || !j) throw new Error("Die Verbindung ist nicht mehr verfügbar.");
  j.pathIds = [...new Set([...(j.pathIds || []), p.id])];
  const r = s.reflections.find((r) => r.id === j.reflectionId);
  if (r) r.pathIds = [...new Set([...(r.pathIds || []), p.id])];
  if (!p.links.some((l) => l.journalId === j.id))
    p.links.push({
      id: "entry-" + j.id,
      kind: "reflection",
      journalId: j.id,
      reflectionId: j.reflectionId || null,
      ref: j.ref || null,
      label: j.ref?.label || j.subtype || "Gedanke",
      date: j.date,
    });
}
