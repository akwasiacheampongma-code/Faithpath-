// Read-only verification for a built FaithPath candidate, including unexpected files.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const roots=process.argv.slice(2);assert(roots.length,'Pass one or more build directories');
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
function verify(root){
 const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(x=>x.isDirectory()?walk(path.join(dir,x.name)):[path.join(dir,x.name)]);
 const files=Object.fromEntries(walk(root).sort().map(file=>[path.relative(root,file),sha(fs.readFileSync(file))]));
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'release-integrity.json'),'utf8'));
 for(const [file,digest]of Object.entries(manifest.files))assert.equal(files[file],digest,`Changed or missing ${file}`);
 assert.deepEqual(Object.keys(files).sort(),[...Object.keys(manifest.files),'release-integrity.json'].sort(),'Unexpected build files');
 assert.equal(sha(JSON.stringify(manifest.files)),manifest.build_hash,'Build map hash');
 assert.equal(manifest.content_hash,'8630cf25034cbd8ee28060b2318addc25d26611317439d08ac2fa5cae938e309','Protected content');
 console.log(JSON.stringify({root,build:manifest.build,files:Object.keys(files).length,build_hash:manifest.build_hash,status:'PASS'}));return files;
}
const first=verify(roots[0]);for(const root of roots.slice(1))assert.deepEqual(verify(root),first,'Builds differ');
