import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createStore, empty, KEYS} from '../src/store.js';

const api = await import('../src/at-rounds.js').catch(() => ({}));
const fixture = JSON.parse(fs.readFileSync('tests/fixtures/at-rounds.test-only.json'));
const sha = '08ce19855640b47b0419345fb58b29ddca466f1708b1b7bf021bad6691598285';
const auditApi = await import('../scripts/validate-at-rounds-test.mjs').catch(() => ({}));
const source = JSON.parse(fs.readFileSync('tests/fixtures/at-rounds.source-questions.json'));
const plan = JSON.parse(fs.readFileSync('tests/fixtures/at-rounds.original-plan.json'));
function catalog(value = fixture) {
  assert.equal(typeof api.createAtRoundCatalog, 'function', 'TEST_ONLY round catalog is missing');
  return api.createAtRoundCatalog(value);
}
function setup(seed = empty()) {
  const values = new Map([[KEYS.main, JSON.stringify(seed)]]);
  const driver = {fail:false, getItem:key => values.get(key) ?? null,
    setItem(key,value) {if (this.fail) throw new Error('quota'); values.set(key,value);}};
  const store = createStore(driver);
  const c = catalog();
  assert.equal(typeof api.createAtRoundController, 'function');
  return {c, store, driver, values, flow:api.createAtRoundController(c, store, sha)};
}
function finish(flow, book, chapter, round, choice = 0) {
  for (let i=0;i<5;i++) {
    flow.answer(book,chapter,round,choice);
    flow.advance(book,chapter,round);
  }
}

test('stored future answers cannot bypass the sequential round', () => {
  const state=empty();state.quiz['1KI:8:A']={fixtureSha:sha,
    questionIds:fixture.chapters['1KI'].variants[0].questions.map(q=>q.id),
    answers:{'1275-Q2':0},index:0,done:null};
  const {flow}=setup(state);
  assert.throws(()=>flow.session('1KI',8,'A'),/beschädigt/);
});

test('only the two specified chapters expose their original five-question A and B selections', () => {
  const c = catalog();
  assert.equal(c.chapters.size,2);
  assert.deepEqual(c.get('1KI',8).rounds.get('A').questions.map(q=>q.id),
    ['1270-Q5','1271-Q5','1272-Q4','1274-Q1','1275-Q2']);
  assert.deepEqual(c.get('2KI',15).rounds.get('B').questions.map(q=>q.id),
    ['1351-Q3','1352-Q2','1353-Q3','1355-Q3','1356-Q3']);
  assert.equal(c.get('1KI',9),null);
  assert.equal(c.get('NUM',17),null);
  for (const b of c.chapters.values()) {
    assert.equal(b.rounds.get('A').questions.length,5);
    assert.equal(b.rounds.get('B').questions.length,5);
    assert.equal(new Set([...b.rounds.values()].flatMap(r=>r.questions.map(q=>q.id))).size,10);
    assert.equal(new Set([...b.rounds.values()].flatMap(r=>r.questions.map(q=>q.sourceUnit))).size,6);
  }
});

test('malformed answers, duplicate IDs, wrong chapters and claimed production approval fail closed', () => {
  const changes = [
    d=>d.approved=true,
    d=>d.production=true,
    d=>d.chapters['1KI'].chapter=9,
    d=>d.chapters.NUM={...d.chapters['1KI'],chapter:17},
    d=>d.chapters['1KI'].variants[1].questions[0].id='1270-Q5',
    d=>d.chapters['1KI'].variants[0].questions[0].options.pop(),
    d=>d.chapters['1KI'].variants[0].questions[0].correctIndex=4,
    d=>d.chapters['1KI'].variants[0].questions[0].correctIndex=true,
    d=>d.chapters['1KI'].variants[0].questions[0].options[1]=d.chapters['1KI'].variants[0].questions[0].options[0],
    d=>d.chapters['2KI'].variants[1].questions[4].sourceUnit='1355',
  ];
  for(const change of changes) {
    const d=structuredClone(fixture);change(d);
    assert.throws(()=>catalog(d), /Test|Kapitel|Frage|Antwort|Freigabe|Quelle|Runde/);
  }
});

test('round B stays blocked until the explicit fifth A completion and never starts automatically', () => {
  const {flow,store}=setup();
  assert.equal(flow.session('1KI',8,'B').blocked,true);
  assert.throws(()=>flow.answer('1KI',8,'B',0),/erste|Runde A|gesperrt/);
  for(let i=0;i<4;i++){flow.answer('1KI',8,'A',0);flow.advance('1KI',8,'A');}
  flow.answer('1KI',8,'A',0);
  assert.equal(flow.session('1KI',8,'B').blocked,true);
  flow.advance('1KI',8,'A');
  assert.equal(flow.completed('1KI',8,'A'),true);
  assert.equal(flow.session('1KI',8,'B').blocked,false);
  assert.equal(store.state.quiz['1KI:8:B'],undefined);
  assert.equal(flow.completed('2KI',15,'A'),false);
});

