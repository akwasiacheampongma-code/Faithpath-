import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const [root,mode='test']=process.argv.slice(2);
const integrity=JSON.parse(fs.readFileSync(path.join(root,'release-integrity.json')));
const config=fs.readFileSync(path.join(root,'releases',integrity.build,'src/at-rounds-config.js'),'utf8');
const fixturePath=`releases/${integrity.build}/data/at-rounds.test-only.json`;
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
if(mode==='test'){
  assert.match(integrity.build,/-AT-ROUNDS-TEST\d+$/);
  assert.match(config,/AT_ROUNDS_TEST_ONLY = true/);
  assert(fs.existsSync(path.join(root,fixturePath)));
  assert(sw.includes(fixturePath));
  assert.equal(integrity.test_only.human_approved,false);
  assert.equal(integrity.test_only.production_import_allowed,false);
  assert.equal(integrity.test_only.deploy_production,false);
}else{
  assert.match(config,/AT_ROUNDS_TEST_ONLY = false/);
  assert(!fs.existsSync(path.join(root,fixturePath)));
  assert(!sw.includes('at-rounds.test-only.json'));
  assert.equal(integrity.test_only,undefined);
}
for(const [name,sha]of Object.entries(integrity.files)){
  const actual=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,name))).digest('hex');
  assert.equal(actual,sha,name);
}
console.log(JSON.stringify({check:'build-activation-and-all-file-hashes',mode,build:integrity.build,status:'PASS',files:Object.keys(integrity.files).length,content_hash:integrity.content_hash}));
