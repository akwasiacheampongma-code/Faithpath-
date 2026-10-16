import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {validateNachleseMc} from '../scripts/validate-nachlese-mc.mjs';

test('Reviewed MC additions cover only active story questions and preserve all protected source fields',()=>{
 const result=validateNachleseMc();
 assert.equal(result.status,'PASS');assert.equal(result.total,2314);
 assert.equal(result.active_story_questions,result.already_complete+result.to_complete);
 assert.equal(result.added+result.manual+result.reflections,2314);
 assert.equal(result.separate_story_reflections,436);assert(result.added>0);
});

test('Corpus gate rejects published data drift and protected flow changes',()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'faithpath-nmc-gate-'));
 try{
  // Isolated copies keep negative tests away from the real source files.
  fs.cpSync('reports/nachlese-mc',path.join(temp,'reports/nachlese-mc'),{recursive:true});
  const manifest=JSON.parse(fs.readFileSync('reports/nachlese-mc/manifest.json'));
  for(const file of [...Object.keys(manifest.protected_files),'data/nachlese-questions.json']){
   const dest=path.join(temp,file);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(file,dest);
  }
  const mutate=(file,change)=>{const dest=path.join(temp,file),original=fs.readFileSync(file);fs.writeFileSync(dest,change(original));return ()=>fs.writeFileSync(dest,original);};
  const undo=mutate('data/nachlese-questions.json',bytes=>bytes.toString().replace('Himmel und Erde','Veränderte Altantwort'));
  assert.throws(()=>validateNachleseMc(temp),/Published N data hash/);undo();
  const undoFlow=mutate('data/faithpath-nachlese-story-flow.json',bytes=>bytes.toString()+' ');
  assert.throws(()=>validateNachleseMc(temp),/Protected STABLE1 content/);undoFlow();
  assert.equal(validateNachleseMc(temp).status,'PASS');
 }finally{fs.rmSync(temp,{recursive:true,force:true});}
});
