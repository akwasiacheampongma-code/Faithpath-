import { describe, expect, it } from "vitest";
import { canonicalJson, sha256 } from "../src/lib/hash";
import { ntChapter } from "../src/features/quiz/catalog";
import { ntQuestionHash, type NtQuestion } from "../src/features/quiz/schema";
import {
  answerKey, answerStamp, appendLegacyNtCompletions, chapterSetHash,
  chapterStudyProgress, completionKey, completionStamp, currentNtAnswer,
  emptyNtStudy, extractLegacyNtCompletions, finishNtChapter, rememberNtPosition,
  saveNtAnswer,
} from "../src/features/quiz/model";
import {
  MAX_NT_ANSWERS, MAX_NT_COMPLETIONS, MAX_NT_LEGACY_COMPLETIONS,
  ntAnswerSchema, ntCompletionSchema, ntLegacyCompletionSchema,
  ntStudyDateSchema, ntStudySchema, type NtStudy,
} from "../src/features/quiz/state-schema";

const AT = "2024-05-06T12:34:56.789Z";
const LATER = "2024-05-07T12:34:56.789Z";
const LATEST = "2024-05-08T12:34:56.789Z";
const IMPORT = `fp5-${"a".repeat(64)}`;
const SOURCE = "b".repeat(64);
const chapter = () => ntChapter("MAT", 1)!;
const clone = <T>(value: T): T => structuredClone(value);
const wrongChoice = (question: NtQuestion) => (question.correctIndex + 1) % 4;

function changedQuestion(question: NtQuestion, prompt = question.prompt + " (spätere Fassung)"): NtQuestion {
  const next = { ...clone(question), prompt };
  next.hash = ntQuestionHash(next);
  return next;
}

function answerAll(study: NtStudy, value = chapter(), at = AT) {
  for (const question of value.questions) {
    saveNtAnswer(study, question, wrongChoice(question), null, at);
  }
  return value;
}

function legacy(quiz: unknown = { "10000": { done: AT } }) {
  return extractLegacyNtCompletions(quiz, IMPORT, SOURCE).completions;
}

