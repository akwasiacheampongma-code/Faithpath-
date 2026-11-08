# Fingerprint and glob/minimatch compatibility probe

**Result: 7/7 probe groups passed**, exit0. Executed 2026-11-08T08:34:40.654Z–2026-11-08T08:34:58.728Z on Nodev24.22.1 / Linux. This evidence supports the scoped glob14.0.4/minimatch11.0.5 candidate for the tested OLIVA0.7 Linux build surface. It is not an upstream Expo compatibility endorsement or a native/store release certification.

## Scope and reproducibility

- Candidate project: `/workspace/oliva-dependency-probe`, immutable OLIVA0.7 source snapshot prepared by the parent agent.
- Candidate dependency APIs: @expo/fingerprint0.21.9, glob14.0.4, minimatch11.0.5 both directly under fingerprint and under glob.
- Baseline API implementation: existing `/workspace/faithpath-next/node_modules` only read, @expo/fingerprint0.21.9 with glob13.0.6/minimatch10.2.6. Both baseline and candidate fingerprint calls used **the same `/workspace/oliva-dependency-probe` project root and its actual inputs**.
- Public API used: `createFingerprintAsync(projectRoot, {silent:true,concurrentIoLimit:2})` with ordinary default source selection, both native platforms and the default balanced preset. No source skip, empty fake input or relaxed preset was introduced to make the check pass.
- Fixture changes and test harness are confined to this report directory. No app source, project manifest or lockfile was modified by this harness. No installs were performed by this helper. `TMPDIR=/tmp/oliva-dependency-probe-tmp` was set, proxy/CA inherited unchanged.
- Fingerprint artifacts omit raw `contents` values and store their SHA256 instead; config values are not printed in chat/log.

Command:

```sh
TMPDIR=/tmp/oliva-dependency-probe-tmp node /workspace/oliva-security-audit/reports/dependencies-0.8/probe/fingerprint-api-probe.mjs
```

## Actual results

| Probe group | Result and evidence |
| --- | --- |
| Real project default fingerprint repeated | Identical full source inventories and hashes across two candidate calls; 33 sources, 33 active. Main hash `2fcfdb0604c9404081d557045f9426ceafb46cc5`. |
| Baseline versus candidate on the same real0.7 project | Same hash, same source inventory, zero fingerprint source diffs. This is stronger than determinism alone and directly checks the dependency upgrade against actual application inputs. |
| Fixture directory integration through public fingerprint API | Hidden included file is hashed. Changes to both normal and hidden ignored temporary files preserve the entire fingerprint. Changing an included `.ts` file changes the fingerprint with exactly one changed directory source. |
| Fingerprint Path matcher API | Six explicit expectations pass: dot files, extglob, exact versus nested `build`, recursive ignores, and ordered negation. |
| glob APIs used by Expo | `glob()`, `sync()`, `globStream()` return the same expected three `.ts/.tsx` matches with dot files and excluded directory. |
| Documented major edge changes | Baseline and candidate differ exactly as documented: Windows `C:/a/../../x` no longer matches `x` with optimizationLevel2; `a/b/?(x)` no longer matches the empty trailing segment in `a/b/`. Baseline=true and candidate=false in both cases. |
| Bounded AbortSignal regression | Both `glob()` and `globStream()` abort on the first directory read; readsAtRejection=1, readsAfter100ms=1, additionalReadsAfterRejection=0. Small real fixture, no load test. |

The real-project source categories were `bareGitIgnore`, `expoConfig`, `expoConfigPlugins`, `packageJson:scripts`, `package:react-native`, `expoAutolinkingAndroid/Ios`, and `rncoreAutolinkingAndroid/Ios`. Successful return was checked for all expected main config/package categories and >10 real active sources, so a silently empty fingerprint would fail.

## API boundary interpretation

Official [Expo fingerprint API documentation](https://docs.expo.dev/versions/latest/sdk/fingerprint/) defines `createFingerprintAsync`, ordinary default Android/iOS inputs, `ignorePaths`, and `extraSources`; its HTML snapshot is saved in this folder. The npm-published @expo/fingerprint0.21.9 implementation and type declarations were inspected directly, with file digests saved:

- `build/Fingerprint.js`: normalizes options, collects sources, sorts/deduplicates and hashes them; no substitute test API.
- `build/Fingerprint.types.d.ts`: `ignorePaths` use glob-style matching with no gitignore partial matching; documents `extraSources` and public fingerprint API options.
- `build/utils/Path.js`: `new Minimatch(pattern, {dot:true})`, `.pattern`, `.negate`, and `.match`. These used APIs work with the candidate in the integration fixture and real project.
- `build/Options.js` and `Presets.js`: normal balanced preset and default source collection are retained in this probe.
- `build/sourcer/Sourcer.js`: actual Expo config, Android/iOS Expo and RN autolinking, scripts and known dependencies are collected.
- `build/hash/Hash.js`: real included/ignored directory hashing is exercised by the fixture.

Official upstream changelogs are preserved in the parent report folder. They establish why glob14 and minimatch11 must be coupled: minimatch11 changes parsed magic portions in `Minimatch.set` from RegExp to Matcher; glob13 checks `instanceof RegExp`, while glob14 consumes Matcher. The candidate exercises the coupled upgrade. The success of this candidate does not validate a minimatch-only override under glob13.

## Practical limits

The Windows check explicitly sets `platform:'win32'` in minimatch on Linux. It validates documented string-matching semantics, not Windows filesystem, UNC traversal or Windows build execution. Native SDK compilation, native devices and store release validation are outside this harness; parent-managed web/native-JS exports and application QA remain separate evidence. The two documented semantic differences are retained in the results rather than hidden by changing expectations to old behavior.

## Artifacts

- `fingerprint-api-probe.mjs`: complete reproducible harness.
- `fingerprint-api-probe-results.json`: versions, all expectations/results, timing and limitations.
- `fingerprint-api-probe.log`: terse execution log.
- `real-project-fingerprint-first.json`, `real-project-fingerprint-second.json`, `real-project-old-dependencies-fingerprint.json`: sanitized source inventories/hashes.
- `fingerprint-package-source-digests.json`: exact npm-published implementation evidence.
- `fingerprint-fixture/`: scratch inputs, including a node_modules symlink to the isolated candidate project.
