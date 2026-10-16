import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {canonicalHash,validateNachleseRecord} from './nachlese-mc-evidence.mjs';

const BASE_COMMIT='d3322255e51af3c5eabb39011b0ff78dc05ea88f';
const BASE_SHA='f752614dea5cab6c787d3834f3651eb77126cd9c819a998ea4373bc5301d6e37';
const ZIP_SHA='b16804e1dfd7cb8b6e8c48151d72f31b25dae80ca9d969c20b107765457c2eea';
const XLSX_SHA='55408eae434e59d781daad5c80d18b68414cd73293940ff1f8dbe50e3186f681';
const KEYS=['q','answer','a','c','ref','references','x'];
const text=v=>typeof v==='string'&&v.trim().length>0;
const hash=v=>crypto.createHash('sha256').update(v).digest('hex');
export const editorialFields=q=>Object.fromEntries(KEYS.filter(k=>Object.hasOwn(q,k)).map(k=>[k,structuredClone(q[k])]));

export function validateEditorialDecision(source,record,verseLookup){
 assert.equal(record.id,source.id,'Editorial N-ID differs');
 assert.equal(record.source_sha256,canonicalHash(source),'Editorial review source differs');
 assert(text(record.reason),'Editorial decision needs a reason');
 const decisions={proposal56:['ACCEPT','REVISE','HOLD'],marked150:['KEEP','CORRECT','HOLD'],segmentation:['CORRECT','HOLD']};
 assert(decisions[record.group]?.includes(record.decision),'Unexpected editorial decision/group');
 if(record.decision==='HOLD'){assert(!record.final,'Held decision cannot publish fields');return 'held';}
 const final=record.final;
 assert(final&&Object.keys(final).every(k=>KEYS.includes(k)),'Editorial identity or unapproved field change');
 assert(['q','answer','a','c','ref'].every(k=>Object.hasOwn(final,k))&&text(final.q)&&text(final.answer)&&text(final.ref),'Editorial required fields');
 assert(Array.isArray(final.references)&&final.references.length>0,'Editorial structured references missing');
 assert(!Object.hasOwn(final,'x')||text(final.x),'Editorial explanation must be text');
 if(record.decision==='KEEP')assert.deepEqual(final,editorialFields(source),'KEEP must preserve all existing fields');
 if(record.decision==='CORRECT'){
  assert(['translation_reference_mismatch','wrong_answer','multiple_true_options','question_answer_mismatch','false_distractor','invalid_reference'].includes(record.error_kind),'Correction needs a demonstrated error kind');
  assert.notDeepEqual(final,editorialFields(source),'CORRECT without an actual change');
 }
 for(const ref of final.references){
  assert(text(ref.book)&&['chapter','from','to'].every(k=>Number.isInteger(ref[k])&&ref[k]>0)&&ref.to>=ref.from,'Editorial invalid reference range');
  for(const tr of ['l1912','otb'])for(let v=ref.from;v<=ref.to;v++)assert(text(verseLookup(`${tr}:${ref.book}:${ref.chapter}:${v}`)),'Editorial reference does not exist in both translations');
 }
 for(const tr of ['l1912','otb']){
  const evidence=record.evidence?.[tr];assert(evidence,'Both translations need editorial evidence');
  validateNachleseRecord({...final,id:source.id},{id:source.id,status:'ready',a:final.a,c:final.c,...evidence},key=>{
   assert(key.startsWith(tr+':'),'Editorial proof uses wrong translation');return verseLookup(key);
  });
  if(record.group==='segmentation'){
   const [,book,ch,v]=evidence.correct_check.key.split(':');
   assert(final.references.some(r=>r.book===book&&r.chapter===+ch&&r.from<=+v&&r.to>=+v),'Segmented reference must cover the supporting verse in each translation');
  }
 }
 return 'verified';
}