describe("Persönlicher NT-Lernstand ohne Lese- oder Wachstumswirkung", () => {
  it("beginnt leer mit strengem Schema und voneinander unabhängigen Behältern", () => {
    const first = emptyNtStudy(), second = emptyNtStudy();
    expect(first).toEqual({ answers: {}, completions: {}, legacyCompletions: [], position: null });
    expect(ntStudySchema.safeParse(first).success).toBe(true);
    expect(first.answers).not.toBe(second.answers);
    expect(first.completions).not.toBe(second.completions);
    expect(first.legacyCompletions).not.toBe(second.legacyCompletions);
    expect(ntStudySchema.safeParse({ ...first, score: 5 }).success).toBe(false);
  });

  it("bewahrt den vollständigen Antwort-Snapshot, ursprünglichen Zeitpunkt und echte Revisionen", () => {
    const study = emptyNtStudy(), question = chapter().questions[0]!;
    expect(saveNtAnswer(study, question, 0, null, AT)).toBe(true);
    const first = currentNtAnswer(study, question)!;
    expect(first).toEqual({ question, choice: 0, createdAt: AT, revision: 1 });
    expect(study.position).toEqual({ book: "MAT", chapter: 1, index: 0 });
    expect(answerStamp(first)).toBe(sha256(canonicalJson(first)));
    expect(answerStamp(null)).toBeNull();
    expect(saveNtAnswer(study, question, 1, answerStamp(first), LATER)).toBe(true);
    expect(currentNtAnswer(study, question)).toEqual({
      question, choice: 1, createdAt: AT, updatedAt: LATER, revision: 2,
    });
    expect(ntStudySchema.safeParse(study).success).toBe(true);
  });

  it("behandelt dieselbe Auswahl als exakten Noop und prüft davor den frischen Stamp", () => {
    const study = emptyNtStudy(), question = chapter().questions[2]!;
    saveNtAnswer(study, question, 1, null, AT);
    rememberNtPosition(study, "REV", 22, 4);
    const before = clone(study), stamp = answerStamp(currentNtAnswer(study, question));
    expect(saveNtAnswer(study, clone(question), 1, stamp, LATER)).toBe(false);
    expect(study).toEqual(before);
    expect(() => saveNtAnswer(study, question, 1, null, LATER)).toThrow(/verändert/);
    expect(() => saveNtAnswer(study, question, 2, "0".repeat(64), LATER)).toThrow(/verändert/);
    expect(study).toEqual(before);
  });

  it("bewahrt andere Hashfassungen derselben ID, ohne sie für die aktuelle Fassung zu zählen", () => {
    const study = emptyNtStudy(), old = chapter(), current = chapter();
    answerAll(study, old);
    finishNtChapter(study, old, null, LATER);
    current.questions[0] = changedQuestion(current.questions[0]!);
    expect(answerKey(old.questions[0]!)).not.toBe(answerKey(current.questions[0]!));
    expect(chapterSetHash(old)).not.toBe(chapterSetHash(current));
    expect(chapterStudyProgress(study, current)).toEqual({ answered: 4, completion: null, legacyCompletions: [] });
    expect(currentNtAnswer(study, current.questions[0]!)).toBeNull();
    const before = clone(study);
    expect(() => finishNtChapter(study, current, null, LATEST)).toThrow(/fünf/);
    expect(study).toEqual(before);
    saveNtAnswer(study, current.questions[0]!, 2, null, LATEST);
    finishNtChapter(study, current, null, LATEST);
    expect(Object.keys(study.answers)).toHaveLength(6);
    expect(Object.keys(study.completions)).toHaveLength(2);
    expect(currentNtAnswer(study, old.questions[0]!)).not.toBeNull();
    expect(chapterStudyProgress(study, old).completion?.completedAt).toBe(LATER);
    expect(chapterStudyProgress(study, current).completion?.completedAt).toBe(LATEST);
  });

  it("verlangt alle fünf aktuellen Antworten und erlaubt fünf falsche Antworten als angesehen", () => {
    const study = emptyNtStudy(), value = chapter();
    expect(() => finishNtChapter(study, value, null, AT)).toThrow(/fünf/);
    value.questions.slice(0, 4).forEach((question) => {
      saveNtAnswer(study, question, wrongChoice(question), null, AT);
    });
    const four = clone(study);
    expect(() => finishNtChapter(study, value, null, LATER)).toThrow(/fünf/);
    expect(study).toEqual(four);
    saveNtAnswer(study, value.questions[4]!, wrongChoice(value.questions[4]!), null, AT);
    expect(finishNtChapter(study, value, null, LATER)).toBe(true);
    const completion = chapterStudyProgress(study, value).completion!;
    expect(completion).toEqual({
      book: "MAT", chapter: 1,
      questionSet: value.questions.map(({ id, hash }) => ({ id, hash })),
      completedAt: LATER, revision: 1,
    });
    expect(study.position).toEqual({ book: "MAT", chapter: 1, index: 4 });
    expect(Object.keys(study).sort()).toEqual(["answers", "completions", "legacyCompletions", "position"]);
  });

  it("aktualisiert einen erneuten vollständigen Durchlauf mit CAS, ohne identische Daten neu zu schreiben", () => {
    const study = emptyNtStudy(), value = answerAll(study);
    finishNtChapter(study, value, null, LATER);
    const completion = chapterStudyProgress(study, value).completion!, stamp = completionStamp(completion);
    expect(completionStamp(null)).toBeNull();
    rememberNtPosition(study, "JHN", 1, 0);
    const before = clone(study);
    expect(finishNtChapter(study, value, stamp, LATER)).toBe(false);
    expect(study).toEqual(before);
    expect(() => finishNtChapter(study, value, null, LATER)).toThrow(/verändert/);
    expect(finishNtChapter(study, value, stamp, LATEST)).toBe(true);
    expect(chapterStudyProgress(study, value).completion).toMatchObject({ completedAt: LATEST, revision: 2 });
    const repeated = clone(study);
    expect(() => finishNtChapter(study, value, stamp, LATEST)).toThrow(/verändert/);
    expect(study).toEqual(repeated);
  });

  it("trennt übergebene und zurückgegebene verschachtelte Objekte vom gespeicherten Inhalt", () => {
    const study = emptyNtStudy(), value = answerAll(study), question = value.questions[0]!;
    finishNtChapter(study, value, null, LATER);
    appendLegacyNtCompletions(study, legacy());
    const before = clone(study);
    question.options[0] = "Änderung am Argument";
    question.referenceRanges[0]!.from = 999;
    const original = chapter().questions[0]!;
    const answer = currentNtAnswer(study, original)!;
    answer.question.options[0] = "Änderung am Ergebnis";
    answer.question.referenceRanges[0]!.to = 999;
    const progress = chapterStudyProgress(study, chapter());
    progress.completion!.questionSet[0]!.hash = "0".repeat(64);
    progress.legacyCompletions[0]!.completedAt = LATEST;
    expect(study).toEqual(before);
  });

  it("weist falsche Fragefassungen, Kapitel und vertauschte Originalreihenfolgen atomar zurück", () => {
    const study = emptyNtStudy(), value = chapter(), question = value.questions[0]!;
    const before = clone(study);
    expect(() => saveNtAnswer(study, { ...question, prompt: "ungehashte Änderung" }, 0, null, AT)).toThrow();
    expect(() => saveNtAnswer(study, { ...question, book: "JHN" }, 0, null, AT)).toThrow();
    expect(() => saveNtAnswer(study, question, 4, null, AT)).toThrow();
    expect(() => saveNtAnswer(study, question, 1.5, null, AT)).toThrow();
    expect(study).toEqual(before);
    [value.questions[0], value.questions[1]] = [value.questions[1]!, value.questions[0]!];
    expect(() => chapterSetHash(value)).toThrow(/Originalreihenfolge/);
    expect(() => finishNtChapter(study, value, null, AT)).toThrow(/Originalreihenfolge/);
    expect(() => finishNtChapter(study, { ...chapter(), key: "JHN:1" }, null, AT)).toThrow();
    expect(() => finishNtChapter(study, { ...chapter(), questions: chapter().questions.slice(0, 4) }, null, AT)).toThrow();
    expect(study).toEqual(before);
  });

  it("verhindert rückwärts datierte Änderungen und verändert bei Fehlern nichts", () => {
    const study = emptyNtStudy(), value = answerAll(study, chapter(), LATER), question = value.questions[0]!;
    const before = clone(study), stamp = answerStamp(currentNtAnswer(study, question));
    expect(() => saveNtAnswer(study, question, question.correctIndex, stamp, AT)).toThrow(/Zeitpunkt/);
    expect(() => finishNtChapter(study, value, null, AT)).toThrow(/Zeitpunkt/);
    expect(study).toEqual(before);
  });

  it("merkt nur kanonische NT-Positionen und schreibt unveränderte Positionen nicht erneut", () => {
    const study = emptyNtStudy();
    expect(rememberNtPosition(study, "MAT", 1, 0)).toBe(true);
    const position = study.position;
    expect(rememberNtPosition(study, "MAT", 1, 0)).toBe(false);
    expect(study.position).toBe(position);
    expect(rememberNtPosition(study, "REV", 22, 4)).toBe(true);
    for (const [book, chapterNumber, index] of [["GEN", 1, 0], ["MAT", 0, 0], ["REV", 23, 0], ["JHN", 1, 5], ["JHN", 1, 0.5]] as const) {
      expect(() => rememberNtPosition(study, book, chapterNumber, index)).toThrow();
    }
    expect(study.position).toEqual({ book: "REV", chapter: 22, index: 4 });
  });
});