test('answers and current question resume after reload without replacing an earlier choice', () => {
  const {flow,store,c}=setup();
  flow.answer('1KI',8,'A',1);
  flow.answer('1KI',8,'A',2);
  assert.equal(flow.session('1KI',8,'A').answer,1);
  assert.equal(flow.session('1KI',8,'A').correct,false);
  flow.advance('1KI',8,'A');
  const resumed=api.createAtRoundController(c,store,sha);
  assert.equal(resumed.session('1KI',8,'A').index,1);
  assert.equal(resumed.session('1KI',8,'A').answer,null);
  assert.equal(resumed.session('1KI',8,'A').questions[1].id,'1271-Q5');
  resumed.answer('1KI',8,'A',1);
  assert.equal(resumed.session('1KI',8,'A').correct,true);
});

test('both books and both rounds have separate result keys without overwriting a normal quiz', () => {
  const seed=empty();seed.quiz['10000']={done:'2026-10-01T00:00:00Z',historical:'keep'};
  const {flow,store}=setup(seed);
  finish(flow,'1KI',8,'A');finish(flow,'1KI',8,'B');
  finish(flow,'2KI',15,'A');finish(flow,'2KI',15,'B');
  assert.deepEqual(Object.keys(store.state.quiz).sort(),['10000','1KI:8:A','1KI:8:B','2KI:15:A','2KI:15:B']);
  assert.deepEqual(store.state.quiz['10000'],seed.quiz['10000']);
  for(const key of ['1KI:8:A','1KI:8:B','2KI:15:A','2KI:15:B']) {
    assert.equal(Object.keys(store.state.quiz[key].answers).length,5);
    assert.equal(typeof store.state.quiz[key].done,'string');
  }
});

test('restarting A relocks B while retaining the other book and the saved B answers', () => {
  const {flow,store}=setup();
  finish(flow,'1KI',8,'A');flow.answer('1KI',8,'B',3);
  flow.answer('2KI',15,'A',3);
  const b=structuredClone(store.state.quiz['1KI:8:B']);
  const other=structuredClone(store.state.quiz['2KI:15:A']);
  flow.reset('1KI',8,'A');
  assert.equal(flow.session('1KI',8,'B').blocked,true);
  assert.deepEqual(store.state.quiz['1KI:8:B'],b);
  assert.deepEqual(store.state.quiz['2KI:15:A'],other);
  finish(flow,'1KI',8,'A');
  assert.equal(flow.session('1KI',8,'B').answer,3);
});

test('unanswered questions and invalid answer indices cannot advance or complete a round', () => {
  const {flow,store}=setup();
  flow.advance('1KI',8,'A');
  assert.equal(flow.session('1KI',8,'A').index,0);
  for(const answer of [-1,4,NaN,1.5,'1',true])assert.throws(()=>flow.answer('1KI',8,'A',answer),/Antwort/);
  assert.deepEqual(store.state.quiz,{});
});

test('a failed save leaves the answer and current question unchanged', () => {
  const {flow,store,driver,values}=setup();
  const raw=values.get(KEYS.main);driver.fail=true;
  assert.throws(()=>flow.answer('1KI',8,'A',2),/Nicht gespeichert/);
  assert.equal(values.get(KEYS.main),raw);
  assert.deepEqual(store.state.quiz,{});
  assert.equal(flow.session('1KI',8,'A').answer,null);
  driver.fail=false;flow.answer('1KI',8,'A',2);
  assert.equal(flow.session('1KI',8,'A').answer,2);
});

test('old answer indices are not reinterpreted after a fixture revision or corrupt state', () => {
  const {flow,store,c}=setup();flow.answer('1KI',8,'A',2);
  const revised=api.createAtRoundController(c,store,'a'.repeat(64));
  assert.throws(()=>revised.session('1KI',8,'A'),/Version|Prüfstand|Testdaten/);
  store.transact(s=>s.quiz['1KI:8:A'].answers['not-a-question']=0);
  assert.throws(()=>flow.session('1KI',8,'A'),/beschädigt|Testfortschritt/);
});

test('every displayed field and correct answer text match the frozen content source despite 16 permutations', () => {
  assert.equal(typeof auditApi.auditAtTestFixture,'function');
  const result=auditApi.auditAtTestFixture(fixture,source,plan);
  assert.equal(result.question_count,20);assert.equal(result.option_permutations,16);
  assert.deepEqual(result.coverage,{'1KI:8':6,'2KI:15':6});
  assert.equal(result.human_approved,false);assert.equal(result.production_import_allowed,false);
  for(const change of [d=>d.chapters['1KI'].variants[0].questions[0].correctIndex=0,
    d=>d.chapters['2KI'].variants[1].questions[4].explanation='Ungeprüfte neue Erklärung',
    d=>d.chapters['1KI'].variants[0].questions.reverse()]) {
    const d=structuredClone(fixture);change(d);
    assert.throws(()=>auditApi.auditAtTestFixture(d,source,plan),/Quelle|Auswahl|Antwort/);
  }
});
