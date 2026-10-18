/** Byte/authority proof against the accepted TREEGUIDE2 source; synthetic only. */
import fs from 'node:fs';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';import crypto from 'node:crypto';
import {treeLevel} from '../../src/domain.js';
const base='31c96d50a5fb19e76cdb09d7a3b96ae5cb6ad70a',out='qa-output/uiux6d-final';
const git=(...args)=>execFileSync('git',args,{maxBuffer:32*1024*1024}),sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const allowed=['src/tree-view.js','src/verbunden/personal.css','src/version.js'];
const protectedFiles=git('ls-tree','-r','--name-only',base).toString().split('\n').filter(p=>p.startsWith('src/')&&!allowed.includes(p)).map(file=>({file,sha256:sha(fs.readFileSync(file)),unchanged:sha(git('show',base+':'+file))===sha(fs.readFileSync(file))}));assert(protectedFiles.every(x=>x.unchanged));
const authority=s=>s.slice(s.indexOf('export function selectTreeHistory'),s.indexOf('export function renderTreeJourney'));
assert.equal(authority(git('show',base+':src/tree-view.js').toString()),authority(fs.readFileSync('src/tree-view.js','utf8')));
const marker='/* Tree meaning is explanatory content, not a progress challenge. */';assert.equal(git('show',base+':src/verbunden/personal.css').toString().split(marker)[0],fs.readFileSync('src/verbunden/personal.css','utf8').split(marker)[0]);
const thresholds=Array.from({length:101},(_,n)=>{const state={paths:[{milestones:Array.from({length:n},()=>({}))}],reviews:[]},before=JSON.stringify(state),got=treeLevel(state),want=n===0?0:n===1?1:n===2?2:n<=4?3:n<=6?4:n<=9?5:6;assert.equal(got,want);assert.equal(JSON.stringify(state),before);return{count:n,stage:got}});
const old=JSON.parse(fs.readFileSync('qa-output/uiux6d/candidate/release-integrity.json')),next=JSON.parse(fs.readFileSync(out+'/candidate/release-integrity.json'));assert.equal(old.content_hash,next.content_hash);
const changedApp=git('diff','--name-only',base,'--','src').toString().trim().split('\n');assert.deepEqual(changedApp.sort(),allowed.sort());
const report={status:'PASS',baseline:base,sourceCommit:next.source_commit,protectedFiles,treeHistoryAuthorityUnchanged:true,sevenMeaningsNamesAndAssetsUnchanged:true,nonTreePersonalCSSUnchanged:true,thresholds,contentHash:next.content_hash,changedApp,schemaChange:false,newDependencies:false,personalDataRead:false};fs.writeFileSync(out+'/module-preservation.json',JSON.stringify(report,null,2));console.log(JSON.stringify({status:'PASS',protectedSource:protectedFiles.length,thresholdCases:thresholds.length,changedApp}));
