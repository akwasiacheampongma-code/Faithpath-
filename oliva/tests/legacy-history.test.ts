import { describe, expect, it } from "vitest";
import { initialData } from "../src/state/model";
import { applyImport, prepareImport } from "../src/features/imports/model";
import { legacyPathHistory, legacyArchiveReader } from "../src/features/imports/legacy-history";
import type { FaithpathData } from "../src/features/imports/source";
import { faithpathFixture } from "./fixtures/faithpath-v5";

function setup(change?: (data: FaithpathData) => void) {
  const input = faithpathFixture();
  change?.(input.data as unknown as FaithpathData);
  const data = initialData(), plan = prepareImport(JSON.stringify(input), data, "2027-01-01T12:00:00.000Z");
  applyImport(data, plan);
  return { data, goal: data.goals[0]!, receipt: data.imports[0]! };
}
function result(value: ReturnType<typeof setup>) {
  const history = legacyPathHistory(value.receipt, value.goal);
  if (history.status !== "ok") throw new Error(history.reason);
  return history;
}
describe("quellengenaue historische Rückblicke und Meilensteine", () => {
  it("liest den tatsächlichen Import unverändert und erzeugt weder Rückblicke noch Wachstum", () => {
    const value = setup(), before = JSON.stringify(value.data), history = result(value);
    expect(history.moments.map((m) => m.kind)).toEqual(["review", "milestone"]);
    expect(history.moments[0]).toMatchObject({ text: "Damals hat mich diese Frage bewegt.",
      originallyConfirmed: false, snapshot: { title: "Mein damaliger Titel" },
      locations: [{ category: "paths", index: 0, section: "reviews", recordIndex: 0 }] });
    expect(history.moments[1]).toMatchObject({ text: "Ein kleiner Anfang.",
      locations: [{ category: "paths", index: 0, section: "milestones", recordIndex: 0 }] });
    expect(JSON.stringify(value.data)).toBe(before);
    expect(value.goal.reviews).toEqual([]);
    expect(value.data.growthStage).toBe(0);
  });
  it("erschließt explizite Journal-, Reflexions- und Kurzschlüssel, ohne gleiche Bibelstellen als Zuordnung zu raten", () => {
    const value = setup((data) => {
      const base = data.paths[0]!.reviews[0]!;
      data.paths[0]!.reviews = [];
      data.reviews = ["journal:j1", "j:j1", "reflection:r1", "r:r1", "path:p1", "journal:j2"].map((sourceKey, i) =>
        ({ ...base, id: "linked-" + i, sourceKey }));
      data.reviews.push({ ...base, id: "direct", pathId: "p1", sourceKey: "unbekannte-alte-Quelle" });
      data.journal[1]!.ref = data.journal[0]!.ref;
    });
    const reviews = result(value).moments.filter((m) => m.kind === "review");
    expect(reviews.map((m) => m.id).sort()).toEqual(["direct", "linked-0", "linked-1", "linked-2", "linked-3", "linked-4"]);
    expect(reviews.every((m) => m.locations[0]?.category === "reviews")).toBe(true);
  });
  it("berücksichtigt beide ausdrücklichen Journal-Linkfelder und verwechselt keine fehlende ID mit undefined", () => {
    const value = setup((data) => {
      const base = data.paths[0]!.reviews[0]!;
      data.journal[1]!.id = "undefined";
      data.reviews = [{ ...base, id: "unlinked", sourceKey: "journal:undefined" }];
    });
    expect(result(value).moments.some((m) => m.id === "unlinked")).toBe(false);
    const linked = setup((data) => {
      data.paths[0]!.links.push({ id: "explicit", journalId: "j1", entryId: "j2" });
      data.reviews = [{ ...data.paths[0]!.reviews[0]!, id: "entry", sourceKey: "journal:j2" }];
    });
    expect(result(linked).moments.some((m) => m.id === "entry")).toBe(true);
  });
  it("zeigt einen echten Spiegel nur einmal und bewahrt beide exakten Archivpositionen", () => {
    const value = setup((data) => { data.reviews = [{ ...data.paths[0]!.reviews[0]!, pathId: "p1" }]; });
    const reviews = result(value).moments.filter((m) => m.kind === "review");
    expect(reviews).toHaveLength(1);
    expect(reviews[0]?.conflictingIdentity).toBe(false);
    expect(reviews[0]?.locations).toEqual([
      { category: "paths", index: 0, section: "reviews", recordIndex: 0 }, { category: "reviews", index: 0 },
    ]);
  });
  it("bewahrt abweichende Originalfassungen derselben ID und rät dann keinen Meilensteinbezug", () => {
    const value = setup((data) => {
      data.reviews = [{ ...data.paths[0]!.reviews[0]!, text: "Ein abweichender damaliger Wortlaut.", pathId: "p1" }];
      data.paths[0]!.milestones[0]!.reviewId = "review1";
    });
    const history = result(value), reviews = history.moments.filter((m) => m.kind === "review");
    expect(reviews).toHaveLength(2);
    expect(reviews.every((m) => m.conflictingIdentity)).toBe(true);
    expect(new Set(reviews.map((m) => m.key)).size).toBe(2);
    expect(history.moments.find((m) => m.kind === "milestone")?.reviewKey).toBeUndefined();
  });
  it("verbindet einen eindeutigen Originalmeilenstein mit seinem tatsächlichen Rückblick", () => {
    const value = setup((data) => { data.paths[0]!.milestones[0]!.reviewId = "review1"; });
    const history = result(value), review = history.moments.find((m) => m.kind === "review")!;
    expect(history.moments.find((m) => m.kind === "milestone")?.reviewKey).toBe(review.key);
  });
  it("kennzeichnet widersprüchliche ursprüngliche Pfadbezüge und bindet sie nicht stillschweigend", () => {
    const value = setup((data) => {
      data.paths[0]!.reviews[0]!.pathId = "anderer-Pfad";
      data.paths[0]!.milestones[0]!.reviewId = "review1";
    });
    const history = result(value);
    expect(history.moments.find((m) => m.kind === "review")?.conflictingAssociation).toBe(true);
    expect(history.moments.find((m) => m.kind === "milestone")?.reviewKey).toBeUndefined();
  });
  it("erfindet weder fehlende Datierungen noch Snapshots aus heutigen Namen oder Importdaten", () => {
    const value = setup((data) => {
      data.paths[0]!.reviews[0]!.date = "kein ursprüngliches Datum";
      data.paths[0]!.reviews[0]!.sourceSnapshot = { key: "falsche-Quelle", title: "Nicht zuordenbar", text: "Nicht übernehmen.", at: "2026-11-01" };
      data.paths[0]!.milestones[0]!.date = "2026-02-30";
      data.paths[0]!.milestones[0]!.text = "";
    });
    value.goal.title = "Mein heutiger neuer Titel";
    const history = result(value);
    expect(history.originalTitle).toBe("In Ruhe zuhören");
    expect(history.moments.every((m) => m.date === null)).toBe(true);
    expect(history.moments.find((m) => m.kind === "review")?.snapshot).toBeNull();
    expect(history.moments.find((m) => m.kind === "milestone")?.text).toBe("");
  });
  it("weist veränderte Quellbytes, Fingerabdrücke und nicht belegte Vorhabenherkunft zurück", () => {
    for (const change of [
      (v: ReturnType<typeof setup>) => { v.receipt.sourceText += " "; },
      (v: ReturnType<typeof setup>) => { v.receipt.fingerprint = "0".repeat(64); },
      (v: ReturnType<typeof setup>) => { v.goal.origin!.entityHash = "0".repeat(64); },
      (v: ReturnType<typeof setup>) => { v.receipt.entities[v.goal.origin!.sourceKeys[0]!] = "0".repeat(64); },
      (v: ReturnType<typeof setup>) => { v.goal.origin = undefined; },
    ]) {
      const value = setup(); change(value);
      expect(legacyPathHistory(value.receipt, value.goal).status).toBe("unavailable");
    }
  });
});

