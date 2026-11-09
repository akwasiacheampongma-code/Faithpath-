import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {createAtRoundCatalog} from '../src/at-rounds.js';

const hash = data => crypto.createHash('sha256').update(data).digest('hex');
const require = (condition,message) => {if (!condition) throw new Error(message);};

/** Technical checks only. This never grants editorial or production approval. */
export function auditAtTestFixture(fixture, source, plan) {
  const catalog = createAtRoundCatalog(fixture);
  require(plan.schema_version === 'faithpath-at-quizvariants-1.0-test-only' &&
    plan.human_approved === false && plan.production_import_allowed === false &&
    plan.deployment_allowed === false, 'Quellenplan besitzt keine gültige TEST_ONLY-Kennzeichnung.');
  require(Array.isArray(source) && source.length === 20 && new Set(source.map(q=>q.id)).size === 20,
    'Die 20 kanonischen Quellfragen fehlen.');
  const originals = new Map(source.map(q=>[q.id,q]));
  let count = 0, permutations = 0;
  const coverage = {};
  for (const [key, chapter] of catalog.chapters) {
    const selection = plan.chapter_quiz_variants[chapter.book];
    require(selection?.chapter === chapter.chapter, 'Kapitel passt nicht zum Quellenplan.');
    for (const round of chapter.rounds.values()) {
      const expected = selection.variants.find(v=>v.id===round.id)?.question_ids;
      require(JSON.stringify(round.questions.map(q=>q.id)) === JSON.stringify(expected),
        'Die bestehende Auswahl der Quellfragen wurde verändert.');
      for (const q of round.questions) {
        const s = originals.get(q.id);
        require(s && s.book === chapter.book && s.chapter === chapter.chapter &&
          s.sourceUnit === q.sourceUnit && s.question === q.text &&
          s.explanation === q.explanation && s.verse_reference === q.reference &&
          JSON.stringify([...s.options].sort()) === JSON.stringify([...q.options].sort()),
          `Frage ${q.id} weicht von ihrer Quelle ab.`);
        require(Number.isInteger(s.correct_index) && q.options[q.correctIndex] === s.options[s.correct_index],
          `Richtige Antwort der Quellfrage ${q.id} wurde verändert.`);
        if (JSON.stringify(s.options) !== JSON.stringify(q.options)) permutations++;
        count++;
      }
    }
    coverage[key] = new Set([...chapter.rounds.values()].flatMap(r=>r.questions.map(q=>q.sourceUnit))).size;
  }
  return {scope:'TEST_FIXTURE_ONLY', status:'TEST_FIXTURE_TECHNICAL_PASS', question_count:count,
    option_permutations:permutations, coverage, human_approved:false,
    production_import_allowed:false, deploy_production:false, release_decision:'NO_GO'};
}

export function validateAtRoundFiles(root = process.cwd()) {
  const read = name => fs.readFileSync(path.join(root,name));
  const raw = read('tests/fixtures/at-rounds.test-only.json');
  const sourceRaw = read('tests/fixtures/at-rounds.source-questions.json');
  const provenance = JSON.parse(read('reports/at-rounds/source-comparison.json'));
  require(hash(raw) === provenance.fixture_sha256 && hash(sourceRaw) === provenance.selected_source_sha256,
    'Fixture oder Quellsnapshot weicht vom geprüften Quellenabgleich ab.');
  const result = auditAtTestFixture(JSON.parse(raw), JSON.parse(sourceRaw),
    JSON.parse(read('tests/fixtures/at-rounds.original-plan.json')));
  return {...result, fixture_sha256:hash(raw), source_commit:provenance.source_commit};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {console.log(JSON.stringify(validateAtRoundFiles(),null,2));}
  catch (error) {console.error(error.message);process.exitCode=1;}
}
