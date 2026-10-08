# Final NT Quiz Import Implementation Plan

> **For agentic workers:** Execute natively using executing-plans. The user explicitly authorized autonomous implementation; do not pause for plan approval.

**Goal:** Import the approved workbook verbatim and prove all 1,300 questions and existing application flows.
**Architecture:** Preserve numeric quiz-unit IDs, unit metadata, the 52 story units and all mappings. Validate `FAITHPATH_IMPORT` before writes; generate canonical rows, a pre-import backup, an exact diff and provenance. Build validates generated questions against those rows and the source hash.
**Tech Stack:** Python/openpyxl for XLSX ingestion; Node ESM validators; existing Playwright browser tests.
**Spec:** User's final NT import instruction in this conversation, including its structural stop conditions.

## Global Constraints

- Branch `content/nt-quiz-final-1300`, based on `develop/v4` at `f02106e9a15877ec8acb92f444bf62fcbc51c36e`.
- Exactly 1,300 IDs FP-0261–FP-1560, 260 chapters, 27 books, five ordered questions and four options per question.
- Preserve zero-based correct indices and every approved string exactly. No redesign, production deploy or main changes.

## Review Focus

- Reject invalid flags, duplicate IDs, duplicate options, wrong correct answers and invalid chapter orders before writes.
- Preserve multi-range and single-chapter-book references verbatim while validating their actual verse ranges.
- Preserve unit IDs, progress keys, non-NT content and the previously approved Nachlese/story mappings.
- Do not reinterpret historical materialization evidence as approval for the new source; independently validate both snapshots.
- Cache updates must activate a coherent release and preserve local state and open drafts.

### Task 1: Validated reproducible ingestion

Create `scripts/import-nt-quiz.py`, `scripts/validate-nt-quiz.mjs`, `scripts/quiz-reference-ranges.mjs`, `tests/nt-quiz-import.test.mjs` and `requirements-nt-import.txt`.

- [ ] Write failing integrity and reference tests, run and confirm RED.
- [ ] Implement strict sheet validation, stable question mapping and idempotent outputs under `reports/nt-quiz-final/`.
- [ ] Test malformed-workbook rejection without target mutation; valid rows and references pass.
- [ ] Commit validator and tests separately from content.

### Task 2: Approved content import and build integration

Modify only chapter-question fields in `data/stories.json`, the source provenance/verification path, build validation and the new build ID. Preserve prior historical validation by comparing its own archived snapshot and validating current questions separately.

- [ ] Save the exact pre-import file; generate all rows, manifest and old/new field diff.
- [ ] Import and verify row-by-row exact equality, unchanged non-question metadata and untouched story units/mapping files.
- [ ] Validate on build; bump build to `FP4-20261008-G-NTFINAL1` for a separate cache.
- [ ] Run the suite and commit the approved content.

### Task 3: Application regression and final report

Create `tests/nt-quiz-browser.mjs`, `tests/nt-quiz-update.mjs` and `NT_QUIZ_FINAL_IMPORT_REPORT.md`.

- [ ] Run existing unit, content/schema/materialization, core-browser and chapter-integration tests.
- [ ] Test real quiz flows from twelve books and all eight mandated IDs at mobile widths with correct/wrong answers, exact feedback and completion/reopen.
- [ ] Test longest content, 200% text, reduced motion, focus/axe and actual old-to-new SW activation/offline data with preserved user state.
- [ ] Inspect screenshots, write all 22 report sections and all 14 acceptance results; commit final evidence.
- [ ] Independent final review; fix material findings within scope.
