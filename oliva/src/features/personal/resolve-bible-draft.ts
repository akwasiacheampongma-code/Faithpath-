import type { Reference } from "../bible/repository";
import { editionReferenceSchema } from "../bible/schema";
import { sameBibleChapter } from "../bible/reference-key";
import { resolveCaptureDraft } from "./resolve-capture-draft";
import type { BibleCaptureSource } from "./capture-model";
import { type Draft, type DraftOf } from "./schema";
import type { VolatileDraft } from "./volatile-drafts";

export type BibleDraft = DraftOf<"capture"> & {
  values: DraftOf<"capture">["values"] & { source: BibleCaptureSource };
};

export function resolveBibleDraft(args: {
  draftId: string; reference: Reference; durable: readonly Draft[];
  held: Readonly<Record<string, VolatileDraft>>; settled: Readonly<Record<string, true>>;
}): BibleDraft {
  const route = editionReferenceSchema.safeParse(args.reference);
  return resolveCaptureDraft({ ...args,
    acceptSource: (source) => source.type === "verse" || source.type === "passage",
    validateRoute: (source) => route.success &&
      (source.type === "verse" || source.type === "passage") &&
      sameBibleChapter(source.ref, route.data) &&
      (source.type !== "passage" || source.ref.from === route.data.from && source.ref.to === route.data.to),
  }) as BibleDraft;
}