describe("bewusst geöffnete vollständige Originalhistorie", () => {
  it("erschließt frühere Vorhaben aus derselben geprüften Quelle ohne heutiges Vorhaben wiederherzustellen", () => {
    const value = setup(); value.data.goals = []; value.data.notes = [];
    const before = JSON.stringify(value.data), reader = legacyArchiveReader(value.receipt);
    expect(reader.status).toBe("ok");
    if (reader.status !== "ok") throw new Error(reader.reason);
    expect(reader.paths).toEqual([{ id: "p1", title: "In Ruhe zuhören", archived: false, index: 0 }]);
    expect(reader.readPath("p1")).toMatchObject({ status: "ok", originalTitle: "In Ruhe zuhören", moments: [
      { kind: "review", text: "Damals hat mich diese Frage bewegt." }, { kind: "milestone", text: "Ein kleiner Anfang." },
    ] });
    expect(JSON.stringify(value.data)).toBe(before);
    expect(value.data.goals).toEqual([]);
  });
  it("trennt belegte Wegbezüge von wirklich nicht zugeordneten ursprünglichen Rückblicken", () => {
    const value = setup((data) => {
      const review = data.paths[0]!.reviews[0]!;
      data.reviews = [{ ...review }, { ...review, id: "linked", sourceKey: "r:r1" },
        { ...review, id: "unassigned", sourceKey: "journal:j2" },
        { ...review, id: "missing-path", pathId: "früher-gelöscht", sourceKey: "path:früher-gelöscht" }];
    });
    const reader = legacyArchiveReader(value.receipt);
    if (reader.status !== "ok") throw new Error(reader.reason);
    expect(reader.unassigned.map((m) => m.id).sort()).toEqual(["missing-path", "unassigned"]);
    expect(reader.unassigned.every((m) => m.locations[0]?.category === "reviews")).toBe(true);
    expect(reader.readPath("p1")).toMatchObject({ status: "ok", moments: expect.arrayContaining([{ ...result(value).moments.find((m) => m.id === "linked")! }]) });
  });
  it("bezeichnet widersprechende unzugeordnete Fassungen statt sie mit einer Wegfassung zu verschmelzen", () => {
    const value = setup((data) => { data.reviews = [{ ...data.paths[0]!.reviews[0]!, sourceKey: "unbekannt", text: "Andere ursprüngliche Fassung." }]; });
    const reader = legacyArchiveReader(value.receipt);
    if (reader.status !== "ok") throw new Error(reader.reason);
    expect(reader.unassigned).toHaveLength(1);
    expect(reader.unassigned[0]).toMatchObject({ conflictingIdentity: true, text: "Andere ursprüngliche Fassung." });
  });
  it("hält die einmal geprüfte Ansicht an ihren ursprünglichen Fingerabdruck gebunden", () => {
    const value = setup(), hash = value.receipt.sourceHash, id = value.receipt.id, reader = legacyArchiveReader(value.receipt);
    if (reader.status !== "ok") throw new Error(reader.reason);
    value.receipt.sourceText += " "; value.receipt.sourceHash = "0".repeat(64);
    expect(reader.readPath("p1")).toMatchObject({ status: "ok", sourceHash: hash, archiveId: id });
    expect(legacyArchiveReader(value.receipt).status).toBe("unavailable");
  });
  it("rät keine vorhandene Originalstelle bei fehlender Auswahl und bewahrt getrennte Dateifassungen", () => {
    const first = setup(), second = setup((data) => { data.paths[0]!.reviews[0]!.text = "Eine spätere Originalfassung."; });
    const a = legacyArchiveReader(first.receipt), b = legacyArchiveReader(second.receipt);
    if (a.status !== "ok" || b.status !== "ok") throw new Error("Expected verified originals");
    expect(a.archiveId).not.toBe(b.archiveId);
    expect(a.readPath("nicht-vorhanden").status).toBe("unavailable");
    expect(a.readPath("p1")).toMatchObject({ moments: expect.arrayContaining([expect.objectContaining({ text: "Damals hat mich diese Frage bewegt." })]) });
    expect(b.readPath("p1")).toMatchObject({ moments: expect.arrayContaining([expect.objectContaining({ text: "Eine spätere Originalfassung." })]) });
  });
  it("erschließt erhaltene globale Rückblicke auch aus Originaldateien ohne persönliche Wege", () => {
    const value = setup((data) => {
      const review = data.paths[0]!.reviews[0]!; data.paths = [];
      for (const item of [...data.journal, ...data.reflections]) item.pathIds = [];
      data.reviews = [{ ...review, id: "retained", confirmedDevelopment: true }];
    });
    const reader = legacyArchiveReader(value.receipt);
    if (reader.status !== "ok") throw new Error(reader.reason);
    expect(reader.paths).toEqual([]);
    expect(reader.unassigned).toMatchObject([{ id: "retained", originallyConfirmed: true }]);
    expect(value.data.growthStage).toBe(0);
  });
});
