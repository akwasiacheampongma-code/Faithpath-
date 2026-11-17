import { beforeEach, describe, expect, it, vi } from "vitest";
const storage = vi.hoisted(() => ({ readData: vi.fn(), writeData: vi.fn(), readRecovery: vi.fn() }));
vi.mock("../src/services/storage", () => storage);
import { useApp } from "../src/state/store";
import { initialData, type AppData } from "../src/state/model";
import { storyById } from "../src/features/stories";
import { storyQuestions } from "../src/features/stories/catalog";
import { storyAnswerKey, storyAnswerStamp } from "../src/features/stories/model";

const unit = storyById("NS-0241")!, question = storyQuestions(unit.id)[0]!;
function personal(data: AppData) { const { revision, storyStudy, ...rest } = data; return rest; }
const position = () => ({ unitId: unit.id, index: 0, stage: "verstehen" as const, setHash: unit.questionSetHash });
beforeEach(async () => {
  vi.restoreAllMocks(); vi.resetAllMocks();
  const data = initialData(); data.revision = 7; data.readChapters = ["MRK:4"];
  data.growthStage = 0; data.bookmarks = ["JHN:6:35"];
  storage.readData.mockResolvedValue(data); storage.writeData.mockResolvedValue(undefined);
  useApp.setState({ busy: false }); await useApp.getState().hydrate();
});
describe("Original story store transactions", () => {
  it("persists even a wrong answer atomically without changing reading, NT, notes or tree", async () => {
    const before = structuredClone(useApp.getState().data);
    expect(await useApp.getState().saveStoryResponse(unit.id, question.id, question.hash, (question.correctIndex + 1) % 4, null)).toBe(true);
    const after = useApp.getState().data;
    expect(personal(after)).toEqual(personal(before));
    expect(after.storyStudy.answers[storyAnswerKey(question)]?.question).toEqual(question);
    expect(after.storyStudy.position).toEqual(position());
    expect(storage.writeData).toHaveBeenCalledExactlyOnceWith(after, 7, {});
  });
  it("keeps the complete state on failed storage, then supports explicit retry", async () => {
    const before = useApp.getState().data;
    storage.writeData.mockRejectedValueOnce(new Error("Speicher voll"));
    expect(await useApp.getState().saveStoryResponse(unit.id, question.id, question.hash, 1, null)).toBe(false);
    expect(useApp.getState().data).toBe(before);
    expect(useApp.getState().error).toBe("Speicher voll");
    expect(await useApp.getState().saveStoryResponse(unit.id, question.id, question.hash, 1, null)).toBe(true);
    expect(personal(useApp.getState().data)).toEqual(personal(before));
  });
  it("requires the actual answer stamp and rejects wrong source/hash/index before writing", async () => {
    await useApp.getState().saveStoryResponse(unit.id, question.id, question.hash, 1, null);
    const before = useApp.getState().data;
    for (const [id, hash, choice] of [["NS-0073", question.hash, 2], [unit.id, "0".repeat(64), 2], [unit.id, question.hash, 4]] as const)
      expect(await useApp.getState().saveStoryResponse(id, question.id, hash, choice, null)).toBe(false);
    expect(await useApp.getState().saveStoryResponse(unit.id, question.id, question.hash, 2, null)).toBe(false);
    expect(useApp.getState().data).toBe(before);
    expect(storage.writeData).toHaveBeenCalledTimes(1);
    const stamp = storyAnswerStamp(before.storyStudy.answers[storyAnswerKey(question)]!);
    expect(await useApp.getState().saveStoryResponse(unit.id, question.id, question.hash, 2, stamp)).toBe(true);
    expect(useApp.getState().data.storyStudy.answers[storyAnswerKey(question)]?.revision).toBe(2);
  });
  it("skipping records viewing separately, repeated navigation is a no-op, and stale sets are rejected", async () => {
    const before = structuredClone(useApp.getState().data);
    expect(await useApp.getState().rememberStoryStep(position(), 0)).toBe(true);
    const after = useApp.getState().data;
    expect(after.storyStudy.answers).toEqual({});
    expect(Object.values(after.storyStudy.viewed)[0]?.seen).toEqual([question.id]);
    expect(personal(after)).toEqual(personal(before));
    expect(await useApp.getState().rememberStoryStep(position(), 0)).toBe(true);
    expect(useApp.getState().data).toBe(after);
    expect(await useApp.getState().rememberStoryStep({ ...position(), setHash: "0".repeat(64) }, 0)).toBe(false);
    expect(storage.writeData).toHaveBeenCalledTimes(1);
  });
  it("owns the requested position before an earlier queued write yields", async () => {
    let release!: () => void;
    storage.writeData.mockImplementationOnce(() => new Promise<void>((resolve) => { release = resolve; }));
    const first = useApp.getState().openReading({ book: "JHN", chapter: 1 });
    await vi.waitFor(() => expect(storage.writeData).toHaveBeenCalledTimes(1));
    const requested = position(), pending = useApp.getState().rememberStoryStep(requested);
    requested.index = 1; requested.unitId = "NS-0073";
    release(); await first;
    expect(await pending).toBe(true);
    expect(useApp.getState().data.storyStudy.position).toEqual(position());
  });
});
