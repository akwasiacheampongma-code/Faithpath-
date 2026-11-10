import { describe, it, expect } from "vitest";
import {
  decodeData,
  initialData,
  v2DataSchema,
  v5DataSchema,
  dataSchema,
} from "../src/state/model";
import {
  forStorage,
  decodeStored,
  archiveHashes,
} from "../src/services/documents";
import { prepareImport, applyImport } from "../src/features/imports/model";
import { faithpathFixture } from "./fixtures/faithpath-v5";

const at = "2026-11-06T09:00:00.000Z";
function legacyV5() {
  const { retainedReviewGrowth, invitations, ntStudy, ...data } = initialData();
  const source = {
    title: "Damals zuhören",
    why: "Meine damalige Frage",
    steps: [{ id: "s1", text: "Zuhören", done: true }],
  };
  return v5DataSchema.parse({
    ...data,
    version: 5,
    revision: 14,
    name: "Ada",
    reading: { book: "JHN", chapter: 6 },
    readingPosition: {
      ref: { book: "JHN", chapter: 6 },
      verse: 35,
      mode: "deep",
    },
    readChapters: ["MRK:4"],
    growthStage: 4,
    goals: [
      {
        id: "g1",
        title: "Heute zuhören",
        why: "Aktuelles Anliegen",
        createdAt: at,
        updatedAt: at,
        archivedAt: null,
        revision: 3,
        steps: [],
        reviews: [
          {
            id: "r1",
            text: "Meine damaligen Worte.",
            createdAt: at,
            applied: true,
            source,
          },
        ],
      },
    ],
    drafts: [
      {
        id: "d1",
        key: "review:g1",
        type: "review",
        revision: 2,
        updatedAt: at,
        values: {
          goalId: "g1",
          baseRevision: 3,
          text: "  Noch nicht fertig.\n  ",
          applied: false,
          source,
        },
      },
    ],
  });
}

describe("Eingefrorene Nutzdaten V1–V5 und neutrale Migration bis V8", () => {
  it("bewahrt alte Rückblicke und offene Entwürfe exakt, ohne ein Bearbeitungsdatum zu erfinden", async () => {
    const old = legacyV5(),
      bytes = JSON.stringify(old);
    const migrated = decodeData(old);
    expect(migrated).toEqual({
      ...old,
      version: 8,
      ntStudy: {
        answers: {},
        completions: {},
        legacyCompletions: [],
        position: null,
      },
      invitations: { enabled: false, snoozed: {}, dismissed: {} },
      retainedReviewGrowth: { reflections: 0, actions: 0 },
    });
    expect(JSON.stringify(old)).toBe(bytes);
    expect(JSON.stringify(migrated.goals)).toBe(JSON.stringify(old.goals));
    expect(migrated.goals[0]!.reviews[0]).not.toHaveProperty("updatedAt");
    expect(migrated.drafts).toEqual(old.drafts);
    expect(
      await decodeStored({ storageVersion: 1, data: old }, async () => {
        throw Error("Kein Archiv");
      }),
    ).toEqual(migrated);
    expect(forStorage(migrated).storageVersion).toBe(1);
  });
  it("erweitert alte strikte Schemas nicht still um neue Bearbeitungen", () => {
    const old = legacyV5();
    const edited = structuredClone(old);
    (edited.goals[0]!.reviews[0] as any).updatedAt = at;
    expect(v5DataSchema.safeParse(edited).success).toBe(false);
    const { imports, readingPosition, ...v2Fields } = old;
    const v2 = { ...v2Fields, version: 2 };
    expect(v2DataSchema.safeParse(v2).success).toBe(true);
    const editedV2 = structuredClone(v2);
    (editedV2.goals[0]!.reviews[0] as any).updatedAt = at;
    expect(v2DataSchema.safeParse(editedV2).success).toBe(false);
    const future = {
      ...old,
      drafts: [
        {
          ...old.drafts[0],
          type: "review-edit",
          values: {
            goalId: "g1",
            reviewId: "r1",
            baseRevision: 3,
            baseReviewHash: "0".repeat(64),
            text: "Korrektur",
            source: old.goals[0]!.reviews[0]!.source,
          },
        },
      ],
    };
    expect(v5DataSchema.safeParse(future).success).toBe(false);
    expect(() => decodeData({ ...old, version: 6 })).toThrow();
    expect(() => decodeData({ ...old, version: 7 })).toThrow();
    expect(
      dataSchema.safeParse({
        ...initialData(),
        retainedReviewGrowth: { reflections: 0, actions: 1 },
      }).success,
    ).toBe(false);
  });
  it("liest V4/V5-Archivdokumente mit exakt unveränderter Originalquelle und Revision", async () => {
    const current = initialData();
    const sourceText = JSON.stringify(faithpathFixture(), null, 2);
    applyImport(current, prepareImport(sourceText, current, at));
    current.revision = 9;
    const { retainedReviewGrowth, invitations, ntStudy, ...fields } =
      forStorage(current).data;
    for (const version of [4, 5]) {
      const old: any = { ...fields, version };
      if (version === 4) delete old.readingPosition;
      const stored = { storageVersion: 1, data: old },
        bytes = JSON.stringify(stored);
      const loaded = await decodeStored(stored, async (hash) => {
        expect(hash).toBe(current.imports[0]!.sourceHash);
        return sourceText;
      });
      expect(loaded.imports).toEqual(current.imports);
      expect(loaded.revision).toBe(9);
      expect(loaded.growthStage).toBe(current.growthStage);
      expect(archiveHashes(stored)).toEqual([current.imports[0]!.sourceHash]);
      expect(JSON.stringify(stored)).toBe(bytes);
      expect(loaded.retainedReviewGrowth).toEqual({
        reflections: 0,
        actions: 0,
      });
    }
  });
});
