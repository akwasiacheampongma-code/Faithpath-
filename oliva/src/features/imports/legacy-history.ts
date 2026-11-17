import { canonicalJson, sha256 } from "../../lib/hash";
import type { Goal } from "../personal/schema";
import type { ImportReceipt } from "./schema";
import { iso, parseFaithpath, type FaithpathData } from "./source";

export type LegacyLocation = {
  category: "paths" | "reviews";
  index: number;
  section?: "reviews" | "milestones";
  recordIndex?: number;
};
type Snapshot = { key: string; title: string; text: string; at: string };
export type LegacyMoment = {
  key: string;
  id: string;
  kind: "review" | "milestone";
  text: string;
  date: string | null;
  status: string | null;
  snapshot: Snapshot | null;
  originallyConfirmed: boolean;
  conflictingIdentity: boolean;
  conflictingAssociation: boolean;
  locations: LegacyLocation[];
  reviewKey?: string;
};
type Result = { status: "unavailable"; reason: string } | {
  status: "ok";
  archiveId: string;
  sourceHash: string;
  originalTitle: string;
  originalArchived: boolean;
  moments: LegacyMoment[];
};
type Review = FaithpathData["reviews"][number];
const unavailable = (reason: string) => ({ status: "unavailable" as const, reason });
const knownSnapshot = (review: Review): Snapshot | null => {
  const value = review.sourceSnapshot;
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const source = value as Record<string, unknown>, at = iso(source.at);
  return source.key === review.sourceKey && typeof source.key === "string" &&
    typeof source.title === "string" && typeof source.text === "string" && at
    ? { key: source.key, title: source.title, text: source.text, at } : null;
};

function readSource(receipt: ImportReceipt) {
  let parsed: ReturnType<typeof parseFaithpath>;
  try { parsed = parseFaithpath(receipt.sourceText); }
  catch { return unavailable("Die Originalquelle kann nicht sicher gelesen werden."); }
  if (parsed.sourceHash !== receipt.sourceHash || parsed.fingerprint !== receipt.fingerprint ||
    receipt.id !== "fp5-" + parsed.fingerprint)
    return unavailable("Die Originalquelle stimmt nicht mit ihrem gespeicherten Fingerabdruck überein.");
  return { status: "ok" as const, data: parsed.data };
}

/** Historical projection only. Never imports, restores, edits or confirms data. */
export function legacyPathHistory(receipt: ImportReceipt, goal: Pick<Goal, "origin">): Result {
  const origin = goal.origin;
  if (!origin || origin.kind !== "path" || origin.importId !== receipt.id)
    return unavailable("Keine eindeutig zugehörige Originalquelle.");
  const source = readSource(receipt);
  if (source.status !== "ok") return source;
  const data = source.data, pathIndex = data.paths.findIndex((p) => String(p.id) === origin.sourceId);
  if (pathIndex < 0) return unavailable("Das ursprüngliche Vorhaben fehlt in dieser Quelle.");
  const path = data.paths[pathIndex]!, pid = String(path.id), sourceKey = "fp5-path-" + sha256(pid),
    entityHash = sha256(canonicalJson(path));
  if (!origin.sourceKeys.includes(sourceKey) || origin.entityHash !== entityHash || receipt.entities[sourceKey] !== entityHash)
    return unavailable("Die Herkunft dieses Vorhabens ist nicht eindeutig belegt.");
  return projectPath(receipt, data, pathIndex);
}

