import { describe, expect, it } from "vitest";
import { STORIES, filterStories, storyById } from "../src/features/stories/index";
import { storyQuestions, storySourceVariants } from "../src/features/stories/catalog";
import { storyQuestionSchema } from "../src/features/stories/schema";
import { emptyStoryStudy, storyStudySchema } from "../src/features/stories/state-schema";
import { saveStoryAnswer, storyAnswerKey, storyAnswerStamp, viewStoryQuestion, storyCapture, storyProgress, rememberStoryPosition } from "../src/features/stories/model";
import { initialData, decodeData, dataSchema, v9DataSchema, parseBackup } from "../src/state/model";
import { forStorage, decodeStored } from "../src/services/documents";
import { captureDraft } from "../src/features/personal/capture-model";
import { saveDraft, commitDraft } from "../src/features/personal/model";
import { captureKey } from "../src/features/personal/capture-schema-current";
import { captureSourceSchema as oldCapture } from "../src/features/personal/capture-schema-v9";
import { resolveCaptureDraft } from "../src/features/personal/resolve-capture-draft";
import { initialV9Data } from "./fixtures/oliva-v9";
const at = "2026-11-16T20:00:00.000Z", later = "2026-11-16T20:01:00.000Z";
const nativity = storyById("NS-0241")!, psalm = storyById("NS-0073")!, jude = storyById("NS-0420")!;

