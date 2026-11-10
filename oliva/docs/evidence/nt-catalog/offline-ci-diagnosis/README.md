# Offline readiness with an existing active registration

Historical CI run `42629068592` remains failed: 168/168 unit cases and 92/93 browser cases passed, including both David geometry cases. The A51 case failed its unchanged 15-second offline-readiness assertion. No CI rerun was performed for this diagnosis.

## Observed CI state

The preserved [native lifecycle snapshot](../../github/ci-v011-geometry/failure-a51-offline-lifecycle.json) shows a visible, focused document with no service-worker controller. Its real existing registration nevertheless has an activated worker, replies with the exact expected build ID and version `0.11.0`, and has all 102 cached files. The UI reports that the offline package is incomplete.

That snapshot does not contain the native registration timeline. It therefore does not prove why the document was uncontrolled or whether `register()` was pending, rejected, or had a late result. It does not support a background-tab explanation. This differs from the earlier v0.8 diagnosis, which involved an already controlled document and a pending native registration promise.

## Deterministic frozen-product proof

[probe-controller-lifecycle.mjs](probe-controller-lifecycle.mjs) serves the untouched frozen v0.11 distribution from `/workspace/oliva-v011-reader-flow-control-dist` on the separate origin `http://localhost:4186`. It never uses the current NT candidate on port 4173.

The probe first installs and verifies the real worker/cache. A genuine Chromium force reload (`Page.reload` with `ignoreCache: true`) then creates a document whose native `navigator.serviceWorker.controller` is `null`. The existing worker and cache remain native. The probe invokes the real `register()` API and holds only the promise returned to the application.

The [recorded sequence](controller-lifecycle.json) is:

| State | Native controller | Existing active worker | Footer |
| --- | --- | --- | --- |
| Initial installation verified | activated | exact build/version, 102 files | ready |
| Actual force reload, registration return held | null | exact build/version, 102 files | preparing |
| Existing finite retries exhausted | null | exact build/version, 102 files | incomplete |
| Original registration return released | null | unchanged | ready |

In the force-reloaded document, the native registration itself resolved with an activated worker at about 3517 ms. The controlled return was released at about 8229 ms. Releasing that result restored readiness without changing the controller, cache, visibility, worker, or expected build. See the [text log](controller-lifecycle.txt) and [screenshot after finite retries](controller-lifecycle-after-retries.png). The probe's `product-worker-query` event label records every observed `OLIVA_BUILD` call, including the independent snapshot inspections; no claim about application-only query counts is based on that label.

The frozen local build marker is `oliva-01c4b9f640bc0931`; the CI build marker is separately preserved in its raw artifact. This proof establishes the missing discovery path under the controlled no-controller/pending-return condition. It does not establish that CI experienced that precise sequence.

## Authorized candidate fix

`WebOffline` now starts an independent `getRegistration()` lookup when neither a controller nor a known active registration is available. The result attaches the existing lifecycle listeners and passes through the unchanged real-worker ID/version verifier. The lookup is not awaited by the controller verification or finite retry path. Effect lifetime, latest registration request, and an already applied native result guard late callbacks. A native registration error preserves a separately discovered active worker.

The service-worker protocol, cache contents, readiness messages, and retry delays are unchanged. No ready state is synthesized from cache counts or registration existence.

Two browser cases were added in `offline-readiness.spec.ts`:

- A real force-reloaded uncontrolled document must discover the matching active worker and become ready before the held registration return is released. It also rejects a different required document ID, performs an actual offline reload, and compares all raw private records.
- Holding both real API return promises must still reach the existing finite unavailable state; releasing them must recover using the actual worker, with unchanged raw records.

The existing controller-present held-registration case remains in place. Typecheck passed. Both new browser cases passed on their first attempts against the versioned v0.12 candidate `oliva-80005b3c1d2e2eef`: 2 passed, 0 skipped, 0 unexpected, 0 flaky, retries 0; total 22.6 seconds. The actual served core was checked before and after the run. See [core check](candidate-core-check.json), [summary](candidate-targeted-summary.json), [raw report](../offline-candidate-targeted.json), [log](../offline-candidate-targeted.txt), [real discovery evidence](real-uncontrolled-registration-discovery.json), and [finite failure evidence](finite-uncontrolled-registration-lookups.json).

The parent task will run the full candidate browser suite. No extra historical A51 rerun was used to revise the failed CI result. This diagnosis made no historical branch, tag, deployment, or frozen-distribution change.
