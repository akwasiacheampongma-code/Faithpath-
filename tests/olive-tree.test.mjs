import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import crypto from 'node:crypto';
import {stageNames} from '../src/content.js';import {renderOliveTree} from '../src/olive-tree.js';import {STUDY} from '../src/olive-a51/stage-data.js';
test('seven A5.1 illustrations expose unchanged domain stages and verified local fallback assets',()=>{
 for(let level=0;level<7;level++){const h=renderOliveTree(level,{context:'test-'+level});assert(h.includes('data-tree-stage="'+level+'"'));assert(h.includes(stageNames[level]));assert(h.includes('data-a51-tree'));assert(!/<script|(?:href|src)="https?:/.test(h));
  for(const asset of STUDY.stages[level].variants){const bytes=fs.readFileSync('src/olive-a51/'+asset.src);assert.equal(bytes.length,asset.bytes);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),asset.sha256);}
 }
});
test('tree consumes bounded domain levels and escapes labels and contexts',()=>{
 assert(!renderOliveTree(0,{context:'"><script>',label:'<script>private</script>'}).includes('<script>'));assert(renderOliveTree(-1).includes('data-tree-stage="0"'));assert.equal(renderOliveTree(2),renderOliveTree(2));
});
