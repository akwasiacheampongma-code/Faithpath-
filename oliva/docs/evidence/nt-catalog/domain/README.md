# NT study domain

`src/features/quiz/state-schema.ts` contains the strict persisted domain schema;
`src/features/quiz/model.ts` contains operations on that study object. These
modules have no AppData, store, cloud, reader, tree or UI dependency. The model
imports `NtChapter` as a type, never the full question bank at runtime. Chapter
and question locations come from the small NT index. Question snapshots are
validated with `ntQuestionSchema` before use.

## Persisted contract

- `answers`: at most 26,000 records keyed by `question.id + ":" + question.hash`.
  Each contains the complete question snapshot, choice 0–3, original `createdAt`
  and positive integer `revision`. A changed choice increments the revision and
  adds `updatedAt`; an unchanged choice leaves all state unchanged. Different
  content hashes of the same ID retain independent records.
- `completions`: at most 5,200 records keyed by `book:chapter:chapterSetHash`.
  Each keeps the five `{id, hash}` identities in original order, `completedAt`
  and a revision. All five matching answer snapshots must exist and predate the
  first completion. A completion means questions viewed, including wrong choices.
- `legacyCompletions`: at most 26,000 historical provenance records. Each holds
  `importId`, original `sourceHash`, exact string `sourceUnitId`, canonical
  `book`/`chapter` and original `completedAt`. Each import/unit pair is unique.
  The enclosing persistence schema checks receipt references separately.
- `position`: a canonical NT `{book, chapter, index}` with index 0–4, or `null`.

All timestamps must exactly roundtrip through `Date.toISOString()`, including
UTC `Z` and three millisecond digits. Date-only strings, offsets, calendar
overflow and other invented timestamp interpretations are rejected.

## Model API

`emptyNtStudy(): NtStudy` returns fresh empty containers.

`answerKey(question): string` selects the ID/hash version.
`answerStamp(answer | null): string | null` hashes the canonical validated record;
`completionStamp(completion | null)` does the same for a completion. Null is the
expected stamp for a missing record.

`chapterSetHash(chapter): string` hashes the five ordered `{id, hash}` identities.
`completionKey(chapter): string` returns the corresponding chapter/set key. Both
validate the supplied questions and their canonical original positions.

`saveNtAnswer(study, question, choice, expectedStamp, at): boolean` and
`finishNtChapter(study, chapter, expectedCompletionStamp, at): boolean` mutate
only after complete validation. Their stamp comparison runs before any no-op.
Answer creation/editing updates position to the question index. Completion
requires all five current hash answers regardless of correctness and sets
position to index 4. A later complete replay updates its timestamp/revision;
the same completion timestamp is a no-op. Errors leave the study unchanged.

`currentNtAnswer(study, question): NtAnswer | null` returns a validated independent
snapshot of only that ID/hash version.

`chapterStudyProgress(study, chapter): {answered, completion, legacyCompletions}`
returns a validated independent projection. `answered` is the number 0–5 of
current hash answers, `completion` is the current set completion or null, and
`legacyCompletions` contains this chapter's separately identified historical
provenance. Selectors validate and clone the selected records, without scanning
or hashing unrelated answer history on every chapter-list row.

`rememberNtPosition(study, book, chapter, index): boolean` validates and stores a
position; an unchanged position is a no-op. Mutators returning false leave their
entire study object unchanged. The caller owns atomic persistence.

## Original progress extraction

`extractLegacyNtCompletions(quizUnknown, importId, sourceHash)` returns:

```ts
{
  completions: NtLegacyCompletion[],
  ignored: {
    unknownUnitKeys: number,
    invalidEntries: number,
    invalidDone: number,
    extraFields: number
  }
}
```

Only exact known index unit keys `10000`–`10259` with a non-array object and an
own valid `done` value produce a completion. Unknown fields remain uninterpreted
and unchanged in the archived input. The counters describe discarded keys,
invalid entry objects, missing/invalid `done` values and additional fields of
known object entries. An invalid top-level quiz value counts as one invalid
entry. `done` never creates answers, a score, an attempt count or a position.

`appendLegacyNtCompletions(study, entries): boolean` adds cloned provenance
without replacing active data. Identical import/unit records deduplicate;
conflicting dates or provenance fail atomically, including conflicts within the
incoming batch. This implements the conservative policy from
[the original progress contract](../../../22-original-nt-progress-contract.md).

## Verification

`npx vitest run tests/nt-study.test.ts` exercises 26 cases covering historical
and current hash versions, stale stamps before no-ops, five required answers,
wrong choices, replay timestamps, snapshot isolation, canonical dates,
key/content/order corruption, all three storage caps, conservative extraction,
deduplication and atomic conflicts. The final machine-readable result is
[`unit-results.json`](unit-results.json). These are domain tests; they make no
browser, device or personal-growth claim.
