import { beforeEach, describe, expect, it, vi } from "vitest";
const storage = vi.hoisted(() => ({
  readData: vi.fn(),
  writeData: vi.fn(),
  readRecovery: vi.fn(),
}));
vi.mock("../src/services/storage", () => storage);
import { useApp } from "../src/state/store";
import { initialData, type AppData } from "../src/state/model";

const reference = { book: "MRK", chapter: 4, from: 35, to: 37 };
function personal(data: AppData) {
  const { revision, bookmarks, highlights, ...rest } = data;
  return rest;
}
beforeEach(async () => {
  vi.restoreAllMocks();
  vi.resetAllMocks();
  const data = initialData();
  data.revision = 6;
  data.readChapters = ["MRK:4"];
  data.growthStage = 0;
  data.bookmarks = ["JHN:6:35", "MRK:4:36"];
  data.highlights = { "JHN:6:35": "sand", "MRK:4:36": "olive" };
  storage.readData.mockResolvedValue(data);
  storage.writeData.mockResolvedValue(undefined);
  useApp.setState({ busy: false });
  await useApp.getState().hydrate();
});
describe("Growth-neutral atomic selection marks", () => {
  it("marks exactly the requested canonical span and preserves all personal and NT fields", async () => {
    const before = structuredClone(useApp.getState().data);
    expect(
      await useApp.getState().setPassageHighlight(reference, "terra"),
    ).toBe(true);
    const after = useApp.getState().data;
    expect(after.highlights).toEqual({
      "JHN:6:35": "sand",
      "MRK:4:35": "terra",
      "MRK:4:36": "terra",
      "MRK:4:37": "terra",
    });
    expect(personal(after)).toEqual(personal(before));
    expect(after.revision).toBe(7);
    expect(storage.writeData).toHaveBeenCalledExactlyOnceWith(after, 6, {});
  });
  it("does not write repeated marking/removal and removes only the selected span", async () => {
    await useApp.getState().setPassageHighlight(reference, "sage");
    const marked = useApp.getState().data;
    expect(await useApp.getState().setPassageHighlight(reference, "sage")).toBe(
      true,
    );
    expect(useApp.getState().data).toBe(marked);
    expect(storage.writeData).toHaveBeenCalledTimes(1);
    expect(await useApp.getState().setPassageHighlight(reference, null)).toBe(
      true,
    );
    const removed = useApp.getState().data;
    expect(removed.highlights).toEqual({ "JHN:6:35": "sand" });
    expect(await useApp.getState().setPassageHighlight(reference, null)).toBe(
      true,
    );
    expect(useApp.getState().data).toBe(removed);
    expect(storage.writeData).toHaveBeenCalledTimes(2);
    expect(removed.growthStage).toBe(0);
  });
  it("adds unique bookmarks and removes exactly the requested keys without affecting old bookmarks", async () => {
    const before = structuredClone(useApp.getState().data);
    expect(await useApp.getState().setPassageBookmarked(reference, true)).toBe(
      true,
    );
    expect(useApp.getState().data.bookmarks).toEqual([
      "JHN:6:35",
      "MRK:4:36",
      "MRK:4:35",
      "MRK:4:37",
    ]);
    expect(await useApp.getState().setPassageBookmarked(reference, true)).toBe(
      true,
    );
    expect(storage.writeData).toHaveBeenCalledTimes(1);
    expect(await useApp.getState().setPassageBookmarked(reference, false)).toBe(
      true,
    );
    expect(useApp.getState().data.bookmarks).toEqual(["JHN:6:35"]);
    expect(personal(useApp.getState().data)).toEqual(personal(before));
  });
  it("snapshots the requested reference before a previous write yields", async () => {
    let release!: () => void;
    storage.writeData.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          release = resolve;
        }),
    );
    const first = useApp.getState().openReading({ book: "JHN", chapter: 1 });
    await vi.waitFor(() => expect(storage.writeData).toHaveBeenCalledTimes(1));
    const requested = { ...reference };
    const pending = useApp.getState().setPassageHighlight(requested, "gold");
    requested.to = 41;
    requested.book = "JHN";
    release();
    expect(await first).toBe(true);
    expect(await pending).toBe(true);
    expect(Object.keys(useApp.getState().data.highlights).sort()).toEqual(
      ["JHN:6:35", "MRK:4:35", "MRK:4:36", "MRK:4:37"].sort(),
    );
  });
  it("preserves the complete state on storage failure and permits an explicit retry", async () => {
    const before = useApp.getState().data;
    storage.writeData.mockRejectedValueOnce(new Error("Speicher voll"));
    expect(await useApp.getState().setPassageBookmarked(reference, true)).toBe(
      false,
    );
    expect(useApp.getState().data).toBe(before);
    expect(useApp.getState().error).toBe("Speicher voll");
    expect(await useApp.getState().setPassageBookmarked(reference, true)).toBe(
      true,
    );
    expect(personal(useApp.getState().data)).toEqual(personal(before));
  });
  it("rejects invalid values before any mutation, including attempts that would otherwise be no-ops", async () => {
    const before = useApp.getState().data;
    expect(
      await useApp
        .getState()
        .setPassageHighlight({ ...reference, to: 999 }, "gold"),
    ).toBe(false);
    expect(
      await useApp.getState().setPassageHighlight(reference, "blue" as never),
    ).toBe(false);
    expect(
      await useApp.getState().setPassageBookmarked(reference, "yes" as never),
    ).toBe(false);
    expect(storage.writeData).not.toHaveBeenCalled();
    expect(useApp.getState().data).toBe(before);
  });
});

