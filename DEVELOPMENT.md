# Development and verification

Use Node **24.19.0**, npm from that distribution, Python 3.12 and the pinned
`openpyxl==3.1.5` requirement for full QA. The historical Node >=20 package engine
describes the application build; it is not the complete lint/test toolchain floor.
ESLint10 requires a supported recent Node release. Do not use an old Node20 image
for the full maintenance gate.

```sh
npm ci
python3 -m pip install -r requirements-nt-import.txt
npx playwright install --with-deps chromium
npm run quality
```

On restricted hosts use `npm ci --cache /tmp/faithpath-npm-cache`. Do not change
HOME or share a writable dependency-directory symlink with another worktree.
An already installed browser can be selected with `FAITHPATH_CHROMIUM=/usr/bin/chromium`.

## Individual checks

```sh
npm test
npm run validate:nt-quiz
npm run validate:nachlese-editorial
npm run lint -- --max-warnings 5
npm run check:modules
npm run check:contracts
FAITHPATH_OUT=qa-output/local-a npm run build
FAITHPATH_OUT=qa-output/local-b npm run build
node scripts/check-build.mjs qa-output/local-a qa-output/local-b
node scripts/serve.mjs qa-output/local-a
```

Open the generated output at `http://127.0.0.1:4174`. Root and tracked legacy
`dist` artifacts may be stale; they are not the candidate. New outputs belong in
`qa-output`, never over historical QA or another branch's candidate.

The lint gate checks correctness and strictly rejects unused bindings in the four
new controllers. Five pre-existing unused-binding warnings remain in byte-protected
Store/legacy validation/tests. They are explicit debt, not errors or new exceptions.
No formatter or autofix is run.

## Full gate and provenance

`npm run quality` runs both approved-master validators, all units, lint, the import
graph, protected contracts, two complete builds and byte comparison, the original
core browser/axe program, the 43-route responsive audit, platform fault boundaries
and an actual failed/successful worker update with synthetic persisted data.
Evidence is under `qa-output/phase7/gate` (override `QA_GATE_OUT`).

The update baseline is the exact TREEFINAL build. Supply an immutable
`FAITHPATH_PREVIOUS_ROOT`, or the gate archives exact Git commit `7d24aea...` into
a disposable directory and builds it with its original source/branch metadata.
No worktree/ref or remote is altered. Full Git history is needed for this and
contract comparisons. Builds normally record actual HEAD and branch. Metadata
overrides `FAITHPATH_BUILD_COMMIT` / `FAITHPATH_BUILD_BRANCH` are for verified
historical reconstruction only; never label uncommitted code as a tested commit.

Browser tests use isolated profiles and synthetic entries. The full gate passes
an isolated `QA_OUT` to the original core program and captures its log and artifacts.
Axe contexts allow diagnostic injection; the route audit checks the unmodified CSP.
Chromium automation is not a physical iPhone/Safari/VoiceOver test.

## CI

`.github/workflows/quality.yml` uses pinned official action commits, Node24,
Python3.12 and Playwright Chromium. It has `contents: read`, no persisted checkout
credential, secrets, merge, publish or deployment steps. It uploads QA evidence on
success or failure. Push triggering is restricted to this maintenance branch;
pull requests and manual dispatch can run the same checks. Netlify must remain
separately controlled; maintenance commits use `[skip netlify]`.

The obsolete write-capable ZIP importer is retired here; see
[the historical record](docs/LEGACY_IMPORT_WORKFLOW.md). Other branches remain
untouched. A configured workflow is not evidence of a completed hosted run; see
the report for actual local/hosted status.

## First-seed candidate checks

Feature branch: `feature/ux-first-seed-living-tree-20261019`.
Run the existing npm validation/test/lint/build checks first. Start a built app on
loopback with `PORT=4590 node scripts/serve.mjs <build-root>`. Then use
`QA_SELF_HOST=<build-root> node tests/first-seed/flow.mjs` (actual backup restore
and offline resume with the TCP listener disconnected). Other programs use
`QA_URL=http://127.0.0.1:4590`: `faults.mjs`, `motion-browser.mjs` and `visual.mjs`.
`motion-browser.mjs` records WebM when Playwright's ffmpeg is installed.
`performance.mjs` expects both immutable baseline4580 and candidate origins.
`update.mjs` hosts an isolated same-origin old→failed→new worker experiment.

`.github/workflows/first-seed-qa.yml` runs read-only Chromium/Firefox/WebKit jobs
on this feature branch. It never deploys or merges. Hosted engine identity and
results must be read from actual runs; configured jobs do not imply success.
The full UIUX1–5 browser runner accepts QA_URL, QA_RESTORE_URL and QA_DEST.
Historical photo selectors were changed only where original SVG replaced photos;
path order, touch geometry, histories and data assertions remain in place.

Human understanding cannot be asserted by Playwright. Ten blank participant
sheets and neutral tasks live in `reports/first-seed/`; physical Safari/PWA/
VoiceOver and battery/performance checks remain separate gates.
Exact source metadata, repeatable build commands and browser prerequisites are
in `reports/first-seed/REPRODUZIEREN.md`.
