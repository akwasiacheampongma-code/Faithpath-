import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {journeySummary,recordExploredChapter} from '../src/bible-journey.js';import {journeyView,journeyAcknowledgement,swordExplanation} from '../src/journey-view.js';
import {swordReadingState,progressiveSword} from '../src/journey-sword.js';import {phase2Fixture,books} from './phase2-fixtures.mjs';
test('all sword states preserve exact historic reveal, counts, one SVG and immutable data',()=>{
 for(const n of [0,1,5,300,1189]){
  const data=phase2Fixture('light',n),before=JSON.stringify(data),summary=journeySummary(data,books),state=swordReadingState(summary),html=journeyView(data,books).body;
  assert.equal(state.chapters,n);assert.equal(state.total,1189);assert.equal(state.reveal,Math.sqrt(n/1189));assert.equal((html.match(/<svg class="journey-sword"/g)||[]).length,1);
  assert(html.includes(`${n} von 1.189 Kapiteln erkundet`));assert(progressiveSword(summary).includes(`data-reveal="${Math.sqrt(n/1189)}"`));
  assert.equal(JSON.stringify(data),before);assert(!journeyView(data,books,'GEN').body.includes('class="journey-sword"'));
 }
});
test('chapter acknowledgement requires canonical exploration and leads to the global sword',()=>{
 const data=phase2Fixture('light',0),ref={book:'JHN',chapter:3};assert.match(journeyAcknowledgement(data,books,ref),/hidden/);
 assert(recordExploredChapter(data,ref,books,'2026-10-16','a'));assert(!recordExploredChapter(data,ref,books,'2026-10-16','b'));
 const html=journeyAcknowledgement(data,books,ref);assert.doesNotMatch(html,/aria-live="polite" hidden/);assert.match(html,/href="#bible-journey"/);assert.match(html,/Dein Schwert ansehen/);assert.equal(journeySummary(data,books).chapters,1);
});
test('spiritual explanation distinguishes reading from faith, tree and violence; local quotes verified',()=>{
 const html=swordExplanation();for(const word of ['nicht automatisch','nicht gegen Menschen','Olivenbaum','nicht, wie stark dein Glaube','Epheser 6,17 · Luther 1912'])assert(html.includes(word));
 const l=JSON.parse(fs.readFileSync('data/bibles/l1912/EPH.json')).chapters[5].find(v=>v[0]===17)[1];
 const o=JSON.parse(fs.readFileSync('data/bibles/otb/EPH.json')).chapters[5].find(v=>v[0]===17)[1];assert.equal(l,'und nehmet den Helm des Heils und das Schwert des Geistes, welches ist das Wort Gottes.');assert.equal(o,'Nehmt den Helm des Heils und das Schwert des Geistes, welches das Wort Gottes ist.');
});