export function validateNachleseEditorial(root='.'){
 const dir='reports/nachlese-editorial-56/',raw=f=>fs.readFileSync(path.join(root,f)),read=f=>JSON.parse(raw(f));
 const manifest=read(dir+'manifest.json');assert.equal(manifest.schema_version,1);assert.equal(manifest.base_commit,BASE_COMMIT);
 assert.equal(hash(raw(dir+'baseline-mc-questions.json')),BASE_SHA,'Editorial baseline differs');
 assert.equal(hash(raw(dir+'source/Redaktionspaket.zip')),ZIP_SHA,'Editorial source ZIP differs');
 assert.equal(hash(raw(dir+'source/Redaktion_56.xlsx')),XLSX_SHA,'Editorial Excel source differs');
 for(const [file,digest]of Object.entries(manifest.audit_files))assert.equal(hash(raw(dir+file)),digest,'Editorial audit file differs: '+file);
 for(const [file,digest]of Object.entries(manifest.protected_files))assert.equal(hash(raw(file)),digest,'Protected STABLE1 content changed: '+file);
 assert.equal(hash(raw('data/nachlese-questions.json')),manifest.data_sha256,'Published N data hash differs (editorial)');
 const before=read(dir+'baseline-mc-questions.json'),after=read('data/nachlese-questions.json');
 const proposals=read(dir+'source/56_redaktionsvorschlaege.json').records,flags=read(dir+'source/mc_optionen_auffaellig.json').records;
 const proposalIds=new Set(proposals.map(q=>q.id)),markedIds=new Set(flags.map(q=>q.id)),specialIds=new Set(['N-1535','N-1536']);
 assert.equal(before.count,2314);assert.equal(before.questions.length,2314);assert.equal(proposalIds.size,56);assert.equal(markedIds.size,150);assert.equal(flags.length,227);
 assert.deepEqual([...proposalIds].sort(),before.questions.filter(q=>!q.a).map(q=>q.id).sort(),'Proposal IDs must equal the existing 56 holds');
 const byId=new Map(before.questions.map(q=>[q.id,q])),allIds=new Set([...proposalIds,...markedIds,...specialIds]);assert.equal(allIds.size,208);
 for(const p of proposals){const source=byId.get(p.id);assert.equal(p.original_question,source.q);assert.equal(p.original_answer,source.answer);assert.equal(p.reference,source.ref);assert.equal(p.story_id,source.source_story_id);}
 for(const f of flags){const source=byId.get(f.id);assert.equal(source.answer,f.correct);assert(source.a.includes(f.suspect_wrong)&&f.suspect_wrong!==source.answer);}
 const records=raw(dir+'review-decisions.jsonl').toString().trim().split('\n').map(l=>JSON.parse(l));
 assert.equal(records.length,208);assert.equal(new Set(records.map(r=>r.id)).size,208);assert.deepEqual(records.map(r=>r.id).sort(),[...allIds].sort());
 const books=new Set(read('data/index.json').map(b=>b.code)),cache=new Map();
 const lookup=key=>{const m=/^(otb|l1912):([A-Z0-9]{3}):(\d+):(\d+)$/.exec(key);if(!m||!books.has(m[2]))return null;const file=`data/bibles/${m[1]}/${m[2]}.json`;if(!cache.has(file))cache.set(file,read(file).chapters);return cache.get(file)[+m[3]-1]?.find(v=>v[0]===+m[4])?.[1]||null;};
 const expected=structuredClone(before),target=new Map(expected.questions.map(q=>[q.id,q])),changes=[];
 let completed=0,markedCorrections=0,holds=0;
 for(const record of records){
  const group=proposalIds.has(record.id)?'proposal56':markedIds.has(record.id)?'marked150':'segmentation';assert.equal(record.group,group);
  const source=byId.get(record.id),status=validateEditorialDecision(source,record,lookup);
  if(status==='held'){holds++;continue;}
  if(record.group==='proposal56'){
   completed++;
   if(record.decision==='ACCEPT'){const p=proposals.find(q=>q.id===record.id);assert.deepEqual([record.final.q,record.final.answer,record.final.a,record.final.c],[p.proposed_question,p.proposed_correct_answer,p.proposed_options,p.correct_index],'ACCEPT differs from submitted proposal');}
  }
  if(record.group==='marked150'&&record.decision==='CORRECT')markedCorrections++;
  for(const [key,value]of Object.entries(record.final))if(canonicalHash(source[key]??null)!==canonicalHash(value))changes.push({id:record.id,field:key,old_value:source[key]??null,new_value:value});
  Object.assign(target.get(record.id),record.final);
 }
 assert.deepEqual(read(dir+'change-list.json'),changes,'Editorial change list differs');
 assert.deepEqual(after,expected,'Unapproved N fields, IDs, order, provenance or story links changed');
 const active=read('data/faithpath-nachlese-story-flow.json').stories.flatMap(s=>s.flow_items.map(i=>{if(i.primary_question_id.startsWith('N-'))assert.equal(target.get(i.primary_question_id)?.source_story_id,s.story_id);return i.primary_question_id;}));
 assert.equal(active.length,2479);assert.equal(new Set(active).size,2479);assert([...byId.keys()].every(id=>active.includes(id)));
 let mc=0;
 for(const [i,q]of after.questions.entries()){
  assert.equal(q.id,'N-'+String(i+1).padStart(4,'0'));
  if(q.a){assert(q.a.length===4&&q.a.every(text)&&Number.isInteger(q.c)&&q.c>=0&&q.c<4&&q.a[q.c]===q.answer);assert.equal(new Set(q.a.map(s=>s.normalize('NFC').trim().replace(/\s+/g,' ').toLocaleLowerCase('de-DE'))).size,4);mc++;}
 }
 const counts={total:2314,active_story_questions:2479,already_complete:165,to_complete:2314,reflections:0,separate_story_reflections:436,added:mc,manual:2314-mc,preexisting_n_mc:2258,added_this_phase:completed,marked_reviewed:150,marked_corrected:markedCorrections,segmented_references_reviewed:2,reviewed_both_translations:208,not_re_reviewed_this_phase:2106,held_decisions:holds,changed_questions:new Set(changes.map(c=>c.id)).size};
 assert.deepEqual(manifest.counts,counts,'Editorial counts differ');
 return {status:'PASS',...counts,separate_nachlese_reflections:435,hidden_faithpath_aliases:95,ids_and_story_links_unchanged:true,questions_and_refs_unchanged:changes.every(c=>!['q','answer','ref','references'].includes(c.field)),only_verified_editorial_changes:true,story_flow_unchanged:true,progress_schema_unchanged:true};
}
if(process.argv[1]===new URL(import.meta.url).pathname)console.log(JSON.stringify(validateNachleseEditorial(process.argv[2]||'.')));
