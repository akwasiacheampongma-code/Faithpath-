# OLIVA 0.8 · real pending registration gate

The third targeted A51 run reproduced the same failed readiness assertion on unchanged core `oliva-56f6fe3a12f05a5c`. The actual document stayed visible and focused. Its controllerchange event reported the new controller in `activating` state at 466.7 ms, before WebOffline began registration at 945.4 ms. That native registration promise did not resolve during the subsequent 38.8 seconds. The independent later probes, rather than that early event, prove the fully activated state. The product sent no `OLIVA_BUILD` query.

After the failed 15-second assertion, two independent native MessageChannel inspections found the activated controller and active worker answering the exact required ID/version, and all98 cache entries present. An additional16-second quiet window retained the same incorrect preparing footer. No timeout was increased and no visibility, worker response, cache or readiness state was forged.

The causal product gap is awaiting registration before verifying an already available controller. Starting verification independently also starts the finite retry path when no controller is available. Later registration and lifecycle events can continue normal verification. The reason for Chromium's underlying registration/update job stall is not proved. This is not proof about the historical0.5CI cause, hostedSite behavior or physical devices.

See `v08-register-gate-diagnosis.json` for exact paths and SHA-256 digests. Opt-in observational test hooks remain under `OLIVA_A51_DIAGNOSTICS`; default tests do not enable them.
