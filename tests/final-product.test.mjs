import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRuntimeModel,SOURCE_FILES} from '../src/runtime-model.js';
import {journalMatches} from '../src/journal-search.js';
const read=f=>JSON.parse(fs.readFileSync('data/'+f));
const books=read('index.json');
test('reviewed merge covers exact source IDs once, preserves 2479 items and excludes chapter quiz',()=>{
 const m=createRuntimeModel(SOURCE_FILES.map(read));
 const ids=m.flow.stories.flatMap(s=>s.flow_items.flatMap(i=>i.source_question_ids));
 assert.equal(m.stories.size,436);assert.equal(ids.length,2574);assert.equal(new Set(ids).size,2574);
 assert.equal(m.flow.stories.reduce((n,s)=>n+s.flow_items.length,0),2479);
 assert.deepEqual(ids.filter(id=>id.startsWith('N')).sort(),Array.from({length:2314},(_,i)=>'N-'+String(i+1).padStart(4,'0')));
 assert.deepEqual(ids.filter(id=>id.startsWith('FP')).sort(),Array.from({length:260},(_,i)=>'FP-'+String(i+1).padStart(4,'0')));
 assert.equal(m.flow.unmapped_faithpath_ids.length,0);assert.equal(m.chapterCount,1300);
});
test('old label-free note searchable through structured name, alias, code and chapter',()=>{
 const j={text:'Unabhängiger persönlicher Text',ref:{book:'JHN',chapter:3,from:1,to:1}};
 for(const q of ['Johannes 3,1','Joh 3,1','JHN 3,1','Johannes 3','jOhAnNeS',' JOHANNES  3, 1 '])assert(journalMatches(j,q,books),q);
 assert.deepEqual(j.ref,{book:'JHN',chapter:3,from:1,to:1});
});
test('reference numeric boundaries prevent verse 1 matching verse 10, with range normalization',()=>{
 const j={text:'Notiz',ref:{book:'JHN',chapter:3,from:10,to:12}};
 assert(!journalMatches(j,'Johannes 3,1',books));assert(!journalMatches(j,'Johannes 4',books));
 assert(journalMatches(j,'Joh 3,10–12',books));assert(journalMatches(j,'JHN 3,10-12',books));
});
test('saved labels, Unicode user text, path titles and reference-free entries remain searchable',()=>{
 assert(journalMatches({text:'Danke!',ref:{label:'Eigene Referenz'}},'Eigene Referenz',books));
 assert(journalMatches({text:'Frage: „Warum?“'},'„Warum?“',books));
 assert(journalMatches({text:'Gedanke',pathIds:['p']},'Vertrauen',books,[{id:'p',title:'Vertrauen'}]));
 assert(!journalMatches({text:'Gedanke'},'Johannes 3,1',books));
 assert(!journalMatches({text:'Gedanke',pathIds:['deleted']},'Vertrauen',books,[]));
});
