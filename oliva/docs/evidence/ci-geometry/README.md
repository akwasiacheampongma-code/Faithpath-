# David Reader geometry: CI harness validation

The original v0.11 CI run `42586789188` passed 91/92 browser tests and 168 unit tests. Its geometry case failed when `boundingBox()` returned `null` and the test immediately read `contextFrame!.width`. The captured page already shows the expected deep Reader and David context card; the artifact does not establish a persistent product layout fault.

Only `tests/e2e/david-story.spec.ts` was edited. The geometry case now waits for the actual `/lesen/1SA?chapter=17&from=38&to=45&mode=deep` destination, the pressed **Tiefer verstehen** control, a decoded image, and a finite positive artwork frame. Both Library 8:5 and Reader 3:2 checks retain `toBeCloseTo(..., 2)` and its original absolute difference threshold of 0.005. Null or transient missing geometry is polled; no non-null assertion, skip, retry, forced navigation, or DOM/layout substitution was introduced.

## Controlled real network evidence

The new regression uses a fresh Playwright context with service workers blocked. It requests the actual Reader JavaScript chunk, identifies it by its response content, holds the original server response, and releases it unchanged. No arbitrary sleeps or fabricated response bodies are used.

In [reader-network-gate.json](reader-network-gate.json):

- The Library image was genuinely ready at 344 × 215 (8:5).
- While the Reader response was held, the URL already pointed to the exact destination, but the deep Reader control was absent. The retained Library image remained decoded with `aria-busy=false` and had a 0 × 0 layout frame.
- The strengthened readiness helper started while the response was held and remained pending. After release, it resolved on the actual pressed deep control and a 348 × 232 (3:2) frame.

The initial stronger hypothesis was **not reproduced**: in the exploratory [probe-network-events.json](probe-network-events.json), the old visible-artwork helper waited and then timed out while Reader JavaScript was held; it did not return on a visible outgoing Library image. The evidence proves a gap between URL/image state and measurable Reader readiness. It does not prove the exact timing or causal sequence of the original CI failure.

Screenshots: [held response](reader-response-held.png), [actual ready context](reader-context-ready.png), and [original geometry screenshots](stories/screens/).

## Validation and build scope

Final commands:

```sh
npm run typecheck
OLIVA_EVIDENCE_DIR=docs/evidence/ci-geometry PLAYWRIGHT_JSON_OUTPUT_NAME=docs/evidence/ci-geometry/geometry-final-targeted.json npx playwright test tests/e2e/david-story.spec.ts --grep 'Geschichten und David-Kontext|echte Reader-Modul' --output=docs/evidence/ci-geometry/geometry-final-results
```

Typecheck passed. Both targeted browser cases passed on their first attempts: 2 passed, 0 skipped, 0 unexpected, 0 flaky, retries 0; total 40.4 seconds. See [test log](geometry-final-targeted.txt), [raw Playwright report](geometry-final-targeted.json), [summary](targeted-summary.json), and [typecheck log](typecheck-final.txt). The original geometry case retained its responsive screenshots, overflow checks, data checks, and Axe scans.

All runs used the existing local v0.11 build marker `oliva-01c4b9f640bc0931`. [served-build-integrity.json](served-build-integrity.json) records the relevant product/source and distribution hashes and verifies that the served Reader chunk matches the local distribution bytes. This task made no product edits, build, deployment, branch, commit, or tag change. Comparison of the final staged scope with the immutable v0.11 commit remains the parent task's repository verification. These checks cover Chromium browser behavior only; they make no native or physical-phone claim.
