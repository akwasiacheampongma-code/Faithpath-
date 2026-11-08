import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import nativeFs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { performance } from 'node:perf_hooks';

const reportRoot = path.dirname(new URL(import.meta.url).pathname);
const projectRoot = '/workspace/oliva-dependency-probe';
const baselineRoot = '/workspace/faithpath-next';
const fixtureRoot = path.join(reportRoot, 'fingerprint-fixture');
const reportPath = path.join(reportRoot, 'fingerprint-api-probe-results.json');
const report = {
  startedAt: new Date().toISOString(), node: process.version, platform: process.platform,
  projectRoot, fixtureRoot,
  scope: 'Actual public createFingerprintAsync API with normal default sources; scratch-only fixture changes; no original project changes or installations.',
  cases: [], limitations: ['Windows checks use minimatch platform:win32 on Linux; they do not establish native Windows filesystem/build compatibility.'],
};
function dependencies(root) {
  const projectRequire = createRequire(path.join(root, 'package.json'));
  const fingerprintEntry = projectRequire.resolve('@expo/fingerprint');
  const fingerprintRequire = createRequire(fingerprintEntry);
  const globEntry = fingerprintRequire.resolve('glob');
  const globRequire = createRequire(globEntry);
  return {
    fingerprint: projectRequire('@expo/fingerprint'),
    matcher: fingerprintRequire('minimatch'), glob: fingerprintRequire('glob'),
    paths: fingerprintRequire('./utils/Path.js'),
    versions: {
      fingerprint: fingerprintRequire('../package.json').version,
      glob: fingerprintRequire('glob/package.json').version,
      directMinimatch: fingerprintRequire('minimatch/package.json').version,
      globMinimatch: globRequire('minimatch/package.json').version,
    },
  };
}
function sourceSummary(source) {
  const { contents, debugInfo, ...safe } = source;
  if (contents !== undefined) safe.contentsSha256 = createHash('sha256').update(contents).digest('hex');
  return safe;
}
function fingerprintSummary(value) {
  return { hash: value.hash, sources: value.sources.map(sourceSummary) };
}
async function save() {
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2) + '\n');
}
async function check(name, operation) {
  const start = performance.now();
  try {
    const details = await operation();
    report.cases.push({ name, status: 'passed', elapsedMs: Math.round(performance.now() - start), details });
    console.log('PASS ' + name);
  } catch (error) {
    report.cases.push({ name, status: 'failed', elapsedMs: Math.round(performance.now() - start), error: { name: error.name, message: error.message, stack: error.stack } });
    console.log('FAIL ' + name + ': ' + error.message);
  }
  await save();
}
async function put(relative, contents) {
  const file = path.join(fixtureRoot, relative);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, contents);
}

await fs.mkdir(fixtureRoot, { recursive: true });
const candidate = dependencies(projectRoot);
const baseline = dependencies(baselineRoot);
let realProjectFingerprint;
report.versions = { candidate: candidate.versions, baseline: baseline.versions };
assert.equal(candidate.versions.glob, '14.0.4');
assert.equal(candidate.versions.directMinimatch, '11.0.5');
assert.equal(candidate.versions.globMinimatch, '11.0.5');
const projectFiles = await fs.readdir(projectRoot);
assert.equal(projectFiles.some(name => /^\.env(?:\.(?:local|development|production|test)(?:\.local)?)?$/.test(name)), false, 'No project dotenv credential files may be read by this harness');

await check('real project default fingerprint and deterministic repetition', async () => {
  const options = { silent: true, concurrentIoLimit: 2 };
  const first = await candidate.fingerprint.createFingerprintAsync(projectRoot, options);
  const second = await candidate.fingerprint.createFingerprintAsync(projectRoot, options);
  realProjectFingerprint = first;
  await fs.writeFile(path.join(reportRoot, 'real-project-fingerprint-first.json'), JSON.stringify(fingerprintSummary(first), null, 2) + '\n');
  await fs.writeFile(path.join(reportRoot, 'real-project-fingerprint-second.json'), JSON.stringify(fingerprintSummary(second), null, 2) + '\n');
  assert.match(first.hash, /^[a-f0-9]{40}$/);
  assert.deepEqual(fingerprintSummary(second), fingerprintSummary(first));
  const active = first.sources.filter(source => source.hash !== null);
  assert.ok(active.length > 10, 'Expected real native/config/package inputs, not an empty fingerprint');
  for (const reason of ['expoConfig', 'packageJson:scripts', 'package:react-native']) {
    assert.ok(active.some(source => source.reasons.includes(reason)), 'Missing actual input category ' + reason);
  }
  assert.deepEqual(candidate.fingerprint.diffFingerprints(first, second), []);
  return { hash: first.hash, sourceCount: first.sources.length, activeSourceCount: active.length, reasons: [...new Set(active.flatMap(source => source.reasons))].sort() };
});

