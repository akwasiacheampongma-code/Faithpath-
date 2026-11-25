import raw from "../../data/story-index.json";
import illustrations from "../../data/story-illustrations.json";
import type { Reference } from "../bible/repository";

export type StoryIllustration = { alt: string; passage: string };
export const projectStoryIllustrations: Readonly<Partial<Record<string, StoryIllustration>>> = illustrations;

export type StoryIdentity = { id: string; hash: string };
export type StoryUnit = {
  id: string; title: string; referenceLabel: string; references: Required<Reference>[];
  reflection: string; sourceOrder: number; sourceNamespace: string;
  testament: "AT" | "NT"; kind: string; image: string | null;
  questions: StoryIdentity[]; questionSetHash: string; hash: string;
};
function freeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}
export const STORIES = freeze(raw.units as StoryUnit[]);
const units = new Map(STORIES.map((unit) => [unit.id, unit]));
const locations = new Map(STORIES.flatMap((unit) => unit.questions.map((q, index) =>
  [q.id, { unitId: unit.id, index }] as const)));
export const storyById = (id: string) => units.get(id) ?? null;
export const storyQuestionLocation = (id: string) => locations.get(id) ?? null;
export const normalizeStorySearch = (value: string) =>
  value.normalize("NFKC").toLocaleLowerCase("de").replace(/[^\p{L}\p{N}]/gu, "");
export function filterStories(query = "", testament = "Alle", kind = "Alle", book = "Alle") {
  const needle = normalizeStorySearch(query);
  return STORIES.filter((unit) =>
    (testament === "Alle" || unit.testament === testament) &&
    (book === "Alle" || unit.references.some((ref) => ref.book === book)) &&
    (kind === "Alle" || (kind === "Bilder" ? Boolean(unit.image || projectStoryIllustrations[unit.id]) : unit.kind === "Psalm" || unit.kind === "Briefabschnitt")) &&
    normalizeStorySearch(unit.title + unit.referenceLabel).includes(needle));
}
