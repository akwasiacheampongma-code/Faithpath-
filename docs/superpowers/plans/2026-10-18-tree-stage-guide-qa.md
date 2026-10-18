# Phase 6D tree-stage guide verification plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans inline. Steps use checkbox syntax for tracking. One independent whole-change review follows implementation.

**Goal:** Finish the existing seven-stage guide on its current branch; make its current meaning immediately understandable and prove that storage and development authority stay unchanged.

**Architecture:** Continue `491acf33c409be37781073d2d831c16c56192241`, descended from MOBILE2. Keep `treeLevel` and all storage/content modules intact. Reuse the existing pure guide renderer, split current meaning from the collapsible overview, and adjust tree-scoped presentation only.

**Tech Stack:** Existing Vanilla JavaScript PWA, modular CSS, Node tests, Playwright Chromium and axe.

**Spec:** User instruction “FaithPath – Phase 6D: Olivenbaum fertigstellen und prüfen”, 2026-10-18, preserved as the requirements in the final report.

## Global constraints

- Only `feature/tree-seven-stages-meaning-20261017`; no merge, main change or deployment.
- Preserve MOBILE2 checkout, archive and source. No schema, data, content ID, threshold or original illustration change.
- Seven design metaphors, never a prescribed biblical ladder or measure of faith, God's nearness or human worth.
- No automatic advancement from reading, quiz answers or completed tasks.
- Real iPhone/Safari/PWA/VoiceOver gates stay OFFEN; do not relabel Chromium as device evidence.

## Review focus

- Current meaning must precede the tree image and its possibly long path list.
- Long stage names and full explanations must reflow at 320px/200%; vertical scrolling is valid.
- Both disclosures must work with keyboard, remain understandable when collapsed, and preserve personal bytes.
- Bible references describe trust and the Spirit's fruit; no formula linking virtues to app activity.
- Existing milestones, retained reviews, archives and backup restore must retain their exact counting authority.

## Task 1: Inspect, reproduce and correct the existing module

**Files:** `src/tree-stage-guide.js`, `src/tree-view.js`, tree-scoped rules in `src/verbunden/personal.css`, `src/version.js`; `tests/tree-stage-guide.test.mjs`, `tests/uiux6d/`.

**Interfaces:** `treeLevel(data)` remains the only stage selector. A pure `renderTreeStageMeaning(level)` renders current prose; `renderTreeStageGuide(level)` renders the existing seven-entry overview and context disclosures. `renderTreeJourney` composes these with the unchanged tree and source evidence.

- [x] Verify branch ancestor, five-file initial diff and clean isolated checkout.
- [x] Read Psalm 52, Jeremiah 17:1–10 and Galatians 5:13–26 in both local translations; note local verse segmentation.
- [x] Run initial `npm test`: 195 pass; build succeeds with subprocess-capable runtime. Retain initial environment-only `spawnSync git EPERM` log.
- [x] Capture and inspect initial 390px night states. Current meaning begins at y1040/y1218, below navigation y777; cause is renderer order, not theological stage selection.
- [x] Capture full representative before set from frozen original build.
- [x] Write actual-render order/context tests; run and observe expected failures before app changes.
- [x] Place existing current meaning before the image; keep full overview collapsed below the image, remove redundant current-description block, clarify the three biblical contexts without rewriting the seven meanings.
- [x] Keep typography responsive and theme-based; test first-screen meaning at normal size, complete reflow at 200%, and keyboard disclosure behavior.
- [x] Run full `npm test`, commit focused correction with `[skip netlify] [skip ci]` and build a new isolated `FP4-20261018-G-STABLE1-UIUX6D-TREEGUIDE2` candidate.

## Task 2: Regression, independent review and reproducible delivery

**Files:** `tests/uiux6d/{capture,acceptance,run,update}.mjs` as needed; `reports/uiux6d/`; separate `qa-output/uiux6d/` and download ZIPs.

**Interfaces:** Tests consume the committed static candidate and existing synthetic fixtures. Original browser drivers keep their business assertions; output roots and previous-build metadata are supplied explicitly.

- [x] Run fresh all-stage capture at 320×568 and 390×844, four themes, 100/200% root text; desktop and 430px controls. Inspect actual PNGs/contact sheets, not just geometry.
- [x] Verify native keyboard disclosures, axe/contrast, offline guide, first-screen meaning and no unintended horizontal clipping.
- [x] Run selected original tree/path/journal/review/core/backup/integration regression programmes and backup-lifecycle test. Record exact commands and exits.
- [x] Verify unchanged thresholds, non-progress activities, historical sources, content/store files and backup compatibility; actual isolated HTTPS update from frozen MOBILE2 with unchanged personal bytes.
- [x] Obtain one independent read-only whole-change review. Fix only reproduced module blockers with RED→GREEN; record other limits.
- [x] Build twice from exact committed source, verify every file and create deterministic Netlify-QA ZIP; verify extraction and SHA-256.
- [x] Prepare German report, numbered flow audit, before/after screenshots, exact source/build hashes, manual device checklist and separate QA files. Delivery must stop for user approval; no deployment or merge.

## Ledger

- User already authorizes scoped completion and correction. Execute inline; no renewed design selection or implementation permission is needed.
- Existing remote fetch configuration tracks main only; `--track` worktree setup failed without changing code. Created the exact named local branch from verified remote commit 491acf3; explicit push destination will preserve branch scope.
- Product Design capture tools are not exposed here. Existing Playwright/Chromium test harness provides real local screenshots; proprietary reference resources `critical-overrides`/`communication-protocol` were unavailable. No new prototype or publishing workflow is involved.
- Initial biblical statements are not proven false. Context clarification addresses interpretive ambiguity; seven existing meaning texts remain unchanged.

- Task1: two node criteria and both targeted browser states failed before correction. Six guide unit tests now pass; full npm test197/197 passes. Targeted390px night meaning is at y232–344 rather than y1040/y1218. The initial 32-case before set is preserved. Broader typography/keyboard verification follows in Task2.

- Task2 verification: 112 final layout cases, 16 keyboard/axe cases (four offline), all 15 selected original browser programmes, backup lifecycle and five actual HTTPS update checks passed. One independent reviewer repeated 197 tests and four bounded browser states without reproduced findings. App source remains 2b48ae0; two builds have 367 identical files and hash150c015e… .
- The first HTTPS attempt failed before old MOBILE2 could install its worker. A causal same-certificate probe established that page-only TLS trust does not cover this Chromium worker; scoped ephemeral browser trust allowed the genuine five-check update test. Failed attempt and probe are retained, not counted as passes; no app change.
- Scope decision: the old title “Fruchttragender” wraps inside the word at320px/200% in both fresh baseline and candidate captures. Keep the MOBILE2 title hierarchy under the new-module-only constraint; record the less polished but fully readable title as an existing P3 finding.
- Delivery galleries passed 16 additional smoke checks. The complete367-file Netlify ZIP was packaged twice identically and every extracted byte checked. No deployment or merge.
