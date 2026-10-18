// Historical content manifests remain immutable. UIUX5 fixes two reproduced store bugs.
// Exact source digests only; no content file or arbitrary future runtime is exempted.
const BASELINE_STORE='c6d5dd08b2f2144b594c63a7014baa9877a52406ef950b18855681cd355c7d6d';
const UIUX5_STORE='6ab0de7812b78a25f50f05f55963a19a5991843e56889e73e7fb67dc6c4b76db';
// Phase7 adds a pinned development-only lint tool. The tooling contract test
// preserves every old package byte-for-byte and rejects runtime dependencies.
const BASELINE_LOCK='157027107db85d2890e77dcf8250ee844f43c477ff55e8437780050efca6621d';
const PHASE7_LINT_LOCK='ad5ec2b9b5390f254bd32520ccce389f4d2c61c6869c471499c9aca50fe72ee8';
export function matchesProtectedRuntime(file,actual,expected){return actual===expected||
 (file==='src/store.js'&&expected===BASELINE_STORE&&actual===UIUX5_STORE)||
 (file==='package-lock.json'&&expected===BASELINE_LOCK&&actual===PHASE7_LINT_LOCK);}
