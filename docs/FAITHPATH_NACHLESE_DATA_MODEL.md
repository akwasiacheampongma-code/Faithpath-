# FaithPath/Nachlese materialization

The source pools remain separate. `data/stories.json` retains all 312 legacy
units, all 1,560 FaithPath questions, their original numeric story IDs, order,
references, correct indices, reflections and unknown fields. Every question now
has a stable `faithpath_id`. The content index identifies 260 story questions
and 1,300 chapter-quiz questions, including 40 quiz questions in FP-0261–0300.

`data/nachlese-stories.json` contains the 435 DOCX story definitions in source
order, with the original titles, spans and reflections. `NS-0001` etc. are
technical identifiers derived from that source order; they do not replace any
N question ID. The DOCX understanding-question sequence binds N-0001–N-2314
to the final QA table. `data/nachlese-questions.json` stores those N IDs and the
final table's `Frage`, `Aktuelle Antwort` and `Bibelstelle` fields verbatim.
The `Korrektur` column is audit documentation, not a blind replacement field:
some cells contain combined question/answer instructions or correction notes.
Original DOCX wording and paragraph positions remain in provenance.

`data/faithpath-nachlese-story-flow.json` is a derived story model. It contains
the 435 canonical Nachlese stories and the explicitly preserved FaithPath-only
story Acts 11,1–18. Items reference source question IDs rather than merging
both pools into one anonymous quiz bank. A word-equal final question/answer
appears once in the flow, with both N and FP IDs in `source_question_ids`.
Semantic variants retain their original source objects and exact wordings.
Chapter-quiz questions never enter this flow. All 2,314 N IDs appear once.

There are 256 verified FP links. FAITHPATH_ONLY links select a unique canonical
DOCX context containing the complete original FP question reference; they do
not fabricate a corresponding N question. Four reconstructed semantic links
remain REVIEW_REQUIRED: FP-0120, FP-0147, FP-0151, FP-0239. Their original FP
questions remain in the source pool and in the review register.

Provenance uses original filenames and SHA-256 hashes. Source copies are in
`reports/sources/`; `faithpath-source-manifest.json` binds their repository
paths and hashes. The original FP snapshot is bound to master Git blob
`18995d231f90df332eef500471060469421aff88` and commit
`5f6c597916a5854f83085538ae345ff4c2d629dc`.

Run the standalone technical validator from the repository:

```sh
node scripts/validate-faithpath-materialization.mjs
```

It checks the exact approved field diff, FP and N ID completeness, both Bible
datasets, source hashes, canonical story structure, word-equal deduplication,
provenance, story/quiz separation and processing of all mapping confidence
classes. Existing `to:999` legacy full-chapter sentinels remain unchanged.

The immutable F publish files under `releases/FP4-20260916-F` are unchanged.
This is source-data and model preparation, not a new production release. The
current shipped reader does not yet consume the derived story flow; its
integration and a separately versioned build remain release-gate work after
the four mapping decisions are resolved. Historical Build-E whole-content hash
tests intentionally cannot certify the authorized content edits; the new
validator instead enforces the original master snapshot plus explicit changes.