function projectPath(receipt: Pick<ImportReceipt, "id" | "sourceHash">, data: FaithpathData, pathIndex: number): Result {
  const path = data.paths[pathIndex]!, pid = String(path.id);
  const thoughtKeys = new Set<string>(), journalIds = new Set<string>(), reflectionIds = new Set<string>();
  for (const link of path.links) {
    if (link.journalId != null) journalIds.add(String(link.journalId));
    if (link.entryId != null) journalIds.add(String(link.entryId));
    if (link.reflectionId != null) reflectionIds.add(String(link.reflectionId));
  }
  const linked = (item: FaithpathData["journal"][number], kind: "journal" | "reflection") =>
    item.pathIds?.includes(pid) || (kind === "journal" ? journalIds : reflectionIds).has(String(item.id));
  for (const item of data.journal.filter((item) => linked(item, "journal"))) {
    thoughtKeys.add("journal:" + item.id); thoughtKeys.add("j:" + item.id);
    if (item.reflectionId != null) {
      thoughtKeys.add("reflection:" + item.reflectionId); thoughtKeys.add("r:" + item.reflectionId);
    }
  }
  for (const item of data.reflections.filter((item) => linked(item, "reflection"))) {
    thoughtKeys.add("reflection:" + item.id); thoughtKeys.add("r:" + item.id);
  }
  const moments: LegacyMoment[] = [], byIdentity = new Map<string, LegacyMoment>();
  function appendReview(review: Review, location: LegacyLocation) {
    // An explicit pathId equal to this enclosing path adds no different meaning.
    // All original coordinates remain available, including this original field.
    const normalized = { ...review };
    if (normalized.pathId == null || String(normalized.pathId) === pid) delete normalized.pathId;
    const identity = sha256(canonicalJson(normalized)), existing = byIdentity.get(identity);
    if (existing) { existing.locations.push(location); return; }
    const moment: LegacyMoment = {
      key: "review:" + identity, id: String(review.id), kind: "review", text: review.text,
      date: iso(review.date), status: typeof review.status === "string" ? review.status : null,
      snapshot: knownSnapshot(review), originallyConfirmed: review.confirmedDevelopment === true,
      conflictingIdentity: false,
      conflictingAssociation: review.pathId != null && String(review.pathId) !== pid ||
        !!review.sourceKey?.startsWith("path:") && review.sourceKey !== "path:" + pid,
      locations: [location],
    };
    moments.push(moment); byIdentity.set(identity, moment);
  }
  path.reviews.forEach((review, recordIndex) => appendReview(review,
    { category: "paths", index: pathIndex, section: "reviews", recordIndex }));
  data.reviews.forEach((review, index) => {
    if (review.pathId != null && String(review.pathId) === pid || review.sourceKey === "path:" + pid ||
      review.sourceKey != null && thoughtKeys.has(review.sourceKey)) appendReview(review, { category: "reviews", index });
  });
  const reviewIds = new Map<string, LegacyMoment[]>();
  for (const moment of moments) {
    const records = reviewIds.get(moment.id) ?? [];
    records.push(moment); reviewIds.set(moment.id, records);
  }
  for (const records of reviewIds.values()) if (records.length > 1)
    for (const record of records) record.conflictingIdentity = true;
  path.milestones.forEach((milestone, recordIndex) => {
    const linkedReviews = milestone.reviewId == null ? [] : reviewIds.get(String(milestone.reviewId)) ?? [];
    const review = linkedReviews.length === 1 && !linkedReviews[0]!.conflictingAssociation ? linkedReviews[0] : null;
    moments.push({ key: "milestone:" + sha256(canonicalJson(milestone)), id: String(milestone.id),
      kind: "milestone", text: milestone.text, date: iso(milestone.date), status: null, snapshot: null,
      originallyConfirmed: false, conflictingIdentity: false, conflictingAssociation: false,
      locations: [{ category: "paths", index: pathIndex, section: "milestones", recordIndex }],
      ...(review ? { reviewKey: review.key } : {}),
    });
  });
  moments.sort((a, b) => (b.date ? Date.parse(b.date) : -Infinity) - (a.date ? Date.parse(a.date) : -Infinity) ||
    (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
  return { status: "ok", archiveId: receipt.id, sourceHash: receipt.sourceHash,
    originalTitle: path.title, originalArchived: path.archived === true, moments };
}

/** One verified original snapshot; paths are projected only when deliberately opened. */
export function legacyArchiveReader(receipt: ImportReceipt) {
  const source = readSource(receipt);
  if (source.status !== "ok") return source;
  const identity = { id: receipt.id, sourceHash: receipt.sourceHash }, data = source.data, paths = data.paths.map((path, index) => ({
    id: String(path.id), title: path.title, archived: path.archived === true, index,
  })), pathIndices = new Map(paths.map((path) => [path.id, path.index])),
    journals = new Set<string>(), reflections = new Set<string>(), thoughtKeys = new Set<string>(),
    localReviews = new Set<string>(), localReviewIds = new Set<string>();
  for (const path of data.paths) {
    for (const link of path.links) {
      if (link.journalId != null) journals.add(String(link.journalId));
      if (link.entryId != null) journals.add(String(link.entryId));
      if (link.reflectionId != null) reflections.add(String(link.reflectionId));
    }
    for (const review of path.reviews) {
      localReviews.add(canonicalJson(review)); localReviewIds.add(String(review.id));
    }
  }
  for (const item of data.journal) if (journals.has(String(item.id)) || item.pathIds?.some((id) => pathIndices.has(id))) {
    thoughtKeys.add("journal:" + item.id); thoughtKeys.add("j:" + item.id);
    if (item.reflectionId != null) { thoughtKeys.add("reflection:" + item.reflectionId); thoughtKeys.add("r:" + item.reflectionId); }
  }
  for (const item of data.reflections) if (reflections.has(String(item.id)) || item.pathIds?.some((id) => pathIndices.has(id))) {
    thoughtKeys.add("reflection:" + item.id); thoughtKeys.add("r:" + item.id);
  }
  const unassigned: LegacyMoment[] = [];
  data.reviews.forEach((review, index) => {
    if (review.pathId != null && pathIndices.has(String(review.pathId)) ||
      review.sourceKey?.startsWith("path:") && pathIndices.has(review.sourceKey.slice(5)) ||
      review.sourceKey != null && thoughtKeys.has(review.sourceKey) || localReviews.has(canonicalJson(review))) return;
    unassigned.push({ key: "review:" + sha256(canonicalJson(review)), id: String(review.id), kind: "review",
      text: review.text, date: iso(review.date), status: typeof review.status === "string" ? review.status : null,
      snapshot: knownSnapshot(review), originallyConfirmed: review.confirmedDevelopment === true,
      conflictingIdentity: localReviewIds.has(String(review.id)), conflictingAssociation: false,
      locations: [{ category: "reviews", index }],
    });
  });
  unassigned.sort((a, b) => (b.date ? Date.parse(b.date) : -Infinity) - (a.date ? Date.parse(a.date) : -Infinity) ||
    (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
  return { status: "ok" as const, archiveId: receipt.id, sourceHash: receipt.sourceHash, paths, unassigned,
    readPath: (sourceId: string): Result => {
      const index = pathIndices.get(sourceId);
      return index === undefined ? unavailable("Dieses frühere Vorhaben ist in der Originalquelle nicht verfügbar.") : projectPath(identity, data, index);
    },
  };
}