describe("Direct selected verse marks", () => {
  it("atomically changes only the selected verses, including gaps, and keeps growth and all other data", async () => {
    const before = structuredClone(useApp.getState().data);
    expect(
      await useApp
        .getState()
        .setSelectionHighlight(reference, [37, 35], "gold"),
    ).toBe(true);
    expect(useApp.getState().data.highlights).toEqual({
      ...before.highlights,
      "MRK:4:35": "gold",
      "MRK:4:37": "gold",
    });
    expect(personal(useApp.getState().data)).toEqual(personal(before));
    expect(storage.writeData).toHaveBeenCalledTimes(1);
    expect(
      await useApp.getState().setSelectionBookmarked(reference, [35, 37], true),
    ).toBe(true);
    expect(useApp.getState().data.bookmarks).toEqual([
      ...before.bookmarks,
      "MRK:4:35",
      "MRK:4:37",
    ]);
    expect(personal(useApp.getState().data)).toEqual(personal(before));
  });
  it("owns requested indices before an awaited prior write and rejects invalid selections before mutation", async () => {
    const original = structuredClone(useApp.getState().data);
    let release!: () => void;
    storage.writeData.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          release = resolve;
        }),
    );
    const first = useApp.getState().openReading({ book: "JHN", chapter: 1 });
    await vi.waitFor(() => expect(storage.writeData).toHaveBeenCalledTimes(1));
    const indices = [35, 37],
      requested = { ...reference };
    const pending = useApp
      .getState()
      .setSelectionHighlight(requested, indices, "terra");
    requested.book = "JHN";
    indices.push(36);
    release();
    await first;
    expect(await pending).toBe(true);
    expect(useApp.getState().data.highlights).toEqual({
      ...original.highlights,
      "MRK:4:35": "terra",
      "MRK:4:37": "terra",
    });
    const before = useApp.getState().data,
      writes = storage.writeData.mock.calls.length;
    for (const selected of [[], [0], [42], [35, 35], [35, 1.5]]) {
      expect(
        await useApp
          .getState()
          .setSelectionHighlight(reference, selected, "gold"),
      ).toBe(false);
      expect(
        await useApp
          .getState()
          .setSelectionBookmarked(reference, selected, true),
      ).toBe(false);
    }
    expect(storage.writeData).toHaveBeenCalledTimes(writes);
    expect(useApp.getState().data).toBe(before);
  });
});
