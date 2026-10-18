import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import crypto from 'node:crypto';
import {matchesProtectedRuntime} from '../scripts/protected-runtime.mjs';
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
test('reviewed lint tooling preserves every pre-existing package and does not exempt content or future lockfiles',()=>{
 const before=fs.readFileSync('tests/fixtures/phase7-tooling-lock-baseline.json'),after=fs.readFileSync('package-lock.json'),old=JSON.parse(before),next=JSON.parse(after);
 assert.equal(hash(before),'157027107db85d2890e77dcf8250ee844f43c477ff55e8437780050efca6621d');
 for(const[name,value]of Object.entries(old.packages))if(name)assert.deepEqual(next.packages[name],value,name);
 for(const[name,value]of Object.entries(next.packages))if(name&&!old.packages[name])assert.equal(value.dev,true,name);
 assert.deepEqual(next.packages[''].devDependencies,{...old.packages[''].devDependencies,eslint:'10.13.0'});
 assert.equal(next.packages[''].dependencies,old.packages[''].dependencies);
 assert(matchesProtectedRuntime('package-lock.json',hash(after),hash(before)),'The exact reviewed development-tool lock needs its own bounded compatibility record');
 assert(!matchesProtectedRuntime('package-lock.json','0'.repeat(64),hash(before)));
 assert(!matchesProtectedRuntime('package-lock.json',hash(after),'0'.repeat(64)));
 assert(!matchesProtectedRuntime('data/stories.json',hash(after),hash(before)));
});
