# OLIVA 0.12: actual GitHub Actions verification

Actual run [42752829627](https://github.com/akwasiacheampongma-code/Faithpath-/actions/runs/42752829627) completed with **success**, attempt **1**, at **2026-11-10T04:09:40Z**. It tested exact GitHub source-backup commit `869b1f750d4b0ff96dcfe6d247280840be5e2c4f` on `feature/oliva-v012-nt-study-20261109`. Independent result: **success**. All independent verification checks passed.

Evidence was retrieved and independently checked at `2026-11-15T21:06:16.626517+00:00`. The report freshness checks refer to the original GitHub run's step times.

The downloaded raw reports contain **225/225 unit assertions** and **108/108 browser cases**, with **0 failed, 0 skipped and 0 flaky browser cases**. Browser attempt-count distribution: `{'1': 108}`; retry-value distribution: `{'0': 108}`. Unit suite timestamps and browser result timestamps were checked against their actual logged GitHub step windows. The browser report's CI and Git metadata were checked against this exact run and commit. See [verification.json](verification.json) for every gate and any failure details.

The actual remote build output reported `oliva-76da5c4a8edf3381`. The build ID was taken from `Offline bundle:` output; the local/private build ID is separate. Exact-head workflow, composite action, test configuration and package snapshots are retained. The four exact upstream action manifests each declare their own `node24` runtime, their pinned downloads appear in the actual log, and the explicit dependency audit reported zero vulnerabilities. The original tag and source subtree identities are retained in [source-identities.json](source-identities.json).

Artifact `13735000825` (`oliva-quality-869b1f750d4b0ff96dcfe6d247280840be5e2c4f`): **9,833,686 bytes**, **104 unique ZIP entries**, SHA-256 **`f16c9763e0a0939ea2353ddb6b20d01982e8cc8ff7bc16e3ec4f20b695f416f9`**, equal to GitHub's digest. Every ZIP CRC was verified. The ZIP stays outside source at `/tmp/oliva-ci-v012-artifact.zip`. The copied raw report bytes and hashes are listed in [verification.json](verification.json); every archive entry is listed in [artifact-integrity.json](artifact-integrity.json).

Historical OLIVA 0.11 release run `42586789188` remains first-attempt failure (168/168 unit, 91/92 browser), and separate geometry-validation run `42629068592` remains first-attempt failure (168/168 unit, 92/93 browser). Both were independently re-read without rerunning them; their historical evidence directories were left unchanged.

This verification performed no source push, ref mutation, workflow rerun, merge, or application deployment. It provides GitHub runner/browser evidence. No native device or simulator test was performed.
