# Production recovery — 2026-10-15

## Result

The complete deployed application is reproducible. Two independent builds match all
319 production artifact files byte for byte, including the generated service worker,
both integrity manifests and the two hosting configuration files.

- Live build: `FP4-20261006-G-POLISH1`
- Netlify site: `61a5e54b-0587-4de5-9203-4fa5cd03ee7e`
- Published deploy: `6ac4c83bfdb6fe46924d3b81`
- Content SHA-256: `812f002add339a256d807530d3509297678e41f9e27e381938e50036234c36b9`
- Build SHA-256: `9ab0a7812559790506f4457f2c16adea6f23594d2569140f5eb5a8407e386573`
- Backup branch: `backup/production-polish1-20261015`
- Closest original Git base: `e38644e3d5b1311f1abf0dc08a7ecb881f3c110b`

## Sources and limits

The supplied audit ZIP passed its 38-file checksum list and ZIP integrity check.
Its report, test logs, historical QA and manifests were examined. The live manifest
still equals the audited manifest. All 316 publicly downloadable manifest entries
were downloaded again and verified. `_headers` and `_redirects` are recovered from
the Git base and match the production manifest hashes. `release-integrity.json`
itself is the 319th artifact and also matches the rebuilt bytes.

All five current GitHub branch heads were compared, not just develop/v4. See
`qa/production-recovery/branch-comparison.json` for full path-level results.
The tree and final-experience branches each match 307 production manifest entries.
The tree branch is the nearest sequential base; the separate content branch is
based on develop/v4 and must not replace the later production UI.

Recovered public originals: `src/app.js`, `src/experience-view.js`,
`src/journey-sword.js` (previously missing from Git), `src/version.js`, `styles.css`,
and the two generated source data indices. Other runtime/data/assets already match.
The original index template, SW template, validators, package lock and Netlify
build/publish configuration are retained from Git. Their ability to produce the
exact deployment is verified, not assumed.

The original unpublished Git commit `ae619f53` and its historical development
branch are still unavailable. This is a reconstructed source commit, not that
historical commit. Missing original development logs/tests are not invented.
No missing deployed runtime or hosting file remains.

## Reproduce from the backup commit

Requires Node >=20. The production build has no third-party runtime/build dependency.

```sh
git switch backup/production-polish1-20261015
node scripts/reproduce-production.mjs
npm test
```

The only build-recipe addition is `FAITHPATH_BUILD_BRANCH`: an explicit provenance
metadata override for the original `BUILD.txt` branch string. Without it, builds
report the real current branch as before. It changes no application behavior.
The exact recipe above deliberately uses the historical metadata to reproduce
the historical artifact; it does not claim the backup branch is the old branch.

Serve generated output, not old checked-in `dist/` or root service-worker artifacts:

```sh
node scripts/serve.mjs qa-output/production-reproduction-a
```

## Phase gate

Phase 1 PASS: runtime reconstruction and reproducibility are complete. Phase 2
may proceed from this immutable backup commit on a separate development branch.
Main, the production pointer, editorial datasets and user storage are untouched.
