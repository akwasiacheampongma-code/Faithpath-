# FaithPath Final Product Fix Implementation Plan

> Execute the user's approved final-fix specification in this session; preserve the existing dirty worktree and published rollback artifact.

**Goal:** Verify and expose the reviewed canonical story collection, correct confirmed product defects, and freeze a fully tested Production baseline.

**Architecture:** Retain the vanilla rendering, existing routes and stored records. Use the reviewed flow directly and derive reference search strings without writing user data. Restrict layout adjustments to the named screens.

**Tech Stack:** Vanilla JavaScript/CSS, Node test runner, Playwright/Chromium, axe, Netlify.

**Spec:** User's 2026-10-04 FINAL PRODUCT FIX + MERGED CONTENT VERIFICATION instruction.

## Global Constraints

- 436 stories / 2314 N / 260 FP story / 2574 unique source IDs / 2479 flow items / zero unmapped; 1300 chapter questions separate.
- No content edits, new mappings, deduplication, storage migration, tree/Today redesign, route removal, SW changes or feature expansion.
- Deploy only after all local gates; then live QA. Preserve every existing public QA link.

## Review Focus

- Legacy label-free references, aliases, ranges, and numeric false positives.
- Old story and question deep links still reach their exact mapped canonical source.
- Mixed deduplicated questions retain their reviewed primary source, MCQ and reveal semantics.
- Returning users and archived paths retain existing priority and access.
- 320px/200% words, touch controls, safe areas and current Production update retain user records/drafts.

### Task 1: Audit and failing evidence

- [x] Record published build/deploy/integrity and branch HEAD, snapshot source and artifact.
- [x] Assert full merge ID coverage and exclusions; verify the source PDF's scope and per-ID final approval.
- [x] Run Production browser reproductions and capture the requested before screenshots.

### Task 2: Canonical content and compatibility

**Files:** `src/app.js`, optional read-only selectors, `tests/final-product-browser.mjs`, `tests/final-product.test.mjs`.

- [x] Write failing visible-library and mixed-flow tests, then remove duplicate story presentation using the existing reviewed flow.
- [x] Keep chapter quizzes separate and old route aliases valid; count and navigate the complete mixed flow.
- [x] Synchronize only approval metadata supported by the supplied final catalogue, not an invented new review.

### Task 3: Targeted product corrections

**Files:** `src/journal-search.js`, `src/app.js`, `styles.css`, product tests.

- [x] Reproduce legacy search, implement structured reference aliases and verify negative/range cases.
- [x] Expose the existing beginner guide early only without personal history.
- [x] Reduce Journal/Reader unnecessary space; reflow Journal heading/action at 200% without font reduction.
- [x] Keep one authoritative current step prominent and remaining steps visible below it.
- [x] Present exact existing history relationships and clear local backup semantics.

### Task 4: Local and update gate

- [x] Run unit/content/build, existing Core/Continuity/Delete/Notes/Menu/Edge/axe/responsive/backup/SW/browser suites and new product tests.
- [x] Capture and inspect before/after screenshots; measure first entry/verse positions.
- [x] Test current published artifact to candidate update with raw saved state/draft equality and offline merged content.
- [x] Prove protected source/content/assets unchanged; preserve old QA files in candidate artifact.

### Task 5: Production, live QA and freeze

- [x] Publish only the locally passing artifact, with published-deploy concurrency check and rollback point.
- [x] Repeat critical tests live, including downloads and offline behavior.
- [x] Publish error/change reports with actual evidence, known device limits and product baseline declaration.

**Self-review:** All user requirements map to the five tasks. No independent content or storage changes are needed. Simulated safe areas/Chromium do not establish real Safari/iPhone/VoiceOver certification.
