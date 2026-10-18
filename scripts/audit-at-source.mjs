import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import path from 'node:path';

const root = process.cwd();
const data = path.join(root, 'content/at-source-recovery');
const load = (name) => JSON.parse(fs.readFileSync(path.join(data, name), 'utf8'));
const manifest = load('manifest.json');
const chapterMap = load('chapter-candidate-map.json');
const proposals = load('editorial-proposals/MAL-3-4.json');
const ruleSet = load('reference-mapping.json');

assert.equal(manifest.totals.books, 39);
assert.equal(manifest.totals.units, 1289);
assert.equal(manifest.totals.questions, 7009);
assert.equal(manifest.totals.chapters, 929);
assert.equal(ruleSet.rules.length, 3);
assert.equal(proposals.questions.length, 5);

const unitNumbers = new Set(), sourceIds = new Map();
const correctAnswers = {A: 0, B: 0, C: 0, D: 0};
const lengthCounts = {'5': 0, '6': 0};
let fileBytes = 0, unitTotal = 0, questionTotal = 0, remapped = 0;

function appLocation(book, verseReference) {
  const ref = verseReference.match(/(?:^|[^\d])(\d{1,3})\s*,\s*(\d{1,3})(?:\D|$)/);
  assert(ref, 'Unparseable verse reference: ' + book + ': ' + verseReference);
  let chapter = Number(ref[1]), verse = Number(ref[2]), mapped = false;
  if (book === 'JOL' && chapter === 3 && verse <= 5) {
    chapter = 2; verse += 27; mapped = true;
  } else if (book === 'JOL' && chapter === 4) {
    chapter = 3; mapped = true;
  } else if (book === 'MAL' && chapter === 3 && verse >= 19) {
    chapter = 4; verse -= 18; mapped = true;
  }
  return {key: book + ':' + chapter, verse, mapped};
}

for (const book of manifest.books) {
  const fullPath = path.join(root, book.path), bytes = fs.readFileSync(fullPath);
  assert.equal(bytes.length, book.bytes, 'source byte size: ' + book.code);
  const gitSha = crypto.createHash('sha1').update('blob ' + bytes.length + '\0').update(bytes).digest('hex');
  assert.equal(gitSha, book.git_blob_sha, 'source blob hash: ' + book.code);
  fileBytes += bytes.length;
  const body = JSON.parse(bytes.toString('utf8'));
  assert.equal(body.book.code, book.code);
  assert.equal(body.book.name, book.name);
  assert.equal(body.units.length, book.original_units);
  assert.equal(body.unit_count, book.original_units);
  assert.equal(body.question_count, book.original_questions);
  let thisQuestions = 0;
  for (const unit of body.units) {
    assert(unit.number >= 824 && unit.number <= 2112);
    assert(!unitNumbers.has(unit.number), 'repeated unit: ' + unit.number);
    assert.equal(unit.book, book.name);
    assert.equal(unit.source_qa_status, manifest.source.source_qa_label);
    assert(unit.verse_range?.trim() && unit.title?.trim() && unit.reflection?.trim());
    assert(lengthCounts[unit.questions.length] !== undefined, 'invalid unit question count: ' + unit.number);
    lengthCounts[unit.questions.length]++;
    unitNumbers.add(unit.number);
    unitTotal++;
    for (const question of unit.questions) {
      const choices = question.options;
      assert.equal(question.unit_number, unit.number);
      assert(question.id && typeof question.id === 'string');
      assert(!sourceIds.has(question.id), 'repeated question id: ' + question.id);
      assert(question.question?.trim() && question.verse_reference?.trim() && question.explanation?.trim());
      assert.equal(question.source_qa_status, manifest.source.source_qa_label);
      assert.equal(choices?.length, 4);
      assert(choices.every(v => typeof v === 'string' && !!v.trim()));
      assert.equal(new Set(choices.map(x => x.trim())).size, 4);
      assert.equal(question.correct_index, 'ABCD'.indexOf(question.correct_answer));
      assert(question.correct_index >= 0 && question.correct_index <= 3);
      const loc = appLocation(book.code, question.verse_reference);
      assert(loc.verse > 0);
      if (loc.mapped) remapped++;
      sourceIds.set(question.id, {book: book.code, key: loc.key, unit_number: unit.number});
      correctAnswers[question.correct_answer]++;
      questionTotal++; thisQuestions++;
    }
  }
  assert.equal(thisQuestions, book.original_questions, 'book question count: ' + book.code);
}
for (let n = 824; n <= 2112; n++) assert(unitNumbers.has(n), 'missing unit number ' + n);
assert.equal(unitTotal, manifest.totals.units);
assert.equal(questionTotal, manifest.totals.questions);
assert.equal(fileBytes, manifest.totals.bytes);
assert.equal(lengthCounts['5'], 725);
assert.equal(lengthCounts['6'], 564);
assert.deepEqual(correctAnswers, manifest.answers);
assert.equal(remapped, 13, 'Joel/Malachi verse mapping count');

