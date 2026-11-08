import { describe, it, expect } from "vitest";
import {
  initialData,
  decodeData,
  parseBackup,
  markRead,
  grow,
} from "../src/state/model";
import { saveDraft, commitDraft } from "../src/features/personal/model";
import {
  captureDraft,
  guidedSource,
  dailySource,
  EXPERIENCE_QUESTION,
  captureSourceCurrent,
} from "../src/features/personal/capture-model";
import {
  captureKey,
  type CaptureSource,
} from "../src/features/personal/capture-schema";
import type { DraftOf } from "../src/features/personal/schema";
const at = "2026-11-06T12:00:00.000Z";
function save(source: CaptureSource, text = "Meine noch offenen Worte.") {
  const data = initialData(),
    draft = captureDraft(source);
  draft.values.text = text;
  saveDraft(data, draft, null);
  return { data, draft: data.drafts[0]! as DraftOf<"capture"> };
}
describe("Entwürfe mit festem Kontext", () => {
  it("bewahrt Hub, Erfahrung, Vers und Lernschritt getrennt, ohne Fortschritt zu bestätigen", () => {
    const data = initialData(),
      sources: CaptureSource[] = [
        dailySource(new Date(2026, 10, 5)),
        { type: "experience", question: EXPERIENCE_QUESTION },
        { type: "verse", ref: { book: "MRK", chapter: 4, from: 35, to: 35 } },
        guidedSource("jesus", 0),
        guidedSource("jesus", 1),
      ];
    for (const source of sources) {
      const draft = captureDraft(source);
      draft.values.text = "  Eigene Worte\nbleiben erhalten.  ";
      saveDraft(data, draft, null);
    }
    grow(data);
    expect(new Set(data.drafts.map((d) => d.key)).size).toBe(5);
    expect(data.notes).toEqual([]);
    expect(data.completedSteps).toEqual([]);
    expect(data.growthStage).toBe(0);
    expect(parseBackup(JSON.stringify(data))).toEqual(data);
  });
  it("verknüpft zwei Versnotizen unabhängig und hält die Quelle unverändert", () => {
    const data = initialData();
    for (const verse of [35, 36]) {
      const draft = captureDraft({
        type: "verse",
        ref: { book: "MRK", chapter: 4, from: verse, to: verse },
      });
      draft.values.text = `Meine Worte zu Vers ${verse}.`;
      saveDraft(data, draft, null);
      const saved = data.drafts.find((d) => d.key === draft.key)!;
      commitDraft(data, saved.key, saved, at);
    }
    expect(data.notes.map((n) => [n.text, n.ref?.from])).toEqual([
      ["Meine Worte zu Vers 36.", 36],
      ["Meine Worte zu Vers 35.", 35],
    ]);
    expect(data.drafts).toEqual([]);
  });
  it("schließt einen Lernschritt und seine Reflexion gemeinsam ab, erst nach dem Lesen", () => {
    const source = guidedSource("jesus", 0),
      { data, draft } = save(source);
    const before = JSON.stringify(data);
    expect(() => commitDraft(data, draft.key, draft, at)).toThrow(
      /Lies zuerst/,
    );
    expect(JSON.stringify(data)).toBe(before);
    markRead(data, source.snapshot.ref, "jesus:0");
    commitDraft(data, draft.key, draft, at);
    expect(data.completedSteps).toEqual(["jesus:0"]);
    expect(data.notes[0]?.captureSource).toEqual(source);
    expect(data.drafts).toEqual([]);
    source.snapshot.question = "Später verändert";
    source.snapshot.ref.from = 36;
    expect(data.notes[0]?.captureSource).not.toEqual(source);
    expect(data.notes[0]?.ref?.from).toBe(35);
    expect(() => commitDraft(data, draft.key, draft, at)).toThrow();
    expect(data.notes).toHaveLength(1);
  });
  it("lässt einen freiwilligen Abschluss ohne Reflexion zu und erzeugt dabei keinen Notiztext", () => {
    const source = guidedSource("jesus", 0),
      { data, draft } = save(source, "");
    markRead(data, source.snapshot.ref, "jesus:0");
    commitDraft(data, draft.key, draft, at);
    expect(data.completedSteps).toEqual(["jesus:0"]);
    expect(data.notes).toEqual([]);
    expect(data.drafts).toEqual([]);
  });
  it("bewahrt einen alten Quelltext ohne einen geänderten Lernschritt abzuschließen", () => {
    const source = guidedSource("jesus", 0);
    source.snapshot.explanation = "Meine alte Einordnung.";
    const { data, draft } = save(source);
    markRead(data, source.snapshot.ref, "jesus:0");
    expect(captureSourceCurrent(source)).toBe(false);
    expect(() => commitDraft(data, draft.key, draft, at)).toThrow(/verändert/);
    expect(data.drafts).toHaveLength(1);
    expect(data.completedSteps).toEqual([]);
    commitDraft(data, draft.key, draft, at, { completeGuided: false });
    expect(data.notes[0]?.captureSource).toEqual(source);
    expect(data.completedSteps).toEqual([]);
  });
  it("wertet eine Erfahrung erst nach ausdrücklichem Festhalten als eigene Anwendung", () => {
    const { data, draft } = save({
      type: "experience",
      question: EXPERIENCE_QUESTION,
    });
    expect(data.notes.filter((n) => n.kind === "action")).toHaveLength(0);
    commitDraft(data, draft.key, draft, at);
    expect(data.notes[0]?.kind).toBe("action");
    expect(data.notes[0]?.captureSource?.type).toBe("experience");
  });
  it("verhindert eine falsche Entwurfszuordnung oder doppelte Notiz vor jeglicher Fortschrittsmutation", () => {
    const source = guidedSource("jesus", 0),
      { data, draft } = save(source);
    markRead(data, source.snapshot.ref, "jesus:0");
    const bad = { ...captureDraft(source), key: "capture:guided:jesus:2" };
    expect(() => saveDraft(data, bad, null)).toThrow(/Quelle/);
    data.notes.push({
      id: draft.values.entityId,
      text: "Schon vorhanden",
      kind: "note",
      createdAt: at,
      updatedAt: at,
    });
    const before = JSON.stringify(data);
    expect(() => commitDraft(data, draft.key, draft, at)).toThrow(/bereits/);
    expect(JSON.stringify(data)).toBe(before);
  });
  it("migriert echte V3-Bestände auf V5 und hält Tagesdatum und alte Daten stabil", () => {
    const { readingPosition, ...current } = initialData(),
      old = {
        ...current,
        version: 3,
        name: "Ada",
        notes: [
          {
            id: "old-note",
            text: "Meine alten Worte.",
            kind: "reflection",
            createdAt: at,
            updatedAt: at,
          },
        ],
      },
      bytes = JSON.stringify(old);
    expect(decodeData(old)).toEqual({
      ...old,
      version: 5,
      readingPosition: null,
    });
    expect(JSON.stringify(old)).toBe(bytes);
    expect(dailySource(new Date(2026, 10, 5, 23)).date).toBe("2026-11-05");
    expect(captureKey(dailySource(new Date(2026, 10, 5)))).toBe(
      captureKey(dailySource(new Date(2026, 10, 6))),
    );
  });
});
