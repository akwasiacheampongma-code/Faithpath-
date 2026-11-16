import { describe, expect, it } from "vitest";
import type { Reference } from "../src/features/bible/repository";
import {
  captureDraft,
  captureSourceForReference,
  dailySource,
} from "../src/features/personal/capture-model";
import { captureKey } from "../src/features/personal/capture-schema-current";
import {
  resolveBibleDraft,
  type BibleDraft,
} from "../src/features/personal/resolve-bible-draft";
import type { Draft } from "../src/features/personal/schema";
import type { VolatileDraft } from "../src/features/personal/volatile-drafts";

const chapter = { book: "JHN", chapter: 6 };
const range = { ...chapter, from: 35, to: 37 };
function draft(to = 37): BibleDraft {
  return captureDraft(
    captureSourceForReference({ ...range, to }),
  ) as BibleDraft;
}
function held(
  draft: BibleDraft,
  base = draft,
): VolatileDraft & { draft: BibleDraft } {
  return {
    draft,
    owner: "editor-held",
    reason: "error",
    savedBytes: JSON.stringify(base.values),
  };
}
function resolve(
  selected: BibleDraft,
  durable: Draft[] = [],
  entry?: VolatileDraft,
  reference: Reference =
    selected.values.source.type === "passage" ? range : chapter,
) {
  return resolveBibleDraft({
    draftId: selected.id,
    reference,
    durable,
    held: entry ? { [entry.draft.key]: entry } : {},
    settled: {},
  });
}

