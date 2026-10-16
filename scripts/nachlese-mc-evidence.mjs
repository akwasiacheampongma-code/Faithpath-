import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
const text=value=>typeof value==='string'&&value.trim().length>0;
const ordered=value=>Array.isArray(value)?value.map(ordered):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,ordered(value[key])])):value;
export const canonicalHash=value=>hash(JSON.stringify(ordered(value)));

// This verifies structure, provenance and literal evidence. Semantic truth and
// plausibility additionally require the separately recorded per-question review.
export function validateNachleseRecord(source,record,verseLookup){
  assert.equal(record.id,source.id,'N-ID differs');
  assert(['ready','manual','reflection'].includes(record.status),'Unknown N-MC status');
  if(record.status!=='ready'){
    assert(text(record.reason),'Held question needs a reason');
    assert(!Object.hasOwn(record,'a')&&!Object.hasOwn(record,'c'),'Held question must not publish choices');
    return record.status;
  }
  assert(Array.isArray(record.a)&&record.a.length===4&&record.a.every(text),'Four nonempty N-MC options required');
  assert.equal(new Set(record.a.map(s=>s.normalize('NFC').trim().replace(/\s+/g,' ').toLocaleLowerCase('de-DE'))).size,4,'Duplicate N-MC options');
  assert(Number.isInteger(record.c)&&record.c>=0&&record.c<4,'N-MC correct index');
  assert.equal(record.a[record.c],source.answer,'Original N answer changed');
  const proof=p=>{
    assert(p&&text(p.key)&&text(p.quote)&&text(p.reason),'Incomplete Bible evidence');
    const verse=verseLookup(p.key);
    assert(text(verse)&&verse.includes(p.quote),`Bible quote differs: ${record.id}/${p.key}`);
  };
  proof(record.correct_check);
  assert(Array.isArray(record.wrong_checks)&&record.wrong_checks.length===3,'Three distractor checks required');
  const wrong=record.a.filter((_,i)=>i!==record.c);
  assert.deepEqual(record.wrong_checks.map(p=>p.option).sort(),[...wrong].sort(),'Distractor checks do not match all three wrong options');
  for(const p of record.wrong_checks)proof(p);
  return 'ready';
}
