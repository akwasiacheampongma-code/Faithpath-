import type { AppData } from "../../state/model";
import { canonicalJson } from "../../lib/hash";
import { storyById, type StoryUnit } from "./index";
import { storyCaptureSchema, storyFingerprint, storyQuestionSchema, type StoryQuestion } from "./schema";
import {
  storyAnswerSchema, storyPositionSchema, type StoryAnswer, type StoryPosition, type StoryStudy,
} from "./state-schema";
export const storyAnswerKey = (q: Pick<StoryQuestion, "id" | "hash">) => q.id + ":" + q.hash;
export const storyAnswerStamp = (answer: StoryAnswer | null) => answer ? storyFingerprint(storyAnswerSchema.parse(answer)) : null;
export const storySetKey = (unit: StoryUnit) => unit.id + ":" + unit.questionSetHash;
export function storyCapture(unit: StoryUnit) {
  return storyCaptureSchema.parse({ type: "story", unitId: unit.id, hash: unit.hash,
    title: unit.title, question: unit.reflection, references: unit.references });
}
export function storyCaptureCurrent(source: ReturnType<typeof storyCapture>) {
  const unit = storyById(source.unitId);
  return !!unit && canonicalJson(source) === canonicalJson(storyCapture(unit));
}
export function rememberStoryPosition(study: StoryStudy, position: StoryPosition) {
  const next = storyPositionSchema.parse(position);
  if (canonicalJson(study.position) === canonicalJson(next)) return false;
  study.position = next;
  return true;
}
export function viewStoryQuestion(study: StoryStudy, unit: StoryUnit, index: number) {
  const id = unit.questions[index]?.id;
  if (!id) throw new Error("Diese Frage gehört nicht zu diesem Abschnitt.");
  const key = storySetKey(unit), previous = study.viewed[key];
  const seen = new Set(previous?.seen ?? []);
  const changed = !seen.has(id);
  seen.add(id);
  if (changed) study.viewed[key] = {
    unitId: unit.id, setHash: unit.questionSetHash, questionSet: unit.questions.map((q) => ({ ...q })),
    seen: unit.questions.filter((q) => seen.has(q.id)).map((q) => q.id),
  };
  return changed;
}
export function saveStoryAnswer(
  study: StoryStudy, unit: StoryUnit, question: StoryQuestion,
  choice: number, expected: string | null, at: string,
) {
  const snapshot = storyQuestionSchema.parse(question), key = storyAnswerKey(snapshot);
  const index = unit.questions.findIndex((q) => q.id === snapshot.id && q.hash === snapshot.hash);
  if (index < 0 || unit.id !== snapshot.unitId) throw new Error("Die Fragenfassung hat sich verändert.");
  const current = study.answers[key] ?? null;
  if (storyAnswerStamp(current) !== expected)
    throw new Error("Diese Antwort wurde inzwischen in einem anderen Fenster verändert. Lade den aktuellen Stand.");
  const next = storyAnswerSchema.parse({
    question: snapshot, choice, createdAt: current?.createdAt ?? at,
    ...(current ? { updatedAt: at } : {}), revision: (current?.revision ?? 0) + 1,
  });
  if (current && Date.parse(at) < Date.parse(current.updatedAt ?? current.createdAt))
    throw new Error("Der Zeitpunkt liegt vor dem bewahrten Antwortstand.");
  if (current?.choice === choice) return false;
  if (!current && Object.keys(study.answers).length >= 10000) throw new Error("Der Antwortspeicher ist voll.");
  study.answers[key] = next;
  viewStoryQuestion(study, unit, index);
  rememberStoryPosition(study, { unitId: unit.id, index, stage: "verstehen", setHash: unit.questionSetHash });
  return true;
}
export function storyProgress(data: AppData, unit: StoryUnit) {
  const answered = unit.questions.filter((q) => !!data.storyStudy.answers[storyAnswerKey(q)]).length;
  const seen = data.storyStudy.viewed[storySetKey(unit)]?.seen.length ?? 0;
  const read = unit.references.every((ref) => data.readChapters.includes(ref.book + ":" + ref.chapter) ||
    data.readPassages.some((key) => {
      const [b, c, from, to] = key.split(":");
      return b === ref.book && Number(c) === ref.chapter && Number(from) <= ref.from && Number(to) >= ref.to;
    }));
  return { answered, seen, total: unit.questions.length, read };
}
