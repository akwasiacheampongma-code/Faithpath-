import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
const referenceApi = await import('../scripts/quiz-reference-ranges.mjs').catch(() => ({}));
const importApi = await import('../scripts/validate-nt-quiz.mjs').catch(() => ({}));
const books = JSON.parse(fs.readFileSync('data/index.json'));

test('approved multi-range and single-chapter references keep every specified verse', () => {
  assert.equal(typeof referenceApi.parseQuizReferences, 'function');
  const parse = text => referenceApi.parseQuizReferences(text, books);
  assert.deepEqual(parse('Matthäus 25,18; 24–27'), [{book:'MAT',chapter:25,from:18,to:18},{book:'MAT',chapter:25,from:24,to:27}]);
  assert.deepEqual(parse('1. Timotheus 5,3–8.16'), [{book:'1TI',chapter:5,from:3,to:8},{book:'1TI',chapter:5,from:16,to:16}]);
  assert.deepEqual(parse('Philemon 4–7'), [{book:'PHM',chapter:1,from:4,to:7}]);
  assert.deepEqual(parse('2. Johannes 7'), [{book:'2JN',chapter:1,from:7,to:7}]);
  assert.throws(() => parse('Johannes 4–7'), /Referenz/);
  assert.throws(() => parse('Philemon 7–4'), /Referenz/);
});
test('every imported question exactly equals the approved source and other content is preserved', () => {
  assert.equal(typeof importApi.validateFinalNtQuiz, 'function');
  const report = importApi.validateFinalNtQuiz('.');
  assert.equal(report.questions,1300); assert.equal(report.chapters,260); assert.equal(report.books,27);
  assert.equal(report.content_preserved,true);
});
test('import check is reproducible and rejects malformed master without mutating data', () => {
  const run = spawnSync('python3',['tests/nt-quiz-invalid-master.py'],{encoding:'utf8'});
  assert.equal(run.status,0,run.stdout+run.stderr);
});
