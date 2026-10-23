#!/usr/bin/env node
// FaithPath AT: NT-equivalent QA ledger generator. No editorial auto-approval.
// Run in repository root: node scripts/review-at-nt-standard.mjs
// Reads AT source/mapping and writes review sheets; never changes original data.
import fs from 'node:fs';
import path from 'node:path';

const source = 'content/at-source-recovery';
const out = 'reports/at-nt-standard-20261023';
const codes = ['GEN','EXO','LEV','NUM','DEU','JOS','JDG','RUT','1SA','2SA','1KI','2KI','1CH','2CH','EZR','NEH','EST','JOB','PSA','PRO','ECC','SNG','ISA','JER','LAM','EZK','DAN','HOS','JOL','AMO','OBA','JON','MIC','NAM','HAB','ZEP','HAG','ZEC','MAL'];
const clean = value => String(value ?? '').normalize('NFKC').toLowerCase().replace(/\s+/g,' ').trim();
const field = value => {
  let v = String(value ?? '');
  if (/^\s*[=+@-]/.test(v)) v = "'" + v;
  return '"' + v.replace(/"/g,'""') + '"';
};
const saveCsv = (name,columns,records) => {
  const lines = [columns.map(field).join(';')];
  for (const row of records) lines.push(columns.map(k=>field(row[k])).join(';'));
  fs.writeFileSync(path.join(out,name),'\uFEFF'+lines.join('\r\n')+'\r\n','utf8');
};
const map = JSON.parse(fs.readFileSync(path.join(source,'chapter-candidate-map.json'),'utf8'));
const links = new Map();
for (const chapter of map.chapters) {
  (chapter.proposed_primary_question_ids||[]).forEach((id,i) =>
    links.set(id,[...(links.get(id)||[]), chapter.book_code+' '+chapter.app_chapter+' #'+(i+1)]));
}
const qrows=[], crows=[], issues=[], books=[], byId=new Map(), ids=new Set(), seenQuestions=new Set();
let counts=[0,0,0,0],shortExplanations=0,drafts=0;
function problem(scope,id,book,error){ issues.push({scope,id,book,error}); }
for (const code of codes) {
  const data = JSON.parse(fs.readFileSync(path.join(source,'books',code+'.json'),'utf8'));
  const dist=[0,0,0,0];
  const questions = (data.units||[]).flatMap(unit=>(unit.questions||[]).map(q=>({q,unit})));
  let shortBook=0;
  if(data.book?.code!==code||data.question_count!==questions.length||data.unit_count!==data.units.length)
    problem('BUCH',code,code,'QUELLMETADATEN_INKONSISTENT');
  for (const {q,unit} of questions){
    const err=[],hints=[],opts=q.options||[];
    if(!q.id||ids.has(q.id))err.push('ID_DOPPELT_ODER_LEER'); ids.add(q.id);
    if(!Array.isArray(opts)||opts.length!==4||opts.some(v=>typeof v!=='string'||!v.trim()))err.push('OPTION_FEHLT');
    if(new Set(opts.map(clean)).size!==4)err.push('OPTION_DOPPELT');
    if(!Number.isInteger(q.correct_index)||q.correct_index<0||q.correct_index>3)err.push('INDEX_UNGUELTIG');
    else {
      dist[q.correct_index]++;counts[q.correct_index]++;
      if(String(q.correct_answer).toUpperCase()!=='ABCD'[q.correct_index])err.push('BUCHSTABE_INDEX_UNGLEICH');
    }
    if(!q.question?.trim()||!q.explanation?.trim()||!q.verse_reference?.trim())err.push('PFLICHTTEXT_LEER');
    if(String(q.explanation||'').trim().length<55){hints.push('KURZE_ERKLAERUNG');shortExplanations++;shortBook++;}
    if(String(q.question||'').trim().length<25)hints.push('SEHR_KURZE_FRAGE');
    if(/symbolisier|steht .* für|bedeutet.*geistlich|welche lehre|was lehrt uns|weist .* hin/i.test((q.question||'')+' '+(q.explanation||'')))
      hints.push('THEOLOGISCHE_AUSLEGUNG_PRUEFEN');
    const key=code+'|'+clean(q.question);
    if(seenQuestions.has(key))hints.push('FRAGETEXT_DOPPELT_IM_BUCH'); seenQuestions.add(key);
    if(opts.length===4 && Number.isInteger(q.correct_index) && q.correct_index>=0 && q.correct_index<4){
      const others=opts.filter((v,i)=>i!==q.correct_index).map(x=>String(x).length).sort((a,b)=>a-b);
      if(String(opts[q.correct_index]).length>40 && String(opts[q.correct_index]).length>2.5*Math.max(1,others[1]))
        hints.push('RICHTIGE_ANTWORT_AUFFAELLIG_LANG');
    }
    for (const error of err)problem('FRAGE',q.id,code,error);
    byId.set(q.id,{q,code});
    qrows.push({book_code:code,book_name:data.book.name,unit:unit.number,question_id:q.id,
      original_qa:q.source_qa_status||'',question:q.question,option_0:opts[0],option_1:opts[1],option_2:opts[2],option_3:opts[3],
      correct_index:q.correct_index,correct_answer:q.correct_answer,reference:q.verse_reference,explanation:q.explanation,
      difficulty:q.difficulty,chapter_choices:(links.get(q.id)||[]).join(' | '),
      technical_flags:err.join(' | '),editorial_hints:hints.join(' | '),
      text_checked:'NEIN',only_one_answer_checked:'NEIN',distractors_checked:'NEIN',
      explanation_checked:'NEIN',theology_checked:'NEIN',first_reviewer:'',second_reviewer:'',
      qa_status:err.length?'BLOCKIERT':'OFFEN',approval:'NICHT_FREIGEGEBEN',import_ready:'NEIN',notes:''});
  }
  books.push({book_code:code,book_name:data.book.name,units:data.unit_count,questions:questions.length,
    short_explanations:shortBook,A:dist[0],B:dist[1],C:dist[2],D:dist[3],qa_status:'NO_GO'});
}
for (const chap of map.chapters) {
  const selected=chap.proposed_primary_question_ids||[];
  if(selected.length!==5||new Set(selected).size!==5)problem('KAPITEL',chap.app_chapter,chap.book_code,'NICHT_EXAKT_FUENF');
  selected.forEach((id,i)=>{
    const sourceQuestion=byId.get(id),draft=id.startsWith('AT-NEW-');
    if(!sourceQuestion&&!draft)problem('KAPITEL',id,chap.book_code,'KANDIDAT_FEHLT');
    if(sourceQuestion&&sourceQuestion.code!==chap.book_code)problem('KAPITEL',id,chap.book_code,'FALSCHES_BUCH');
    if(draft)drafts++;
    crows.push({book_code:chap.book_code,chapter:chap.app_chapter,slot:i+1,question_id:id,
      source_type:draft?'ENTWURF':'ORIGINAL',question:sourceQuestion?.q.question||'',
      reference:sourceQuestion?.q.verse_reference||'',verse_remap:chap.remapped_original_verse_numbers?'JA':'NEIN',
      text_checked:'NEIN',choice_checked:'NEIN',coverage_checked:'NEIN',difficulty_checked:'NEIN',
      theology_checked:'NEIN',second_reviewer:'',qa_status:'OFFEN',approval:'NICHT_FREIGEGEBEN',import_ready:'NEIN',notes:''});
  });
}
const totals={books:books.length,units:books.reduce((s,b)=>s+b.units,0),questions:qrows.length,
  chapters:map.chapters.length,chapter_slots:crows.length,drafts};
for(const [key,num] of Object.entries({books:39,units:1289,questions:7009,chapters:929,chapter_slots:4645,drafts:5}))
  if(totals[key]!==num)problem('GESAMT',key,'AT','SOLL_'+num+'_IST_'+totals[key]);
fs.mkdirSync(out,{recursive:true});
saveCsv('questions-review.csv',Object.keys(qrows[0]),qrows);
saveCsv('chapter-choice-review.csv',Object.keys(crows[0]),crows);
saveCsv('hard-issues.csv',['scope','id','book','error'],issues);
fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify({
  date:'2026-10-23',origin:'content/at-source-recovery-20261018',
  verdict:'NO_GO_editorial_not_reviewed',totals,answer_distribution:counts,
  short_explanations_under_55_chars:shortExplanations,hard_issues:issues.length,books
},null,2)+'\n');
console.log(JSON.stringify({totals,answer_distribution:counts,shortExplanations,hard_issues:issues.length,output:out},null,2));
if(issues.length)process.exitCode=1;
