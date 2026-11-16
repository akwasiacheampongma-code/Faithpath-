# OLIVA 0.12.1: actual GitHub Actions verification

Actual run [43794926581](https://github.com/akwasiacheampongma-code/Faithpath-/actions/runs/43794926581) completed with **success**, attempt **1**, at **2026-11-16T03:04:58Z**. It tested exact GitHub source-backup commit `8d0e663150da1860c371aeeba2c4f2ddf16daf8a` on `feature/oliva-v0121-book-search-20261115`. Independent result: **success**. All independent verification checks passed.

Evidence was retrieved and independently checked at `2026-11-16T09:27:23.496251+00:00`. The report freshness checks refer to the original GitHub run's step times.

The downloaded raw reports contain **225/225 unit assertions** and **114/114 browser cases**, with **0 failed, 0 skipped and 0 flaky browser cases**. Browser attempt-count distribution: `{'1': 114}`; retry-value distribution: `{'0': 114}`. Unit suite timestamps and browser result timestamps were checked against their actual logged GitHub step windows. The browser report's CI and Git metadata were checked against this exact run and commit. See [verification.json](verification.json) for every gate and any failure details.

The actual remote build output reported `oliva-c74e9c9ec6137bfb`. The build ID was taken from `Offline bundle:` output; the local/private build ID is separate. Exact-head workflow, composite action, test configuration and package snapshots are retained. The four exact upstream action manifests each declare their own `node24` runtime, their pinned downloads appear in the actual log, and the explicit dependency audit reported zero vulnerabilities. The original tag and source subtree identities are retained in [source-identities.json](source-identities.json).

Artifact `14194243608` (`oliva-quality-8d0e663150da1860c371aeeba2c4f2ddf16daf8a`): **9,993,257 bytes**, **106 unique ZIP entries**, SHA-256 **`17744119ab9175a8fddb1b3dcad9dac6b9644616effc39609eec19da0568816f`**, equal to GitHub's digest. Every ZIP CRC was verified. The ZIP stays outside source at `/tmp/oliva-ci-v0121-artifact.zip`. The copied raw report bytes and hashes are listed in [verification.json](verification.json); every archive entry is listed in [artifact-integrity.json](artifact-integrity.json).

Historical OLIVA 0.11 release run `42586789188` remains first-attempt failure (168/168 unit, 91/92 browser), and separate geometry-validation run `42629068592` remains first-attempt failure (168/168 unit, 92/93 browser). Both were independently re-read without rerunning them; their historical evidence directories were left unchanged.

This verification performed no source push, ref mutation, workflow rerun, merge, or application deployment. It provides GitHub runner/browser evidence. No native device or simulator test was performed.

A separate read-only reviewer independently passed all 19 checks, including all 29 manifest hashes present before adding this review and the archived verifier tools. See [independent-review.json](independent-review.json). No network, Git mutation or file write was performed by that reviewer. The final manifest below is regenerated after recording the review.

The actual verifier and source-identity reader are archived as `verify-ci.py` and `identify-source.py`. Their original execution paths were `/tmp/verify-oliva-ci0121.py` and `/tmp/identify-oliva-ci0121-source.py`; the archived bytes are exact copies. Their evidence-root constant reflects this execution workspace.
