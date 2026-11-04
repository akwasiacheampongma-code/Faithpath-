import test from 'node:test';
import assert from 'node:assert/strict';
import {LIFE_TOPICS,PATH_CATEGORIES} from '../src/content.js';
import {stepSuggestions,validateSuggestionCoverage,smallerStep} from '../src/step-suggestions.js';
import {renderStepHelp} from '../src/step-help.js';
import {newSeedDraft,commitSeed,seedPassage} from '../src/first-seed/model.js';
import {empty} from '../src/store.js';
import {treeLevel} from '../src/domain.js';
import fs from 'node:fs';
test('all 18 themes and 17 categories offer distinct curated small/action/reflection choices',()=>{
 assert.equal(LIFE_TOPICS.length,18);assert.equal(PATH_CATEGORIES.length,17);assert(validateSuggestionCoverage());
 const first=[];for(const t of LIFE_TOPICS){const choices=stepSuggestions({topic:t.id});assert.equal(choices.length,3);assert.equal(new Set(choices.map(c=>c.text)).size,3);first.push(choices[0].text);assert(smallerStep({topic:t.id}).length>10);}
 assert.equal(new Set(first).size,18);
 for(const c of PATH_CATEGORIES)assert.equal(stepSuggestions({category:c.id}).length,3);
});
test('used suggestions are omitted and user text cannot inject HTML into helper attributes',()=>{
 const c=stepSuggestions({topic:'angst'});assert.equal(stepSuggestions({topic:'angst',used:[c[0].text]}).length,3);assert.notEqual(stepSuggestions({topic:'angst',used:[c[0].text]})[0].text,c[0].text);
 const html=renderStepHelp({field:'"><script>bad</script>',topic:'angst'});assert(!html.includes('<script>'));assert(html.includes('data-guided-confirm hidden'));assert(html.includes('Eigene Worte ausdrücklich ersetzen'));
});
test('selected edited step uses existing V5 linked records and never creates development',()=>{
 const at='2026-11-04T10:00:00.000Z',ids=Object.fromEntries(['pathId','journalId','reflectionId','stepId','thoughtLinkId','scriptureLinkId'].map(x=>[x,x]));
 for(const t of LIFE_TOPICS){const d=newSeedDraft(ids,at);Object.assign(d.values,{topic:t.id,concern:'Mein Anliegen',thought:'Meine Worte',title:'Mein Weg',next:stepSuggestions({topic:t.id})[0].text+' – in meinen Worten'});const data=empty();commitSeed(data,d,seedPassage(d.values,JSON.parse(fs.readFileSync('data/reference-index.json'))).ref);assert.equal(data.paths[0].steps[0].text,d.values.next);assert.equal(treeLevel(data),0);assert.equal(data.paths[0].milestones.length,0);}
});
