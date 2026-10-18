# Phase7 QA delivery

Canonical report: [../../MAINTENANCE_REPORT.md](../../MAINTENANCE_REPORT.md).
Start visual comparison: [screenshots/index.html](screenshots/index.html).
All data are synthetic. Physical iPhone/Safari/VoiceOver remain OPEN.

Source398f22f, buildPHASE7-MAINT1. The later delivery commit changes no runtime.
The separate Netlify-compatible ZIP is not deployed. To reproduce exact bytes,
use a fresh checkout of398f22f, npm ci, then FAITHPATH_BUILD_BRANCH set to the
recorded maintenance branch and npm run build. Verify scripts/check-build.mjs
and the supplied complete receipts. A detached checkout without that truthful
historical branch label has different BUILD.txt metadata and therefore a different
artifact hash. See DEVELOPMENT.md and RELEASE_CHECKLIST.md.

Evidence includes intentional RED/fault diagnostics and subsequent GREEN/final
runs; final QA-RESULTS.json is the decision record. Do not interpret a deliberate
missing-module or injected-error trace as an unresolved final failure.

The original NT/Nachlese browser scripts use historical fixed scratch paths;
fresh PHASE7 results have been copied into this evidence tree. Historical tracked
reports and original content are unchanged. QA logs and charts are evidence,
not a promise that a browser simulation replaces a physical device.
