import { beforeEach, describe, expect, it, vi } from "vitest";

const storage = vi.hoisted(() => ({
  readData: vi.fn(),
  writeData: vi.fn(),
  readRecovery: vi.fn(),
}));
vi.mock("../src/services/storage", () => storage);
import { useApp } from "../src/state/store";
import { initialData, type AppData } from "../src/state/model";
import { ntChapter } from "../src/features/quiz/catalog";
import {
  answerKey,
  answerStamp,
  chapterSetHash,
  completionKey,
  completionStamp,
} from "../src/features/quiz/model";
import { prepareImport, applyImport } from "../src/features/imports/model";
import { faithpathFixture } from "./fixtures/faithpath-v5";

const chapter = ntChapter("MRK", 4)!;
const question = chapter.questions[0]!;
function personal(data: AppData) {
  const { ntStudy, revision, ...rest } = data;
  return rest;
}
beforeEach(async () => {
  vi.restoreAllMocks();
  vi.resetAllMocks();
  const data = initialData();
  data.revision = 9;
  data.name = "Ada";
  // Any accidental grow() call would now change this deliberately old stage.
  data.readChapters = ["MRK:4"];
  data.growthStage = 0;
  storage.readData.mockResolvedValue(data);
  storage.writeData.mockResolvedValue(undefined);
  useApp.setState({ busy: false });
  await useApp.getState().hydrate();
});

