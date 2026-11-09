import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createAtRoundCatalog} from '../src/at-rounds.js';

/** Checks recorded real renderer visits, in addition to source-only validation. */
export function auditRoundReachability(fixture,report){
  const catalog=createAtRoundCatalog(fixture);
  for(const flag of ['human_approved','production_import_allowed','deploy_production'])assert.equal(report[flag],false,flag);
  assert.deepEqual(report.page_errors,[]);
  for(const check of ['reader-entry','1KI8-two-real-app-rounds','2KI15-two-rounds-and-protected-personal-data'])
    assert(report.results.some(r=>r.check===check&&r.status==='PASS'),`Missing passed app flow: ${check}`);
  assert(report.results.every(r=>r.status==='PASS'));
  const visited=report.results.find(r=>r.visited_ids)?.visited_ids;
  const questions=[...catalog.chapters.values()].flatMap(ch=>[...ch.rounds.values()].flatMap(r=>r.questions));
  assert.deepEqual(visited,questions.map(q=>q.id),'Actual renderer visits must match all 20 questions in A/B order');
  const coverage=Object.fromEntries([...catalog.chapters].map(([key,ch])=>[key,new Set([...ch.rounds.values()].flatMap(r=>r.questions).filter(q=>visited.includes(q.id)).map(q=>q.sourceUnit)).size]));
  return {scope:'REAL_APP_TEST_FIXTURE_ONLY',status:'REACHABILITY_PASS',visited_question_count:visited.length,
    reachable_editorial_units:coverage,human_approved:false,production_import_allowed:false,deploy_production:false,release_decision:'NO_GO'};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{
    const fixture=JSON.parse(fs.readFileSync('tests/fixtures/at-rounds.test-only.json'));
    const report=JSON.parse(fs.readFileSync(process.argv[2]||'qa-output/at-rounds-browser/browser-results.json'));
    console.log(JSON.stringify(auditRoundReachability(fixture,report),null,2));
  }catch(e){console.error(e.message);process.exitCode=1;}
}
