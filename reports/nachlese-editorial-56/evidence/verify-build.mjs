import fs from 'node:fs';import crypto from 'node:crypto';import assert from 'node:assert/strict';
const roots=process.argv.slice(2);assert.equal(roots.length,2,'Usage: node verify-build.mjs BUILD_A BUILD_B');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(d+'/'+e.name):[d+'/'+e.name]).sort();
const maps=[];
for(const root of roots){
 const manifest=JSON.parse(fs.readFileSync(root+'/release-integrity.json')),candidate=JSON.parse(fs.readFileSync(root+'/candidate-integrity.json'));
 const actual=Object.fromEntries(walk(root).filter(f=>f!==root+'/release-integrity.json').map(f=>[f.slice(root.length+1),hash(fs.readFileSync(f))]));
 assert.deepEqual(actual,manifest.files);assert.equal(hash(JSON.stringify(actual)),manifest.build_hash);assert.equal(hash(JSON.stringify(candidate.files)),manifest.content_hash);assert.equal(candidate.content_hash,manifest.content_hash);
 for(const [file,digest] of Object.entries(candidate.files))assert.equal(hash(fs.readFileSync(file)),digest,'Source content differs: '+file);
 maps.push(Object.fromEntries(walk(root).map(f=>[f.slice(root.length+1),hash(fs.readFileSync(f))])));
}
assert.deepEqual(maps[0],maps[1]);const manifest=JSON.parse(fs.readFileSync(roots[0]+'/release-integrity.json'));
console.log(JSON.stringify({status:'PASS',build:manifest.build,content_hash:manifest.content_hash,build_hash:manifest.build_hash,files:Object.keys(maps[0]).length,byte_identical_builds:true,all_published_file_hashes_verified:true,all_source_content_hashes_verified:true},null,2));
