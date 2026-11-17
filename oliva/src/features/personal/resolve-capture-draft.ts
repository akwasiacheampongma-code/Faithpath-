import { canonicalJson } from "../../lib/hash";
import { captureKey, captureValuesSchema } from "./capture-schema-current";
import type { CaptureSource } from "./capture-schema-current";
import { draftSchema, type Draft, type DraftOf } from "./schema";
import type { VolatileDraft } from "./volatile-drafts";

type CaptureDraft = DraftOf<"capture">;

const missing =
  "Dieser Bibelentwurf ist nicht mehr vorhanden. Deine übrigen Entwürfe bleiben in der Sammlung.";
const mismatch =
  "Entwurf und Bibelabschnitt passen nicht zusammen. Öffne den Entwurf erneut über die Sammlung.";
const conflict =
  "Dieser Entwurf hat sich inzwischen verändert. Deine ungesicherten Worte bleiben in der Sammlung erhalten; sichere oder exportiere sie, bevor du den aktuellen Stand lädst.";

function captureDraft(value: Draft, accept: (source: CaptureSource) => boolean): CaptureDraft {
  const parsed = draftSchema.safeParse(value);
  if (
    !parsed.success ||
    parsed.data.type !== "capture" ||
    !accept(parsed.data.values.source) ||
    parsed.data.key !== captureKey(parsed.data.values.source)
  )
    throw new Error(mismatch);
  return parsed.data as CaptureDraft;
}

/** Authorize an exact draft route without writing or claiming held words.
 * The returned parsed copy cannot mutate either original draft. The editor's
 * useDraft hook remains responsible for adopting the held values and owner.
 */
export function resolveCaptureDraft({
  draftId,
  acceptSource,
  validateRoute,
  durable,
  held,
  settled,
}: {
  draftId: string;
  acceptSource: (source: CaptureSource) => boolean;
  validateRoute: (source: CaptureSource) => boolean;
  durable: readonly Draft[];
  held: Readonly<Record<string, VolatileDraft>>;
  settled: Readonly<Record<string, true>>;
}): CaptureDraft {
  if (!draftId || settled[draftId]) throw new Error(missing);
  const persistedById = durable.filter((draft) => draft.id === draftId);
  const heldById = Object.entries(held).filter(
    ([, entry]) => entry.draft.id === draftId,
  );
  if (persistedById.length > 1 || heldById.length > 1)
    throw new Error(conflict);
  const raw = heldById[0]?.[1].draft ?? persistedById[0];
  if (!raw) throw new Error(missing);
  const chosen = captureDraft(raw, acceptSource);
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
    const pendingDraft = captureDraft(pending.draft, acceptSource);
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
      const storedDraft = captureDraft(stored, acceptSource);
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

  if (!validateRoute(chosen.values.source)) throw new Error(mismatch);
  return chosen;
}