await check('old dependency APIs and candidate produce identical real project fingerprint', async () => {
  assert.ok(realProjectFingerprint, 'Candidate real-project fingerprint must exist');
  const old = await baseline.fingerprint.createFingerprintAsync(projectRoot, { silent: true, concurrentIoLimit: 2 });
  await fs.writeFile(path.join(reportRoot, 'real-project-old-dependencies-fingerprint.json'), JSON.stringify(fingerprintSummary(old), null, 2) + '\n');
  assert.deepEqual(fingerprintSummary(old), fingerprintSummary(realProjectFingerprint));
  assert.deepEqual(candidate.fingerprint.diffFingerprints(old, realProjectFingerprint), []);
  return { oldDependencyHash: old.hash, candidateHash: realProjectFingerprint.hash, sourceCount: old.sources.length, sourceDiffCount: 0 };
});

await put('package.json', JSON.stringify({ name: 'oliva-fingerprint-audit-fixture', version: '1.0.0', private: true, scripts: { auditFixture: 'node fixture-script.js' } }, null, 2) + '\n');
await put('app.json', JSON.stringify({ expo: { name: 'OLIVA fingerprint audit fixture', slug: 'oliva-fingerprint-audit-fixture', version: '1.0.0', sdkVersion: '58.0.0' } }, null, 2) + '\n');
await put('.gitignore', 'node_modules/\n');
try { await fs.symlink(path.join(projectRoot, 'node_modules'), path.join(fixtureRoot, 'node_modules'), 'dir'); }
catch (error) { if (error.code !== 'EEXIST') throw error; }
for (const [file, contents] of Object.entries({
  'test-inputs/keep.ts': 'export const value = 1;\n',
  'test-inputs/.hidden.ts': 'export const hidden = 1;\n',
  'test-inputs/nested/component.tsx': 'export default null;\n',
  'test-inputs/keep/readme.txt': 'Included plain text\n',
  'test-inputs/cache/session.tmp': 'ignored temporary data\n',
  'test-inputs/.cache/.private.tmp': 'ignored dot temporary data\n',
  'test-inputs/ignored/excluded.ts': 'ignored whole directory\n',
})) await put(file, contents);

await check('fingerprint directory hashing honors ignores and included-file changes', async () => {
  const options = {
    silent: true, concurrentIoLimit: 2, debug: true,
    ignorePaths: ['test-inputs/**/*.tmp', 'test-inputs/ignored/**'],
    extraSources: [{ type: 'dir', filePath: 'test-inputs', reasons: ['auditFixture'] }],
  };
  const first = await candidate.fingerprint.createFingerprintAsync(fixtureRoot, options);
  const source = first.sources.find(item => item.reasons.includes('auditFixture'));
  assert.ok(source?.hash, 'Fixture directory must really be hashed');
  const paths = [];
  const visit = item => { if (!item) return; paths.push(item.path); for (const child of item.children ?? []) visit(child); };
  visit(source.debugInfo);
  assert.ok(paths.includes('test-inputs/.hidden.ts'), 'dot:true must include the hidden nonignored file');
  assert.equal(paths.some(item => item?.endsWith('.tmp')), false, 'Temporary files must not be hashed');
  assert.equal(paths.some(item => item?.includes('/ignored/')), false, 'Ignored subtree must not be hashed');
  await put('test-inputs/cache/session.tmp', 'changed ignored data\n');
  await put('test-inputs/.cache/.private.tmp', 'changed ignored dot data\n');
  const afterIgnored = await candidate.fingerprint.createFingerprintAsync(fixtureRoot, options);
  assert.equal(afterIgnored.hash, first.hash, 'Ignored edits must preserve the complete fingerprint');
  await put('test-inputs/keep.ts', 'export const value = 2;\n');
  const afterIncluded = await candidate.fingerprint.createFingerprintAsync(fixtureRoot, options);
  assert.notEqual(afterIncluded.hash, first.hash, 'Included edits must change the fingerprint');
  const diff = candidate.fingerprint.diffFingerprints(afterIgnored, afterIncluded);
  assert.equal(diff.length, 1);
  assert.equal(diff[0].op, 'changed');
  assert.ok(diff[0].afterSource.reasons.includes('auditFixture'));
  return { firstHash: first.hash, afterIgnoredHash: afterIgnored.hash, afterIncludedHash: afterIncluded.hash, hashedFixturePaths: paths, changedSourceCount: diff.length };
});

