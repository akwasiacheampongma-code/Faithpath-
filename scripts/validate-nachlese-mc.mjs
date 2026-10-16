import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {canonicalHash,validateNachleseRecord} from './nachlese-mc-evidence.mjs';
import {validateNachleseEditorial} from './validate-nachlese-editorial.mjs';
export {canonicalHash,validateNachleseRecord} from './nachlese-mc-evidence.mjs';

const BASELINE_SHA='e475c34506a20aefd71a4e41a5fdec813c0ed0add5790397aa4b68cbdc6aa73d';
const BASE_COMMIT='6f96ec8be376af3b0de03094a5052ae909054658';
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
const text=value=>typeof value==='string'&&value.trim().length>0;

export function validateNachleseMc(root='.'){
  const raw=file=>fs.readFileSync(path.join(root,file)),read=file=>JSON.parse(raw(file));
  const dir='reports/nachlese-mc/';
  const successor=fs.existsSync(path.join(root,'reports/nachlese-editorial-56/manifest.json')) ? validateNachleseEditorial(root) : null;
  const published=successor ? 'reports/nachlese-editorial-56/baseline-mc-questions.json' : 'data/nachlese-questions.json';
  const manifest=read(dir+'manifest.json');
  assert.equal(manifest.schema_version,1);assert.equal(manifest.base_commit,BASE_COMMIT);
  assert.equal(hash(raw(dir+'baseline-active-questions.json')),BASELINE_SHA,'N source baseline changed');
  assert.equal(manifest.baseline_sha256,BASELINE_SHA);
  for(const [name,digest] of Object.entries(manifest.audit_files))assert.equal(hash(raw(dir+name)),digest,'N audit artifact changed: '+name);
  for(const [name,digest] of Object.entries(manifest.protected_files))assert.equal(hash(raw(name)),digest,'Protected STABLE1 content changed: '+name);
  assert.equal(hash(raw(published)),manifest.data_sha256,'Published N data hash differs');
  const before=read(dir+'baseline-active-questions.json'),after=read(published);
  const lines=file=>raw(dir+file).toString('utf8').trim().split('\n').map(line=>JSON.parse(line));
  const authors=lines('authored.jsonl'),reviews=lines('reviews.jsonl'),master=read(dir+'master.json');
  assert.equal(before.count,2314);assert.equal(before.questions.length,2314);
  assert.equal(authors.length,2314);assert.equal(reviews.length,2314);assert.equal(master.schema_version,1);
  const sourceById=new Map(before.questions.map(q=>[q.id,q]));
  const byAuthor=new Map(authors.map(q=>[q.id,q])),byReview=new Map(reviews.map(q=>[q.id,q]));
  assert.equal(sourceById.size,2314);assert.equal(byAuthor.size,2314);assert.equal(byReview.size,2314);
  const books=new Set(read('data/index.json').map(b=>b.code)),cache=new Map();
  const verseLookup=key=>{
    const m=/^(l1912|otb):([A-Z0-9]{3}):(\d+):(\d+)$/.exec(key);
    if(!m||!books.has(m[2]))return null;
    const file=`data/bibles/${m[1]}/${m[2]}.json`;
    if(!cache.has(file))cache.set(file,read(file).chapters);
    return cache.get(file)[+m[3]-1]?.find(v=>v[0]===+m[4])?.[1]||null;
  };
  // The UI renders primary_question_id, not every alias in source_question_ids.
  // Count the installed story flow before changing any options; no legacy import.
  const flow=read('data/faithpath-nachlese-story-flow.json');
  const fp=new Map(read('data/stories.json').filter(u=>u.kind!=='chapter-quiz').flatMap(u=>u.questions.map(q=>[q.faithpath_id,q])));
  const active=flow.stories.flatMap(s=>s.flow_items.map(item=>{
    assert(item.source_question_ids.includes(item.primary_question_id),'Primary missing from story mapping');
    const q=sourceById.get(item.primary_question_id)||fp.get(item.primary_question_id);
    assert(q,'Active story question missing');
    if(sourceById.has(item.primary_question_id))assert.equal(q.source_story_id,s.story_id,'Active N story mismatch');
    return item.primary_question_id;
  }));
  assert.equal(new Set(active).size,active.length,'Repeated active story question');
  assert.equal(active.length,2479);assert.equal(flow.stories.length,436);
  assert([...sourceById.keys()].every(id=>active.includes(id)),'Only displayed N questions may receive options');
  const existing=active.filter(id=>fp.has(id));
  assert.equal(existing.length,165);
  for(const id of existing){const q=fp.get(id);assert(q.a?.length===4&&Number.isInteger(q.c)&&q.c>=0&&q.c<4,'Existing active MC incomplete');}
  const effective=[],counts={total:2314,active_story_questions:2479,already_complete:165,to_complete:2314,reflections:0,separate_story_reflections:436,added:0,manual:0};
  for(const [i,source] of before.questions.entries()){
    assert.equal(source.id,'N-'+String(i+1).padStart(4,'0'),'N source order');
    assert(!Object.hasOwn(source,'a')&&!Object.hasOwn(source,'c'),'Baseline already has MC');
    const authored=byAuthor.get(source.id),review=byReview.get(source.id);
    assert(authored&&review,'Missing independent review: '+source.id);
    assert.equal(review.candidate_sha256,canonicalHash(authored),'Review covers a different candidate: '+source.id);
    assert(text(review.reason),'Review reason required');
    let record;
    if(review.verdict==='PASS'){
      assert.equal(authored.status,'ready','Only ready candidates can pass');record=authored;
    }else if(review.verdict==='REPLACE'){
      assert(review.replacement,'Replacement missing');record={id:source.id,status:'ready',...review.replacement};
      assert.equal(record.status,'ready');
    }else{
      assert(['MANUAL','REFLECTION'].includes(review.verdict),'Unknown independent verdict');
      record={id:source.id,status:review.verdict==='MANUAL'?'manual':'reflection',reason:review.reason};
    }
    validateNachleseRecord(source,record,verseLookup);effective.push(record);
    counts[record.status==='ready'?'added':record.status==='reflection'?'reflections':'manual']++;
  }
  assert.deepEqual(master.records,effective,'Master differs from independently reviewed candidates');
  assert.deepEqual(manifest.counts,counts,'N-MC counts differ');
  const expected=structuredClone(before);
  for(const [i,record] of effective.entries())if(record.status==='ready'){
    expected.questions[i].a=record.a;expected.questions[i].c=record.c;
  }
  assert.deepEqual(after,expected,'Existing N source fields, order or provenance changed');
  assert.equal(counts.added+counts.manual+counts.reflections,counts.total);
  const previous={status:'PASS',...counts,separate_nachlese_reflections:435,hidden_faithpath_aliases:95,questions_and_refs_unchanged:true,story_flow_unchanged:true,progress_schema_unchanged:true};
  return successor ? {...successor,previous_mc_release:previous} : previous;
}
if(process.argv[1]===new URL(import.meta.url).pathname)console.log(JSON.stringify(validateNachleseMc(process.argv[2]||'.')));
