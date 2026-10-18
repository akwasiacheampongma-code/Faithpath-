# TREEGUIDE2 Mobile Final Fix

> **For agentic workers:** Use superpowers:executing-plans inline; one fresh whole-change review follows. Checkboxes track completion.

**Goal:** Correct only the two reported rendering defects on a separate fix branch from TREEGUIDE2.

**Architecture:** Keep the existing renderer and domain. Match the two paragraphs through their actual main parent; add an optional German compound break to the presentation of the long title. Preserve its type size and all stored names. No content, store or domain change.

**Tech Stack:** Existing Vanilla JavaScript/CSS PWA, Node tests, Playwright Chromium, axe.

**Spec:** User request “FaithPath – Phase6D: TREEGUIDE2 Mobile-Final-Fix”, 18.10.2026.

## Global constraints

- Base branch stays at31c96d50a5fb19e76cdb09d7a3b96ae5cb6ad70a; app2b48ae037deeb05100d550522623ecf75ff07224, buildTREEGUIDE2/hash150c015e… . Work only on fix/treeguide2-mobile-final-20261018.
- No main, QA-site, MOBILE2, deployment or merge changes. Synthetic profiles only.
- Preserve seven meanings, thresholds, IDs, data model, paths, historical reviews and backups.
- Real iPhone/Safari/VoiceOver remain OFFEN. Doubled CSS root text is not Safari zoom.

## Review focus

- Effective computed paragraph size/line-height/margins, not just matching CSS strings.
- All known titles wrap at valid word/compound boundaries without smaller text or horizontal loss; fallback fonts must remain usable.
- Native disclosures keep keyboard, current-stage indication and full content.
- A real TREEGUIDE2→TREE_FINAL worker update preserves all personal/draft/backup bytes.
- Existing branches and old artifacts remain intact; final build points to an exact committed app source.

## Task 1: Correct the two rendering defects

**Files:** src/verbunden/personal.css, src/tree-view.js, src/version.js, tests/tree-stage-guide.test.mjs, tests/uiux6d-final/mobile.mjs.

**Interfaces:** renderTreeJourney still consumes unchanged stageName/model. Only its displayed heading receives an optional compound boundary; stageNames and all explanations remain exact. Browser tests consume immutable build roots and synthetic phase3Fixture.

- [x] Verify clean current branch, remote source, original frozen build and197 baseline tests.
- [x] Reproduce zero selector matches and actual32px/56px instead of30.4px/50.16px at200%; record margins. Reproduce unhyphenated title split at320/390px200%.
- [x] Add browser assertions for computed styles and actual line fragments; observe both expected failures on the old build. Add a title regression to the existing Node suite; observe its expected failure.
- [x] Correct the selectors; keep title size but use an explicit optional Frucht-tragender boundary and manual heading hyphenation. Run the targeted tests and full npm test.
- [x] Commit app correction with buildFP4-20261018-G-STABLE1-UIUX6D-TREEFINAL and skip-ci/netlify markers. Build twice to separate directories and compare all367 files.

## Task 2: Verify and deliver

**Files:** tests/uiux6d-final/, reports/uiux6d-final/, separate qa-output/uiux6d-final/ and shared download ZIPs.

**Interfaces:** New matrix extends the original capture approach; original regression drivers retain their assertions. A dedicated update driver installs exactTREEGUIDE2 before the new build on one isolated HTTPS origin.

- [x] Run seven stages × four themes ×320/390px ×100/200%=112 final cases; check computed styles, complete title, valid breaks, no horizontal loss, native disclosures, storage bytes, real screenshots. Capture representative fresh before states for both defects.
- [x] Run keyboard/axe/offline checks, original tree/path/journal/review/backup regressions and actual worker update. Verify unchanged protected sources/content, thresholds and names.
- [x] Independently review the scoped diff and evidence; fix only reproduced blockers, no redesign.
- [x] Package reproducible Netlify QA ZIP named FaithPath_UIUX6D_TREE_FINAL_Netlify_QA.zip plus report/screenshots, exact app/delivery commits and hashes. Stop for approval, no publish/merge.

## Ledger

- Existing linked worktree reused; a separate fix branch was created from verified31c96d5. No old branch moved.
- The user already specified the exact fixes and authorized implementation; no additional design approval or implementation handoff is needed.
- Existing baseline is197PASS; original content-validator whole-chapter warnings remain unchanged.
- Diagnosis: DOM is .tree-page > main#main > p. Original direct-child selectors match zero nodes. The platform computes hyphens:auto but renders an arbitrary anywhere break without a visible hyphen. This establishes the local Chromium behavior, not the presence/absence of Safari dictionaries.
- Choose a presentation-only optional compound break instead of reducing the type size. All existing displayed words and all stored names remain the same; soft-hyphen is not a content/schema migration.
- Some skill helper resources are not exposed as files in this managed runtime; retain this plan as the execution ledger and use the available tools directly.
- Build naming: the first internal version string contained an underscore and was correctly rejected by the unchanged build-ID validator. Use TREEFINAL in the ID; retain the requested TREE_FINAL ZIP filename. The dependent browser attempt had no built manifest and is not a product test result.

- Browser probe: a Range for the character after a soft hyphen includes both the generated hyphen rectangle and the glyph on the next line. getBoundingClientRect merges them and mislabels that glyph's line. Use the last nonzero client rectangle; preserve the false-alarm run and the causal glyph-rectangle probe. Actual app rendering needs no second change.

- Task1 targeted gate: new Node regression failed as expected before the change; browser cases failed both computed-style checks and the invalid title split. With corrected glyph measurement, both targeted cases pass. Full suite198/198 passed, with only existing content warnings and npm update notices.

- Task1 complete: appce89422411ec3382c62ba7683167cf1b6db4a457. Full npm test198/198 at the committed source, two367-file builds byte-identical with hash5390ec0a00ba171bc0f997a5fd5c8ba11b7e58b508a3085c488c21d95add84aa.
- Task2 current evidence: all112 final cases pass computed properties, exact title size/breaks, native keyboard and storage snapshots;32 fresh before captures retained. All16 axe/keyboard cases pass, four offline. Five actual TREEGUIDE2→TREEFINAL update checks pass. Source64/core-content175 byte comparisons and101 threshold cases pass.
- Independent whole-change review: no Critical/Important/Minor findings; independent198/198 and8/8 layout/fallback cases with exact prior-title-size equality. Chromium AX name contains optionalU+00AD; real spoken VoiceOver remains OFFEN.
- Visual inspection complete for eight all-stage contact boards plus direct comparisons and selected original PNGs. Original15-program regression is still running; no final delivery gate asserted yet.

- Task2 regression gate complete: all15 selected original programmes exit0, bound to appce89422/build5390ec0a… . The final112-case matrix and16-case acceptance suites have no errors. Actual HTTPS update5/5, backup lifecycle, preservation and independent review all pass.
- Additional gallery check: serving only the screenshots child directory made parent comparison images404. The complete report server root resolves both images;320/390/1440px smoke checks pass. This is a QA-serving configuration issue, not an app change.
- Native final-fix app remains frozen atce89422. Report, source inventory, checksums and download receipts complete delivery; no original branches or artifacts are replaced.

- Delivery prepared: complete Netlify ZIP and QA/Screenshot ZIPs were each generated twice byte-identically and every extracted byte verified. SHA-256 lists and external delivery receipt identify app and delivery commits separately. No merge/deploy; await explicit device/release approval after delivery.
