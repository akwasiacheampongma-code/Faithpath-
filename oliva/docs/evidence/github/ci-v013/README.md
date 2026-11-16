# OLIVA 0.13.0: actual GitHub Actions verification

Actual run [43888534422](https://github.com/akwasiacheampongma-code/Faithpath-/actions/runs/43888534422) completed with **success**, attempt **1**, at **2026-11-16T14:53:23Z**. It tested exact GitHub source-backup commit `639fdafaf15a9ae49ce6a3d8e2889f2fa3ee0d12` on `feature/oliva-v013-reader-parity-20261116`. Independent result: **success**. All independent verification checks passed.

Evidence was retrieved and independently checked at `2026-11-16T14:55:56.128386+00:00`. The report freshness checks refer to the original GitHub run's step times.

The downloaded raw reports contain **290/290 unit assertions** and **126/126 browser cases**, with **0 failed, 0 skipped and 0 flaky browser cases**. Browser attempt-count distribution: `{'1': 126}`; retry-value distribution: `{'0': 126}`. Unit suite timestamps and browser result timestamps were checked against their actual logged GitHub step windows. The browser report's CI and Git metadata were checked against this exact run and commit. See [verification.json](verification.json) for every gate and any failure details.

The actual remote build output reported `oliva-4669ec10881d7abd`. The build ID was taken from `Offline bundle:` output; the local/private build ID is separate. Exact-head workflow, composite action, test configuration and package snapshots are retained. The four exact upstream action manifests each declare their own `node24` runtime, their pinned downloads appear in the actual log, and the explicit dependency audit reported zero vulnerabilities. The original tag and source subtree identities are retained in [source-identities.json](source-identities.json).

Artifact `14237130650` (`oliva-quality-639fdafaf15a9ae49ce6a3d8e2889f2fa3ee0d12`): **10,747,231 bytes**, **130 unique ZIP entries**, SHA-256 **`f49d547d6b5866104d964320198fbde239ffbe3b51dbdc9b138aff0c89f18046`**, equal to GitHub's digest. Every ZIP CRC was verified. The ZIP stays outside source at `/tmp/oliva-ci-v013-artifact.zip`. The copied raw report bytes and hashes are listed in [verification.json](verification.json); every archive entry is listed in [artifact-integrity.json](artifact-integrity.json).

Historical OLIVA 0.11 release run `42586789188` remains first-attempt failure (168/168 unit, 91/92 browser), and separate geometry-validation run `42629068592` remains first-attempt failure (168/168 unit, 92/93 browser). Both were independently re-read without rerunning them; their historical evidence directories were left unchanged.

This verification performed no source push, ref mutation, workflow rerun, merge, or application deployment. It provides GitHub runner/browser evidence. No native device or simulator test was performed.

The actual verifier, source-identity reader, artifact downloader and corrected log receiver are archived here as Python source. Download capabilities were used only through memory and hidden stdin; no URI value is persisted. A client-side canonical-terminal line limit rejected the initial long log JSON before any log file was written. Disabling canonical input corrected this transport helper; the application, tests, original CI run and its attempt number were unchanged. See [log-transport-diagnostic.json](log-transport-diagnostic.json).

A separate read-only reviewer passed all 27 independent checks with no inconsistency. This included all 35 manifest entries present before recording this review, all then-existing evidence files, the exact job-log provenance and all 47 unchanged non-OLIVA root entries. See [independent-review.json](independent-review.json). The final manifest is regenerated after recording this result.
