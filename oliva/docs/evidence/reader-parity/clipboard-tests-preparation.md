# Clipboard end-to-end test preparation

`tests/e2e/reader-copy.spec.ts` prepares three browser acceptance cases for the new copy feature: existing single-verse actions, additive range endpoints 35–36 then 35–37, and an intentionally rejected Clipboard API call.

The success cases grant Chromium clipboard read/write permissions, seed an actual clipboard sentinel, invoke the app button, and read `navigator.clipboard.readText()` back. The expected strings freeze literal Johannes 6,35–37 text and compare those literals to the independent licensed JSON fixture read with Node `readFileSync`. Exact string equality covers the en dash, verse numbers, unchanged historical spelling, LF separators, and `Lutherbibel 1912` footer; UI context and personal words cannot enter that output.

The rejection case changes only the browser's `navigator.clipboard.writeText` implementation to throw `NotAllowedError`. It requires the byte-identical fallback textbox, a read-only field, no success claim, retained selection, and unchanged real clipboard sentinel. All cases compare every durable logical field except the current reading position and the global revision counter incremented by legitimate position writes. Reports and screenshots are written beneath `${OLIVA_EVIDENCE_DIR ?? "docs/evidence/latest"}/reader-copy` and identify the served build.

These tests have not been executed against a candidate yet. The copy component was still being integrated while the tests were drafted. There is no native, simulator, device, or screen-reader claim.
