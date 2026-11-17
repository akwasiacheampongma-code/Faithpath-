import { describe, expect, it } from "vitest";
import { PATHS, ALL_PATHS, CURRENT_STEP_COUNT, pathById } from "../src/features/paths/catalog";
import { LIFE_TOPICS, TOPIC_PATHS, filterTopics } from "../src/features/topics/catalog";
import { isHistoricalPath, isHistoricalStep } from "../src/features/paths/historical-progress";
import { dataSchema, v9DataSchema, v10DataSchema, initialData, decodeData, markRead } from "../src/state/model";
import { initialV10Data } from "./fixtures/oliva-v10";
import { initialV9Data } from "./fixtures/oliva-v9";
import { decodeStored, forStorage } from "../src/services/documents";
import { guidedSource, captureDraft } from "../src/features/personal/capture-model";
import { saveDraft, commitDraft } from "../src/features/personal/model";
import { storyById } from "../src/features/stories";
import { storyQuestions } from "../src/features/stories/catalog";
import { saveStoryAnswer, storyCapture } from "../src/features/stories/model";
import { guidedReadingContext } from "../src/features/paths/reader-context";

const topic = TOPIC_PATHS.find((t) => t.id === "faithpath-topic-arbeit")!;
const at = "2026-11-17T06:00:00.000Z";
describe("Original life topics and immutable historical progress", () => {
  it("keeps all nine shipped paths and adds exactly 18 separately namespaced topics / 45 steps", () => {
    expect(PATHS).toHaveLength(9);
    expect(PATHS.every((p) => p.steps.length === 3 && isHistoricalPath(p.id))).toBe(true);
    expect(TOPIC_PATHS).toHaveLength(18); expect(ALL_PATHS).toHaveLength(27); expect(CURRENT_STEP_COUNT).toBe(72);
    expect(new Set(ALL_PATHS.map((p) => p.id)).size).toBe(27);
    expect(TOPIC_PATHS.reduce((n, t) => n + t.steps.length, 0)).toBe(45);
    for (const path of TOPIC_PATHS) {
      expect(path.kind).toBe("life-topic"); expect(isHistoricalPath(path.id)).toBe(false);
      expect(path.minutes).toBeUndefined(); expect(path.goals).toEqual([]);
      expect(path.steps.every((s) => s.prayer === undefined)).toBe(true);
    }
    expect(pathById("vergebung")).toBe(PATHS.find((p) => p.id === "vergebung"));
    expect(pathById("faithpath-topic-vergebung")).not.toBe(pathById("vergebung"));
  });
  it("freezes original text and keeps whitespace search useful without inventing original content", () => {
    expect(filterTopics("  über forde rung ").map((t) => t.sourceId)).toEqual(["ueberfordert"]);
    expect(filterTopics("VERGEBUNG").length).toBeGreaterThan(0);
    expect(filterTopics(" ")).toHaveLength(18); expect(filterTopics("xyz987")).toEqual([]);
    expect(() => { LIFE_TOPICS[0]!.title = "Ersetzt"; }).toThrow();
    expect(() => { TOPIC_PATHS[0]!.steps[0]!.question = "Ersetzt"; }).toThrow();
  });
  it("V10 and V9 still reject new path IDs/keys while current V11 accepts all 72 legitimate steps", () => {
    const old = initialV10Data(), key = topic.id + ":0";
    expect(v10DataSchema.safeParse(old).success).toBe(true);
    for (const patch of [{ activePath: topic.id }, { readSteps: [key] }, { readSteps: [key], completedSteps: [key] }])
      expect(v10DataSchema.safeParse({ ...old, ...patch }).success).toBe(false);
    expect(v9DataSchema.safeParse({ ...initialV9Data(), activePath: topic.id }).success).toBe(false);
    expect(isHistoricalStep(key)).toBe(false);
    expect(isHistoricalStep("jesus:0")).toBe(true);
    expect(isHistoricalStep("jesus:03")).toBe(false);
    const data = initialData(); data.activePath = topic.id;
    data.readSteps = ALL_PATHS.flatMap((p) => p.steps.map((_, i) => p.id + ":" + i));
    data.completedSteps = [...data.readSteps];
    expect(data.readSteps).toHaveLength(72); expect(dataSchema.safeParse(data).success).toBe(true);
    expect(dataSchema.safeParse({ ...data, readSteps: [...data.readSteps, topic.id + ":999"] }).success).toBe(false);
    expect(dataSchema.safeParse({ ...data, completedSteps: ["unbekannt:0"] }).success).toBe(false);
  });
  it("migrates a genuine rich V10 snapshot only in RAM, preserving story answers, notes, drafts and all older fields", async () => {
    const previous = initialV10Data(), story = storyById("NS-0241")!, question = storyQuestions(story.id)[0]!;
    previous.name = "Ada"; previous.revision = 42; previous.growthStage = 4;
    previous.readChapters = ["MRK:4"]; previous.bookmarks = ["JHN:6:35"];
    previous.highlights = { "JHN:6:35": "gold" };
    saveStoryAnswer(previous.storyStudy, story, question, 1, null, at);
    const source = storyCapture(story);
    previous.notes = [{ id: "kept-story-note", text: "Mein bereits bewahrter Gedanke.", kind: "reflection",
      createdAt: at, updatedAt: at, ref: story.references[0]!, captureSource: source }];
    const draft = captureDraft(guidedSource("jesus", 0));
    draft.revision = 1; draft.updatedAt = at; draft.values.text = "Meine noch unfertigen Worte.";
    previous.drafts = [draft];
    expect(v10DataSchema.safeParse(previous).success).toBe(true);
    const bytes = JSON.stringify(previous), migrated = decodeData(previous);
    expect(migrated).toEqual({ ...previous, version: 11 });
    expect(JSON.stringify(previous)).toBe(bytes);
    const doc = { storageVersion: 1, data: { ...previous, imports: [] } };
    const docBytes = JSON.stringify(doc);
    expect(await decodeStored(doc, async () => { throw new Error("Unexpected archive read"); })).toEqual(migrated);
    expect(JSON.stringify(doc)).toBe(docBytes);
    expect(forStorage(migrated).data.version).toBe(11);
  });
  it("preserves separately labeled OLIVA historical context with the original reflection source", () => {
    const source = guidedSource(topic.id, 0), original = LIFE_TOPICS.find((t) => t.id === topic.id)!.steps[0]!;
    expect(topic.steps[0]!.explanation).toBe(original.explanation);
    expect(source.snapshot.question).toBe(original.question);
    expect(source.snapshot.explanation).toContain(original.explanation);
    expect(source.snapshot.explanation).toContain("Ergänzender OLIVA-Hinweis:");
    expect(source.snapshot.explanation).toContain("versklavte Menschen");
    const data = initialData(), before = structuredClone(data);
    expect(() => markRead(data, { book: "JHN", chapter: 1, from: 1, to: 5 }, topic.id + ":0")).toThrow();
    expect(data).toEqual(before);
    const step = topic.steps[0]!; markRead(data, step.ref, topic.id + ":0");
    const draft = captureDraft(source); draft.values.text = "Meine eigenen Worte bleiben meine eigenen.";
    saveDraft(data, draft, null);
    const saved = data.drafts.find((d) => d.key === draft.key)!;
    commitDraft(data, saved.key, { id: saved.id, revision: saved.revision }, at);
    expect(data.completedSteps).toContain(topic.id + ":0");
    expect(data.notes[0]?.captureSource).toEqual(source);
    expect(data.notes[0]?.text).toBe("Meine eigenen Worte bleiben meine eigenen.");
    expect(data.readChapters).toEqual([]);
    expect(dataSchema.safeParse(data).success).toBe(true);
  });
  it("binds all 45 topic reading ranges exactly and rejects unrelated or forged route context", () => {
    for (const path of TOPIC_PATHS) for (const [i, step] of path.steps.entries()) {
      expect(guidedReadingContext(step.ref, path.id, String(i))).toEqual({ path, step, key: path.id + ":" + i });
      expect(guidedReadingContext({ ...step.ref, from: undefined, to: undefined }, path.id, String(i))).toBeNull();
      expect(guidedReadingContext({ ...step.ref, chapter: step.ref.chapter + 1 }, path.id, String(i))).toBeNull();
      expect(guidedReadingContext(step.ref, path.id, "0" + i)).toBeNull();
    }
    expect(guidedReadingContext(topic.steps[0]!.ref, topic.id, "99")).toBeNull();
    expect(guidedReadingContext(topic.steps[0]!.ref, "missing", "0")).toBeNull();
  });
  it("keeps separate thought sources for the same Bible passage in different life topics", () => {
    const conflict = guidedSource("faithpath-topic-streit", 0), anger = guidedSource("faithpath-topic-wut", 0);
    expect(conflict.snapshot.ref).toEqual(anger.snapshot.ref);
    expect(conflict.snapshot.title).not.toBe(anger.snapshot.title);
    expect(captureDraft(conflict).key).not.toBe(captureDraft(anger).key);
    expect(captureDraft(conflict).values.source).toEqual(conflict);
  });
});
