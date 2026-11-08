import { describe, expect, it } from "vitest";
import {
  dataSchema,
  decodeData,
  initialData,
  parseBackup,
  v6DataSchema,
} from "../src/state/model";
import {
  archiveHashes,
  decodeStored,
  documentRevision,
  forStorage,
} from "../src/services/documents";
import { applyImport, prepareImport } from "../src/features/imports/model";
import { goalSnapshot, reviewHash } from "../src/features/personal/model";
import {
  changeInvitationControl,
  selectInvitations,
} from "../src/features/invitations/model";
import { faithpathFixture } from "./fixtures/faithpath-v5";

const at = "2026-10-01T09:00:00.000Z";
const editedAt = "2026-11-06T09:00:00.000Z";
const optOut = { enabled: false, snoozed: {}, dismissed: {} };

// Synthetic predecessor data; never derived from a person's export.
function previousData() {
  const { invitations, ...fields } = initialData();
  const data = {
    ...fields,
    version: 6 as const,
    revision: 23,
    name: "Ada",
    onboarded: true,
    reading: { book: "JHN", chapter: 6 },
    readingPosition: {
      ref: { book: "JHN", chapter: 6 },
      verse: 35,
      mode: "deep" as const,
    },
    readChapters: ["MRK:4", "JHN:1"],
    readPassages: ["JHN:6:35:40"],
    bookmarks: ["JHN:6:35"],
    highlights: { "JHN:6:35": "olive" as const },
    growthStage: 4,
    retainedReviewGrowth: { reflections: 8, actions: 3 },
    notes: [
      {
        id: "note-1",
        text: "Meine bewahrten Worte.\nEine zweite Zeile.",
        kind: "reflection" as const,
        ref: { book: "JHN", chapter: 6, from: 35, to: 35 },
        createdAt: at,
        updatedAt: editedAt,
        goalIds: ["goal-1"],
      },
    ],
    goals: [
      {
        id: "goal-1",
        title: "Raum zum Zuhören",
        why: "Ein eigener Gedanke.",
        createdAt: at,
        updatedAt: editedAt,
        archivedAt: null,
        revision: 4,
        steps: [
          {
            id: "step-1",
            text: "Eine Frage stellen.",
            done: true,
            createdAt: at,
            completedAt: editedAt,
          },
        ],
        reviews: [
          {
            id: "review-1",
            text: "Korrigierte Worte, dieselbe damalige Erfahrung.",
            createdAt: at,
            updatedAt: editedAt,
            applied: true,
            source: {
              title: "Mein damaliger Titel",
              why: "Die damalige Frage.",
              steps: [{ id: "step-1", text: "Alter Wortlaut.", done: false }],
            },
          },
        ],
      },
    ],
  };
  const goal = data.goals[0]!;
  return v6DataSchema.parse({
    ...data,
    drafts: [
      {
        id: "draft-1",
        key: "review-edit:goal-1:review-1",
        type: "review-edit",
        revision: 3,
        updatedAt: editedAt,
        values: {
          goalId: goal.id,
          reviewId: "review-1",
          baseRevision: goal.revision,
          baseReviewHash: reviewHash(goal.reviews[0]!),
          text: "  Noch nicht fertig.\n  ",
          source: goalSnapshot(goal),
        },
      },
    ],
  });
}

