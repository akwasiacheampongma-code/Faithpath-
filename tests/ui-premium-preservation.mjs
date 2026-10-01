// Guard the requested UI-only boundary against the exact MENU1 source commit.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
const base = '4465dff5fd4860772c6aefec545395d1ec8af4e6';
const git = (...args) => execFileSync('git', args, { maxBuffer: 16 * 1024 * 1024 });
const original = file => git('show', `${base}:${file}`);
const tracked = git('ls-tree', '-r', '--name-only', base).toString().trim().split('\n');
const protectedFiles = tracked.filter(file =>
  (file.startsWith('data/') && !file.startsWith('data/audit/')) ||
  ['src/content.js', 'src/domain.js', 'src/menu.js', 'src/runtime-model.js', 'src/store.js', 'scripts/build.mjs', 'scripts/sw-template.js', 'sw.js', 'index.html', '_headers', '_redirects', 'manifest.webmanifest'].includes(file)
);
for (const file of protectedFiles) assert.deepEqual(fs.readFileSync(file), original(file), `Protected file changed: ${file}`);
const oldApp = original('src/app.js').toString(), newApp = fs.readFileSync('src/app.js', 'utf8');
const allowed = new Set(['home', 'reader', 'paths', 'path', 'journal', 'journalResults', 'more']);
function sections(text) {
  const starts = [...text.matchAll(/^(?:async )?function (\w+)\(/gm)];
  return { prefix: text.slice(0, starts[0].index), functions: starts.map((m, i) => ({ name: m[1], text: text.slice(m.index, starts[i + 1]?.index ?? text.length) })) };
}
const old = sections(oldApp), current = sections(newApp);
assert.equal(current.prefix, old.prefix, 'App initialization and shared helpers unchanged');
assert.deepEqual(current.functions.map(f => f.name), old.functions.map(f => f.name));
for (let i = 0; i < old.functions.length; i++) {
  if (!allowed.has(old.functions[i].name)) assert.equal(current.functions[i].text, old.functions[i].text, `Logic changed: ${old.functions[i].name}`);
  if (old.functions[i].name === 'reader') {
    const prefix = text => text.slice(0, text.indexOf('\n  shell('));
    assert.equal(prefix(current.functions[i].text), prefix(old.functions[i].text), 'Reader loading, selection initialization and persistence unchanged');
  }
}
console.log(JSON.stringify({ status: 'PASS', base_commit: base, protected_files: protectedFiles.length, app_logic_unchanged: true, reader_logic_unchanged: true, permitted_views: [...allowed] }, null, 2));