describe("Atomic NT study persistence without growth or reading changes", () => {
  it("hydrates without writes, then saves the actual source snapshot and preserves every other field", async () => {
    const before = structuredClone(useApp.getState().data);
    expect(storage.writeData).not.toHaveBeenCalled();
    expect(
      await useApp
        .getState()
        .saveNtResponse(question.id, question.hash, 2, null),
    ).toBe(true);
    const after = useApp.getState().data;
    expect(after.ntStudy.answers[answerKey(question)]?.question).toEqual(
      question,
    );
    expect(after.ntStudy.answers[answerKey(question)]?.choice).toBe(2);
    expect(after.revision).toBe(10);
    expect(personal(after)).toEqual(personal(before));
    expect(storage.writeData).toHaveBeenCalledExactlyOnceWith(after, 9, {});
  });

  it("checks source and optimistic stamps before a no-op, and does not rewrite a repeated valid answer", async () => {
    await useApp.getState().saveNtResponse(question.id, question.hash, 2, null);
    const before = useApp.getState().data;
    const stamp = answerStamp(before.ntStudy.answers[answerKey(question)]!);
    expect(
      await useApp
        .getState()
        .saveNtResponse(question.id, question.hash, 2, stamp),
    ).toBe(true);
    expect(useApp.getState().data).toBe(before);
    expect(storage.writeData).toHaveBeenCalledTimes(1);
    expect(
      await useApp
        .getState()
        .saveNtResponse(question.id, question.hash, 2, null),
    ).toBe(false);
    expect(useApp.getState().error).toMatch(/inzwischen/);
    expect(
      await useApp
        .getState()
        .saveNtResponse(question.id, "0".repeat(64), 2, stamp),
    ).toBe(false);
    expect(
      await useApp.getState().saveNtResponse("FP-9999", question.hash, 2, null),
    ).toBe(false);
    expect(
      await useApp
        .getState()
        .saveNtResponse(question.id, question.hash, 7, stamp),
    ).toBe(false);
    expect(storage.writeData).toHaveBeenCalledTimes(1);
    expect(useApp.getState().data).toBe(before);
  });

  it("does not announce success while storage is pending and blocks double taps", async () => {
    const before = useApp.getState().data;
    let release!: () => void;
    storage.writeData.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          release = resolve;
        }),
    );
    let settled = false;
    const pending = useApp
      .getState()
      .saveNtResponse(question.id, question.hash, 1, null)
      .then((ok) => {
        settled = true;
        return ok;
      });
    await vi.waitFor(() => expect(storage.writeData).toHaveBeenCalledTimes(1));
    expect(settled).toBe(false);
    expect(useApp.getState().data).toBe(before);
    expect(
      await useApp
        .getState()
        .saveNtResponse(question.id, question.hash, 3, null),
    ).toBe(false);
    release();
    expect(await pending).toBe(true);
    expect(
      useApp.getState().data.ntStudy.answers[answerKey(question)]?.choice,
    ).toBe(1);
  });

  it("keeps the previous state after a storage failure and permits an explicit retry", async () => {
    const before = useApp.getState().data;
    storage.writeData.mockRejectedValueOnce(new Error("Datenträger voll"));
    expect(
      await useApp
        .getState()
        .saveNtResponse(question.id, question.hash, 0, null),
    ).toBe(false);
    expect(useApp.getState().error).toBe("Datenträger voll");
    expect(useApp.getState().data).toBe(before);
    expect(
      await useApp
        .getState()
        .saveNtResponse(question.id, question.hash, 0, null),
    ).toBe(true);
    expect(storage.writeData).toHaveBeenLastCalledWith(
      useApp.getState().data,
      9,
      {},
    );
  });

  it("finishes only five saved current questions, including incorrect choices, with no other progress", async () => {
    const before = structuredClone(useApp.getState().data);
    const hash = chapterSetHash(chapter);
    expect(await useApp.getState().completeNtStudy("MRK", 4, hash, null)).toBe(
      false,
    );
    expect(storage.writeData).not.toHaveBeenCalled();
    for (const q of chapter.questions) {
      expect(
        await useApp
          .getState()
          .saveNtResponse(q.id, q.hash, (q.correctIndex + 1) % 4, null),
      ).toBe(true);
    }
    expect(
      await useApp.getState().completeNtStudy("MRK", 4, "0".repeat(64), null),
    ).toBe(false);
    expect(await useApp.getState().completeNtStudy("MRK", 4, hash, null)).toBe(
      true,
    );
    const completed = useApp.getState().data;
    expect(
      completed.ntStudy.completions[completionKey(chapter)]?.revision,
    ).toBe(1);
    expect(personal(completed)).toEqual(personal(before));
    expect(
      completionStamp(completed.ntStudy.completions[completionKey(chapter)]!),
    ).toMatch(/^[a-f0-9]{64}$/);
    expect(await useApp.getState().completeNtStudy("MRK", 4, hash, null)).toBe(
      false,
    );
    expect(useApp.getState().data).toBe(completed);
    expect(storage.writeData).toHaveBeenCalledTimes(6);
  });

  it("remembers an explicit valid question change with no duplicate writes and rejects an invalid position", async () => {
    const before = structuredClone(useApp.getState().data);
    expect(
      await useApp
        .getState()
        .rememberNtStudyPosition({ book: "JUD", chapter: 1, index: 4 }),
    ).toBe(true);
    const after = useApp.getState().data;
    expect(after.ntStudy.position).toEqual({
      book: "JUD",
      chapter: 1,
      index: 4,
    });
    expect(personal(after)).toEqual(personal(before));
    expect(
      await useApp
        .getState()
        .rememberNtStudyPosition({ book: "JUD", chapter: 1, index: 4 }),
    ).toBe(true);
    expect(
      await useApp
        .getState()
        .rememberNtStudyPosition({ book: "GEN", chapter: 1, index: 0 }),
    ).toBe(false);
    expect(storage.writeData).toHaveBeenCalledTimes(1);
    expect(useApp.getState().data).toBe(after);
  });

  it("captures a caller-owned NT position before waiting for an earlier queued write", async () => {
    let release!: () => void;
    storage.writeData.mockImplementationOnce(() => new Promise<void>((resolve) => { release = resolve; }));
    const earlier = useApp.getState().openReading({ book: "JHN", chapter: 6 });
    await vi.waitFor(() => expect(storage.writeData).toHaveBeenCalledTimes(1));
    const requested = { book: "MRK", chapter: 4, index: 0 };
    const pending = useApp.getState().rememberNtStudyPosition(requested);
    Object.assign(requested, { book: "REV", chapter: 22, index: 4 });
    release();
    expect(await earlier).toBe(true);
    expect(await pending).toBe(true);
    expect(useApp.getState().data.ntStudy.position).toEqual({ book: "MRK", chapter: 4, index: 0 });
  });

  it("rejects study actions before hydration or after failed hydration", async () => {
    for (const state of [
      { ready: false, healthy: false },
      { ready: true, healthy: false },
    ]) {
      useApp.setState(state);
      expect(
        await useApp
          .getState()
          .saveNtResponse(question.id, question.hash, 0, null),
      ).toBe(false);
      expect(
        await useApp
          .getState()
          .rememberNtStudyPosition({ book: "MRK", chapter: 4, index: 2 }),
      ).toBe(false);
    }
    expect(storage.writeData).not.toHaveBeenCalled();
  });

  it("activates an already archived original only by explicit, current-revision action and leaves all other bytes intact", async () => {
    const source = faithpathFixture();
    (source.data as unknown as Record<string, unknown>).quiz = {
      "10000": { done: "2026-10-01T09:00:00.000Z" },
      "10001": { done: "2026-10-01" },
      bogus: { done: "2026-10-01T09:00:00.000Z" },
    };
    const data = initialData();
    applyImport(data, prepareImport(JSON.stringify(source), data));
    // Model a receipt loaded through V7: its raw source exists but no active NT facts.
    data.ntStudy.legacyCompletions = [];
    data.revision = 15;
    const receipt = data.imports[0]!;
    useApp.setState({ data });
    const before = structuredClone(data);
    expect(
      await useApp
        .getState()
        .activateArchivedNtProgress(receipt.id, receipt.sourceHash, 14),
    ).toBe(false);
    expect(
      await useApp
        .getState()
        .activateArchivedNtProgress(receipt.id, "0".repeat(64), 15),
    ).toBe(false);
    expect(storage.writeData).not.toHaveBeenCalled();
    expect(
      await useApp
        .getState()
        .activateArchivedNtProgress(receipt.id, receipt.sourceHash, 15),
    ).toBe(true);
    const after = useApp.getState().data;
    expect(after.ntStudy.legacyCompletions).toHaveLength(1);
    expect(after.ntStudy.legacyCompletions[0]).toMatchObject({
      book: "MAT",
      chapter: 1,
      completedAt: "2026-10-01T09:00:00.000Z",
      importId: receipt.id,
      sourceHash: receipt.sourceHash,
    });
    expect(after.ntStudy.answers).toEqual({});
    expect(after.ntStudy.completions).toEqual({});
    expect(after.ntStudy.position).toBeNull();
    expect(personal(after)).toEqual(personal(before));
    expect(storage.writeData).toHaveBeenCalledExactlyOnceWith(after, 15, {});
    expect(
      await useApp
        .getState()
        .activateArchivedNtProgress(receipt.id, receipt.sourceHash, 16),
    ).toBe(true);
    expect(useApp.getState().data).toBe(after);
    expect(storage.writeData).toHaveBeenCalledTimes(1);
  });
});
