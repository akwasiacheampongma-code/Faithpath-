import { beforeEach, describe, expect, it, vi } from "vitest";

const storage = vi.hoisted(() => ({
  readData: vi.fn(),
  writeData: vi.fn(),
  readRecovery: vi.fn(),
}));
vi.mock("../src/services/storage", () => storage);

import {
  initialData,
  parseBackup,
  type AppData,
} from "../src/state/model";
import { useApp } from "../src/state/store";
import {
  captureDraft,
  captureSourceForReference,
} from "../src/features/personal/capture-model";
import {
  captureKey,
  captureSourceSchema,
} from "../src/features/personal/capture-schema-current";
import {
  captureBibleContextLabel,
  captureBibleDestination,
} from "../src/features/personal/capture-presentation";
import {
  commitDraft,
  journalDraft,
  saveDraft,
} from "../src/features/personal/model";
import type { DraftOf } from "../src/features/personal/schema";
import { useVolatileDrafts } from "../src/features/personal/volatile-drafts";
import { selectionReference } from "../src/features/bible/selection";
import * as repository from "../src/features/bible/repository";

const ref = { book: "JHN", chapter: 6, from: 35, to: 36 };
const at = "2026-11-10T12:00:00.000Z";
const words = "  Meine Worte zu beiden Versen.\nAuch diese Zeile.  ";

function unrelated(data: AppData) {
  const { revision, drafts, notes, ...rest } = data;
  return rest;
}
function storedCapture(data: AppData, key: string) {
  const draft = data.drafts.find((d) => d.key === key);
  if (draft?.type !== "capture") throw new Error("Notizentwurf fehlt");
  return draft;
}
function pendingRange(data: AppData, to = 36) {
  const draft = captureDraft(captureSourceForReference({ ...ref, to }));
  draft.values.text = words;
  saveDraft(data, draft, null);
  return storedCapture(data, draft.key);
}

beforeEach(() => {
  vi.restoreAllMocks();
  vi.resetAllMocks();
  useVolatileDrafts.setState({ items: {}, settled: {} });
  useApp.setState({
    data: initialData(),
    ready: true,
    healthy: true,
    busy: false,
    error: null,
  });
  storage.writeData.mockResolvedValue(undefined);
});

