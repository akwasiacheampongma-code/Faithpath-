# First seed implementation plan

> Execute inline with superpowers:executing-plans; one fresh final review.

**Goal:** A real optional first personal story and a living seven-stage olive tree.
**Architecture:** existing StoreV5/journalTransaction/draft ownership; pure first-seed model/view plus controller; shared local SVG tree and lifecycle motion controller.
**Tech Stack:** Vanilla ESM, CSS/SVG, existing Node/Playwright/axe. No runtime dependency.
**Spec:** docs/superpowers/specs/2026-10-19-first-seed.md

## Global constraints

- Preserve all content/keys/schemaV5/thresholds/history/IDs/backup envelopes.
- Only feature/ux-first-seed-living-tree-20261019; no main/prod/QA deploy/merge.
- Mark human and real-device gates OPEN; no invented performance/FPS evidence.

## Review focus

- Other draft, stale tab, queued save failure or route interruption retains words.
- Stable transaction IDs and two evaluations cannot produce duplicate paths.
- Slow Scripture response cannot overwrite a newer topic/translation/route.
- Symbolic germination never awards tree development; hidden animation stops.
- Large tree and200% text leave actions usable on320 without clipping.

## Task1: Baseline and model

Files: src/first-seed/model.js, tests/first-seed-model.test.mjs, baseline captures.
API: newSeedDraft(ids,at), seedPassage(values,refs), validateSeed(values),
commitSeed(data,draft,ref) deterministic returns pathId. No storage in model.

- [x] Capture baseline welcome/Today/path/tree and payload/performance.
- [x] RED missing model behavior; GREEN exact relationships, no growth, duplicate
  save, XSS strings, invalid/empty/long inputs, source mappings in both Bibles.

## Task2: Real introduction

Files: src/first-seed/controller.js, view.js, src/app.js, app-router.js, onboarding-view.js.
API: controller.render(), handle(action,data), input(event), leave(), resume(),
hasUnsavedWork. Dependencies: existing store/storage/refs/getBook/UI adapters.

- [x] RED controller ownership/restore/queued save/cancellation cases.
- [x] Implement seven scenes and exact owned-draft journalTransaction commit.
- [x] Preserve old shortcuts; first-seed resume interception and navigation guard.
- [x] Browser flow, reload, multi-tap, quota/denied/other-draft/late fetch; full units.
- [x] Commit introduction package after green checks.

## Task3: Tree, paths, Today and motion

Files: src/olive-tree.js, src/living-motion.js, src/verbunden/seed.css,
today-view.js, paths-view.js, experience-view.js, build.mjs and targeted tests.
API: renderOliveTree(level,{context,label}), setupLivingMotion(root) -> cleanup.

- [x] RED all7 stage mappings/no mutations/unique SVG IDs/accessibility.
- [x] Implement original layered art, finite motion, visibility/reduced-motion
  controls and growth transition only from domain level changes.
- [x] Integrate prominent Today/tree/paths and clear contextual path help.
- [x] Real screenshots, inspect/refine, all themes/widths/font scales; full units.
- [x] Commit visual package after green checks.

## Task4: Full QA and delivery

Files: tests/first-seed/, scripts/check-contracts.mjs, reports/first-seed/,
UX-study templates, developer/release documents, unique version.js.

- [x] Keep frozen data/domain hashes; allow only reviewed UI files.
- [x] Run lint/units/content/reproducible builds/core and original regression,
  first-seed E2E, axe, privacy/no-logs, offline/update/failure and performance.
- [x] Execute available Chromium/Firefox/WebKit; record actual environments.
- [x] Prepare ten blank participant sheets and aggregate UX acceptance scoring.
- [x] Fresh independent review; fix demonstrated blockers and rerun affected gates.
- [x] Deliver exact source/evidence commits, screenshots/animation, full reports,
  hashes and deterministic Netlify QA ZIP. No publication; physical/human OPEN.
