// Separate output protects tracked dist and existing QA builds.
process.env.FAITHPATH_AT_ROUNDS_TEST_ONLY='1';
process.env.FAITHPATH_OUT ||= 'qa-output/at-rounds-test';
await import('./build.mjs');
