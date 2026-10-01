import fs from 'node:fs';
import path from 'node:path';
import {createRuntimeModel} from '../src/runtime-model.js';
import {auditContent} from './validate-content.mjs';
const root=process.argv[2]||'.';
const read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
const {index,report}=auditContent(root);
const m=createRuntimeModel([read('data/index.json'),read('data/stories.json'),index,read('data/faithpath-content-index.json'),read('data/nachlese-stories.json'),read('data/nachlese-questions.json'),read('data/faithpath-nachlese-story-flow.json')]);
for(const tr of ['otb','l1912'])for(const b of m.books){
 const data=read(`data/bibles/${tr}/${b.code}.json`);
 if(data.chapters.length!==b.chapters)throw new Error('Bible chapter schema');
 for(const verses of data.chapters){const seen=new Set();for(const v of verses){if(!Array.isArray(v)||v.length!==2||!Number.isInteger(v[0])||v[0]<1||seen.has(v[0])||typeof v[1]!=='string'||!v[1].trim())throw new Error('Bible verse schema');seen.add(v[0]);}}
}
if(report.errors.length)throw new Error(report.errors.join('\n'));
console.log(JSON.stringify({status:'PASS',faithpath:m.fp.size,nachlese:m.n.size,chapter_quiz:m.chapterCount,stories:m.stories.size,errors:[]}));
