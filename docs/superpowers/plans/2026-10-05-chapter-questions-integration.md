# Chapter Questions Integration Implementation Plan

> Execute the user's complete 2026-10-05 integration specification in this session. Preserve PRODUCT1 and all existing public QA downloads. No further product or design pass.

**Goal:** Reach the existing canonical chapter quiz from both the chapter end and a compact book/chapter collection, with shared status and correct returns.

**Architecture:** A read-only `chapter-questions.js` selector indexes existing `stories.json` chapter units by normalized book and one-based reader chapter. UI routes refer to the existing numeric unit ID and existing `state.quiz[unit.id].done`; no duplicate questions or persistence schema. Guarded local return routes preserve a reader's chapter, translation and explicit context.

**Tech Stack:** Existing vanilla JavaScript/CSS, Node test runner, Playwright/Chromium, axe, Netlify.

**Spec:** User's FAITHPATH CHAPTER QUESTIONS INTEGRATION specification (2026-10-05), including all local/live gates.

## Global Constraints

- Exactly 260 units / 1300 questions / 5 per unit, FP-0261–FP-1560; reviewed story merge remains 436 / 2314 / 260 / 2574 / 2479 / zero unmapped.
- No question/content/status edits, data model migration, tree/Today/nav redesign, SW restructuring, additional features or gamification.
- Existing `quiz/<id>` and `story/<id>` links stay valid. Reader section follows the last verse; no compulsory quiz.
- Production only after the complete local gate; then actual live QA, reports and release-candidate baseline.

## Review Focus

- Zero-based unit chapter must map to the exact one-based reader chapter, including first/last chapters and single-chapter books.
- No quiz UI for a chapter without data; future chapter units are indexed from metadata rather than an NT hardcode.
- An origin must match the current canonical unit; malformed/foreign return routes fall back safely without creating an open redirect.
- Completed status survives repeat entry, reload, offline and backup without modifying unrelated state or resetting old metadata.
- At 320px/200%, section/answers/actions reflow naturally and keyboard focus progresses through feedback, next question and completion.

### Task 1: Baseline and failing evidence

- [x] Verify Production/build/remote HEAD; snapshot verified deployed artifact and protected source.
- [x] Assert full counts and every unique book/chapter mapping; record current missing reader/collection integration in live browser tests.
- [x] Establish prepared baseline unit/content PASS; write new selector and browser behavior tests before implementation.

### Task 2: Single-source selector and navigation

**Files:** `src/chapter-questions.js`, `tests/chapter-questions.test.mjs`.

**Interfaces:** `createChapterCatalog(units, books)` returns existing-unit maps `byChapter` and `byBook`. `chapterUnit(catalog, book, chapter)` returns the original unit or null. `chapterQuizRoute(unit, returnRoute)` and `chapterQuizNavigation(unit, books, translation, returnRoute)` produce local existing quiz/read routes and guarded return/next/collection routes.

- [x] RED: test exact 260/1300/5 coverage, original object identity, no story/N IDs, boundaries, absent chapter, future metadata, ambiguous mapping rejection and foreign origin rejection.
- [x] GREEN: implement only read-only selection/route derivation and run new and existing unit tests.

### Task 3: Reader, collection and completion

**Files:** `src/app.js`, scoped `styles.css`, `tests/chapter-questions-browser.mjs`; existing `tests/browser.mjs` remains unchanged and passes through the preserved reflection action.

- [x] RED: reader after-last-verse CTA, collection 27 books/260 chapters, same unit/questions, completion status sync and origin/legacy links.
- [x] Add `chapter-quizzes` / `chapter-quizzes/<book>` within existing architecture, reachable from Entdecken. Lists use existing row/divider components.
- [x] Add quiet non-sticky chapter-end section only when a unit exists. `Später` dismisses only the current UI section without any stored task or reminder.
- [x] Preserve MCQ/feedback; chapter question 5 leads to quiet completion with correct chapter/next/book actions. Optional existing reflection remains reachable for compatibility.
- [x] Verify keyboard/axe, all requested viewports and 14 screenshots; unit and relevant browser tests PASS.

### Task 4: Full local gate

- [x] Run content/build/unit plus Core, Reader/Highlights/Notes/Journal/Delete/Paths/Continuity/Merged/Nachlese/Menu/Backup/Edge/axe/Responsive/Safe Area/browser E2E regression.
- [x] Test actual PRODUCT1 artifact → candidate on one origin with real SW; compare saved main state/draft byte-for-byte, including existing quiz/story state.
- [x] Test installed offline reader → all five questions → chapter, status reload, collection and backup. Hash-prove protected content/logic unchanged and preserve historical QA files.

### Task 5: Production and release-candidate freeze

- [x] Deploy only the verified artifact with published-deploy concurrency guard and PRODUCT1 rollback.
- [x] Repeat critical new flows and relevant regression live; inspect actual screenshots and publish honest error/change reports with device-test limits.
- [x] Verify real HTML/PDF/ZIP downloads, sync only develop/v4, freeze next release-candidate baseline. No main merge or release tag.

**Self-review:** Every user requirement maps to these tasks. The initial clean checkout needs existing `npm run validate` to generate reference-index before the existing runtime-model unit test; this is a preparation dependency, not a product change. Chromium/safe-area simulation is not a real Safari/iPhone/VoiceOver certification.
