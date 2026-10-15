# FaithPath maintenance guide

## Start here

FaithPath is a static, offline-first ES module application, with no runtime framework
or backend dependency. Node >=20 runs the build, validators and unit tests.
`package-lock.json` pins Playwright and axe for development checks only.

```sh
npm ci
npm test
npm run build
node scripts/serve.mjs dist
```

If the execution environment restricts the default npm cache, pass
`--cache /path/to/writable/cache` to npm ci. No lockfile change is needed.
On runners that prohibit child-process Git discovery, set `FAITHPATH_BUILD_BRANCH`
to the actual branch name when building. Never silently mislabel a release.

Only serve generated build output. Existing root/dist legacy artifacts are not
the source of truth. A build regenerates dist from src, data and the SW template.
The recovered generated reference/content indices are tracked so a fresh checkout
can run tests and reproduce POLISH1 without an undocumented pre-step.

## Module ownership and contracts

| Module | Responsibility | Mutation contract |
|---|---|---|
| src/store.js | V5 storage, legacy migration, transactions, export and restore | All main-state writes go through transact/restore; persist before publishing state |
| src/import-validation.js | Known-field and live-link validation at backup boundary | Reject invalid imports before writing; never silently repair/drop content; preserve unknown fields |
| src/journal-storage.js | Durable journal/draft coordination and crash recovery | Shared Web Lock, write-ahead recovery record, deterministic mutation callbacks |
| src/drafts.js | Ownership of the existing single draft | Compare exact prior bytes; share journal lock; never clear someone else's draft |
| src/journal-management.js | Journal deletion/undo and path reassignment | Typed relationships, explicit mirror checks, preserve standalone Bible links |
| src/bible-notes.js | Bible-note role deletion and undo | Keep personal text and history when removing the Bible-note role |
| src/domain.js | References, chronology, reminders and documented development | Pure selectors/helpers except explicit attach; no inferred faith rating |
| src/continuity.js | Previous thoughts and before/after review relationships | Read-only; do not invent historical links from similar prose |
| src/core-experience.js | Highlight ranges and path detachment | Preserve unaffected verses and personal records |
| src/bible-journey.js | Unique chapter-end events and summary | Opening a chapter or quiz is not chapter completion |
| src/chapter-questions.js | Book/chapter catalog and reader/collection routing | Stable IDs; same completion keys for both entries |
| src/runtime-model.js | Canonical story/question models | Validate namespaces and mappings; fail clearly on missing required data |
| src/experience-view.js, journey-sword.js, tree-branches.js, themes.js | Product presentation and derived projections | No independent scores or new storage authority |
| src/app.js | Routing, DOM rendering, UI events and orchestration | Delegate data invariants to the modules above |
| scripts/build.mjs, scripts/sw-template.js | Versioned complete release and offline caching | New BUILD for changed runtime; deterministic manifests; explicit update activation |

## Data rules that must survive future work

- Keep `faithpath.v1.rebuild`, the existing draft key, schema V5 and backup shape.
- A journal entry and its exact reflection mirror are separate existing records.
  Update only the explicit matching mirror; preserve independent reflections.
- Physical journal deletion and Bible-note-role deletion are distinct operations.
- `pathIds` and live journal/reflection links must point to existing records at import.
  Historical `sourceKey` and `highlightId` may refer to a deliberately deleted source.
- Import validates more strictly than local legacy loading. Existing V5 data is not
  rewritten by an update; malformed backups are rejected without swapping the store.
- Old numeric/missing record IDs are handled only by the existing migration.
- `journalTransaction` evaluates its mutation twice. Allocate UUIDs/timestamps
  before the callback; do not generate random IDs inside it.
- Input controls are disabled while an asynchronous editor save is pending.
- The draft JSON shape stays `{type,args,values,saved}`. A conflict offers resume,
  export or explicit discard. Draft exports are recovery documents, not main backups.
- Web Locks serialize draft and journal writers where supported. Without Web Locks,
  synchronous byte comparison remains the fallback; truly simultaneous cross-process
  writes cannot be given the same atomicity guarantee. Do not claim otherwise.
- User data is local and unencrypted; device loss requires an external backup.
- Editorial JSON and Excel data must use their own validated approval workflow.
  The separately revised 1300-question content branch is not included here.

## Safe extension strategy

The architecture is maintainable by human developers without a rewrite. The main
pressure point is app.js (routing, markup and actions); styles.css also carries
several generations of overrides. Do not split them all at once.

When a feature is actually changed, extract that feature's view and action boundary
into one small module with explicit arguments. Keep the store and data relationships
central, and cover the existing UI flow before moving code. Suitable later slices:
editor orchestration, import/export UI, reader view, then route dispatch. Each should
be independently reviewable, with no schema/content change in the same commit.

Do not adopt a framework merely to reduce file length. A framework migration needs
a concrete maintenance or platform requirement, a measured benefit and a separate
migration/rollback plan. The current build does not need one.

## Verification and release

1. Preserve an immutable backup commit and its production manifest.
2. Run npm test and the content/runtime validators.
3. Build twice; compare complete artifact manifests and protected content hashes.
4. Run tests/browser.mjs against the generated candidate, not stale dist.
5. Run tests/stabilization-browser.mjs against a local served candidate.
6. Run tests/stabilization-update.mjs with the reproduced POLISH1 output as the
   previous root and the new candidate as the current root. This tests a real
   local Service Worker update, with migration, draft preservation and offline reload.
7. Record exact source commit, BUILD, content/build hashes and tested deployment.
8. Complete real iPhone/Safari, installed PWA, keyboard and VoiceOver checks before
   commercial release. Chromium simulations do not replace them.

Example Chromium commands (requires an installed Chromium executable):

```sh
FAITHPATH_TEST_ROOT=qa-output/stabilization FAITHPATH_CHROMIUM=/usr/bin/chromium node tests/browser.mjs
node scripts/serve.mjs qa-output/stabilization
QA_URL=http://127.0.0.1:4174 node tests/stabilization-browser.mjs
FAITHPATH_PREVIOUS_ROOT=qa-output/production-reproduction-a FAITHPATH_CANDIDATE_ROOT=qa-output/stabilization node tests/stabilization-update.mjs
```

All browser scripts use isolated synthetic local data. No production deploy is part
of these commands. A preview and any production publication need their own release
decision. Cache deduplication and Today reordering are intentionally deferred.
