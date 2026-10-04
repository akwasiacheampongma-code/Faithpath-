import { normBook } from "./domain.js";
// Optional metadata only; existing V5 storage/backup retains unknown fields.
export const HIGHLIGHT_COLORS = Object.freeze({ olive: "Olive", gold: "Gold", sand: "Sand", sage: "Sage", terra: "Terracotta" });
export const highlightColor = h => Object.hasOwn(HIGHLIGHT_COLORS, h.color) ? h.color : "olive";
export const overlapsRef = (a, b) => normBook(a.book) === normBook(b.book) && +a.chapter === +b.chapter && (a.translation || "otb") === (b.translation || "otb") && +(a.from || 0) <= +(b.to || b.from || 0) && +(b.from || 0) <= +(a.to || a.from || 0);
export function paintRange(data, ref, color, verses, newId, at) {
  if (!Object.hasOwn(HIGHLIGHT_COLORS, color)) throw new Error("Unbekannte Markierungsfarbe.");
  const covered = new Set();
  const excerpt = (from, to) => verses.filter(v => v[0] >= from && v[0] <= to).map(v => v[1]).join(" ");
  data.highlights = data.highlights.flatMap(h => {
    if (!overlapsRef(h, ref)) return [h];
    const from = Math.max(+h.from, +ref.from), to = Math.min(+(h.to || h.from), +ref.to);
    for (let n = from; n <= to; n++) covered.add(n);
    const parts = [];
    if (+h.from < from) parts.push({ ...h, id: newId(), to: from - 1, label: "", snippet: excerpt(+h.from, from - 1) });
    parts.push({ ...h, from, to, label: "", color, snippet: excerpt(from, to) });
    if (+(h.to || h.from) > to) parts.push({ ...h, id: newId(), from: to + 1, label: "", snippet: excerpt(to + 1, +(h.to || h.from)) });
    return parts;
  });
  for (let n = +ref.from; n <= +ref.to; n++) {
    if (covered.has(n)) continue;
    const from = n;
    while (n < +ref.to && !covered.has(n + 1)) n++;
    data.highlights.push({ ...ref, from, to: n, label: "", color, id: newId(), at, snippet: excerpt(from, n) });
  }
}
export function detachPath(data, pid) {
  const p = data.paths.find(p => p.id === pid);
  if (!p) throw new Error("Dieser Weg ist nicht mehr vorhanden.");
  // Retain review IDs and nested milestone IDs; no editorial or tree rules change.
  const retained = (p.reviews || []).map(r => {
    const milestones = (p.milestones || []).filter(m => m.reviewId === r.id || (m.text === r.text && Math.abs(Date.parse(m.date) - Date.parse(r.date)) < 5000));
    if (milestones.length > 1) throw new Error("Bitte diesen Weg archivieren: Seine Entwicklung lässt sich nicht verlustfrei lösen.");
    const kept = { ...r }; delete kept.pathId;
    return { ...kept, ...(milestones.length ? { milestones, confirmedDevelopment: true } : {}) };
  });
  for (const m of p.milestones || [])
    if (!retained.some(r => r.milestones?.some(x => x.id === m.id))) retained.push({ ...m, confirmedDevelopment: true, sourceKey: "path:" + pid });
  const beforeCount = (p.milestones || []).length;
  if (retained.filter(r => r.confirmedDevelopment).length !== beforeCount) throw new Error("Bitte diesen Weg archivieren: Seine Entwicklung lässt sich nicht verlustfrei lösen.");
  if (retained.some(r => data.reviews.some(x => x.id === r.id))) throw new Error("Eine Rückblick-ID ist bereits vorhanden. Bitte den Weg archivieren.");
  data.reviews.unshift(...retained);
  data.paths = data.paths.filter(x => x.id !== pid);
  for (const item of [...data.journal, ...data.reflections, ...data.highlights]) if (item.pathIds) item.pathIds = item.pathIds.filter(x => x !== pid);
  delete data.reminderSnoozes["path:" + pid];
  delete data.dismissedGaps["path:" + pid];
}
export function clearRange(data, ref, verses, newId) {
  const excerpt = (from, to) => verses.filter(v => v[0] >= from && v[0] <= to).map(v => v[1]).join(" ");
  data.highlights = data.highlights.flatMap(h => {
    if (!overlapsRef(h, ref)) return [h];
    const parts = [];
    if (+h.from < +ref.from) parts.push({ ...h, to: +ref.from - 1, label: "", snippet: excerpt(+h.from, +ref.from - 1) });
    if (+(h.to || h.from) > +ref.to) parts.push({ ...h, id: parts.length ? newId() : h.id, from: +ref.to + 1, label: "", snippet: excerpt(+ref.to + 1, +(h.to || h.from)) });
    return parts;
  });
}
