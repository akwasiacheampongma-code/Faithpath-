import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {parseQuizReferences} from './quiz-reference-ranges.mjs';
const hash = raw=>crypto.createHash('sha256').update(raw).digest('hex');
const text = value=>typeof value==='string' && value.trim().length>0;
export function validateFinalNtQuiz(root='.') {
  const file=name=>path.join(root,name), dir='reports/nt-quiz-final/';
  const raw=name=>fs.readFileSync(file(name)), read=name=>JSON.parse(raw(name));
  const manifest=read(dir+'manifest.json'), master=read(dir+'master.json');
  assert.equal(hash(raw(dir+manifest.source_file)),manifest.source_sha256,'Excel source hash');
  assert.equal(hash(raw(dir+'master.json')),manifest.normalized_sha256,'Normalized source hash');
  assert.equal(hash(raw(dir+'pre-import-stories.json')),manifest.pre_import_sha256,'Pre-import backup hash');
  assert.equal(hash(raw(dir+'pre-import-nt-quiz-status.json')),manifest.pre_import_status_sha256,'Original status metadata hash');
  assert.equal(hash(raw('data/nt-quiz-status.json')),manifest.imported_status_sha256,'Final status metadata hash');
  const status=read('data/nt-quiz-status.json');
  assert.equal(status.source_sha256,manifest.source_sha256);assert.equal(status.source_sheet,'FAITHPATH_IMPORT');
  assert.equal(status.qa_status,'FREIGEGEBEN');assert.equal(status.approval,'FREIGEGEBEN');assert.equal(status.import_ready,'JA');
  assert.equal(hash(raw('data/stories.json')),manifest.imported_stories_sha256,'Imported file hash');
  assert.equal(master.schema_version,1);assert.equal(master.sheet,'FAITHPATH_IMPORT');assert.equal(master.rows.length,1300);
  const rows=master.rows, books=read('data/index.json'), nt=books.slice(39), bookByCode=new Map(nt.map(b=>[b.code,b]));
  const before=read(dir+'pre-import-stories.json'), after=read('data/stories.json');
  const expected=structuredClone(before), byId=new Map(), chapters=new Map(), diff=[];
  for(const [si,unit] of expected.entries())for(const [qi,q] of unit.questions.entries()) {
    assert(!byId.has(q.faithpath_id),'Duplicate existing ID');byId.set(q.faithpath_id,{unit,q,si,qi});
  }
  const bibles=Object.fromEntries(['otb','l1912'].map(tr=>[tr,Object.fromEntries(nt.map(b=>[b.code,read(`data/bibles/${tr}/${b.code}.json`).chapters]))]));
  const ids=new Set();
  for(const row of rows) {
    assert(!ids.has(row.FP_ID),'Duplicate master ID');ids.add(row.FP_ID);
    const b=bookByCode.get(row.book_key);assert(b,'Unknown NT book');assert.equal(row.book_name,b.name);
    assert(Number.isInteger(row.chapter)&&row.chapter>=1&&row.chapter<=b.chapters,'Chapter range');
    assert(Number.isInteger(row.question_order)&&row.question_order>=1&&row.question_order<=5,'Question order');
    const options=Array.from({length:4},(_,i)=>row['option_'+i]);assert(options.every(text));assert.equal(new Set(options).size,4);
    assert(Number.isInteger(row.correct_index)&&row.correct_index>=0&&row.correct_index<4);
    assert.equal(row.correct_answer,options[row.correct_index],'Zero-based correct answer differs');
    for(const key of ['question','reference','explanation'])assert(text(row[key]),'Empty '+key);
    for(const value of Object.values(row))if(typeof value==='string')assert(!/\uFFFD|_x[0-9a-f]{4}_|&(?:[A-Za-z]+|#\d+|#x[0-9a-f]+);/i.test(value),'Unicode/Excel/HTML artifact');
    assert.equal(row.qa_status,'FREIGEGEBEN');assert.equal(row.approval,'FREIGEGEBEN');assert.equal(row.import_ready,'JA');
    const key=row.book_key+':'+row.chapter;if(!chapters.has(key))chapters.set(key,[]);chapters.get(key).push(row);
    for(const ref of parseQuizReferences(row.reference,books)) {
      assert.equal(ref.book,row.book_key,'Reference points to foreign book');assert.equal(ref.chapter,row.chapter,'Reference points to foreign chapter');
      for(const tr of ['otb','l1912']) {
        const present=new Set(bibles[tr][ref.book][ref.chapter-1].map(v=>v[0]));
        for(let verse=ref.from;verse<=ref.to;verse++)assert(present.has(verse),`${row.FP_ID}: ${tr} verse missing ${verse}`);
      }
    }
    const location=byId.get(row.FP_ID);assert(location,'Master ID has no legacy location');
    const {unit,q,si,qi}=location;assert.equal(unit.kind,'chapter-quiz');assert.equal(unit.book,row.book_key);assert.equal(unit.chapter+1,row.chapter);assert.equal(qi+1,row.question_order);
    const fields={q:row.question,a:options,c:row.correct_index,ref:row.reference,x:row.explanation};
    for(const [field,value] of Object.entries(fields)) {
      if(JSON.stringify(q[field])!==JSON.stringify(value))diff.push({FP_ID:row.FP_ID,locator:`$[${si}].questions[${qi}].${field}`,field,old_value:q[field],new_value:value});
      q[field]=value;
    }
  }
  assert.deepEqual([...ids].sort(),Array.from({length:1300},(_,i)=>'FP-'+String(i+261).padStart(4,'0')));
  assert.equal(chapters.size,260);assert.equal(new Set(rows.map(r=>r.book_key)).size,27);
  for(const b of nt)for(let chapter=1;chapter<=b.chapters;chapter++) {
    const items=chapters.get(b.code+':'+chapter);assert.equal(items?.length,5);
    assert.deepEqual(items.map(r=>r.question_order).sort(),[1,2,3,4,5]);assert.equal(new Set(items.map(r=>r.question.normalize('NFC').trim().toLowerCase())).size,5);
  }
  assert.deepEqual(after,expected,'Non-approved question fields, other stories, metadata, IDs or order changed');
  assert.deepEqual(read(dir+'diff.json'),{source_sha256:manifest.source_sha256,changes:diff},'Diff must exactly describe source change');
  assert.equal(diff.length,manifest.changed_fields);
  return {status:'PASS',questions:1300,chapters:260,books:27,content_preserved:true,changed_fields:diff.length,source_sha256:manifest.source_sha256};
}
if(process.argv[1]===new URL(import.meta.url).pathname)console.log(JSON.stringify(validateFinalNtQuiz(process.argv[2]||'.')));
