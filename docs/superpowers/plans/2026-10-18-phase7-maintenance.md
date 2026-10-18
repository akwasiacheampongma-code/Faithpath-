# Phase7 maintenance implementation plan

> **For agentic workers:** Execute inline with superpowers:executing-plans; one independent final review. Checkboxes are the execution ledger.

**Goal:** Fewer maintenance risks through small explicit orchestration boundaries, fault coverage, reliable CI and current documentation.

**Architecture:** See the written design; preserve Store V5, existing domain/content/views and appearance. Extract routing, backup session ownership, worker status and Bible loading; remove only measured generated duplication.

**Tech Stack:** Vanilla ESM PWA, Node24 development, existing Playwright/axe, one ESLint development tool, Python/openpyxl for existing import checks.

**Spec:** docs/superpowers/specs/2026-10-18-phase7-maintenance.md and the user's complete Phase7 instruction.

## Global constraints

- Only maintenance/stability-phase7-20261018 from7d24aea. No main/QA/production/content branch change, deployment or merge.
- No content IDs/texts, LocalStorage keys, SchemaV5, historical relationships, tree count or backup-format change. No automatic data reset/repair.
- No CSS redesign, runtime dependency or framework/TypeScript migration.
- Retain old reports/artifacts. Generate candidates under qa-output/phase7, never overwrite tracked dist.
- Any failed mandatory gate is NO-GO. Physical iPhone/Safari/VoiceOver stay OPEN.

## Review focus

- Encoded/invalid deep links, quiz return-route identity and stale reader promises.
- Late file results, newer previews, modal/route cancellation and pending restore locks.
- Denied storage, corrupt data and deterministic journal recovery retain exact original bytes.
- Worker status send/timeout failures close ports; failed updates retain the complete old offline version.
- Deduplicated generated Bibles retain all132 canonical files and old/current app access; CI has no write/publish authority.

## Task1: Audit and routing boundary

**Files:** src/app-router.js, src/app.js, tests/app-router.test.mjs, architecture/spec/plan and baseline evidence.
**Interfaces:** createAppRouter receives explicit views/helpers/state/DOM dependencies and returns render(); parseHashRoute preserves existing route parsing. No Store mutation.

- [x] Record clean branch/remote refs, immutable TREEFINAL,198 baseline tests and measured module/build metrics.
- [x] Capture baseline product routes; write parse/dispatch/race/focus contracts and observe RED for the new boundary before extraction.
- [x] Extract route rendering without changing behavior; run focused contracts, baseline-equivalent browser check and all units, inspect diff, commit.

## Task2: Backup session ownership

**Files:** src/backup-controller.js, src/app.js, tests/backup-controller.test.mjs.
**Interfaces:** controller owns only transient request/mode/session; inspectFile(file), invalidate(), handles(action), handle(action,data,element). Existing store and view callbacks are dependencies. Invalidate on close/hash/new flow before async continuation.

- [ ] Characterize late read and restore-lock cancellation; RED→implement small extraction→GREEN.
- [ ] Run backup lifecycle/races/roundtrip and all units; preserve editor's actual submit handler regression. Inspect diff and commit.

## Task3: Platform boundaries and measured payload reduction

**Files:** src/pwa-controller.js, src/bible-loader.js, src/app.js, scripts/build.mjs, focused Node tests.
**Interfaces:** worker status/activation have explicit platform callbacks, no data writes; cached Bible loader returns original JSON, evicts failures. Build retains root Bibles and removes only the duplicate generated versioned set.

- [ ] Write worker timeout/send/error and Bible retry/coalescing contracts; observe RED, implement, run full units and relevant browser checks.
- [ ] Write full generated-layout/integrity test; observe duplicate payload failure before changing build. Remove duplicate only; verify132 canonical source-equal Bibles, full hash map and offline worker fallback. Separate commits.

## Task4: CI, contracts, documentation and final gate

**Files:** .github/workflows/, eslint.config.js, package/lock, scripts/phase7 checks, tests/phase7/, five canonical Markdown files and reports/phase7/.
**Interfaces:** read-only CI consumes committed source and immutable TREEFINAL; all outputs/profiles synthetic. No remote write/merge/deploy step. Candidate BUILD FP4-20261018-G-STABLE1-PHASE7-MAINT1.

- [ ] Pin development lint tool, run static audit; remove only proved dead code. Add portable CI without weakening original tests; archive destructive one-shot import workflow.
- [ ] Document architecture/risks, data contracts, development/release/rollback; update old maintenance index.
- [ ] Freeze final source; all units/content/static checks, relevant original browser programmes, functional/axe routes, storage faults, actual old→new/offline/failed-update tests and two complete byte-equal builds.
- [ ] Obtain independent whole-change review; fix reproduced blockers with RED→GREEN and a green suite. Document all limitations.
- [ ] Deliver exact source/delivery commits, hashes, build/QA ZIPs and clear device-gate GO/NO-GO. No merge or deployment.

## Ledger

- Native inline implementation is authorized by the user's explicit audit-then-implement instruction. No new product choice, framework or storage redesign is needed, so do not stop for redundant design/plan authorization.
- Existing linked worktree reused; only new maintenance branch created. Previous remote refs and artifacts are retained.
- Audit: app2076 lines/121363 bytes/100 functions; nine document and six window listeners. Store/draft recovery modules already have substantive fault tests. Preserve their authority.
- Generated duplicate Bible payload:132 files,8759230 identical bytes beyond the canonical root copy. Performance claims will be limited to measured bytes/requests, not invented phone speedups.
- Default npm cache is unavailable in this workspace. Use /tmp/faithpath-phase7-npm-cache; never change HOME or read credential values.
- Existing node_modules is a shared symlink. Before installing the lint dependency, replace only this worktree's symlink with an independent install; do not mutate another branch's dependency directory.
- No skill helper script is available as a filesystem executable here; this plan is the persistent ledger. Independent review remains mandatory as explicitly requested by the user.

- Task1 complete: six route contracts pass (including encoded step focus and stale async reader). All204 unit tests pass. Existing core browser programme passed against immutable TREEFINAL before the refactor; original43-route programme plus onboarding storage-failure checks passed against the intermediate router build at390/night. Original business assertions retained; new test environment/output options prevent overwriting historical QA.
- The first mechanical routing transfer wrongly replaced suffix s() inside marks/focus. The new dispatch and focus contracts caught it; regenerate with a word-boundary-only state accessor substitution. No failing intermediate implementation was committed.
- Intermediate router build tests use an isolated working-tree build, not the final claimed release. The final source/build gets fresh full evidence later.
