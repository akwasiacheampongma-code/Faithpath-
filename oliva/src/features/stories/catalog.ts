import raw from "../../data/story-questions.json";
import { storyById } from "./index";
import { storyQuestionSchema, type StoryQuestion } from "./schema";
const bank = raw.questions as Record<string, unknown>;
const cache = new Map<string, StoryQuestion>();
export function storyQuestion(id: string): StoryQuestion | null {
  if (cache.has(id)) return cache.get(id)!;
  if (!bank[id]) return null;
  const question = storyQuestionSchema.parse(bank[id]);
  cache.set(id, question);
  return question;
}
export function storyQuestions(unitId: string) {
  const unit = storyById(unitId);
  if (!unit) throw new Error("Dieser Originalabschnitt ist nicht vorhanden.");
  return unit.questions.map(({ id, hash }) => {
    const q = storyQuestion(id);
    if (!q || q.hash !== hash) throw new Error("Die Originalfragen konnten nicht vollständig geladen werden.");
    return q;
  });
}
export const storySourceVariants = raw.sourceVariants;