describe("Exact Bible draft routes preserve same-session held words", () => {
  it("resumes the exact durable range with a cloned source and unchanged inputs", () => {
    const saved = draft();
    saved.revision = 3;
    saved.values.text = "Bereits gesicherte Worte.";
    const snapshot = structuredClone(saved);
    const found = resolve(saved, [saved]);
    expect(found).toEqual(saved);
    expect(found).not.toBe(saved);
    found.values.text = "Nur die Rückgabe verändert.";
    found.values.source.ref.to = 36;
    expect(saved).toEqual(snapshot);
  });

  it.each([35, 37])(
    "resumes a never-saved %s draft without inventing durable state",
    (to) => {
      const initial = draft(to);
      const pending = structuredClone(initial);
      pending.values.text = "Diese Worte sind noch in der Sitzung.";
      const entry = held(pending, initial);
      const before = structuredClone(entry);
      const result = resolve(pending, [], entry);
      expect(result.id).toBe(initial.id);
      expect(result.revision).toBe(0);
      expect(result.values).toEqual(pending.values);
      expect(entry).toEqual(before);
    },
  );

  it("prefers legitimate unsaved words over the same durable identity and base stamp", () => {
    const saved = draft();
    saved.revision = 4;
    saved.values.text = "Alter gesicherter Text.";
    const pending = structuredClone(saved);
    pending.values.text = "Meine späteren, noch ungesicherten Worte.";
    const entry = held(pending, saved);
    expect(resolve(saved, [saved], entry)).toEqual(pending);
    expect(saved.values.text).toBe("Alter gesicherter Text.");
    expect(entry.draft.values).toEqual(pending.values);
  });

  it("does not substitute a same-key draft when the requested ID is absent", () => {
    const selected = draft();
    const replacement = structuredClone(selected);
    replacement.id = "replacement";
    replacement.revision = 1;
    expect(() => resolve(selected, [replacement])).toThrow(
      /nicht mehr vorhanden/,
    );
  });

  it("rejects both links when a held identity conflicts with a durable draft at the same key", () => {
    const saved = draft();
    saved.revision = 2;
    const pending = draft();
    pending.values.text = "Anderer Sitzungsentwurf, nicht zu ersetzen.";
    const entry = held(pending);
    const before = structuredClone({ saved, entry });
    expect(() => resolve(pending, [saved], entry)).toThrow(
      /inzwischen verändert/,
    );
    expect(() => resolve(saved, [saved], entry)).toThrow(
      /inzwischen verändert/,
    );
    expect({ saved, entry }).toEqual(before);
  });

  it("rejects a stale held revision even when the saved values happen to be equal", () => {
    const saved = draft();
    saved.revision = 5;
    const pending = structuredClone(saved);
    pending.revision = 4;
    pending.values.text = "Älterer Editor.";
    expect(() => resolve(saved, [saved], held(pending, saved))).toThrow(
      /inzwischen verändert/,
    );
  });

  it("preserves an old held draft after its durable base disappears instead of recreating it", () => {
    const old = draft();
    old.revision = 2;
    const entry = held(old);
    expect(() => resolve(old, [], entry)).toThrow(/inzwischen verändert/);
    expect(entry.draft.revision).toBe(2);
  });

  it("rejects a held source/entity or stored-base change even when its key or stamp was copied", () => {
    const saved = draft();
    saved.revision = 3;
    saved.values.text = "Aktueller dauerhafter Text.";
    const pending = structuredClone(saved);
    pending.values.text = "Meine ungesicherten Worte.";
    const entry = held(pending, saved);
    entry.savedBytes = JSON.stringify({
      ...saved.values,
      text: "Ein anderer Grundstand.",
    });
    expect(() => resolve(saved, [saved], entry)).toThrow(
      /inzwischen verändert/,
    );
    entry.savedBytes = JSON.stringify(saved.values);
    pending.values.entityId = "different-note";
    expect(() => resolve(saved, [saved], entry)).toThrow(
      /inzwischen verändert/,
    );
    pending.values.entityId = saved.values.entityId;
    pending.values.source.ref.to = 36;
    expect(() => resolve(saved, [saved], entry)).toThrow(
      /passen nicht zusammen/,
    );
  });

  it("requires the exact passage boundaries and containing book/chapter", () => {
    const saved = draft();
    saved.revision = 1;
    for (const reference of [
      chapter,
      { ...range, to: 36 },
      { ...range, book: "LUK" },
      { ...range, chapter: 7 },
    ])
      expect(() => resolve(saved, [saved], undefined, reference)).toThrow(
        /passen nicht zusammen/,
      );
    const verse = draft(35);
    verse.revision = 1;
    // Single-verse destinations historically open the containing chapter;
    // unrelated logical focus bounds must not rewrite the note's source.
    expect(
      resolve(verse, [verse], undefined, { ...chapter, from: 1, to: 2 }).values
        .source.ref,
    ).toEqual({ ...chapter, from: 35, to: 35 });
  });

  it("does not resume a settled identity or a non-Bible capture", () => {
    const saved = draft();
    saved.revision = 1;
    expect(() =>
      resolveBibleDraft({
        draftId: saved.id,
        reference: range,
        durable: [saved],
        held: {},
        settled: { [saved.id]: true },
      }),
    ).toThrow(/nicht mehr vorhanden/);
    const daily = captureDraft(dailySource());
    expect(() =>
      resolveBibleDraft({
        draftId: daily.id,
        reference: range,
        durable: [daily],
        held: {},
        settled: {},
      }),
    ).toThrow(/passen nicht zusammen/);
  });

  it("rejects malformed saved metadata and alias keys without touching held words", () => {
    const pending = draft();
    pending.values.text = "Immer noch hier.";
    const entry = held(pending);
    entry.savedBytes = "not JSON";
    expect(() => resolve(pending, [], entry)).toThrow(/inzwischen verändert/);
    expect(entry.draft.values.text).toBe("Immer noch hier.");
    entry.savedBytes = JSON.stringify(pending.values);
    expect(() =>
      resolveBibleDraft({
        draftId: pending.id,
        reference: range,
        durable: [],
        held: { alias: entry },
        settled: {},
      }),
    ).toThrow(/inzwischen verändert/);
    const wrongBase = structuredClone(pending.values);
    wrongBase.source.ref.to = 36;
    entry.savedBytes = JSON.stringify(wrongBase);
    expect(() => resolve(pending, [], entry)).toThrow(/inzwischen verändert/);
  });

  it("refuses duplicate IDs and same-ID relocated sources rather than choosing arbitrarily", () => {
    const saved = draft();
    saved.revision = 1;
    expect(() => resolve(saved, [saved, structuredClone(saved)])).toThrow(
      /inzwischen verändert/,
    );
    const relocated = structuredClone(saved);
    relocated.values.source.ref.to = 36;
    relocated.key = captureKey(relocated.values.source);
    expect(() => resolve(saved, [saved], held(relocated))).toThrow(
      /inzwischen verändert/,
    );
  });
});
