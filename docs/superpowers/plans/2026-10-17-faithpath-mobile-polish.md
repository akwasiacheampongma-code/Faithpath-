# FaithPath Mobile Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reproduce and correct the reported mobile composition defects while preserving Verbunden and all content and personal data.

**Architecture:** Work in the existing isolated Phase-6B worktree. Amend the authoritative presentation modules and Journal view only; retain storage, routing, content and progress authorities. Keep the immutable pre-polish build and all previous evidence.

**Tech Stack:** Vanilla JavaScript PWA, modular CSS, Node unit tests, Playwright Chromium.

**Spec:** User's “Phase 6B – Mobile Visual QA nach TinyFish-Livetest” instruction and attached iPhone night Journal screenshot.

## Global Constraints

- Branch `feature/uiux-phase6b-verbunden-20261017` only; no main, merge or deployment.
- No change to Bible texts, questions, IDs, progress rules, storage formats or personal data.
- Four themes; 320×568, 390×844, 430×932 and desktop at 100/150/200% root text enlargement.
- Real iPhone/Safari/VoiceOver tests remain OFFEN; Chromium is not Safari.
- No clipped content, disabled zoom, tiny replacement text or horizontal overflow concealment.
- Existing `qa-output/uiux6b/release-final` and `reports/uiux6b` are immutable references.

## Review Focus

- Fonts unavailable or individually enlarged: brand must remain atomic; menu may occupy another row.
- Safe top 44px and enlarged text: header must grow to contain all controls.
- Empty and populated Journal: same entry action and storage, one useful empty explanation.
- Large text and long chapters/questions: natural vertical reflow; reading font enlargement preserved.
- Wrapped fixed navigation: measured height must reserve enough scroll space and keyboard focus.

### Task 1: Diagnose and record the baseline

- [x] Verify clean linked worktree, HEAD 49ec83c and frozen build 911c3f4a…; run baseline `npm test`.
- [x] Capture real new pre-change Journal/reader/quiz PNGs and CSS geometry in `qa-output/uiux6b-mobile1/diagnosis`.
- [x] Probe live URL: network CONNECT 403. No live-source equivalence or Safari-specific cause claimed.
- [ ] Record cascade findings and distinguish confirmed effects from device hypotheses.

### Task 2: Targeted presentation fixes

**Files:** `src/app.js` (brand markup only), `src/journal-view.js` (empty copy/action), `src/verbunden/{foundation,personal,reader,discover}.css`, `src/version.js`.

**Interfaces:** Existing DOM actions, routes, form names and models unchanged. New `.brand-name` is presentation only.

- [ ] Write/run `tests/uiux6b-mobile1/focused.mjs` against port4510: RED geometry assertions for header enlargement/safe inset, first Journal action, reader text and quiz answer placement.
- [ ] Implement atomic brand and wrapping height-adaptive header, compact Journal hierarchy and single empty note, remove inherited Journal padding, reduce redundant reader/quiz heading space only on mobile.
- [ ] Run focused browser checks against a new unique MOBILE1 build, then `npm test` and existing editor/reader/backup checks.
- [ ] Commit with `[skip netlify] [skip ci]`.

### Task 3: Complete mobile and functional regression

**Files:** `tests/uiux6b-mobile1/{matrix,update}.mjs`; reuse existing Phase1–6B suites with independent output directories.

- [ ] All requested route families × four themes × four viewports × 100/150/200% text; check DOM overflow, visible fonts/images, navigation bounds, capture genuine PNGs.
- [ ] Stress empty Journal, long chapters in both translations, long questions, many paths, very long entries, empty search, writer, keyboard and reduced motion; axe plus computed contrast.
- [ ] Rerun original unit/content/data/browser/offline regressions and actual isolated HTTPS worker update from the frozen UIUX6B build to MOBILE1; preserve personal storage bytes and pending drafts.
- [ ] Inspect contact sheets and individual PNGs, correct only reproduced failures, repeat affected checks.

### Task 4: Evidence and delivery

**Files:** `reports/uiux6b-mobile1/`, independent build and QA ZIPs in `/workspace/shared/downloads/`.

- [ ] Verify all protected content/storage modules unchanged; build twice from exact committed source and compare bytes.
- [ ] Document confirmed causes, code locations, limitations, tests, before/after screenshots and physical iPhone checklist.
- [ ] Package deterministic ZIP, verify SHA-256 and extraction; no deployment.
- [ ] Final whole-change independent review, then delivery evidence commit only.

## Execution ledger

- Baseline: clean HEAD49ec83c; immutable application source f89eccf. Existing linked worktree reused.
- Ruling: user already authorizes diagnosis and correction; execute inline without a second approval step. No new visual direction or product decision.
- Ruling: live host is not allowlisted. Continue with the frozen exact source build; report live and physical verification as open, no proxy workaround.
- Baseline diagnostics: browser font loading succeeds; viewport meta allows zoom; no physical zoom setting can be inferred from screenshot raster size. Root text-size-adjust is `auto`, but a Safari inflation fault is not independently established.
- Task2: five original RED cases plus existing Safe-Area control became6 GREEN in654a63f.191 unit tests passed; protected175 files unchanged.
- Ruling: visual inspection of the first full matrix exposed additional mid-word Settings/Journey titles at320/200% and the opening reading line below navigation. Overflow-only assertions missed these. Stop that internal MOBILE1 trial, preserve its receipts under `qa-output/uiux6b-mobile1/trial1`, add3 RED tests, use the shared mobile page-title token (1.75rem;1.5rem below351px), preserve the Journal/Today editorial hierarchy and all40px reading text at200%. Cost: repeat the complete final regression, rather than using trial PASS records as final evidence.
- Final candidate receives unique build-ID `FP4-20261017-G-STABLE1-UIUX6B-MOBILE2`; MOBILE1 was never published.
