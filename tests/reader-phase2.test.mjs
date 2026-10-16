import test from 'node:test';import assert from 'node:assert/strict';
import {chapterOffer,chapterNavigation} from '../src/reader-view.js';
test('optional chapter offer preserves canonical unit, count and escaped return route',()=>{
 assert.equal(chapterOffer(null), '');
 const html=chapterOffer({unit:{id:10070,questions:Array(5)},quizRoute:'quiz/10070?return=a&origin=b',done:true});
 assert.match(html,/Was hast du verstanden\?/);assert.match(html,/5 vorhandene Fragen/);assert.match(html,/data-unit-id="10070"/);assert.match(html,/return=a&amp;origin=b/);assert.match(html,/Später/);assert.match(html,/bereits angesehen/);
});
test('chapter navigation has explicit accessible landmark and optional boundary links',()=>{
 const html=chapterNavigation({previous:'read/JHN/2/otb?origin=merged-story%2FNS-0001',next:null});
 assert.match(html,/aria-label="Kapitel wechseln"/);assert.match(html,/Vorheriges Kapitel/);assert.doesNotMatch(html,/Nächstes Kapitel/);
 assert.match(chapterNavigation({next:'read/JHN/4/l1912'}),/Nächstes Kapitel/);
});
