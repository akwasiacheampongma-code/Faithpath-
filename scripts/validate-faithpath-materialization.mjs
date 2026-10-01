import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { isDeepStrictEqual as equal } from 'node:util';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const read = name => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const report = read('reports/faithpath-nachlese-materialization.json');
const originalBytes = fs.readFileSync(path.join(root, 'reports/faithpath-original-stories.json'));
const original = JSON.parse(originalBytes);
const currentBytes = fs.readFileSync(path.join(root, 'data/stories.json'));
const current = JSON.parse(currentBytes);
const index = read('data/faithpath-content-index.json');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const errors = [];
const check = (condition, message) => { if (!condition) errors.push(message); };
const originalBlob = crypto.createHash('sha1').update(Buffer.from(`blob ${originalBytes.length}\0`)).update(originalBytes).digest('hex');
check(originalBlob === index.original_blob, 'Original baseline does not match master Git blob');
check(hash(originalBytes) === report.original_source_sha256, 'Original source hash mismatch');
check(hash(currentBytes) === report.materialized_source_sha256, 'Materialized source hash mismatch');
const approved = new Map(report.changes.map(c => [c.JSON_Locator, c]));
check(approved.size === report.changes.length, 'Duplicate change locators');
const actual = new Set();
const ids = [], originalIds = [], categories = new Map();
const books = read('data/index.json');
const aliases = Object.fromEntries(books.map(b => [b.name, b.code]));
Object.assign(aliases, {Apg:'ACT',Mt:'MAT',Mk:'MRK',Lk:'LUK',Joh:'JHN','Röm':'ROM','1 Kor':'1CO','2 Kor':'2CO',Gal:'GAL',Eph:'EPH',Phil:'PHP',Kol:'COL','1 Thess':'1TH','2 Thess':'2TH','1 Tim':'1TI','2 Tim':'2TI',Tit:'TIT',Phlm:'PHM',Hebr:'HEB',Jak:'JAS','1 Petr':'1PE','2 Petr':'2PE','1 Joh':'1JN','2 Joh':'2JN','3 Joh':'3JN',Jud:'JUD',Offb:'REV'});
const bibles = {};
for (const tr of ['otb', 'l1912']) bibles[tr] = Object.fromEntries(books.map(b => [b.code, read(`data/bibles/${tr}/${b.code}.json`).chapters]));
function validReference(book, chapter, from, to) {
  for (const tr of ['otb', 'l1912']) {
    const verses = bibles[tr][book]?.[chapter - 1];
    check(Array.isArray(verses), `${tr}: missing ${book} chapter ${chapter}`);
    if (!verses) continue;
    const last = to === 999 ? Number(verses.at(-1)[0]) : to;
    const present = new Set(verses.map(v => Number(v[0])));
    check(Number.isInteger(from) && Number.isInteger(last) && from >= 1 && last >= from, 'Invalid reference range');
    for (let verse = from; verse <= last; verse++) check(present.has(verse), `${tr}: missing ${book} ${chapter},${verse}`);
  }
}
function change(locator, oldValue, newValue) {
  if (equal(oldValue, newValue)) return;
  actual.add(locator);
  const entry = approved.get(locator);
  check(Boolean(entry), `Unapproved field change ${locator}`);
  if (entry) {
    check(equal(entry.old_value, oldValue ?? null), `Old value mismatch ${locator}`);
    check(equal(entry.new_value, newValue), `New value mismatch ${locator}`);
  }
}
check(current.length === original.length, 'Story/unit deletion or insertion');
let questions = 0, chapterQuestions = 0, storyUnits = 0;
for (const [si, s] of current.entries()) {
  const old = original[si];
  if (!old) continue;
  check(equal(Object.keys(s), Object.keys(old)), `Story schema changed ${si}`);
  for (const key of Object.keys(old)) if (key !== 'questions') check(equal(old[key], s[key]), `Story field changed ${si}/${key}`);
  originalIds.push(old.id);
  if (s.kind !== 'chapter-quiz') storyUnits++;
  validReference(s.book, s.chapter + 1, s.from, s.to);
  check(s.questions.length === old.questions.length && s.questions.length === 5, `Questions lost in story ${si}`);
  for (const [qi, q] of s.questions.entries()) {
    const oq = old.questions[qi];
    const number = ++questions, fpId = `FP-${String(number).padStart(4, '0')}`;
    ids.push(q.faithpath_id);
    check(q.faithpath_id === fpId, `Unstable FP ID ${si}/${qi}`);
    check(equal(Object.keys(q).sort(), [...Object.keys(oq), 'faithpath_id'].sort()), `Question schema changed ${fpId}`);
    check(Number.isInteger(q.c) && q.c >= 0 && q.c <= 3 && q.c === oq.c, `Invalid/changed correct_index ${fpId}`);
    check(q.ref === oq.ref, `Reference changed ${fpId}`);
    check(q.a.length === 4 && new Set(q.a).size === 4 && q.a.every(v => typeof v === 'string' && v.trim()), `Invalid options ${fpId}`);
    const category = s.kind === 'chapter-quiz' ? 'chapter-quiz' : 'story';
    categories.set(fpId, category);
    if (category === 'chapter-quiz') chapterQuestions++;
    if (number >= 301) check(category === 'chapter-quiz', `Chapter question entered story pool ${fpId}`);
    const m = /^(.+?) (\d+),(\d+)(?:[–-](\d+))?$/.exec(q.ref);
    check(Boolean(m && aliases[m[1]]), `Unparseable reference ${fpId}`);
    if (m && aliases[m[1]]) validReference(aliases[m[1]], +m[2], +m[3], +(m[4] || m[3]));
    for (const key of Object.keys(q)) {
      if (key === 'a') for (const [oi, text] of q.a.entries()) change(`$[${si}].questions[${qi}].a[${oi}]`, oq.a[oi], text);
      else change(`$[${si}].questions[${qi}].${key}`, oq[key], q[key]);
    }
  }
}
check(questions === 1560 && new Set(ids).size === 1560, 'FP count or uniqueness failed');
check(new Set(originalIds).size === originalIds.length, 'Duplicate legacy story IDs');
check(chapterQuestions === 1300 && storyUnits === 52, 'Story/chapter separation changed unexpectedly');
check(actual.size === approved.size && [...approved.keys()].every(k => actual.has(k)), 'Change report does not exactly cover actual diff');
check(index.question_index.length === 1560, 'Question index incomplete');
for (const row of index.question_index) check(categories.get(row.faithpath_id) === row.content_type, `Incorrect indexed question type ${row.faithpath_id}`);
check(equal(index.content_models.chapter_quiz_question_ids, ids.filter(id => categories.get(id) === 'chapter-quiz')), 'Chapter pool index differs');
check(equal(index.content_models.story_question_ids, ids.filter(id => categories.get(id) === 'story')), 'Story pool index differs');
for (const entry of report.changes.filter(c => c.change_kind === 'EXACT_VERSE_RECONSTRUCTION')) {
  const e = entry.evidence, r = e.Bible_reference;
  const bibleFile = fs.readFileSync(path.join(root, e.Bible_source));
  check(hash(bibleFile) === e.Bible_source_sha256, 'Bible provenance mismatch');
  const matches = bibles.l1912[r.book][r.chapter - 1].filter(v => Number(v[0]) === r.verse);
  check(matches.length === 1 && matches[0][1] === entry.new_value, `Reconstruction differs from source ${entry.JSON_Locator}`);
}

