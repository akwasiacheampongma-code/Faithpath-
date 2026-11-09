import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const api=await import('../scripts/validate-at-rounds-reachability.mjs').catch(()=>({}));
const fixture=JSON.parse(fs.readFileSync('tests/fixtures/at-rounds.test-only.json'));
const ids=Object.values(fixture.chapters).flatMap(ch=>ch.variants.flatMap(r=>r.questions.map(q=>q.id)));
const report={human_approved:false,production_import_allowed:false,deploy_production:false,page_errors:[],results:[{check:'reader-entry',status:'PASS'},{check:'1KI8-two-real-app-rounds',status:'PASS'},{check:'2KI15-two-rounds-and-protected-personal-data',status:'PASS',visited_ids:ids}]};
test('coverage requires passed real-app visits to all original questions, never grants approval',()=>{
  assert.equal(typeof api.auditRoundReachability,'function');
  const result=api.auditRoundReachability(fixture,report);
  assert.deepEqual(result.reachable_editorial_units,{'1KI:8':6,'2KI:15':6});
  assert.equal(result.human_approved,false);assert.equal(result.release_decision,'NO_GO');
  for(const change of [r=>r.results[2].visited_ids.pop(),r=>r.results[0].status='FAIL',r=>r.human_approved=true,r=>r.page_errors.push('bad')]){
    const bad=structuredClone(report);change(bad);assert.throws(()=>api.auditRoundReachability(fixture,bad));
  }
});
