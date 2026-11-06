import { describe, it, expect } from "vitest";
import { createHash } from "node:crypto";
import { sha256, utf8Length, canonicalJson } from "../src/lib/hash";
import { initialData, decodeData, parseBackup, grow } from "../src/state/model";
import {
  prepareImport,
  applyImport,
  archiveData,
  sourceKey,
  legacyReference,
} from "../src/features/imports/model";
import { parseFaithpath } from "../src/features/imports/source";
import { faithpathFixture, sourceDate } from "./fixtures/faithpath-v5";
const at = "2026-11-06T11:00:00.000Z";
describe("FaithPath-V5-Prüfung und Zuordnung", () => {
  it("erfindet keine Verknüpfung für eine alte ID mit dem Wort undefined", () => {
    const input = faithpathFixture();
    input.data.journal[1]!.id = "undefined";
    const plan = prepareImport(JSON.stringify(input), initialData(), at);
    expect(
      plan.notes.find((n) => n.origin?.sourceId === "undefined")?.goalIds,
    ).toEqual([]);
  });
  it("berechnet standardkonforme UTF-8-Fingerabdrücke und kanonische Objektidentität", () => {
    for (const value of [
      "",
      "abc",
      "ä 👋 \ud800",
      "0123456789".repeat(10000),
    ]) {
      expect(sha256(value)).toBe(
        createHash("sha256").update(value).digest("hex"),
      );
      expect(utf8Length(value)).toBe(Buffer.byteLength(value));
    }
    expect(canonicalJson({ b: 2, a: { z: 0, x: 1 } })).toBe(
      canonicalJson({ a: { x: 1, z: 0 }, b: 2 }),
    );
  });
  it("prüft rein lesend, führt nur belegte Spiegel zusammen und bewahrt sämtliche Originalbytes", () => {
    const current = initialData(),
      before = JSON.stringify(current),
      text = JSON.stringify(faithpathFixture(), null, 2) + "\n";
    const plan = prepareImport(text, current, at);
    expect(JSON.stringify(current)).toBe(before);
    expect(plan.receipt.counts).toEqual({
      paths: 1,
      notes: 2,
      highlights: 2,
      chapters: 1,
      mirrors: 1,
      conflicts: 0,
    });
    expect(plan.goals[0]?.steps[0]).toMatchObject({
      done: true,
      completedAt: "2026-11-02T10:00:00.000Z",
    });
    expect(plan.notes[0]?.goalIds).toEqual([sourceKey("path", "p1")]);
    expect(plan.notes[0]?.ref).toEqual({
      book: "MRK",
      chapter: 4,
      from: 35,
      to: 41,
    });
    expect(plan.notes[1]?.ref).toBeUndefined();
    expect(plan.notes[1]?.origin?.referenceLabel).toContain("OTB");
    expect(plan.receipt.sourceText).toBe(text);
    expect(archiveData(plan.receipt).unknownFutureField).toEqual({
      keep: "Unverändert erhalten.",
    });
    applyImport(current, plan);
    grow(current);
    expect(current.growthStage).toBe(0);
    expect(current.readChapters).toEqual(["MRK:4"]);
    expect(current.readSteps).toEqual([]);
    expect(current.settings.theme).toBe("light");
    expect(current.reading).toEqual({ book: "MRK", chapter: 4 });
    expect(parseBackup(JSON.stringify(current))).toEqual(current);
    expect(
      JSON.parse(current.imports[0]!.sourceText).unknownEnvelopeField,
    ).toBe("Auch erhalten.");
  });
  it("ist idempotent bei neuem Exportdatum, JSON-Formatierung und Objekt-Schlüsselreihenfolge", () => {
    const input = faithpathFixture(),
      current = initialData();
    applyImport(current, prepareImport(JSON.stringify(input), current, at));
    input.exported = at;
    const second = prepareImport(JSON.stringify(input, null, 3), current, at);
    expect(second.alreadyImported).toBe(true);
    expect(() => applyImport(current, second)).toThrow(/bereits/);
    expect(current.notes).toHaveLength(2);
  });
  it("bewahrt lokale Änderungen und Löschungen auch bei einer später veränderten Quelldatei", () => {
    const input = faithpathFixture(),
      current = initialData();
    applyImport(current, prepareImport(JSON.stringify(input), current, at));
    current.notes[0]!.text = "Meine heutige Fassung.";
    current.notes.splice(1, 1);
    current.goals[0]!.title = "Mein heutiger Titel";
    current.highlights["MRK:4:35"] = "gold";
    input.data.journal[0]!.text = "Eine inzwischen andere Fassung.";
    input.data.paths[0]!.title = "Ein anderer alter Titel";
    const plan = prepareImport(JSON.stringify(input), current, at);
    expect(plan.receipt.counts.conflicts).toBeGreaterThanOrEqual(3);
    applyImport(current, plan);
    expect(current.goals).toHaveLength(1);
    expect(current.goals[0]?.title).toBe("Mein heutiger Titel");
    expect(current.notes[0]?.text).toBe("Meine heutige Fassung.");
    expect(current.notes.some((n) => n.text.includes("OTB erkennbar"))).toBe(
      false,
    );
    expect(current.highlights["MRK:4:35"]).toBe("gold");
    // Known aliases do not recreate a second native copy; both new source
    // versions remain available in the new immutable archive.
    expect(current.notes).toHaveLength(1);
    expect(archiveData(current.imports[1]!).journal[0]?.text).toBe(
      "Eine inzwischen andere Fassung.",
    );
  });
  it("bewahrt abweichende Spiegel und zufällig identische Gedanken getrennt", () => {
    const input = faithpathFixture();
    input.data.reflections[0]!.text = "Meine andere Frage.";
    expect(
      prepareImport(JSON.stringify(input), initialData(), at).notes,
    ).toHaveLength(3);
    delete (input.data.journal[0] as { reflectionId?: string }).reflectionId;
    input.data.reflections[0]!.text = input.data.journal[0]!.text;
    expect(
      prepareImport(JSON.stringify(input), initialData(), at).notes,
    ).toHaveLength(3);
  });
  it("archiviert nicht verlustfrei abbildbare Wege und überlange Gedanken, ohne sie zu kürzen", () => {
    const input = faithpathFixture();
    input.data.paths[0]!.steps[0]!.completedAt = "";
    input.data.journal[1]!.text = "a".repeat(10001);
    const plan = prepareImport(JSON.stringify(input), initialData(), at);
    expect(plan.goals).toHaveLength(0);
    expect(plan.notes).toHaveLength(1);
    expect(archiveData(plan.receipt).journal[1]!.text).toHaveLength(10001);
    expect(
      plan.rows.filter((r) => r.status === "archive").length,
    ).toBeGreaterThan(2);
  });
  it("stellt entfernte Bibelnotiz-Rollen nicht wieder her und übersetzt keine OTB-Markierungen um", () => {
    const input = faithpathFixture();
    (input.data.journal[0] as Record<string, unknown>).bibleNoteDeletedAt =
      sourceDate;
    const plan = prepareImport(JSON.stringify(input), initialData(), at);
    expect(
      plan.notes.find((n) => n.origin?.sourceId === "j1")?.ref,
    ).toBeUndefined();
    expect(plan.highlights["JHN:14:27"]).toBeUndefined();
    expect(
      legacyReference({
        book: "joh",
        chapter: 1,
        from: 1,
        to: 999,
        translation: "l1912",
      }).ref?.to,
    ).toBe(51);
  });
  it("blockiert veraltete Vorschauen und beschädigte Originalarchive", () => {
    const current = initialData(),
      plan = prepareImport(JSON.stringify(faithpathFixture()), current, at);
    current.revision++;
    expect(() => applyImport(current, plan)).toThrow(/verändert/);
    current.revision--;
    applyImport(current, plan);
    current.imports[0]!.sourceText += " ";
    expect(() => decodeData(current)).toThrow(/beschädigt/);
  });
  it("weist falsche Formate, Recovery-Dateien, doppelte IDs, unsichere Schlüssel und tote Verbindungen zurück", () => {
    for (const change of [
      (x: any) => {
        x.data.paths.push({ ...x.data.paths[0] });
      },
      (x: any) => {
        x.data.journal[0].pathIds = ["missing"];
      },
      (x: any) => {
        x.data.journal[0].reflectionId = "missing";
      },
      (x: any) => {
        x.data.highlights[0].pathIds = "p1";
      },
      (x: any) => {
        x.data.paths[0].links[0].entryId = "missing";
      },
      (x: any) => {
        x.data.paths[0].steps[0].done = "yes";
      },
      (x: any) => {
        x.schemaVersion = 6;
      },
      (x: any) => {
        x.app = "FaithPath-Recovery";
      },
    ]) {
      const x = faithpathFixture();
      change(x);
      expect(() => parseFaithpath(JSON.stringify(x))).toThrow();
    }
    for (const text of [
      "{}",
      "{",
      JSON.stringify({ version: 3 }),
      '{"version":5,"__proto__":{}}',
      JSON.stringify({ version: 5, constructor: {} }),
      "ä".repeat(5 * 1024 * 1024 + 1),
    ])
      expect(() => parseFaithpath(text)).toThrow();
  });
  it("akzeptiert den nackten V5-Zustand und numerische Alt-IDs ohne Identitätsverlust", () => {
    const x = faithpathFixture().data;
    (x.paths[0] as any).id = 42;
    x.journal[0]!.pathIds = ["42"];
    x.reflections[0]!.pathIds = ["42"];
    expect(
      prepareImport(JSON.stringify(x), initialData(), at).goals[0]?.origin
        ?.sourceId,
    ).toBe("42");
  });
});