// Validate the separate canonical N pool and the derived source-bound story flow.
const sourceManifest = read('reports/faithpath-source-manifest.json');
for (const source of sourceManifest) check(hash(fs.readFileSync(path.join(root, source.repo_path))) === source.sha256, `Source artifact hash mismatch ${source.repo_path}`);
const nStories = read('data/nachlese-stories.json').stories;
const nQuestions = read('data/nachlese-questions.json').questions;
const docxBaseline = read('reports/faithpath-docx-story-baseline.json');
const nBaseline = read('reports/faithpath-final-nachlese-baseline.json');
const storyFlow = read('data/faithpath-nachlese-story-flow.json');
const mergeReport = read('reports/faithpath-nachlese-story-merge.json');
const nById = new Map(nQuestions.map(q => [q.id, q]));
const fpById = new Map(current.flatMap(s => s.questions).map(q => [q.faithpath_id, q]));
check(nStories.length === 435 && equal(nStories, docxBaseline), 'DOCX story structure/order/reflections altered');
check(nQuestions.length === 2314 && nById.size === 2314, 'N question count/uniqueness failed');
const nReferenceIds = nStories.flatMap(s => s.question_ids);
check(equal(nReferenceIds, nQuestions.map(q => q.id)), 'Canonical DOCX question/story order differs');
for (const [i, q] of nQuestions.entries()) {
  const originalN = nBaseline[i];
  check(q.id === `N-${String(i + 1).padStart(4, '0')}` && q.id === originalN.id, 'N ID lost or renamed');
  check(q.q === originalN.q && q.answer === originalN.answer && q.ref === originalN.ref, `Canonical final N fields changed ${q.id}`);
  check(q.provenance.docx_original.id === q.id && q.provenance.final_qa_row === originalN.source_row, `N provenance mismatch ${q.id}`);
  for (const r of q.references) validReference(r.book, r.chapter, r.from, r.to);
}
const verseSet = refs => new Set(refs.flatMap(r => Array.from({length:r.to-r.from+1}, (_,i) => `${r.book}/${r.chapter}/${r.from+i}`)));
const parseSimpleRef = text => {
  const m = /^(.+?) (\d+),(\d+)(?:[–-](\d+))?$/.exec(text);
  return m && aliases[m[1]] ? [{book:aliases[m[1]],chapter:+m[2],from:+m[3],to:+(m[4]||m[3])}] : [];
};
check(storyFlow.stories.length === 436 && storyFlow.story_count === 436, 'Combined story target mismatch');
check(new Set(storyFlow.stories.map(s => s.story_id)).size === 436, 'Duplicate flow story IDs');
const allFlowSourceIds = [];
let deduplicated = 0;
const assignment = new Map();
for (const [i, s] of storyFlow.stories.entries()) {
  if (i < 435) {
    const originalStory = nStories[i];
    check(s.story_id === originalStory.id && s.title === originalStory.title && s.ref === originalStory.ref && s.reflection === originalStory.reflection && equal(s.references, originalStory.references), `Canonical flow story changed ${i}`);
  } else {
    const legacy = original.find(s => s.book === 'ACT' && s.chapter === 10 && s.from === 1 && s.to === 18);
    check(Boolean(legacy && s.legacy_story_id === legacy.id && s.title === legacy.title && s.reflection === legacy.reflection && s.source_namespace === 'FaithPath'), 'Unapproved extra story');
  }
  for (const r of s.references) validReference(r.book, r.chapter, r.from, r.to);
  const storyVerses = verseSet(s.references);
  for (const item of s.flow_items) {
    check(item.source_question_ids.includes(item.primary_question_id), 'Flow primary ID missing from provenance');
    allFlowSourceIds.push(...item.source_question_ids);
    for (const id of item.source_question_ids) {
      if (id.startsWith('FP-')) {
        const q = fpById.get(id);
        check(Boolean(q) && categories.get(id) === 'story', `Chapter or unknown FP entered flow ${id}`);
        check(verseSet(parseSimpleRef(q?.ref)).size > 0 && [...verseSet(parseSimpleRef(q?.ref))].every(v => storyVerses.has(v)), `FP question outside canonical story ${id}`);
        assignment.set(id, s.story_id);
      } else check(nById.has(id), `Unknown N source ID in flow ${id}`);
    }
    if (item.deduplication === 'EXACT_FINAL_WORDING') {
      const primary = nById.get(item.primary_question_id);
      check(Boolean(primary), 'Exact dedup primary must retain N provenance');
      for (const id of item.source_question_ids.filter(id => id.startsWith('FP-'))) {
        const q = fpById.get(id);
        check(primary.q === q.q && primary.answer === q.a[q.c], `Non-word-equal questions deduplicated ${id}`);
        deduplicated++;
      }
    }
  }
}
check(new Set(allFlowSourceIds).size === allFlowSourceIds.length, 'Source question appears twice in story flow');
check(equal(allFlowSourceIds.filter(id => id.startsWith('N-')).sort(), [...nById.keys()].sort()), 'N ID lost or duplicated in flow');
const verifiedRows = mergeReport.rows.filter(r => r.verification_status === 'VERIFIED_FOR_WRITE');
const reviewRows = mergeReport.rows.filter(r => r.verification_status === 'REVIEW_REQUIRED');
const excludedRows = mergeReport.rows.filter(r => r.verification_status === 'EXCLUDED_CHAPTER_QUIZ');
check(mergeReport.rows.length === 300 && new Set(mergeReport.rows.map(r => r.FP_ID)).size === 300, 'Mapping report rows incomplete/duplicated');
check(verifiedRows.length === storyFlow.mapping_links.length && assignment.size === verifiedRows.length, 'Unverified or missing mapping write');
for (const row of verifiedRows) check(assignment.get(row.FP_ID) === row.Story_ID, `Written story mapping mismatch ${row.FP_ID}`);
for (const link of storyFlow.mapping_links) {
  const row = verifiedRows.find(r => r.FP_ID === link.FP_ID);
  check(Boolean(row) && link.N_ID === row.N_ID && link.Match_Status === row.Match_Status && link.Story_ID === row.Story_ID, `Mapping link provenance mismatch ${link.FP_ID}`);
  if (link.N_ID) check(nById.get(link.N_ID)?.source_story_id === link.Story_ID, `N context mismatch ${link.FP_ID}`);
}
for (const row of reviewRows) check(!assignment.has(row.FP_ID) && fpById.has(row.FP_ID), `Uncertain row written or source dropped ${row.FP_ID}`);
for (const row of excludedRows) check(!assignment.has(row.FP_ID) && categories.get(row.FP_ID) === 'chapter-quiz', `Excluded chapter row mishandled ${row.FP_ID}`);
check(equal(reviewRows.map(r => r.FP_ID), storyFlow.unmapped_faithpath_ids), 'Review register mismatch');
check(equal(index.verified_story_merge_FP_ids, verifiedRows.map(r => r.FP_ID)), 'Content index verified mapping mismatch');
check(equal(index.review_required_FP_ids, reviewRows.map(r => r.FP_ID)), 'Content index review mapping mismatch');
check(deduplicated === mergeReport.word_equal_duplicates_single_flow_item, 'Dedup report count differs');