describe("Strikte Snapshot-, Schlüssel- und Zeitintegrität", () => {
  it.each([
    "2024-02-30T12:34:56.789Z", "2023-02-29T12:34:56.789Z",
    "2024-05-06", "2024-05-06T12:34:56Z", "2024-05-06T12:34:56.78Z",
    "2024-05-06T12:34:56.789+00:00", "2024-05-06T24:00:00.000Z", "",
  ])("lehnt unbewiesene oder ungültige Zeitangaben ab: %s", (at) => {
    expect(ntStudyDateSchema.safeParse(at).success).toBe(false);
    const study = emptyNtStudy(), before = clone(study);
    expect(() => saveNtAnswer(study, chapter().questions[0]!, 0, null, at)).toThrow();
    expect(study).toEqual(before);
  });

  it("akzeptiert kalendarisch gültige volle UTC-Zeitpunkte einschließlich .000Z", () => {
    expect(ntStudyDateSchema.safeParse("2024-02-29T00:00:00.000Z").success).toBe(true);
    expect(ntStudyDateSchema.safeParse(AT).success).toBe(true);
    expect(ntStudyDateSchema.safeParse("+010000-01-01T00:00:00.000Z").success).toBe(true);
  });

  it("verlangt exakte Antwortschlüssel, valide Inhalts-Hashes und stimmige Bearbeitungsmetadaten", () => {
    const study = emptyNtStudy(), question = chapter().questions[0]!;
    saveNtAnswer(study, question, 0, null, AT);
    const record = currentNtAnswer(study, question)!;
    const wrongKey = { ...study, answers: { [question.id]: record } };
    expect(ntStudySchema.safeParse(wrongKey).success).toBe(false);
    const mismatchedSnapshot = { ...study, answers: {
      [answerKey(question)]: { ...record, question: changedQuestion(question) },
    } };
    expect(() => currentNtAnswer(mismatchedSnapshot, question)).toThrow();
    for (const invalid of [
      { ...record, extra: true },
      { ...record, revision: 0 },
      { ...record, revision: 1.5 },
      { ...record, revision: 2 },
      { ...record, updatedAt: LATER },
      { ...record, revision: 2, updatedAt: "2024-05-05T00:00:00.000Z" },
      { ...record, question: { ...question, hash: "0".repeat(64) } },
    ]) {
      expect(ntAnswerSchema.safeParse(invalid).success).toBe(false);
    }
  });

  it("verlangt exakte Fragensatzschlüssel und fünf belegte Snapshots in Originalreihenfolge", () => {
    const study = emptyNtStudy(), value = answerAll(study);
    finishNtChapter(study, value, null, LATER);
    const key = completionKey(value), completion = study.completions[key]!;
    const wrongKey = clone(study);
    wrongKey.completions = { "MAT:1": completion };
    expect(ntStudySchema.safeParse(wrongKey).success).toBe(false);
    const missing = clone(study);
    delete missing.answers[answerKey(value.questions[0]!)];
    expect(ntStudySchema.safeParse(missing).success).toBe(false);
    const wrongOrder = clone(completion);
    wrongOrder.questionSet.reverse();
    expect(ntCompletionSchema.safeParse(wrongOrder).success).toBe(false);
    expect(ntCompletionSchema.safeParse({ ...completion, questionSet: completion.questionSet.slice(1) }).success).toBe(false);
    const predated = clone(study);
    predated.completions[key]!.completedAt = "2024-05-05T00:00:00.000Z";
    expect(ntStudySchema.safeParse(predated).success).toBe(false);
  });

  it("begrenzt die Zahl bewahrter Antworten, Abschlüsse und Legacy-Nachweise", () => {
    const study = emptyNtStudy(), value = answerAll(study);
    finishNtChapter(study, value, null, LATER);
    const answer = Object.values(study.answers)[0]!, completion = Object.values(study.completions)[0]!;
    const answers = Object.fromEntries(Array.from({ length: MAX_NT_ANSWERS + 1 }, (_, index) => [String(index), answer]));
    const completions = Object.fromEntries(Array.from({ length: MAX_NT_COMPLETIONS + 1 }, (_, index) => [String(index), completion]));
    expect(ntStudySchema.shape.answers.safeParse(answers).success).toBe(false);
    expect(ntStudySchema.shape.completions.safeParse(completions).success).toBe(false);
    expect(ntStudySchema.shape.legacyCompletions.safeParse(Array.from({ length: MAX_NT_LEGACY_COMPLETIONS + 1 }, () => legacy()[0]!)).success).toBe(false);
  }, 30000);
});

