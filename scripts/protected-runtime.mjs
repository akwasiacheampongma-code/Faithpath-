// Historical content manifests remain immutable. UIUX5 fixes two reproduced store bugs.
// Exact source digests only; no content file or arbitrary future runtime is exempted.
const BASELINE_STORE='c6d5dd08b2f2144b594c63a7014baa9877a52406ef950b18855681cd355c7d6d';
const UIUX5_STORE='6ab0de7812b78a25f50f05f55963a19a5991843e56889e73e7fb67dc6c4b76db';
export function matchesProtectedRuntime(file,actual,expected){return actual===expected||(file==='src/store.js'&&expected===BASELINE_STORE&&actual===UIUX5_STORE);}
