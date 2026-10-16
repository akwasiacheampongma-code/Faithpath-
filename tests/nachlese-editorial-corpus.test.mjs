import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {validateNachleseEditorial} from '../scripts/validate-nachlese-editorial.mjs';

test('All 2314 active Nachlese questions have four options after verified editorial completion',()=>{
 const result=validateNachleseEditorial();assert.equal(result.total,2314);assert.equal(result.added,2314);assert.equal(result.manual,0);
 assert.equal(result.added_this_phase,56);assert.equal(result.marked_reviewed,150);assert.equal(result.reviewed_both_translations,208);
 assert(result.only_verified_editorial_changes&&result.ids_and_story_links_unchanged&&result.story_flow_unchanged&&result.progress_schema_unchanged);
});
test('Editorial successor rejects unapproved text and lost story links even if a published hash is refreshed',()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'faithpath-editorial-'));
 try{
  fs.cpSync('reports/nachlese-editorial-56',path.join(temp,'reports/nachlese-editorial-56'),{recursive:true});
  const mf='reports/nachlese-editorial-56/manifest.json',manifest=JSON.parse(fs.readFileSync(mf));
  for(const file of [...Object.keys(manifest.protected_files),'data/nachlese-questions.json']){const dest=path.join(temp,file);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(file,dest);}
  const original=fs.readFileSync('data/nachlese-questions.json');
  for(const mutate of [q=>q.q='Ungeprüfte Änderung einer anderen Frage',q=>q.source_story_id='NS-9999']){
   const data=JSON.parse(original);mutate(data.questions[0]);const raw=JSON.stringify(data);fs.writeFileSync(path.join(temp,'data/nachlese-questions.json'),raw);
   const changed=structuredClone(manifest);changed.data_sha256=crypto.createHash('sha256').update(raw).digest('hex');fs.writeFileSync(path.join(temp,mf),JSON.stringify(changed));
   assert.throws(()=>validateNachleseEditorial(temp),/Unapproved N fields/);
  }
 }finally{fs.rmSync(temp,{recursive:true,force:true});}
});
test('Supplied Excel/JSON package and all original fields match the exact prior installed release',()=>{
 const result=JSON.parse(execFileSync('python3',['scripts/validate-nachlese-editorial-source.py','--check'],{encoding:'utf8'}));
 assert.equal(result.status,'PASS');assert.equal(result.proposal_rows,56);assert.equal(result.marked_questions,150);assert.equal(result.writes,0);
});
