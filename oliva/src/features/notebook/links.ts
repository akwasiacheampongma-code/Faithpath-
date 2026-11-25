import type { Href } from "expo-router";
import { editionReferenceLabel, type Reference } from "../bible/repository";
import { editionReferenceSchema } from "../bible/schema";
import { readerRoute, alternateEdition } from "../bible/editions";
import { sameBibleChapter } from "../bible/reference-key";
import { pathById } from "../paths/catalog";
import { DAILY_QUESTION } from "../personal/capture-model";
import { newId } from "../personal/schema";
import { storyById } from "../stories/index";
import { notebookLinkSchema, type NotebookLink } from "./model";

export function linkDetails(link: NotebookLink): { label: string; href: Href } {
  switch (link.kind) {
    case "bible": return { label: editionReferenceLabel(link.ref), href: readerRoute(link.ref) };
    case "path": return { label: pathById(link.pathId)?.title ?? "Weg", href: { pathname: "/weg/[id]", params: { id: link.pathId } } };
    case "story": return { label: storyById(link.storyId)?.title ?? "Geschichte", href: { pathname: "/geschichte/[id]", params: { id: link.storyId } } };
    case "daily-question": return { label: DAILY_QUESTION, href: "/" };
    case "path-question": return {
      label: pathById(link.pathId)?.steps[link.step]?.question ?? "Reflexionsfrage",
      href: { pathname: "/weg/[id]", params: { id: link.pathId, step: String(link.step) } },
    };
    case "story-question": return {
      label: storyById(link.storyId)?.reflection ?? "Reflexionsfrage",
      href: { pathname: "/geschichte/[id]", params: { id: link.storyId, stage: "gedanken" } },
    };
  }
}

export type BibleNoteParams = { book?: string; chapter?: string; edition?: string; from?: string; to?: string };
export type NotebookEntryParams = BibleNoteParams & {
  id: string;
  neu?: string;
  kopie?: string;
  quelle?: string;
  pathId?: string;
  step?: string;
  storyId?: string;
};

type ContextLink = Extract<NotebookLink, { kind: "bible" | "path-question" | "story-question" }>;

export function contextualNotebookHref(link: ContextLink): Href {
  const context = link.kind === "bible" ? bibleNoteParams(link.ref)
    : link.kind === "path-question" ? { pathId: link.pathId, step: String(link.step) }
      : { storyId: link.storyId };
  return { pathname: "/notizen/[id]", params: { id: newId("notiz"), neu: "1", quelle: link.kind, ...context } };
}

export function initialNotebookLink(params: NotebookEntryParams): NotebookLink | null {
  if (params.neu !== "1") return null;
  const kind = params.quelle ?? "bible";
  if (kind !== "bible" && kind !== "path-question" && kind !== "story-question") return null;
  if (kind === "path-question" && !/^(0|[1-9]\d*)$/.test(params.step ?? "")) return null;
  const candidate = kind === "bible" ? { kind, ref: bibleNoteFilter(params) }
    : kind === "path-question" ? { kind, pathId: params.pathId, step: Number(params.step) }
      : { kind, storyId: params.storyId };
  const checked = notebookLinkSchema.safeParse(candidate);
  return checked.success ? checked.data : null;
}

export function bibleNoteFilter(params: BibleNoteParams): Reference | undefined {
  const edition = alternateEdition(params.edition);
  if (params.edition && !edition) return undefined;
  const parsed = editionReferenceSchema.safeParse({
    book: params.book, chapter: Number(params.chapter),
    ...(edition ? { edition } : {}),
    from: params.from ? Number(params.from) : undefined,
    to: params.to ? Number(params.to) : undefined,
  });
  return parsed.success ? parsed.data : undefined;
}

export function bibleNoteParams(ref?: Reference): BibleNoteParams {
  return ref ? { book: ref.book, chapter: String(ref.chapter), ...(ref.edition ? { edition: ref.edition } : {}),
    from: ref.from?.toString(), to: ref.to?.toString() } : {};
}

export function linksChapter(link: NotebookLink | null, ref: Reference) {
  return link?.kind === "bible" && sameBibleChapter(link.ref, ref);
}