describe("The complete, original FaithPath story catalog", () => {
  it("keeps 436 units, all 2479 ordered questions, 436 prompts and 95 alternate source versions", () => {
    expect(STORIES).toHaveLength(436);
    expect(new Set(STORIES.map((s) => s.id)).size).toBe(436);
    expect(new Set(STORIES.flatMap((s) => s.references.map((r) => r.book))).size).toBe(66);
    const all = STORIES.flatMap((s) => storyQuestions(s.id));
    expect(all).toHaveLength(2479);
    expect(all.reduce((n, q) => n + q.sourceQuestionIds.length, 0)).toBe(2574);
    expect(all.filter((q) => q.explanation)).toHaveLength(174);
    expect(Object.keys(storySourceVariants)).toHaveLength(95);
    expect(all.every((q) => storyQuestionSchema.safeParse(q).success)).toBe(true);
    for (const unit of STORIES)
      expect(storyQuestions(unit.id).map(({ id, hash }) => ({ id, hash }))).toEqual(unit.questions);
  });
  it("preserves the changed alias wording and option order rather than transferring an index", () => {
    const original = storySourceVariants["FP-0010"];
    const primary = storyQuestions(storyById("NS-0112")?.id ?? "NS-0108");
    expect(original.primaryId).toBe("N-0545");
    expect(original.id).toBe("FP-0010");
    const unit = STORIES.find((s) => s.questions.some((q) => q.id === "N-0545"))!;
    const q = storyQuestions(unit.id).find((q) => q.id === "N-0545")!;
    expect(q.prompt).not.toBe(original.prompt);
    expect(q.options).not.toEqual(original.options);
    expect(q.sourceQuestionIds).toEqual(["N-0545", "FP-0010"]);
  });
  it("uses Bible order while preserving the appended original Acts11 unit identity", () => {
    const unit = storyById("FP-STORY-0391")!;
    expect(unit.references).toEqual([{ book: "ACT", chapter: 11, from: 1, to: 18 }]);
    expect(unit.sourceOrder).toBe(435);
    expect(STORIES.indexOf(unit)).toBeLessThan(STORIES.findIndex((s) => s.references[0]!.book === "REV"));
    expect(storyQuestions(storyById("NS-0324")!.id)).toHaveLength(31);
  });
  it("finds titles/references across spaces and filters all 66 books without personal-word searches", () => {
    for (const q of [" L u k a s 2 ", "Ｌｕｋａｓ２", "Lukas\u00a02"])
      expect(filterStories(q).some((s) => s.id === nativity.id)).toBe(true);
    expect(filterStories("", "NT")).toHaveLength(329);
    expect(filterStories("", "AT")).toHaveLength(107);
    expect(filterStories("", "Alle")).toHaveLength(436);
    expect(filterStories("", "Alle", "Bilder")).toHaveLength(6);
    expect(filterStories("", "Alle", "Alle", "PSA").every((s) => s.kind === "Psalm")).toBe(true);
    expect(psalm.image).toBeNull();
  });
  it("retains both Judas ranges and never calls the missing middle verses read", () => {
    expect(jude.references).toEqual([
      { book: "JUD", chapter: 1, from: 1, to: 4 },
      { book: "JUD", chapter: 1, from: 17, to: 25 },
    ]);
    const data = initialData();
    data.readPassages = ["JUD:1:1:4"];
    expect(storyProgress(data, jude).read).toBe(false);
    data.readPassages.push("JUD:1:17:25");
    expect(storyProgress(data, jude).read).toBe(true);
    expect(data.readChapters).toEqual([]);
  });
});
describe("Independent, durable story answers and voluntary reflection", () => {
  it("saves a wrong answer and the complete original question without any reading or tree change", () => {
    const data = initialData(), before = structuredClone(data), question = storyQuestions(nativity.id)[0]!;
    expect(saveStoryAnswer(data.storyStudy, nativity, question, (question.correctIndex + 1) % 4, null, at)).toBe(true);
    const { storyStudy, ...outside } = data, { storyStudy: old, ...previous } = before;
    expect(outside).toEqual(previous);
    expect(storyStudy.answers[storyAnswerKey(question)]!.question).toEqual(question);
    expect(storyStudy.answers[storyAnswerKey(question)]!.choice).not.toBe(question.correctIndex);
    expect(storyProgress(data, nativity)).toMatchObject({ answered: 1, seen: 1, read: false });
    expect(parseBackup(JSON.stringify(data))).toEqual(data);
  });
  it("requires the displayed question hash and a fresh answer stamp, preserving dates on explicit edits", () => {
    const study = emptyStoryStudy(), q = storyQuestions(nativity.id)[0]!;
    saveStoryAnswer(study, nativity, q, 0, null, at);
    const first = study.answers[storyAnswerKey(q)]!, bytes = JSON.stringify(study);
    expect(() => saveStoryAnswer(study, nativity, q, 1, null, later)).toThrow(/verändert/);
    expect(JSON.stringify(study)).toBe(bytes);
    expect(() => saveStoryAnswer(study, nativity, { ...q, hash: "a".repeat(64) }, 1, storyAnswerStamp(first), later)).toThrow();
    expect(() => saveStoryAnswer(study, nativity, q, 4, storyAnswerStamp(first), later)).toThrow();
    saveStoryAnswer(study, nativity, q, 1, storyAnswerStamp(first), later);
    expect(study.answers[storyAnswerKey(q)]).toMatchObject({ createdAt: at, updatedAt: later, revision: 2, choice: 1 });
    const after = JSON.stringify(study);
    expect(saveStoryAnswer(study, nativity, q, 1, storyAnswerStamp(study.answers[storyAnswerKey(q)]!), later)).toBe(false);
    expect(JSON.stringify(study)).toBe(after);
  });
  it("records a skip separately from an answer and keeps the complete set's original order", () => {
    const data = initialData(), study = data.storyStudy;
    expect(viewStoryQuestion(study, nativity, 2)).toBe(true);
    expect(viewStoryQuestion(study, nativity, 0)).toBe(true);
    const record = study.viewed[nativity.id + ":" + nativity.questionSetHash]!;
    expect(record.seen).toEqual([nativity.questions[0]!.id, nativity.questions[2]!.id]);
    expect(record.questionSet).toEqual(nativity.questions);
    expect(study.answers).toEqual({});
    expect(viewStoryQuestion(study, nativity, 0)).toBe(false);
    expect(storyStudySchema.safeParse(study).success).toBe(true);
    const bytes = JSON.stringify(study);
    expect(() => viewStoryQuestion(study, nativity, 99)).toThrow();
    expect(JSON.stringify(study)).toBe(bytes);
  });
  it("remembers arbitrary-length unit positions, rejects a nonexistent question, and validates restored map keys", () => {
    const study = emptyStoryStudy(), unit = storyById("NS-0324")!;
    expect(rememberStoryPosition(study, { unitId: unit.id, index: 30, stage: "verstehen", setHash: unit.questionSetHash })).toBe(true);
    expect(rememberStoryPosition(study, { ...study.position! })).toBe(false);
    expect(() => rememberStoryPosition(study, { ...study.position!, index: 31 })).toThrow();
    viewStoryQuestion(study, unit, 30);
    const [key, value] = Object.entries(study.viewed)[0]!;
    expect(storyStudySchema.safeParse({ ...study, viewed: { wrong: value } }).success).toBe(false);
    expect(storyStudySchema.safeParse({ ...study, viewed: { [key]: { ...value, unitId: psalm.id } } }).success).toBe(false);
  });
  for (const unit of [nativity, jude]) it("saves a real collection reflection and exact draft source for " + unit.id, () => {
    const data = initialData(), source = storyCapture(unit), draft = captureDraft(source);
    draft.values.text = "  Meine eigenen Worte.\nDie zweite Zeile bleibt.  ";
    saveDraft(data, draft, null);
    expect(data.notes).toHaveLength(0);
    expect(data.drafts[0]!.key).toBe(captureKey(source));
    const stored = data.drafts[0]!;
    commitDraft(data, stored.key, stored, at);
    expect(data.notes[0]!.kind).toBe("reflection");
    expect(data.notes[0]!.captureSource).toEqual(source);
    expect(data.notes[0]!.text).toBe("Meine eigenen Worte.\nDie zweite Zeile bleibt.");
    expect(data.notes[0]!.ref).toEqual(unit.references.length === 1 ? unit.references[0] : undefined);
    expect(data.readChapters).toEqual([]);
    expect(data.readPassages).toEqual([]);
    expect(dataSchema.safeParse(data).success).toBe(true);
    expect(parseBackup(JSON.stringify(data))).toEqual(data);
  });
  it("authorizes a real story draft and rejects another unit or a forged Bible-draft route", () => {
    const data = initialData(), draft = captureDraft(storyCapture(nativity));
    draft.values.text = "Mein angefangener Gedanke.";
    saveDraft(data, draft, null);
    const args = { draftId: data.drafts[0]!.id, durable: data.drafts, held: {}, settled: {},
      acceptSource: (s: any) => s.type === "story", validateRoute: (s: any) => s.unitId === nativity.id };
    expect(resolveCaptureDraft(args)).toEqual(data.drafts[0]);
    expect(() => resolveCaptureDraft({ ...args, validateRoute: (s) => s.type === "story" && s.unitId === jude.id })).toThrow();
    expect(() => resolveCaptureDraft({ ...args, draftId: "forged" })).toThrow();
  });
});
describe("V10 migration keeps the shipped V9 graph and raw documents intact", () => {
  it("adds only the new empty story domain and version in RAM, without modifying any V9 value", async () => {
    const previous = initialV9Data();
    previous.name = "Ada"; previous.revision = 71; previous.growthStage = 4;
    previous.readPassages = ["JHN:6:35:36"];
    const bytes = JSON.stringify(previous), stored = { storageVersion: 1, data: previous };
    expect(v9DataSchema.safeParse(previous).success).toBe(true);
    expect(decodeData(previous)).toEqual({ ...previous, version: 10, storyStudy: emptyStoryStudy() });
    expect(await decodeStored(stored, async () => { throw new Error("Unexpected archive read"); })).toEqual(decodeData(previous));
    expect(JSON.stringify(previous)).toBe(bytes);
    expect(forStorage(decodeData(previous)).data.version).toBe(10);
    expect(oldCapture.safeParse(storyCapture(nativity)).success).toBe(false);
    expect(v9DataSchema.safeParse({ ...previous, storyStudy: emptyStoryStudy() }).success).toBe(false);
    expect(dataSchema.safeParse(previous).success).toBe(false);
  });
  it("does not accept a story note merely relabeled as V9 and requires the NT domain in current data", () => {
    const current = initialData(), draft = captureDraft(storyCapture(nativity));
    draft.values.text = "Eine bewahrte Reflexion."; saveDraft(current, draft, null);
    commitDraft(current, current.drafts[0]!.key, current.drafts[0]!, at);
    const { storyStudy, ...without } = current;
    expect(v9DataSchema.safeParse({ ...without, version: 9 }).success).toBe(false);
    expect(dataSchema.safeParse({ ...current, ntStudy: undefined }).success).toBe(false);
    const invalid = structuredClone(current);
    invalid.notes[0]!.ref = { book: "LUK", chapter: 2, from: 1, to: 10 };
    expect(dataSchema.safeParse(invalid).success).toBe(false);
  });
});
