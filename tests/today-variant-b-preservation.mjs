import fs from 'node:fs';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
const base = 'cf78c70';
const git = (...args) => execFileSync('git', args, { maxBuffer: 16 * 1024 * 1024 });
const original = file => git('show', `${base}:${file}`);
const files = git('ls-tree', '-r', '--name-only', base).toString().trim().split('\n');
const protectedFiles = files.filter(file =>
  (file.startsWith('src/') && file !== 'src/app.js') ||
  (file.startsWith('data/') && !file.startsWith('data/audit/')) ||
  file.startsWith('trees/') ||
  ['scripts/build.mjs','scripts/sw-template.js','sw.js','index.html','manifest.webmanifest','_headers','_redirects'].includes(file));
for (const file of protectedFiles) assert.deepEqual(fs.readFileSync(file), original(file), `Protected file changed: ${file}`);
const old = original('src/app.js').toString(), current = fs.readFileSync('src/app.js','utf8');
const beforeHome = text => text.slice(0,text.indexOf('function home()'));
const afterHome = text => text.slice(text.indexOf('function guidance()'));
assert.equal(beforeHome(current), beforeHome(old));
assert.equal(afterHome(current), afterHome(old), 'Only home rendering may change');
assert(fs.readFileSync('styles.css','utf8').startsWith(original('styles.css').toString()), 'Existing CSS unchanged; only scoped Today styles appended');
console.log(JSON.stringify({ status:'PASS', base_commit:base, protected_files:protectedFiles.length, home_only:true, existing_css_unchanged:true },null,2));
