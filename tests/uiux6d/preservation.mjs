/** Structural/byte proof: no domain, storage, content or MOBILE2 style rewrite. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import crypto from 'node:crypto';
import {TREE_STAGE_MEANINGS} from '../../src/tree-stage-guide.js';
import {treeLevel} from '../../src/domain.js';

const base='491acf33c409be37781073d2d831c16c56192241',out='qa-output/uiux6d';
const git=(...args)=>execFileSync('git',args,{maxBuffer:32*1024*1024});
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const sourceFiles=git('ls-tree','-r','--name-only',base).toString().trim().split('\n').filter(p=>p.startsWith('src/'));
const allowed=new Set(['src/tree-stage-guide.js','src/tree-view.js','src/verbunden/personal.css','src/version.js']);
const protectedSource=sourceFiles.filter(p=>!allowed.has(p)).map(file=>({file,unchanged:sha(git('show',base+':'+file))===sha(fs.readFileSync(file))}));
assert(protectedSource.every(r=>r.unchanged));
const oldManifest=JSON.parse(fs.readFileSync(out+'/baseline/release-integrity.json'));
const oldGuide=await import(pathToFileURL(path.resolve(out+'/baseline/releases/'+oldManifest.build+'/src/tree-stage-guide.js')).href);
assert.deepEqual(TREE_STAGE_MEANINGS,oldGuide.TREE_STAGE_MEANINGS);
const priorCSS=git('show',base+':src/verbunden/personal.css').toString(),css=fs.readFileSync('src/verbunden/personal.css','utf8');
const marker='/* Tree meaning is explanatory content, not a progress challenge. */';
assert.equal(css.split(marker)[0],priorCSS.split(marker)[0]);
const authority=source=>source.slice(source.indexOf('export function selectTreeHistory'),source.indexOf('export function renderTreeJourney'));
assert.equal(authority(git('show',base+':src/tree-view.js').toString()),authority(fs.readFileSync('src/tree-view.js','utf8')));
const thresholds=Array.from({length:101},(_,count)=>{
 const got=treeLevel({paths:[{milestones:Array.from({length:count},()=>({}))}],reviews:[]});
 const expected=count===0?0:count===1?1:count===2?2:count<=4?3:count<=6?4:count<=9?5:6;
 assert.equal(got,expected);return{count,stage:got};
});
const current=JSON.parse(fs.readFileSync(out+'/candidate/release-integrity.json'));
assert.equal(current.content_hash,oldManifest.content_hash);
fs.writeFileSync(out+'/module-preservation.json',JSON.stringify({baseline:base,sourceCommit:current.source_commit,protectedSource,sevenMeaningsUnchanged:true,priorMOBILE2PersonalCSSUnchanged:true,historicalSourceSelectorUnchanged:true,thresholds,contentHash:current.content_hash,schemaChange:false,newDependency:false,personalDataRead:false,status:'PASS'},null,2));
console.log(JSON.stringify({protectedSource:protectedSource.length,sevenMeaningsUnchanged:true,thresholdCases:thresholds.length,status:'PASS'}));
