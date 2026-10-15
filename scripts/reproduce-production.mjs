import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';

// Run on the backup commit. Any later product change must fail this exact comparison.
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const expectedRaw = fs.readFileSync('qa/production-recovery/release-integrity.json');
const expected = JSON.parse(expectedRaw);
const walk = dir => fs.readdirSync(dir, {withFileTypes:true}).flatMap(entry =>
  entry.isDirectory() ? walk(path.join(dir,entry.name)) : [path.join(dir,entry.name)]).sort();
for (const name of ['production-reproduction-a','production-reproduction-b']) {
  const out = `qa-output/${name}`;
  execFileSync(process.execPath,['scripts/build.mjs'], {stdio:'inherit',env:{...process.env,
    FAITHPATH_OUT:out,FAITHPATH_BUILD_BRANCH:'feature/final-product-polish'}});
  const actual = Object.fromEntries(walk(out).map(file => [path.relative(out,file),hash(fs.readFileSync(file))]));
  assert.deepEqual(actual,{...expected.files,'release-integrity.json':hash(expectedRaw)});
}
console.log(`PASS: two builds, ${Object.keys(expected.files).length+1} files each, byte-identical to ${expected.build}; ${expected.build_hash}`);
