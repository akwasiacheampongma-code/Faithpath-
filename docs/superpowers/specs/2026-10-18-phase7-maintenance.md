# Phase7 maintenance design

Authority: user request “FaithPath – Phase7: Maintainability & Stability”, 18.10.2026. Purpose: a human-maintainable existing Vanilla PWA, not a rewrite or new product. The user explicitly authorizes audit followed by small implementation units, with no deployment/merge or content/schema change.

## Baseline and measured findings

Start at fix/treeguide2-mobile-final-20261018, commit7d24aea30bec5b0b8d43e199f3cadfc6305c1e3e; immutable appce89422411ec3382c62ba7683167cf1b6db4a457 and TREEFINAL/hash5390ec0a00ba171bc0f997a5fd5c8ba11b7e58b508a3085c488c21d95add84aa. The maintenance branch is maintenance/stability-phase7-20261018. All21 preexisting remote refs are recorded before work. Baseline198 unit tests pass.

app.js has2076 lines/121363 bytes,100 function declarations and15 document/window listeners. Many actual views/domain functions already live in modules. Its remaining routing, backup-session lifetime and worker messaging are the narrow orchestration seams to improve. Store/journal/draft recovery already persist before publishing and reject stale ownership; preserve them.

The build currently includes identical132-file offline Bible sets twice: root data/bibles and releases/BUILD/data/bibles. The redundant payload is8759230 bytes. getBook fetches the root paths; the versioned runtime catalog loads seven other JSON files. Remove only a proven unused generated duplicate, retain every source file and root Bible path, then test both translations and old/new worker generations.

The only existing Actions workflow is an obsolete manual source-ZIP import with contents:write, root-file deletion and git push. Archive it as inert historical documentation and replace it with read-only validation jobs. No new CI job may deploy, push commits or merge.

## Selected boundaries

1. **app-router.js:** own hash parsing, dispatch, async-route token checks and route-specific focus restoration. Receive explicit view callbacks, state getter and DOM/location boundaries. Keep paths, query semantics, legacy canonical-story redirection, quiz keys, compose drafts and navigation focus unchanged. No data writes.
2. **backup-controller.js:** own transient import request tokens, selected mode and restore session. Expose inspectFile/invalidate/action handling. Keep store.prepareImport/restore, exact-byte ownership, explicit two-step confirmation, Web Lock recheck and undo preparation. Closing, navigating and newer inspections cancel older asynchronous reads. No new persistence.
3. **pwa-controller.js and bible-loader.js:** move worker lifecycle/status and Bible request caching out of app.js. Preserve manual activation and old-reader race guards. Close MessagePorts on success/timeout/send failure; handle unavailable registrations without unhandled event rejections or stale ready state. Bible failures evict failed promises so retry works; never fabricate missing text.
4. **Application coordinator:** compose these boundaries and keep the existing editor/action/domain adapters. Do not split every view or rewrite its markup. Remove only statically verified dead declarations/imports.

ES modules and focused JSDoc contracts are sufficient. React/Vue/Svelte would add a second rendering/lifecycle system and broad regression exposure without solving the current data authority; TypeScript migration is not part of this task. ESLint is a justified development-only dependency for undeclared bindings, unreachable branches and safe new-module boundaries, not a runtime dependency. Existing visual CSS and all seven tree rules stay intact.

## Stability scope and limits

Exercise denied reads/writes, quota failures, malformed/legacy data, journal write-ahead recovery, restore cancellation after lock waits, failed Bible requests, unavailable worker messaging and failed incomplete worker updates. Reuse existing core transaction tests rather than invent a new storage layer.

LocalStorage is not a cross-process transaction engine. Existing exact-byte stale checks remain; journal/draft writers share Web Locks where available. Truly simultaneous generic writes without a shared asynchronous lock cannot be claimed serializable. Preserve the sync Store API and document this remaining boundary; do not silently add a lock key/schema or an async-store migration.

## CI and verification

Read-only workflow: content/master validators, all unit tests, ESLint/static module graph, data-contract checks, two deterministic production-format builds, portable Chromium/axe product checks and a real worker update with synthetic existing data and a failed-update fallback. Use isolated output/profile directories. No Netlify commands, write-scoped token, pull_request_target or automatic merge.

Baseline and candidate browser flows cover reader/both translations, chapter and story questions, paths, journal, reviews/tree, navigation and backups. Preserve original business assertions; supplement them with focused new regressions and measured before/after screenshots. Each refactor is committed only after its relevant tests and full unit suite pass.

Final source is frozen before final browser/build evidence. Compare two complete build maps, unchanged content hash8630cf25034cbd8ee28060b2318addc25d26611317439d08ac2fa5cae938e309, source/contracts and raw personal bytes. A failed mandatory gate means NO-GO. Independent code review is required; real iPhone/Safari/VoiceOver remain OPEN.

## Documentation

Use root ARCHITECTURE.md, DEVELOPMENT.md, DATA_CONTRACTS.md, RELEASE_CHECKLIST.md and MAINTENANCE_REPORT.md as current canonical documents. Replace stale advice in docs/MAINTENANCE.md with links to them; keep historical reports as dated evidence. Explain module responsibilities, exact APIs, data authority, reproducible commands, failure/rollback boundaries and measured remaining debt.
