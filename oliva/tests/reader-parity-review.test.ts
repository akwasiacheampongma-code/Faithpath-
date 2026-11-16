import { beforeEach, describe, expect, it, vi } from "vitest";
const storage = vi.hoisted(() => ({
  readData: vi.fn(), writeData: vi.fn(), readRecovery: vi.fn(),
}));
vi.mock("../src/services/storage", () => storage);

import { initialData, type AppData } from "../src/state/model";
import { useApp } from "../src/state/store";
import { captureDraft, captureSourceForReference } from "../src/features/personal/capture-model";
import { journalDraft, saveDraft } from "../src/features/personal/model";
import { captureKey } from "../src/features/personal/capture-schema-current";
import type { DraftOf, DraftStamp } from "../src/features/personal/schema";

const focus = { book: "JHN", chapter: 6, from: 35, to: 37 };
const words = "  Dieser Bereich bleibt meine Quelle.\n  ";
function seed() {
  const data = initialData();
  data.revision = 4;
  data.reading = { ...focus };
  data.readChapters = ["MRK:4"]; // Detect accidental growth catch-up.
  return data;
}
async function holdNextWrite() {
  let release!: () => void;
  storage.writeData.mockImplementationOnce(() => new Promise<void>((resolve) => {
    release = resolve;
  }));
  const background = journalDraft();
  background.values.text = "Eine getrennte Hintergrundnotiz.";
  const pending = useApp.getState().saveEditorDraft(background, null);
  await vi.waitFor(() => expect(storage.writeData).toHaveBeenCalledTimes(1));
  return { release, pending };
}
function capture(data: AppData, key: string) {
  const found = data.drafts.find((d) => d.key === key);
  if (found?.type !== "capture") throw new Error("Bereichsentwurf fehlt");
  return found;
}
beforeEach(() => {
  vi.resetAllMocks();
  storage.writeData.mockResolvedValue(undefined);
  useApp.setState({ data: seed(), ready: true, healthy: true, busy: false, error: null });
});

describe("Reader queue input ownership", () => {
  it("captures the requested reading scope before a previous background write yields", async () => {
    const gate = await holdNextWrite();
    const requested = { book: "MRK", chapter: 4, from: 35, to: 37 };
    const intended = structuredClone(requested);
    const opening = useApp.getState().openReading(requested);
    requested.book = "JHN"; requested.chapter = 6; requested.to = 40;
    gate.release(); await gate.pending;
    expect(await opening).toBe(true);
    expect(useApp.getState().data.reading).toEqual(intended);
    expect(useApp.getState().data.readingPosition).toBeNull();
    expect(useApp.getState().data.growthStage).toBe(0);
  });

  it("captures an outside-focus chapter anchor before an earlier queued write yields", async () => {
    const gate = await holdNextWrite();
    const reference = { ...focus };
    const position = { ref: { ...focus }, verse: 60, mode: "deep" as const };
    const intended = structuredClone(position);
    const remembering = useApp.getState().rememberReadingPosition(position, reference);
    position.verse = 61; position.ref.to = 40; reference.to = 40;
    gate.release(); await gate.pending;
    expect(await remembering).toBe(true);
    expect(useApp.getState().data.reading).toEqual(focus);
    expect(useApp.getState().data.readingPosition).toEqual(intended);
    expect(useApp.getState().data.growthStage).toBe(0);
  });

  it("owns the range draft words, exact source and key before its queued autosave starts", async () => {
    const gate = await holdNextWrite();
    const draft = captureDraft(captureSourceForReference({ ...focus, to: 36 }));
    draft.values.text = words;
    const intended = structuredClone(draft);
    const saving = useApp.getState().saveEditorDraft(draft, null);
    if (draft.values.source.type !== "passage") throw new Error("Quelle fehlt");
    draft.values.source.ref.to = 37;
    draft.key = captureKey(draft.values.source);
    draft.values.text = "Worte nach dem ursprünglichen Aufruf.";
    gate.release(); await gate.pending;
    expect(await saving).toMatchObject({
      id: intended.id, key: intended.key, revision: 1, values: intended.values,
    });
    expect(capture(useApp.getState().data, intended.key).values).toEqual(intended.values);
    expect(useApp.getState().data.growthStage).toBe(0);
  });

  it("keeps the original expected draft stamp while a newer autosave is pending", async () => {
    const data = seed();
    const initial = captureDraft(captureSourceForReference({ ...focus, to: 36 }));
    initial.values.text = words; saveDraft(data, initial, null);
    useApp.setState({ data });
    const existing = capture(data, initial.key);
    let release!: () => void;
    storage.writeData.mockImplementationOnce(() => new Promise<void>((resolve) => { release = resolve; }));
    const fresh = structuredClone(existing);
    fresh.values.text = "Die neuere ausdrücklich übergebene Eingabe.";
    const first = useApp.getState().saveEditorDraft(fresh, { id: existing.id, revision: existing.revision });
    await vi.waitFor(() => expect(storage.writeData).toHaveBeenCalledTimes(1));
    const expected: DraftStamp = { id: existing.id, revision: existing.revision };
    const stale = structuredClone(existing) as DraftOf<"capture">;
    stale.values.text = "Der alte Editor darf die neue Eingabe nicht überschreiben.";
    const second = useApp.getState().saveEditorDraft(stale, expected);
    expected.revision = existing.revision + 1;
    release(); expect(await first).not.toBeNull();
    expect(await second).toBeNull();
    expect(capture(useApp.getState().data, initial.key).values.text).toBe(fresh.values.text);
    expect(storage.writeData).toHaveBeenCalledTimes(1);
  });
  it("does not use a subsequently changed stamp to commit a newer range draft", async () => {
    const data = seed();
    const initial = captureDraft(captureSourceForReference({ ...focus, to: 36 }));
    initial.values.text = words; saveDraft(data, initial, null);
    useApp.setState({ data });
    const existing = capture(data, initial.key);
    let release!: () => void;
    storage.writeData.mockImplementationOnce(() => new Promise<void>((resolve) => { release = resolve; }));
    const fresh = structuredClone(existing);
    fresh.values.text = "Neue Worte, die der alte Bestätigungsaufruf noch nicht kannte.";
    const saving = useApp.getState().saveEditorDraft(fresh, { id: existing.id, revision: existing.revision });
    await vi.waitFor(() => expect(storage.writeData).toHaveBeenCalledTimes(1));
    const expected: DraftStamp = { id: existing.id, revision: existing.revision };
    const finishing = useApp.getState().finishEditorDraft(existing.key, expected);
    expected.revision = existing.revision + 1;
    release(); expect(await saving).not.toBeNull();
    expect(await finishing).toBeNull();
    expect(useApp.getState().data.notes).toEqual([]);
    expect(capture(useApp.getState().data, initial.key).values.text).toBe(fresh.values.text);
    expect(storage.writeData).toHaveBeenCalledTimes(1);
  });

});
