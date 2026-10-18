/** Compare source authorities with the exact accepted base, never with a moving branch. */
import fs from 'node:fs';import crypto from 'node:crypto';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';
import {KEYS,empty} from '../src/store.js';
const base='7d24aea30bec5b0b8d43e199f3cadfc6305c1e3e';
const git=(...args)=>execFileSync('git',args,{maxBuffer:64*1024*1024});
const hash=v=>crypto.createHash('sha256').update(v).digest('hex');
const authorities=['src/store.js','src/drafts.js','src/journal-storage.js','src/import-validation.js','src/backup-model.js','src/domain.js','src/tree-view.js','src/tree-stage-guide.js','src/bible-journey.js','scripts/sw-template.js','styles.css'];
const names=git('ls-tree','-r','--name-only',base).toString().trim().split('\n');
const protectedFiles=names.filter(name=>name.startsWith('data/')||name.startsWith('trees/')||name.startsWith('src/verbunden/')||name.endsWith('.css')||authorities.includes(name));
for(const file of protectedFiles)assert.equal(hash(fs.readFileSync(file)),hash(git('show',base+':'+file)),file+' changed protected authority/content');
assert.equal(empty().version,5);
assert.deepEqual(KEYS,{main:'faithpath.v1.rebuild',plans:'faithpath.guidedPlans.v1',onboard:'faithpath.onboarding.v4',legacyOnboard:'faithpath.onboarding.v3',migration:'faithpath.backup.pre-v5',restore:'faithpath.backup.before-import',draft:'faithpath.draft.v4'});
console.log(JSON.stringify({status:'PASS',base,protectedFiles:protectedFiles.length,schema:5,keys:KEYS,allContentAndStylesUnchanged:true},null,2));
