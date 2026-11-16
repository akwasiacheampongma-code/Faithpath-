import type { Href } from "expo-router";
import { referenceLabel } from "../bible/repository";
import type { BibleCaptureSource } from "./capture-model";

export function captureBibleContextLabel(source: BibleCaptureSource) {
  return `${source.type === "passage" ? "Dein Bibelabschnitt" : "Dein Bibelbezug"}: ${referenceLabel(source.ref)} · Luther 1912`;
}

// A range link restores its full logical scope and its exact action selection.
// Draft links additionally identify the existing draft; the reader validates
// that ID against the source before resuming it.
export function captureBibleDestination(
  source: BibleCaptureSource,
  draftId?: string,
): Href {
  return {
    pathname: "/lesen/[book]",
    params: {
      book: source.ref.book,
      chapter: source.ref.chapter,
      verse: source.ref.from,
      ...(source.type === "passage"
        ? {
            from: source.ref.from,
            to: source.ref.to,
            selectFrom: source.ref.from,
            selectTo: source.ref.to,
          }
        : {}),
      ...(draftId ? { draft: draftId } : {}),
    },
  };
}
