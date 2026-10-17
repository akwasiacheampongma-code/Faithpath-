import test from 'node:test';import assert from 'node:assert/strict';
import {renderReaderFlow,readingTools} from '../src/verbunden/reader-flow.js';
test('continuous reader preserves every verse number/text in order, including long chapter',()=>{
 const verses=Array.from({length:176},(_,i)=>[i+1,'Original '+i]);const seen=[];
 const html=renderReaderFlow(verses,v=>{seen.push(v);return '<span>'+v[0]+' '+v[1]+'</span>';});
 assert.deepEqual(seen,verses);assert.equal((html.match(/reader-paragraph/g)||[]).length,36);assert(html.includes('176 Original 175'));assert(!html.includes('<p>'));
});
test('reading tools expose keyboard-friendly named actions without persistence',()=>{
 const html=readingTools();assert(html.includes('aria-pressed="false"'));assert(html.includes('Leseschrift vergrößern'));assert(html.includes('Lesefokus beenden'));assert(!html.includes('localStorage'));
});