describe("Independent Bible range note drafts", () => {
  it("keeps verse 35, range 35–36 and range 35–37 independent through backup and commit", () => {
    const data = initialData();
    const single = captureDraft(captureSourceForReference({ ...ref, to: 35 }));
    single.values.text = "Nur zu Vers 35.";
    saveDraft(data, single, null);
    const a = pendingRange(data, 36), b = pendingRange(data, 37);
    expect(data.drafts.map((d) => d.key)).toEqual([
      "capture:verse:JHN:6:35",
      "capture:passage:JHN:6:35:36",
      "capture:passage:JHN:6:35:37",
    ]);
    const restored = parseBackup(JSON.stringify(data));
    expect(restored).toEqual(data);
    expect(storedCapture(restored, a.key)).toMatchObject({
      id: a.id,
      revision: a.revision,
      values: { text: words, source: { type: "passage", ref } },
    });
    const before = structuredClone(unrelated(restored));
    commitDraft(restored, a.key, a, at);
    expect(restored.notes[0]).toMatchObject({
      id: a.values.entityId,
      kind: "note",
      text: words.trim(),
      ref,
      captureSource: { type: "passage", ref },
    });
    expect(restored.drafts.map((d) => d.key)).toEqual([single.key, b.key]);
    expect(unrelated(restored)).toEqual(before);
    expect(parseBackup(JSON.stringify(restored))).toEqual(restored);
  });

  it("snapshots the source when opening, and owns separate saved note/source references", () => {
    const selected = { ...ref };
    const source = captureSourceForReference(selected);
    const draft = captureDraft(source);
    selected.to = 37;
    source.ref.to = 38;
    expect(draft.values.source).toEqual({ type: "passage", ref });
    draft.values.text = words;
    const data = initialData();
    saveDraft(data, draft, null);
    const saved = storedCapture(data, draft.key);
    commitDraft(data, saved.key, saved, at);
    expect(data.notes[0]?.captureSource).toEqual({ type: "passage", ref });
    expect(data.notes[0]?.ref).toEqual(ref);
    if (saved.values.source.type !== "passage") throw new Error("Quelle fehlt");
    saved.values.source.ref.to = 40;
    expect(data.notes[0]?.captureSource).toEqual({ type: "passage", ref });
    data.notes[0]!.ref!.to = 39;
    expect(data.notes[0]?.captureSource).toEqual({ type: "passage", ref });
  });

  it("keeps the old verse source, key and destination semantics", () => {
    const source = captureSourceForReference({ ...ref, to: 35 });
    expect(source.type).toBe("verse");
    expect(captureKey(source)).toBe("capture:verse:JHN:6:35");
    expect(captureBibleDestination(source)).toEqual({
      pathname: "/lesen/[book]",
      params: { book: "JHN", chapter: 6, verse: 35 },
    });
    expect(captureBibleContextLabel(source)).toBe(
      "Dein Bibelbezug: Johannes 6,35 · Luther 1912",
    );
  });

  it("resumes the exact range and draft ID with explicit full selection and an accessible passage label", () => {
    const draft = captureDraft(captureSourceForReference(ref));
    if (draft.values.source.type !== "passage") throw new Error("Quelle fehlt");
    expect(captureBibleDestination(draft.values.source, draft.id)).toEqual({
      pathname: "/lesen/[book]",
      params: {
        book: "JHN", chapter: 6, from: 35, to: 36, verse: 35,
        selectFrom: 35, selectTo: 36, draft: draft.id,
      },
    });
    expect(captureBibleContextLabel(draft.values.source)).toBe(
      "Dein Bibelabschnitt: Johannes 6,35–36 · Luther 1912",
    );
  });

  it("refuses missing, inverted or noncanonical range boundaries instead of widening the note", () => {
    for (const invalid of [
      { book: "JHN", chapter: 6 },
      { book: "JHN", chapter: 6, from: 35 },
      { book: "JHN", chapter: 6, to: 36 },
      { ...ref, from: 36, to: 35 },
      { ...ref, from: 35.5 },
      { ...ref, from: 0 },
      { ...ref, to: 999 },
      { ...ref, chapter: 999 },
      { ...ref, book: "missing" },
    ]) expect(() => captureSourceForReference(invalid)).toThrow();
    expect(captureSourceSchema.safeParse({
      type: "passage", ref: { ...ref, to: 35 },
    }).success).toBe(false);
    expect(storage.writeData).not.toHaveBeenCalled();
  });

  it("refuses a gapped selection before creating or storing a source", () => {
    const data = initialData(), before = JSON.stringify(data);
    expect(() => pendingRangeFromSelection(data, [35, 37])).toThrow(
      "Bitte wähle zusammenhängende Verse aus.",
    );
    expect(JSON.stringify(data)).toBe(before);
    expect(storage.writeData).not.toHaveBeenCalled();
  });

  it("also refuses an apparent canonical range if its repository coverage has a hole", () => {
    const actual = repository.getPassage({ ...ref, to: 37 });
    vi.spyOn(repository, "getPassage").mockReturnValue(
      actual.filter((v) => v.n !== 36),
    );
    expect(() => captureSourceForReference({ ...ref, to: 37 })).toThrow(
      /zusammenhängende/,
    );
  });

  it("rejects a mismatched range key or blank commit without removing other drafts", () => {
    const data = initialData(), draft = pendingRange(data);
    const bad = { ...captureDraft(captureSourceForReference({ ...ref, to: 37 })), key: draft.key };
    expect(() => saveDraft(initialData(), bad, null)).toThrow(/Quelle/);
    draft.values.text = "  \n  ";
    const before = JSON.stringify(data);
    expect(() => commitDraft(data, draft.key, draft, at)).toThrow(/Worte/);
    expect(JSON.stringify(data)).toBe(before);
  });
});

function pendingRangeFromSelection(data: AppData, selected: number[]) {
  const exact = selectionReference({ book: ref.book, chapter: ref.chapter }, selected);
  const draft = captureDraft(captureSourceForReference(exact));
  draft.values.text = words;
  saveDraft(data, draft, null);
}

