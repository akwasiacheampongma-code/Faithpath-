import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const api = await import('../src/chapter-questions.js').catch(() => ({}));
const units = JSON.parse(fs.readFileSync('data/stories.json'));
const books = JSON.parse(fs.readFileSync('data/index.json'));
const chapters = units.filter(unit => unit.kind === 'chapter-quiz');
const catalog = () => {
  assert.equal(typeof api.createChapterCatalog, 'function', 'Canonical chapter selector must exist');
  return api.createChapterCatalog(units, books);
};

test('chapter collection covers all 260 original units and all 1300 exact source IDs without story content', () => {
  const c = catalog(), visible = [...c.byBook.values()].flat();
  assert.equal(c.byChapter.size, 260); assert.equal(c.byBook.size, 27);
  assert.equal(visible.length, 260); assert.equal(new Set(visible.map(unit => unit.id)).size, 260);
  assert(visible.every(unit => unit.questions.length === 5 && chapters.includes(unit)));
  const ids = visible.flatMap(unit => unit.questions.map(q => q.faithpath_id)).sort();
  assert.equal(new Set(ids).size, 1300);
  assert.deepEqual(ids, Array.from({length: 1300}, (_, i) => 'FP-' + String(i + 261).padStart(4, '0')));
});
test('every one-based reader chapter maps to exactly its original zero-based unit object', () => {
  const c = catalog();
  for (const unit of chapters) assert.equal(api.chapterUnit(c, unit.book, unit.chapter + 1), unit);
  for (const [code, chapter, id] of [['MAT',1,10000],['MAT',28,10027],['MRK',1,10028],['JHN',3,10070],['ACT',28,10116],['REV',22,10259]])
    assert.equal(api.chapterUnit(c, code, chapter).id, id);
  assert.equal(api.chapterUnit(c, 'joh', 3).id, 10070);
});
test('chapters without actual quiz data and invalid chapters have no unit', () => {
  const c = catalog();
  for (const [book, chapter] of [['GEN',1],['MAT',0],['MAT',29],['JHN',3.5],['UNKNOWN',1]])
    assert.equal(api.chapterUnit(c, book, chapter), null);
});
test('future chapter metadata indexes without an NT-only list or copying questions', () => {
  catalog();
  const future = {...chapters[0], id:70000, book:'GEN', chapter:0};
  const c = api.createChapterCatalog([...units, future], books);
  assert.equal(api.chapterUnit(c, 'GEN', 1), future);
  assert.equal(api.chapterUnit(c, 'GEN', 1).questions, future.questions);
});
test('a future chapter unit without actual questions cannot create an empty quiz entry', () => {
  catalog();
  const emptyUnit = {...chapters[0], id:70000, book:'GEN', chapter:0, questions:[]};
  assert.equal(api.chapterUnit(api.createChapterCatalog([...units, emptyUnit], books), 'GEN', 1), null);
});
test('ambiguous chapter mappings and invalid unit metadata are rejected rather than picking a wrong chapter', () => {
  catalog();
  assert.throws(() => api.createChapterCatalog([...units, {...chapters[0], id:70000}], books), /Kapitel/);
  assert.throws(() => api.createChapterCatalog([{...chapters[0], chapter:28}], books), /Kapitel/);
});
test('reader and collection entry routes use the same canonical existing numeric quiz ID', () => {
  const unit = api.chapterUnit(catalog(), 'JHN', 3);
  for (const origin of ['read/JHN/3/otb', 'chapter-quizzes/JHN', 'story/10070', '']) {
    const route = api.chapterQuizRoute(unit, origin);
    assert.equal(route.split('?')[0], 'quiz/10070');
    assert.equal(new URLSearchParams(route.split('?')[1]).get('return') || '', origin);
  }
});
test('reader return preserves translation, range and explicit context while next chapter is the correct chapter', () => {
  const unit = api.chapterUnit(catalog(), 'JHN', 3);
  const origin = 'read/JHN/3/l1912?from=1&to=3&origin=path%2Fexisting';
  const n = api.chapterQuizNavigation(unit, books, 'otb', origin);
  assert.equal(n.backRoute, origin); assert.equal(n.readerRoute, origin);
  assert.equal(n.nextReaderRoute, 'read/JHN/4/l1912');
  assert.equal(n.collectionRoute, 'chapter-quizzes/JHN');
});
test('collection, old story and direct routes have a useful book return without requiring an origin', () => {
  const unit = api.chapterUnit(catalog(), 'JHN', 3);
  for (const origin of ['chapter-quizzes/JHN', '']) {
    const n = api.chapterQuizNavigation(unit, books, 'otb', origin);
    assert.equal(n.backRoute, 'chapter-quizzes/JHN'); assert.equal(n.readerRoute, 'read/JHN/3/otb');
  }
  assert.equal(api.chapterQuizNavigation(unit, books, 'otb', 'story/10070').backRoute, 'story/10070');
  const last = api.chapterUnit(catalog(), 'REV', 22);
  assert.equal(api.chapterQuizNavigation(last, books, 'otb', '').nextReaderRoute, null);
});
test('foreign chapter, foreign unit and external or malformed origins safely fall back to the correct collection', () => {
  const unit = api.chapterUnit(catalog(), 'JHN', 3);
  for (const origin of ['read/JHN/4/otb','read/MAT/3/otb','read/JHN/3/unknown','chapter-quizzes/MAT','story/10000','https://example.com','//example.com','read/%ZZ/3/otb']) {
    const n = api.chapterQuizNavigation(unit, books, 'otb', origin);
    assert.equal(n.backRoute, 'chapter-quizzes/JHN', origin);
    assert.equal(n.readerRoute, 'read/JHN/3/otb', origin);
  }
});
