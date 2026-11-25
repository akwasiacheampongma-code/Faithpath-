import type { Href } from "expo-router";
import { BIBLE_EDITIONS, bibleEdition, readerRoute } from "../bible/editions";
import { referenceLabel } from "../bible/repository";
import type { BibleCaptureSource } from "./capture-model";

export function captureBibleContextLabel(source: BibleCaptureSource) {
  return `${source.type === "passage" ? "Dein Bibelabschnitt" : "Dein Bibelbezug"}: ${referenceLabel(source.ref)} · ${BIBLE_EDITIONS[bibleEdition(source.ref.edition)].name}`;
}

// A range link restores its full logical scope and its exact action selection.
// Draft links additionally identify the existing draft; the reader validates
// that ID against the source before resuming it.
export function captureBibleDestination(
  source: BibleCaptureSource,
  draftId?: string,
): Href {
  const { book, chapter, edition, from, to } = source.ref;
  return readerRoute(
    source.type === "passage" ? source.ref : { book, chapter, ...(edition ? { edition } : {}) },
    {
      verse: from,
      ...(source.type === "passage" ? { selectFrom: from, selectTo: to } : {}),
      ...(draftId ? { draft: draftId } : {}),
    },
  );
}