describe("Neutrale V6→V7-Migration für freiwillige Einladungen", () => {
  it("ergänzt ausschließlich Version und ausgeschaltete Kontrollen, ohne Altdaten oder Revision zu verändern", () => {
    const old = previousData();
    const bytes = JSON.stringify(old);
    const migrated = decodeData(old);
    expect(migrated).toEqual({ ...old, version: 7, invitations: optOut });
    expect(JSON.stringify(old)).toBe(bytes);
    expect(migrated.revision).toBe(23);
    expect(migrated.growthStage).toBe(4);
    expect(migrated.retainedReviewGrowth).toEqual({
      reflections: 8,
      actions: 3,
    });
    const draft = migrated.drafts[0]!;
    expect(draft.type).toBe("review-edit");
    if (draft.type !== "review-edit")
      throw new Error("Review-Editentwurf fehlt");
    expect(draft.values.text).toBe("  Noch nicht fertig.\n  ");
    // A caller editing the migrated view cannot mutate its input document.
    migrated.goals[0]!.reviews[0]!.text = "Spätere Änderung";
    migrated.settings.theme = "dark";
    expect(JSON.stringify(old)).toBe(bytes);
  });

  it("behält das V6-Schema strikt und ergänzt keinem Dokument stillschweigend neue Felder", () => {
    const old = previousData();
    expect(v6DataSchema.safeParse(old).success).toBe(true);
    expect(
      v6DataSchema.safeParse({ ...old, invitations: optOut }).success,
    ).toBe(false);
    expect(v6DataSchema.safeParse({ ...old, version: 7 }).success).toBe(false);
    expect(dataSchema.safeParse({ ...old, version: 7 }).success).toBe(false);
    expect(
      dataSchema.safeParse({ ...old, version: 7, invitations: optOut }).success,
    ).toBe(true);
  });

  it("liest private V1-Dokumente mit Originalarchiv bytegetreu und exportiert erst den ausdrücklich übergebenen V7-Stand", async () => {
    const current = decodeData(previousData());
    const sourceText = JSON.stringify(faithpathFixture(), null, 2);
    applyImport(current, prepareImport(sourceText, current, editedAt));
    const { invitations, ...predecessor } = current;
    const old = v6DataSchema.parse({ ...predecessor, version: 6 });
    const stored = {
      storageVersion: 1,
      data: {
        ...old,
        imports: old.imports.map(
          ({ sourceText: omitted, ...metadata }) => metadata,
        ),
      },
    };
    const bytes = JSON.stringify(stored);
    const loadedHashes: string[] = [];
    const migrated = await decodeStored(stored, async (hash) => {
      loadedHashes.push(hash);
      expect(hash).toBe(old.imports[0]!.sourceHash);
      return sourceText;
    });
    expect(migrated).toEqual({ ...old, version: 7, invitations: optOut });
    expect(migrated.imports[0]!.sourceText).toBe(sourceText);
    expect(loadedHashes).toEqual([old.imports[0]!.sourceHash]);
    expect(archiveHashes(stored)).toEqual(loadedHashes);
    expect(documentRevision(stored)).toBe(old.revision);
    expect(JSON.stringify(stored)).toBe(bytes);
    const rewritten = forStorage(migrated);
    expect(rewritten.storageVersion).toBe(1);
    expect(rewritten.data.version).toBe(7);
    expect(rewritten.data.invitations).toEqual(optOut);
    expect(rewritten.data.imports[0]).not.toHaveProperty("sourceText");
    expect(archiveHashes(rewritten)).toEqual(loadedHashes);
    expect(JSON.stringify(stored)).toBe(bytes);
  });

  it("bewahrt vorhandene V7-Entscheidungen beim Backup-Roundtrip und aktiviert alte Backups nicht", async () => {
    const old = previousData();
    const migrated = parseBackup(JSON.stringify(old));
    expect(migrated.invitations).toEqual(optOut);
    migrated.invitations = {
      enabled: true,
      snoozed: { "goal:goal-1": editedAt },
      dismissed: { "note:note-1": at },
    };
    const before = JSON.stringify(migrated);
    expect(parseBackup(before)).toEqual(migrated);
    expect(
      await decodeStored(forStorage(migrated), async () => {
        throw Error("Kein Archiv vorhanden");
      }),
    ).toEqual(migrated);
    expect(JSON.stringify(migrated)).toBe(before);
  });

  it.each(["\n", "\u2028", "\u2029"])(
    "bewahrt zulässige alte IDs mit Zeilentrenner %j bei echten Einladungsaktionen",
    (separator) => {
      const data = decodeData(previousData());
      const goal = data.goals[0]!;
      const note = data.notes[0]!;
      goal.id = `goal${separator}original`;
      note.id = `note${separator}original`;
      delete note.goalIds;
      data.drafts = [];
      data.invitations.enabled = true;
      const now = Date.parse("2027-01-01T09:00:00.000Z");
      const sourceBytes = JSON.stringify({
        goals: data.goals,
        notes: data.notes,
      });
      expect(dataSchema.parse(data)).toEqual(data);

      for (const id of [goal.id, note.id]) {
        const due = selectInvitations(data, data.invitations, now).due.find(
          (invitation) => invitation.id === id,
        )!;
        expect(due).toBeDefined();
        data.invitations = changeInvitationControl(
          data,
          data.invitations,
          due,
          "snooze",
          now,
        );
        expect(dataSchema.parse(data).invitations.snoozed[due.key]).toBe(
          "2027-01-15T09:00:00.000Z",
        );
        const deferred = selectInvitations(
          data,
          data.invitations,
          now,
        ).deferred.find((invitation) => invitation.key === due.key)!;
        data.invitations = changeInvitationControl(
          data,
          data.invitations,
          deferred,
          "resume",
          now,
        );
        expect(
          dataSchema.parse(data).invitations.snoozed[due.key],
        ).toBeUndefined();
        const resumed = selectInvitations(data, data.invitations, now).due.find(
          (invitation) => invitation.key === due.key,
        )!;
        data.invitations = changeInvitationControl(
          data,
          data.invitations,
          resumed,
          "dismiss",
          now,
        );
        expect(dataSchema.parse(data).invitations.dismissed[due.key]).toBe(
          "2027-01-01T09:00:00.000Z",
        );
      }
      expect(parseBackup(JSON.stringify(data))).toEqual(data);
      expect(JSON.stringify({ goals: data.goals, notes: data.notes })).toBe(
        sourceBytes,
      );
    },
  );

  it("lehnt ungültige Kontrollschlüssel, Datumswerte, zusätzliche Felder und zukünftige Versionen ab", async () => {
    const current = initialData();
    const invalid = [
      { enabled: true, snoozed: { "goal:": at }, dismissed: {} },
      { enabled: true, snoozed: { "note:": at }, dismissed: {} },
      { enabled: true, snoozed: { "highlight:JHN:6:35": at }, dismissed: {} },
      {
        enabled: true,
        snoozed: { [`goal:${"x".repeat(101)}`]: at },
        dismissed: {},
      },
      { enabled: true, snoozed: {}, dismissed: { "note:note-1": "gestern" } },
      {
        enabled: true,
        snoozed: {},
        dismissed: { "note:note-1": "2026-13-01T09:00:00.000Z" },
      },
      { enabled: "true", snoozed: {}, dismissed: {} },
      { ...optOut, backgroundPush: true },
    ];
    for (const invitations of invalid) {
      expect(dataSchema.safeParse({ ...current, invitations }).success).toBe(
        false,
      );
      expect(() => decodeData({ ...current, invitations })).toThrow();
    }
    expect(() => decodeData({ ...current, version: 8 })).toThrow();
    expect(() =>
      parseBackup(JSON.stringify({ ...current, version: 8 })),
    ).toThrow();
    await expect(
      decodeStored(
        { storageVersion: 1, data: { ...current, version: 8 } },
        async () => "",
      ),
    ).rejects.toThrow();
  });

  it("begrenzt Kontrollsammlungen und akzeptiert gültige Schlüssel an den ID-Längengrenzen", () => {
    const current = initialData();
    const accepted = {
      enabled: true,
      snoozed: { "goal:x": at, [`note:${"x".repeat(100)}`]: editedAt },
      dismissed: {},
    };
    expect(
      dataSchema.safeParse({ ...current, invitations: accepted }).success,
    ).toBe(true);
    const snoozed = Object.fromEntries(
      Array.from({ length: 10000 }, (_, index) => [`goal:${index}`, at]),
    );
    expect(
      dataSchema.safeParse({ ...current, invitations: { ...optOut, snoozed } })
        .success,
    ).toBe(true);
    snoozed["goal:one-too-many"] = at;
    expect(
      dataSchema.safeParse({ ...current, invitations: { ...optOut, snoozed } })
        .success,
    ).toBe(false);
    expect(
      dataSchema.safeParse({
        ...current,
        invitations: { ...optOut, dismissed: snoozed },
      }).success,
    ).toBe(false);
  });
});
