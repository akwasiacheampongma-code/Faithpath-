import type { Reference } from "../bible/repository";
import { referenceSchema } from "../bible/schema";
import { canonicalJson } from "../../lib/hash";
import { captureKey, captureValuesSchema } from "./capture-schema-current";
import type { BibleCaptureSource } from "./capture-model";
import { draftSchema, type Draft, type DraftOf } from "./schema";
import type { VolatileDraft } from "./volatile-drafts";

export type BibleDraft = DraftOf<"capture"> & {
  values: DraftOf<"capture">["values"] & { source: BibleCaptureSource };
};

const missing =
  "Dieser Bibelentwurf ist nicht mehr vorhanden. Deine übrigen Entwürfe bleiben in der Sammlung.";
const mismatch =
  "Entwurf und Bibelabschnitt passen nicht zusammen. Öffne den Entwurf erneut über die Sammlung.";
const conflict =
  "Dieser Entwurf hat sich inzwischen verändert. Deine ungesicherten Worte bleiben in der Sammlung erhalten; sichere oder exportiere sie, bevor du den aktuellen Stand lädst.";

function bibleDraft(value: Draft): BibleDraft {
  const parsed = draftSchema.safeParse(value);
  if (
    !parsed.success ||
    parsed.data.type !== "capture" ||
    (parsed.data.values.source.type !== "verse" &&
      parsed.data.values.source.type !== "passage") ||
    parsed.data.key !== captureKey(parsed.data.values.source)
  )
    throw new Error(mismatch);
  return parsed.data as BibleDraft;
}

/** Authorize an exact draft route without writing or claiming held words.
 * The returned parsed copy cannot mutate either original draft. The editor's
 * useDraft hook remains responsible for adopting the held values and owner.
 */
export function resolveBibleDraft({
  draftId,
  reference,
  durable,
  held,
  settled,
}: {
  draftId: string;
  reference: Reference;
  durable: readonly Draft[];
  held: Readonly<Record<string, VolatileDraft>>;
  settled: Readonly<Record<string, true>>;
}): BibleDraft {
  if (!draftId || settled[draftId]) throw new Error(missing);
  const persistedById = durable.filter((draft) => draft.id === draftId);
  const heldById = Object.entries(held).filter(
    ([, entry]) => entry.draft.id === draftId,
  );
  if (persistedById.length > 1 || heldById.length > 1)
    throw new Error(conflict);
  const raw = heldById[0]?.[1].draft ?? persistedById[0];
  if (!raw) throw new Error(missing);
  const chosen = bibleDraft(raw);
  const persistedAtKey = durable.filter((draft) => draft.key === chosen.key);
  if (
    persistedAtKey.length > 1 ||
    (persistedById[0] && persistedById[0].key !== chosen.key) ||
    (heldById[0] && heldById[0][0] !== chosen.key)
  )
    throw new Error(conflict);

  const pending = held[chosen.key];
  const stored = persistedAtKey[0];
  // CaptureInput/useDraft selects by key. Reject a conflicting held entry even
  // when the incoming ID named a valid durable draft, so the hook cannot adopt
  // somebody else's identity or silently replace a stale draft's words.
  if (pending) {
    const pendingDraft = bibleDraft(pending.draft);
    let savedValues;
    try {
      savedValues = captureValuesSchema.parse(JSON.parse(pending.savedBytes));
    } catch {
      throw new Error(conflict);
    }
    if (
      pendingDraft.id !== chosen.id ||
      pendingDraft.key !== chosen.key ||
      (stored && stored.id !== chosen.id) ||
      savedValues.entityId !== pendingDraft.values.entityId ||
      canonicalJson(savedValues.source) !==
        canonicalJson(pendingDraft.values.source)
    )
      throw new Error(conflict);
    if (stored) {
      const storedDraft = bibleDraft(stored);
      if (
        pendingDraft.revision !== storedDraft.revision ||
        pendingDraft.values.entityId !== storedDraft.values.entityId ||
        canonicalJson(pendingDraft.values.source) !==
          canonicalJson(storedDraft.values.source) ||
        canonicalJson(savedValues) !== canonicalJson(storedDraft.values)
      )
        throw new Error(conflict);
    } else if (pendingDraft.revision !== 0) throw new Error(conflict);
  }

  const route = referenceSchema.safeParse(reference);
  const source = chosen.values.source;
  if (
    !route.success ||
    source.ref.book !== route.data.book ||
    source.ref.chapter !== route.data.chapter ||
    (source.type === "passage" &&
      (source.ref.from !== route.data.from || source.ref.to !== route.data.to))
  )
    throw new Error(mismatch);
  return chosen;
}
