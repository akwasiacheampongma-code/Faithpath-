import { describe, expect, it } from "vitest";
import { cloneData, dataSchema, decodeData, initialData, parseBackup } from "../src/state/model";
import { forStorage, decodeStored } from "../src/services/documents";
import { faithpathFixture } from "./fixtures/faithpath-v5";
import { applyImport, prepareImport } from "../src/features/imports/model";
import { applyNotebookAction, applyNotebookEdit, notebookStamp, notebookText, type PendingNote } from "../src/features/notebook/model";
import { initialNotebookLink } from "../src/features/notebook/links";

it("übernimmt nur echte Bibelstellen und passende Fragen aus dem Direkteinstieg", () => {
  const draft = { id: "notiz-pruefung", neu: "1" };
  expect(initialNotebookLink({ ...draft, quelle: "bible", book: "MRK", chapter: "4", from: "35", to: "41" }))
    .toEqual({ kind: "bible", ref: { book: "MRK", chapter: 4, from: 35, to: 41 } });
  expect(initialNotebookLink({ ...draft, quelle: "bible", book: "MRK", chapter: "4", from: "42" })).toBeNull();
  expect(initialNotebookLink({ ...draft, quelle: "path-question", pathId: "jesus", step: "0" }))
    .toEqual({ kind: "path-question", pathId: "jesus", step: 0 });
  expect(initialNotebookLink({ ...draft, quelle: "path-question", pathId: "jesus", step: "" })).toBeNull();
  expect(initialNotebookLink({ ...draft, quelle: "story-question", storyId: "unbekannt" })).toBeNull();
});

const now = "2026-11-19T10:30:00.000Z";
const first: PendingNote = {
  targetId: "notiz-erster", copyId: "notiz-kopie", expectedStamp: null,
  text: "  Eine Überschrift  \n\nZwei Zeilen für 🌿\nmeinen Gedanken.  ",
  link: { kind: "bible", ref: { book: "JHN", chapter: 3, from: 16, to: 18 } },
  updatedAt: now,
};

describe("Notizbuch im bestehenden Profil", () => {
  it("lässt das V11-Profil bis zur ersten echten Notiz unverändert", () => {
    const data = initialData();
    const old = JSON.stringify(data);
    expect(applyNotebookEdit(data, { ...first, link: null, text: "  " }).note).toBe(null);
    expect(JSON.stringify(data)).toBe(old);
    expect(decodeData(JSON.parse(old))).toEqual(data);
    expect(() => decodeData({ ...data, notebook: [] })).toThrow();
    expect(() => decodeData({ ...data, version: 12 })).toThrow();
    expect(notebookText(first.text)).toEqual({ title: "Eine Überschrift", preview: "Zwei Zeilen für 🌿 meinen Gedanken." });
  });

  it("bewahrt das bisherige Profil, Archivbytes und freie Notiz einschließlich Papierkorb in Sicherungen", async () => {
    const data = initialData();
    const source = JSON.stringify(faithpathFixture(), null, 2);
    applyImport(data, prepareImport(source, data));
    const before = cloneData(data);
    const { note } = applyNotebookEdit(data, first);
    expect(note?.text).toBe(first.text);
    applyNotebookAction(data, first.targetId, notebookStamp(note!), "pin", now);
    applyNotebookAction(data, first.targetId, notebookStamp(data.notebook![0]!), "delete", now);
    const { notebook, version, ...still } = data;
    const { version: previousVersion, ...original } = before;
    expect(version).toBe(12);
    expect(previousVersion).toBe(11);
    expect(still).toEqual(original);
    expect(parseBackup(JSON.stringify(data))).toEqual(data);
    expect(await decodeStored(forStorage(data), async () => source)).toEqual(data);
    expect(notebook?.[0]).toMatchObject({ deletedAt: now, pinned: true });
    applyNotebookAction(data, first.targetId, notebookStamp(data.notebook![0]!), "restore", now);
    expect(data.notebook?.[0]).toMatchObject({ deletedAt: null, pinned: true });
  });

  it("hält alte und neue Fassungen auseinander und erkennt wiederholtes Schreiben derselben Kopie", () => {
    const data = initialData();
    const savedFirst = applyNotebookEdit(data, first).note!;
    const firstStamp = notebookStamp(savedFirst);
    applyNotebookEdit(data, { ...first, expectedStamp: firstStamp, text: "Fassung A" });
    const stale = { ...first, expectedStamp: firstStamp, text: "Fassung B" };
    const saved = applyNotebookEdit(data, stale);
    expect(saved).toMatchObject({ copied: true, note: { id: stale.copyId, text: "Fassung B" } });
    expect(applyNotebookEdit(data, stale).changed).toBe(false);
    expect(data.notebook?.map((entry) => entry.text)).toEqual(["Fassung A", "Fassung B"]);
    expect(() => applyNotebookAction(data, first.targetId, firstStamp, "delete", now)).toThrow(/geändert/);
    expect(() => applyNotebookAction(data, first.targetId, notebookStamp(data.notebook![0]!), "purge", now)).toThrow(/Status/);
    expect(dataSchema.parse(data)).toEqual(data);
  });

  it("erkennt eine wiederhergestellte abweichende Fassung mit derselben Revision", () => {
    const data = initialData();
    const old = applyNotebookEdit(data, first).note!;
    const expectedStamp = notebookStamp(old);
    data.notebook = [{ ...old, text: "Fassung aus einer Sicherung" }];
    applyNotebookEdit(data, { ...first, expectedStamp, text: "Laufende Eingabe" });
    expect(data.notebook.map((entry) => entry.text)).toEqual(["Fassung aus einer Sicherung", "Laufende Eingabe"]);
  });

  it("prüft echte Verknüpfungen und lässt beschädigte V12-Importe zurückweisen", () => {
    const data = initialData();
    applyNotebookEdit(data, { ...first, link: { kind: "daily-question" } });
    expect(dataSchema.safeParse(data).success).toBe(true);
    const invalid = {
      ...data, notebook: [{ ...data.notebook?.[0], link: { kind: "story-question", storyId: "unknown" } }],
    };
    expect(() => parseBackup(JSON.stringify(invalid))).toThrow(/keine gültige OLIVA-Sicherung/);
  });
});