describe("Konservative Original-Quizübernahme nach Dokument 22", () => {
  it("übernimmt nur exakte bekannte Einheits-IDs und kanonisches done, einschließlich der Randkapitel", () => {
    const quiz = {
      "10000": { done: AT, answers: [0, 1, 2, 3, 0], score: 5, lastIndex: 4 },
      "10259": { done: LATER },
      "10001": { done: "2024-05-06" },
      "10002": { done: "2024-02-30T12:34:56.789Z" },
      "10003": { done: null }, "10004": { done: false }, "10005": {},
      "10006": [], "10007": "done", "10008": { done: "" },
      "010000": { done: AT }, "10000.0": { done: AT }, "+10000": { done: AT },
      "FP-0261": { done: AT }, "9999": { done: AT }, "10260": { done: AT },
    };
    const before = clone(quiz), result = extractLegacyNtCompletions(quiz, IMPORT, SOURCE);
    expect(result.completions).toEqual([
      { importId: IMPORT, sourceHash: SOURCE, sourceUnitId: "10000", book: "MAT", chapter: 1, completedAt: AT },
      { importId: IMPORT, sourceHash: SOURCE, sourceUnitId: "10259", book: "REV", chapter: 22, completedAt: LATER },
    ]);
    expect(result.ignored).toEqual({ unknownUnitKeys: 6, invalidEntries: 2, invalidDone: 6, extraFields: 3 });
    expect(quiz).toEqual(before);
    const study = emptyNtStudy();
    appendLegacyNtCompletions(study, result.completions);
    expect(study.answers).toEqual({});
    expect(study.completions).toEqual({});
    expect(study.position).toBeNull();
    expect(chapterStudyProgress(study, chapter())).toEqual({
      answered: 0, completion: null, legacyCompletions: [result.completions[0]],
    });
    expect(() => finishNtChapter(study, chapter(), null, LATEST)).toThrow(/fünf/);
  });

  it("interpretiert Arraywerte, Exportdaten und fremde Felder nicht als Originalabschluss", () => {
    for (const quiz of [null, undefined, [], false, "unknown"]) {
      const result = extractLegacyNtCompletions(quiz, IMPORT, SOURCE);
      expect(result.completions).toEqual([]);
      expect(result.ignored.invalidEntries).toBe(1);
    }
    expect(legacy({ "10000": { date: AT, completedAt: AT, answers: [1, 2, 3], correct: 5 } })).toEqual([]);
    expect(legacy({ "10000": { done: "2024-05-06T12:34:56.789+00:00" } })).toEqual([]);
    expect(() => extractLegacyNtCompletions({}, "arbitrary", SOURCE)).toThrow();
    expect(() => extractLegacyNtCompletions({}, IMPORT, "bad" )).toThrow();
    expect(() => extractLegacyNtCompletions({}, IMPORT + "\n", SOURCE)).toThrow();
    expect(() => extractLegacyNtCompletions({}, IMPORT, SOURCE + "\n")).toThrow();
  });

  it("fügt Legacy-Herkunft additiv hinzu und dedupliziert wiederholte Übernahmen", () => {
    const study = emptyNtStudy(), value = answerAll(study);
    finishNtChapter(study, value, null, LATER);
    const active = clone(study), entries = legacy();
    expect(appendLegacyNtCompletions(study, entries)).toBe(true);
    expect(appendLegacyNtCompletions(study, [...entries, ...entries])).toBe(false);
    expect(study.answers).toEqual(active.answers);
    expect(study.completions).toEqual(active.completions);
    expect(study.position).toEqual(active.position);
    entries[0]!.completedAt = LATEST;
    expect(study.legacyCompletions[0]!.completedAt).toBe(AT);
    const otherImport = legacy().map((entry) => ({ ...entry, importId: `fp5-${"c".repeat(64)}` }));
    expect(appendLegacyNtCompletions(study, otherImport)).toBe(true);
    expect(study.legacyCompletions).toHaveLength(2);
  });

  it("lehnt widersprüchliche vorhandene und eingehende Herkunft atomar ab", () => {
    const study = emptyNtStudy();
    appendLegacyNtCompletions(study, legacy());
    const extra = legacy({ "10001": { done: AT } })[0]!, before = clone(study);
    for (const conflict of [
      { ...legacy()[0]!, completedAt: LATER },
      { ...legacy()[0]!, sourceHash: "d".repeat(64) },
      { ...legacy()[0]!, chapter: 2 },
    ]) {
      expect(() => appendLegacyNtCompletions(study, [extra, conflict])).toThrow();
      expect(study).toEqual(before);
    }
    const empty = emptyNtStudy();
    expect(() => appendLegacyNtCompletions(empty, [extra, { ...extra, completedAt: LATER }])).toThrow();
    expect(empty).toEqual(emptyNtStudy());
    expect(ntStudySchema.safeParse({ ...study, legacyCompletions: [...study.legacyCompletions, ...study.legacyCompletions] }).success).toBe(false);
    expect(ntLegacyCompletionSchema.safeParse({ ...legacy()[0]!, sourceUnitId: "010000" }).success).toBe(false);
    expect(ntLegacyCompletionSchema.safeParse({ ...legacy()[0]!, sourceUnitId: "10260" }).success).toBe(false);
  });
});
