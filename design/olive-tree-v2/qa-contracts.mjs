/** Confirms that Phase A cannot silently replace the app's protected contracts. */
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';import {execFileSync} from 'node:child_process';import {createHash} from 'node:crypto';
import {stageNames} from '../../src/content.js';
import {TREE_STAGE_MEANINGS} from '../../src/tree-stage-guide.js';
import {treeLevel,developmentCount} from '../../src/domain.js';
const root=path.dirname(fileURLToPath(import.meta.url)),sha=v=>createHash('sha256').update(v).digest('hex');
const m=JSON.parse(fs.readFileSync(path.join(root,'asset-manifest.json'))),checks=[];
function check(name,fn){fn();checks.push({name,pass:true});}
check('seven-existing-stage-names-and-meanings',()=>{assert.equal(m.stages.length,7);assert.deepEqual(m.stages.map(s=>s.name),stageNames);assert.deepEqual(m.stages.map(s=>s.meaning),TREE_STAGE_MEANINGS.map(s=>s.meaning));});
check('source-and-export-hashes',()=>{for(const s of m.stages){assert.equal(sha(fs.readFileSync(path.join(root,s.source))),s.sourceSha256);for(const ex of Object.values(s.exports))assert.equal(sha(fs.readFileSync(path.join(root,ex.path))),ex.sha256);}});
check('unchanged-application-tree-from-selected-base',()=>{const diff=execFileSync('git',['diff','--name-only','ef8d96d7126fb79661467feaaa17044874471d4d','--','src','data','scripts','tests','styles.css','index.html','package.json','package-lock.json','trees','icons','manifest.webmanifest','netlify.toml'],{encoding:'utf8'});assert.equal(diff.trim(),'');});
check('all-growth-boundaries-no-data-mutation',()=>{const expected=[0,1,2,3,3,4,4,5,5,5,6,6];for(let n=0;n<expected.length;n++){const data={paths:[{id:'synthetic-path',milestones:Array.from({length:n},(_,i)=>({id:'synthetic-'+i})),steps:[{done:true}]}],reviews:[],reading:{MAT:[1,2]},quiz:{synthetic:'correct'},events:[{kind:'chapter-explored'}]};const before=JSON.stringify(data);assert.equal(developmentCount(data),n);assert.equal(treeLevel(data),expected[n]);assert.equal(JSON.stringify(data),before);}});
check('study-does-not-write-personal-storage-or-register-workers',()=>{for(const f of ['study.js','preview.js','sheet.js'])assert.doesNotMatch(fs.readFileSync(path.join(root,f),'utf8'),/localStorage|sessionStorage|indexedDB|serviceWorker|fetch\s*\(/);});
const report={scope:'Phase A asset and contract assertions, not Phase B integration.',pass:true,checks};fs.writeFileSync(path.join(root,'evidence/contracts.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
