/** Actual worker update on an isolated HTTPS origin, never a Netlify deployment. */
process.env.FAITHPATH_PREVIOUS_ROOT='qa-output/uiux6b/release-final';
process.env.FAITHPATH_PREVIOUS_BUILD='FP4-20261017-G-STABLE1-UIUX6B-CANDIDATE';
process.env.FAITHPATH_PREVIOUS_HASH='911c3f4a66eccc6d07f1e2f34f35256fd09f228b606af77f522ac5973e7a5852';
process.env.FAITHPATH_CANDIDATE_ROOT='qa-output/uiux6b-mobile1/candidate';
process.env.QA_OUT='qa-output/uiux6b-mobile1/update';
await import('../uiux6b/update-https.mjs');
