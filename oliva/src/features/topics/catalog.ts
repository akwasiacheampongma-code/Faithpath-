import { z } from "zod";
import raw from "../../data/life-topics.json";
import { referenceSchema } from "../bible/schema";
import { getPassage } from "../bible/repository";
import type { LearningPath } from "../paths/catalog";
import { normalizeBookSearch } from "../bible/book-search";

const text = z.string().min(1).max(5000).refine((s) => !!s.trim());
const reference = z.object({ ...referenceSchema.shape, from: z.number().int().positive(), to: z.number().int().positive() })
  .strict().refine((r) => r.from <= r.to && getPassage(r).length === r.to - r.from + 1);
const topicSchema = z.object({
  id: z.string(), sourceId: z.string().regex(/^[a-z]+$/), title: text, subtitle: text,
  sourceIcon: text, category: text,
  steps: z.array(z.object({ title: text, referenceLabel: text, sourceBook: text, ref: reference,
    explanation: text, question: text }).strict()).min(2).max(3),
}).strict().refine((t) => t.id === "faithpath-topic-" + t.sourceId);
export type LifeTopic = z.infer<typeof topicSchema>;
function immutable<T>(value: T): T {
  if (value && typeof value === "object") { Object.values(value).forEach(immutable); Object.freeze(value); }
  return value;
}
export const LIFE_TOPICS = immutable(z.array(topicSchema).length(18).parse(raw.topics));
if (new Set(LIFE_TOPICS.map((t) => t.id)).size !== 18 || LIFE_TOPICS.reduce((n, t) => n + t.steps.length, 0) !== 45)
  throw new Error("Der vollständige Original-Themenkatalog ist nicht vorhanden.");
export const TOPIC_CATEGORIES: Readonly<Record<string, string>> = Object.freeze({
  vertrauen: "Vertrauen", beziehungen: "Miteinander", hoffnung: "Hoffnung", entscheidung: "Entscheidungen",
  vergebung: "Vergebung", glaube: "Glaube & Zweifel", ruhe: "Ruhe", dankbarkeit: "Dankbarkeit",
  geduld: "Geduld", disziplin: "Bewusst leben", berufung: "Arbeit & Berufung",
});
// New OLIVA editorial drafts, kept separate from unchanged FaithPath strings.
// They are neither Bible quotes nor an independent specialist approval.
const contextNotes: Readonly<Record<string, string>> = Object.freeze({
  "faithpath-topic-arbeit:0": "Diese Worte stehen in einer antiken Haustafel und richten sich an versklavte Menschen. Das ist keine Gleichsetzung mit einem heutigen Arbeitsverhältnis und keine Rechtfertigung für Sklaverei, Zwang oder Missbrauch. Für die heutige Anwendung bleiben Menschenwürde, Schutz und gerechte Verantwortung wichtig.",
  "faithpath-topic-ruhe:1": "Der Hebräerbrief verbindet Gottes Ruhe mit Schöpfung, Israels Geschichte und einer bleibenden Verheißung. Christliche Traditionen setzen bei Sabbatruhe und kommender Vollendung unterschiedliche Akzente. Der Abschnitt spricht deshalb von mehr als einer Arbeitspause.",
});
export const TOPIC_PATHS: LearningPath[] = immutable(LIFE_TOPICS.map<LearningPath>((t) => ({
  id: t.id, kind: "life-topic", sourceTopicId: t.sourceId, title: t.title, subtitle: t.subtitle,
  category: TOPIC_CATEGORIES[t.category] ?? t.category, intro: t.subtitle,
  goals: [], art: "garden", steps: t.steps.map((step, i) => ({
    title: step.title, ref: { ...step.ref }, explanation: step.explanation, question: step.question,
    ...(contextNotes[t.id + ":" + i] ? { editorialNote: contextNotes[t.id + ":" + i] } : {}),
  })),
})));
export const topicById = (id: string) => LIFE_TOPICS.find((t) => t.id === id);
export function filterTopics(query: string) {
  const key = normalizeBookSearch(query);
  return LIFE_TOPICS.filter((t) => !key || normalizeBookSearch([t.title, t.subtitle, t.sourceId, TOPIC_CATEGORIES[t.category] ?? t.category].join(" ")).includes(key));
}