describe("Atomic range note persistence without reading, learning or growth", () => {
  it("keeps overdue growth unchanged on autosave, commit, edit and discard", async () => {
    const data = initialData();
    // An accidental grow() would catch up this old stage from 0 to 1.
    data.readChapters = ["MRK:4"];
    useApp.setState({ data });
    const before = structuredClone(unrelated(data));
    const draft = captureDraft(captureSourceForReference(ref));
    draft.values.text = words;
    const saved = await useApp.getState().saveEditorDraft(draft, null);
    expect(saved?.values).toEqual(draft.values);
    expect(unrelated(useApp.getState().data)).toEqual(before);
    expect(await useApp.getState().finishEditorDraft(saved!.key, saved!)).toEqual({
      result: draft.values.entityId,
    });
    expect(useApp.getState().data.notes[0]).toMatchObject({
      kind: "note", ref, captureSource: { type: "passage", ref },
    });
    expect(unrelated(useApp.getState().data)).toEqual(before);
    const edit = journalDraft(useApp.getState().data.notes[0]);
    edit.values.text = "  Meine überarbeiteten Worte.  ";
    const editing = await useApp.getState().saveEditorDraft(edit, null);
    await useApp.getState().finishEditorDraft(editing!.key, editing!);
    expect(useApp.getState().data.notes[0]).toMatchObject({
      text: edit.values.text.trim(), ref,
      captureSource: { type: "passage", ref },
    });
    const abandoned = await useApp.getState().saveEditorDraft(
      captureDraft(captureSourceForReference({ ...ref, to: 37 })), null,
    );
    await useApp.getState().finishEditorDraft(abandoned!.key, abandoned!, true);
    expect(unrelated(useApp.getState().data)).toEqual(before);
    expect(useApp.getState().data.notes).toHaveLength(1);
    expect(useApp.getState().data.drafts).toEqual([]);
  });

  it("preserves exact draft identity and whitespace on write failure, then retries the same source", async () => {
    const draft = captureDraft(captureSourceForReference(ref));
    draft.values.text = words;
    const saved = await useApp.getState().saveEditorDraft(draft, null);
    const other = await useApp.getState().saveEditorDraft(
      captureDraft(captureSourceForReference({ ...ref, to: 37 })), null,
    );
    const before = useApp.getState().data;
    storage.writeData.mockRejectedValueOnce(new Error("Speicher voll"));
    expect(await useApp.getState().finishEditorDraft(saved!.key, saved!)).toBeNull();
    expect(useApp.getState().data).toBe(before);
    expect(storedCapture(useApp.getState().data, draft.key)).toMatchObject({
      id: saved!.id, revision: saved!.revision,
      values: { text: words, source: { type: "passage", ref } },
    });
    expect(useApp.getState().error).toBe("Speicher voll");
    expect(await useApp.getState().finishEditorDraft(saved!.key, saved!)).toEqual({
      result: draft.values.entityId,
    });
    expect(useApp.getState().data.notes).toHaveLength(1);
    expect(useApp.getState().data.drafts).toEqual([other]);
  });

  it("publishes a range commit only after durable storage and rejects a duplicate pending save", async () => {
    const draft = captureDraft(captureSourceForReference(ref));
    draft.values.text = words;
    const saved = await useApp.getState().saveEditorDraft(draft, null);
    const before = useApp.getState().data;
    let release!: () => void;
    storage.writeData.mockImplementationOnce(() => new Promise<void>((resolve) => {
      release = resolve;
    }));
    const committing = useApp.getState().finishEditorDraft(saved!.key, saved!);
    expect(useApp.getState().data).toBe(before);
    expect(useApp.getState().data.notes).toEqual([]);
    expect(await useApp.getState().finishEditorDraft(saved!.key, saved!)).toBeNull();
    release();
    expect(await committing).toEqual({ result: draft.values.entityId });
    expect(useApp.getState().data.notes).toHaveLength(1);
    expect(useApp.getState().data.drafts).toEqual([]);
  });
});