await check('Expo fingerprint exact dot, extglob, ignore and negation matcher contracts', async () => {
  const cases = [
    { patterns: ['**/*.tmp'], file: '.cache/session.tmp', expected: true },
    { patterns: ['**/*.@(ts|tsx)'], file: 'src/.hidden.tsx', expected: true },
    { patterns: ['build'], file: 'android/build/out.js', expected: false },
    { patterns: ['**/build/**'], file: 'android/build/out.js', expected: true },
    { patterns: ['**/*.tmp', '!keep/*.tmp'], file: 'keep/important.tmp', expected: false },
    { patterns: ['**/*.tmp', '!keep/*.tmp'], file: 'cache/unimportant.tmp', expected: true },
  ];
  return cases.map(item => {
    const matches = candidate.paths.buildPathMatchObjects(item.patterns);
    const actual = candidate.paths.isIgnoredPathWithMatchObjects(item.file, matches);
    assert.equal(actual, item.expected, JSON.stringify(item));
    return { ...item, actual };
  });
});

await check('glob async, sync and stream API return identical extglob and dot matches', async () => {
  const options = { cwd: path.join(fixtureRoot, 'test-inputs'), dot: true, nodir: true, ignore: ['ignored/**'] };
  const expected = ['.hidden.ts', 'keep.ts', 'nested/component.tsx'].sort();
  const asynchronous = (await candidate.glob.glob('**/*.@(ts|tsx)', options)).sort();
  const synchronous = candidate.glob.sync('**/*.@(ts|tsx)', options).sort();
  const stream = [];
  for await (const file of candidate.glob.globStream('**/*.@(ts|tsx)', options)) stream.push(file);
  stream.sort();
  assert.deepEqual(asynchronous, expected);
  assert.deepEqual(synchronous, expected);
  assert.deepEqual(stream, expected);
  return { expected, asynchronous, synchronous, stream };
});

await check('documented minimatch10 to11 edge changes are explicit', async () => {
  const cases = [
    { name: 'Windows parent traversal retains drive root', pattern: 'C:/a/../../x', file: 'x', options: { platform: 'win32', optimizationLevel: 2 }, oldExpected: true, newExpected: false },
    { name: 'Empty path portion does not match optional extglob', pattern: 'a/b/?(x)', file: 'a/b/', options: {}, oldExpected: true, newExpected: false },
  ];
  return cases.map(item => {
    const before = new baseline.matcher.Minimatch(item.pattern, item.options).match(item.file);
    const after = new candidate.matcher.Minimatch(item.pattern, item.options).match(item.file);
    assert.equal(before, item.oldExpected, 'Unexpected baseline behavior: ' + item.name);
    assert.equal(after, item.newExpected, 'Unexpected candidate behavior: ' + item.name);
    return { ...item, before, after };
  });
});

await check('bounded glob and globStream AbortSignal regressions stop further directory reads', async () => {
  const results = [];
  for (const api of ['glob', 'globStream']) {
    const controller = new AbortController();
    const reason = new Error('audit fixture cancellation');
    let readdirCalls = 0;
    const countingFs = {
      ...nativeFs,
      readdir: (...args) => {
        readdirCalls += 1;
        if (readdirCalls === 1) controller.abort(reason);
        return nativeFs.readdir(...args);
      },
    };
    const options = { cwd: path.join(fixtureRoot, 'test-inputs'), signal: controller.signal, fs: countingFs };
    await assert.rejects(async () => {
      if (api === 'glob') await candidate.glob.glob('**/*', options);
      else for await (const unused of candidate.glob.globStream('**/*', options)) void unused;
    }, error => error === reason);
    const readsAtRejection = readdirCalls;
    await new Promise(resolve => setTimeout(resolve, 100));
    assert.equal(readsAtRejection, 1, 'Aborting first directory read should prevent recursion');
    assert.equal(readdirCalls, readsAtRejection, 'No background directory reads may occur after rejection');
    results.push({ api, readsAtRejection, readsAfter100ms: readdirCalls, additionalReadsAfterRejection: readdirCalls - readsAtRejection });
  }
  return results;
});

report.finishedAt = new Date().toISOString();
report.passed = report.cases.filter(item => item.status === 'passed').length;
report.failed = report.cases.filter(item => item.status === 'failed').length;
await save();
console.log(JSON.stringify({ passed: report.passed, failed: report.failed, reportPath }));
process.exitCode = report.failed ? 1 : 0;
