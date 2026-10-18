/** Verify the actual generated release, including every canonical offline Bible. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const files=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]).sort();
export function checkBuild(root) {
 const receipt=JSON.parse(fs.readFileSync(path.join(root,'release-integrity.json')));
 const actual=Object.fromEntries(files(root).filter(f=>path.relative(root,f)!=='release-integrity.json').map(f=>[path.relative(root,f),sha(fs.readFileSync(f))]));
 assert.deepEqual(actual,receipt.files,'Every emitted file must be in the integrity map');
 assert.equal(sha(JSON.stringify(actual)),receipt.build_hash);
 const source=JSON.parse(fs.readFileSync(path.join(root,'candidate-integrity.json')));
 for(const [file,digest]of Object.entries(source.files))assert.equal(sha(fs.readFileSync(file)),digest,file);
 assert.equal(sha(JSON.stringify(source.files)),receipt.content_hash);
 const bibles=files('data/bibles').filter(f=>f.endsWith('.json'));
 assert.equal(bibles.length,132);
 for(const file of bibles)assert.equal(sha(fs.readFileSync(path.join(root,file))),sha(fs.readFileSync(file)),file);
 const duplicate=path.join(root,'releases',receipt.build,'data/bibles');
 assert(!fs.existsSync(duplicate),'Versioned Bible copy duplicates 132 canonical offline resources');
 const worker=fs.readFileSync(path.join(root,'sw.js'),'utf8');
 const assets=JSON.parse(worker.match(/const ASSETS = (\[[^\n]+\]);/)[1]);
 const expected=Object.keys(actual).filter(f=>!['sw.js','_headers','_redirects'].includes(f)).map(f=>'./'+f).sort();
 assert.deepEqual(assets,expected,'Worker must cache the complete release exactly once');
 const allBibles=bibles.reduce((n,f)=>n+fs.statSync(f).size,0);
 return {status:'PASS',build:receipt.build,commit:receipt.source_commit,buildHash:receipt.build_hash,contentHash:receipt.content_hash,files:Object.keys(actual).length+1,bibleFiles:132,bibleBytes:allBibles,workerAssets:assets.length};
}
if(process.argv[1]&&path.resolve(process.argv[1])===path.resolve(new URL(import.meta.url).pathname)) {
 const result=checkBuild(process.argv[2]||'dist');
 if(process.argv[3]){const second=checkBuild(process.argv[3]);assert.deepEqual(second,result);assert.deepEqual(fs.readFileSync(path.join(process.argv[2],'release-integrity.json')),fs.readFileSync(path.join(process.argv[3],'release-integrity.json')));result.twoBuildsByteIdentical=true;}
 console.log(JSON.stringify(result,null,2));
}