// The four reviewed associations may change the derived flow, never either source pool.
const resolution = read('reports/faithpath-review-decisions.json');
const resolvedIds = ['FP-0120', 'FP-0147', 'FP-0151', 'FP-0239'];
check(equal(resolution.scope, resolvedIds) && equal(resolution.cases.map(c => c.id), resolvedIds), 'Four-case scope changed');
for (const [file, digest] of Object.entries(resolution.locked_source_hashes)) check(hash(fs.readFileSync(path.join(root, file))) === digest, `Reviewed source changed ${file}`);
for (const c of resolution.cases) {
  const q = fpById.get(c.id), n = nById.get(c.candidate_N_ID);
  const link = storyFlow.mapping_links.find(l => l.FP_ID === c.id);
  check(Boolean(q && n && link), `Reviewed ID lost ${c.id}`);
  if (!q || !n || !link) continue;
  check(c.faithpath_value === `${q.q} → ${q.a[q.c]}` && c.comparison_value === `${n.id}: ${n.q} → ${n.answer}`, `Reviewed content evidence changed ${c.id}`);
  check(c.content_change_required === false && c.final_value === null, `Unapproved content edit ${c.id}`);
  check(link.N_ID === c.verified_N_ID && link.Story_ID === c.Story_ID && link.decision === c.decision && link.candidate_N_ID === c.candidate_N_ID, `Decision not materialized ${c.id}`);
  const story = storyFlow.stories.find(s => s.story_id === c.Story_ID);
  const item = story?.flow_items.find(i => i.source_question_ids.includes(c.id));
  check(Boolean(item) && equal(item.source_question_ids, [c.id]) && item.deduplication === 'NONE', `Reviewed variant incorrectly deduplicated ${c.id}`);
  for (const e of c.source_evidence) {
    check(hash(fs.readFileSync(path.join(root, e.file))) === e.sha256, `Review evidence hash mismatch ${c.id}/${e.file}`);
    if (e.verse) {
      const tr = e.file.includes('/l1912/') ? 'l1912' : 'otb';
      check(bibles[tr][e.book]?.[e.chapter - 1]?.find(v => Number(v[0]) === e.verse)?.[1] === e.text, `Review Bible text mismatch ${c.id}`);
    }
  }
  if (c.id === 'FP-0147') {
    check(c.decision === 'APPROVE' && c.verified_N_ID === 'N-1536' && q.ref === 'Johannes 10,11' && n.ref === 'Johannes 10,12', 'Translation-aware Hirte association invalid');
    check(bibles.l1912.JHN[9].find(v => Number(v[0]) === 12)[1].includes('Der gute Hirte läßt sein Leben für seine Schafe.'), 'Luther-1912 witness missing');
    check(bibles.otb.JHN[9].find(v => Number(v[0]) === 11)[1].includes('Der gute Hirte lässt sein Leben für die Schafe.'), 'OTB witness missing');
  } else check(c.decision === 'KEEP_AS_EXCEPTION' && c.verified_N_ID === null && link.Match_Status === 'FAITHPATH_ONLY', `False N equivalence persisted ${c.id}`);
}
const oldFlow = structuredClone(storyFlow);
oldFlow.mapping_links = oldFlow.mapping_links.filter(l => !resolvedIds.includes(l.FP_ID));
for (const story of oldFlow.stories) story.flow_items = story.flow_items.filter(i => !i.source_question_ids.some(id => resolvedIds.includes(id)));
oldFlow.status = resolution.flow_before_status;
oldFlow.unmapped_faithpath_ids = resolvedIds;
const canonical = value => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(k => [k, canonical(value[k])])) : value;
check(hash(Buffer.from(JSON.stringify(canonical(oldFlow)))) === resolution.flow_before_canonical_sha256, 'Flow changes exceeded the four reviewed cases');
const result = {status: errors.length ? 'FAIL' : 'PASS', faithpath_questions: questions, unique_fp_ids: new Set(ids).size, legacy_story_units: storyUnits, chapter_quiz_questions: chapterQuestions, nachlese_questions: nQuestions.length, unique_n_ids:nById.size, canonical_nachlese_stories:nStories.length, combined_story_count:storyFlow.stories.length, verified_story_links:verifiedRows.length, review_required:reviewRows.length, chapter_rows_excluded_from_merge:excludedRows.length, word_equal_duplicates_single_flow_item:deduplicated, approved_field_changes: approved.size, actual_field_changes: actual.size, correct_index_changes: 0, reference_changes: 0, errors};
console.log(JSON.stringify(result, null, 2));
if (errors.length) process.exitCode = 1;