const draftIds = new Map();
for (const draft of proposals.questions) {
  assert(!sourceIds.has(draft.id) && !draftIds.has(draft.id));
  assert.equal(draft.review_status, 'NEU_QA_OFFEN');
  assert.equal(draft.options.length, 4);
  assert.equal(new Set(draft.options.map(x => x.trim())).size, 4);
  assert(draft.correct_index >= 0 && draft.correct_index <= 3);
  draftIds.set(draft.id, {key: draft.book + ':' + draft.app_chapter});
}

assert.equal(chapterMap.chapters.length, 929);
const seenChapters = new Set(), assignedSources = new Set(), usedDrafts = new Set();
let primaryCount = 0, originalDeficient = [];
for (const chapter of chapterMap.chapters) {
  const key = chapter.book_code + ':' + chapter.app_chapter;
  assert(!seenChapters.has(key), 'duplicate chapter ' + key);
  seenChapters.add(key);
  if (chapter.source_question_ids.length < 5) originalDeficient.push([key, chapter.source_question_ids.length]);
  for (const id of chapter.source_question_ids) {
    assert(sourceIds.has(id), 'unknown source id ' + id);
    assert.equal(sourceIds.get(id).key, key, 'wrong chapter for ' + id);
    assert(!assignedSources.has(id), 'source question assigned twice ' + id);
    assignedSources.add(id);
  }
  assert.equal(chapter.proposed_primary_question_ids.length, 5, 'incomplete proposal ' + key);
  for (const id of chapter.proposed_primary_question_ids) {
    if (sourceIds.has(id)) {
      assert.equal(sourceIds.get(id).key, key, 'foreign primary source ' + id);
    } else {
      assert.equal(draftIds.get(id)?.key, key, 'unknown/foreign draft ' + id);
      usedDrafts.add(id);
    }
  }
  primaryCount += chapter.proposed_primary_question_ids.length;
}
assert.equal(seenChapters.size, 929);
assert.equal(assignedSources.size, 7009);
assert.equal(usedDrafts.size, 5);
assert.equal(primaryCount, 4645);
assert.deepEqual(originalDeficient, [['MAL:3', 4], ['MAL:4', 1]]);

const result = {
  status: 'PASS_SOURCE_STRUCTURE__EDITORIAL_QA_STILL_OPEN',
  source_books: manifest.books.length,
  original_units: unitTotal,
  original_questions: questionTotal,
  unique_question_ids: sourceIds.size,
  book_files_verified_by_git_blob_sha: manifest.books.length,
  questions_per_unit: lengthCounts,
  correct_answer_distribution: correctAnswers,
  mapped_legacy_references: remapped,
  app_chapters: seenChapters.size,
  draft_chapter_quiz_slots: primaryCount,
  source_chapters_below_five: originalDeficient,
  new_review_required_proposals: usedDrafts.size,
  application_code_changed: false,
  production_authorized: false,
};
console.log(JSON.stringify(result, null, 2));
