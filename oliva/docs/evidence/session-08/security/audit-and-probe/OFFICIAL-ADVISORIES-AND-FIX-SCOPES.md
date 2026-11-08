# Official advisory and compatibility research — OLIVA 0.8

Read-only research. No install, source, lockfile, project configuration, GitHub reference, workflow or deployment mutations. Registry and official upstream GitHub GET requests used inherited proxy/CA trust. Evidence fetched at 2026-11-08T08:21:34.403007+00:00.

## Confirmed advisory details

| Installed dependency | Advisory | Official vulnerable range | Official first patched version | Exploitation preconditions |
| --- | --- | --- | --- | --- |
| glob 13.0.6 | [GHSA-3g3m-2fjr-6pw4](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4), CVE-2026-118773 | >=9.0.0 <=14.0.1 | 14.0.2 | An async glob/globStream walk uses AbortSignal to bound traversal over attacker-influenced patterns or attacker-controlled directory trees. Cancellation rejects but traversal continues in background. Availability impact; advisory observed no confidentiality/integrity impact. |
| minimatch 10.2.6 | [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249), CVE-2026-118764 | >=7.0.0 <11.0.1 | 11.0.1 | Attacker supplies a pattern, with optimizationLevel >=2. The **/../ preprocessing transformation amplifies patterns, followed by quadratic pairwise processing. CPU/memory availability impact. |

The GitHub advisory database currently lists the ranges above. There is, however, a verified upstream glob13 backport not yet excluded by that advisory range:

- Registry publishes `glob@13.0.7` under `v13-legacy`.
- [Official compare v13.0.6...v13.0.7](https://github.com/isaacs/node-glob/compare/v13.0.6...v13.0.7) contains backport [d94a8c8d0a89b89436d9612ebea6f9995104e05e](https://github.com/isaacs/node-glob/commit/d94a8c8d0a89b89436d9612ebea6f9995104e05e), `fix: do not continue walking after signal abort`, and a changelog entry explicitly saying `Backport fix for walking after abort signal`.
- Its four abort branches change `if (this.signal?.aborted) cb()` to `if (this.signal?.aborted) return cb()`; upstream adds post-abort traversal regression checks.
- `glob@13.0.7` retains the same dependencies (`minimatch:^10.2.2`, `minipass:^7.1.3`, `path-scurry:^2.0.2`) and Node engine range (`18 || 20 || >=22`). It satisfies Expo's existing `glob:^13.0.0` ranges. This is a real abort-path code fix while audit metadata may continue to flag it; it is not a complete audit cleanup because minimatch remains affected.

## Current SDK58 ecosystem state

Registry state checked for all stable package releases and dist-tags, not just local install:

- Latest Expo is 58.0.23; latest @expo/cli is 58.1.19; latest @expo/fingerprint is 0.21.9. All three already match this project.
- Expo58.0.23 requires CLI `^58.1.19` and fingerprint `^0.21.9`.
- Latest CLI58.1.19 still requires glob `^13.0.0`.
- Latest fingerprint0.21.9 still requires glob `^13.0.0` and minimatch `^10.2.2`.
- Latest glob is 14.0.4; latest legacy13 is 13.0.7. Latest minimatch is 11.0.5; the highest published stable minimatch10 is 10.2.6. No minimatch10 fixed backport is presently published.

Therefore a normal SDK58 patch update cannot currently remove both advisories. No React, React Native or Expo major upgrade is needed to *experiment with* a scoped transitive repair, but that candidate is outside Expo's declared glob/minimatch semver ranges.

## Smallest defensible fix scopes

1. **Low-change partial fix:** refresh only the glob resolution to 13.0.7 under existing ranges. No manifest override is required. This addresses the verified cancellation bug without glob API changes. It does not fix the minimatch advisory; do not claim audit-zero or full security clearance. Audit may retain the glob finding because its range has not excluded the backport.
2. **Complete transitive candidate, requiring explicit implementation decision and validation:** couple glob14 and minimatch11, scoped to the two actual Expo parents. Suggested exact current pins for review only:

```json
{
  "overrides": {
    "@expo/cli": { "glob": "14.0.4" },
    "@expo/fingerprint": { "glob": "14.0.4", "minimatch": "11.0.5" }
  }
}
```

This retains the declared Expo58/React19.3/RN0.88.1 versions but makes transitive major changes. It is **not verified compatible with Expo58 by this research**. CLI's observed APIs (`glob`, `sync`, `globStream`) remain exported; fingerprint uses `new Minimatch`, `pattern`, `negate`, and `match`, which remain. Node24.22.1 satisfies glob14.0.4's `18 || 20 || >=22` and minimatch11.0.5's `20 || >=22` engines. Validation should inspect the resolved tree, run audit/typecheck/unit/PWA export/browser/offline checks, and directly exercise fingerprint ignore-pattern behavior; platform-specific Windows matching changes matter if Windows builds are supported.

**Do not globally force minimatch11 while retaining glob13.** This is a concrete API incompatibility: glob13's `Pattern.isRegExp()` and Processor test parsed pattern entries using `instanceof RegExp`, while minimatch11 changes `Minimatch.set` magic entries to `Matcher` objects. Glob14's corresponding code was changed to handle that new representation. A naive minimatch-only override can silently alter or break file matching.

Upstream changelogs explicitly document further major changes:

- glob14 removes debug, updates Windows rooted ignore semantics, changes some internal Pattern/Processor/GlobWalker APIs, and adopts minimatch11/path-scurry3.
- minimatch11 removes makeRe/regexp/AST and several formerly public internal methods, changes empty extglob segment behavior and fixes Windows/partial glob matching.

These facts support a coupled candidate, not a blanket assertion that overrides are SDK58-compatible. Waiting for Expo-supported constraints while accepting restricted trusted-build exposure is also defensible when only private static PWA output is distributed. Static-output mitigation reduces deployment reachability; it does not patch developer/CI tooling.

## Local package evidence

Observed lock versions: expo58.0.23, nested @expo/cli58.1.19, @expo/fingerprint0.21.9, glob13.0.6, minimatch10.2.6.

Observed local glob13 API coupling: `node_modules/glob/dist/commonjs/glob.js` builds patterns from `m.set`; `pattern.js:109` and `processor.js:194,222,273` use `instanceof RegExp`. Fingerprint's `build/utils/Path.js` uses `Minimatch`, `.pattern`, `.negate`, `.match` with default `dot:true`, without optimizationLevel2 in that direct call path.

## Saved primary evidence

- glob-advisory-official.json / minimatch-advisory-official.json: complete GitHub official advisory API responses.
- glob-13.0.7-compare.json: official minimal backport diff and commits.
- glob-major-compare.json / minimatch-major-compare.json: official current-installed-to-first-fixed major comparisons.
- glob-14.0.2-changelog.md / minimatch-11.0.1-changelog.md: official upstream change logs.
- glob-14.0.2-registry.json / minimatch-11.0.1-registry.json: first-fixed release metadata.
- expo-registry-current-summary.json / expo-cli-registry-current-summary.json / expo-fingerprint-registry-current-summary.json / glob-registry-current-summary.json / minimatch-registry-current-summary.json: registry latest/stable version/constraint summaries.
